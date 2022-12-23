const functions = require('firebase-functions')
const firebase_tools = require('firebase-tools')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')

const dayjs = require('dayjs')
const utc = require("dayjs/plugin/utc")
const timezone = require("dayjs/plugin/timezone")
dayjs.extend(timezone)
dayjs.extend(utc)

const tz = 'Asia/Singapore'

const reportMinDay = 3 //days, minimum before current stall can make another report on a customer
const defaultEstWaitTime = 5 //minutes, the default estWaitTime when item is created or isRequireWaiting toggled
const minCookDuration = 3 //minutes (Maggi recommendation), if cook duration is less than this, estWaitTime is not changed
const maxCookDuration = 15 //minutes (Average for stir fry dishes), if cook duration is greater than this, estWaitTime is not changed

const db = getFirestore()
const stallsRef = db.collection('stalls')
const reportsRef = db.collection('reports')
const ordersRef = db.collection('orders')

function verifyStallUser(token) {
    if (token.userType !== 'stallUser') {
        console.log(`${token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a verified stall user to call this function.'
        )
    }
}

async function verifyStallOwner(stallID, token) {
    const ownerEmail = (await stallsRef.doc(stallID).get()).data().ownerEmail

    if (token.userType !== 'stallUser' || token.email !== ownerEmail) {
        console.log(`${token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a verified stall owner to call this function.'
        )
    }
}

async function deleteCollection(path) {
    await firebase_tools.firestore
        .delete(path, {
            project: process.env.GCLOUD_PROJECT,
            recursive: true,
            force: true,
            token: functions.config().ci.token
        })
}

exports.registerStall = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    let newStall = data.newStall
    newStall.stallName = newStall.stallName.trim()
    newStall.lowercaseStallName = newStall.stallName.trim().toLowerCase()
    newStall.ownerEmail = context.auth.token.email
    newStall.status = "closed"
    newStall.orderQueue = []
    newStall.preOrderList = []

    let isSuccess = true
    let messageArray = []

    //if stall name is empty
    if (newStall.stallName === '') {
        isSuccess = false
        messageArray.push(`Stall name cannot be empty.`)
    }

    //if stall name already in use by another stall
    const usedStallName = await stallsRef.where('lowercaseStallName', '==', newStall.lowercaseStallName).get()
    if (!usedStallName.empty) {
        isSuccess = false
        messageArray.push(`\"${newStall.stallName}\" (or similar) is already in use by another stall.`)
    }

    //perform validation if staffEmails provided
    if (newStall.staffEmails.length !== 0) {
        //return early if staffEmails somehow > 10, otherwise problem with array-contains-any
        if (newStall.staffEmails.length > 10) return {
            success: false,
            message: [`Stall staff emails cannot include more than 10 emails.`]
        }

        //remove empty elements from staffEmails
        newStall.staffEmails = newStall.staffEmails.filter(em => em)

        //convert emails to lowercase
        newStall.staffEmails = newStall.staffEmails.map(em => em.trim().toLowerCase())

        //if other stall owner is added as staff
        const addedOwnerAsStaff = await stallsRef.where("ownerEmail", "in", newStall.staffEmails).get()
        if (!addedOwnerAsStaff.empty) {
            isSuccess = false
            messageArray.push(`Stall staff emails cannot include emails of other stall owners.`)
        }


        //if owner adds staff (>=1) already assigned to other stall
        const addedRegisteredStaff = await stallsRef.where("staffEmails", "array-contains-any", newStall.staffEmails).get()
        if (!addedRegisteredStaff.empty) {
            isSuccess = false
            messageArray.push(`Stall staff emails cannot include emails of stall staff assigned to another stall.`)
        }


        //if owner add student/lecturer as staff
        for (let i in newStall.staffEmails) {
            if (newStall.staffEmails[i].endsWith('@student.tarc.edu.my') || newStall.staffEmails[i].endsWith('@tarc.edu.my')) {
                isSuccess = false
                messageArray.push(`Stall staff emails cannot include TAR students or lecturers emails.`)
                break
            }
        }

        //if owner added themselves as staff
        if (newStall.staffEmails.includes(newStall.ownerEmail)) {
            isSuccess = false
            messageArray.push(`Stall staff emails cannot include stall owner email.`)
        }

    }


    //otherwise add stall and return success
    if (isSuccess) await stallsRef.add(newStall)

    return { success: isSuccess, message: messageArray }
})

exports.updateStallDetails = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    let updatedDetails = data.updatedDetails

    let isSuccess = true
    let messageArray = []

    const oldStallDetails = (await stallsRef.doc(updatedDetails.stallID).get()).data()

    await verifyStallOwner(updatedDetails.stallID, context.auth.token)

    //perform validation if change in stallName
    if (updatedDetails.stallName !== undefined) {
        updatedDetails.lowercaseStallName = updatedDetails.stallName.trim().toLowerCase()

        //if stall name is empty
        if (updatedDetails.stallName === '') {
            isSuccess = false
            messageArray.push(`Stall name cannot be empty.`)
        }

        //if stall name already in use by another stall, only check if not a change of name casing
        if (updatedDetails.lowercaseStallName !== oldStallDetails.lowercaseStallName) {
            const usedStallName = await stallsRef.where('lowercaseStallName', '==', updatedDetails.lowercaseStallName).get()
            if (!usedStallName.empty) {
                isSuccess = false
                messageArray.push(`\"${updatedDetails.stallName}\" (or similar) is already in use by another stall.`)
            }
        }
    }

    //perform validation if change in staffEmails
    if (updatedDetails.staffEmails !== undefined && updatedDetails.staffEmails.length !== 0) {

        //return early if staffEmails somehow > 10, otherwise problem with array-contains-any
        if (updatedDetails.staffEmails.length > 10) return {
            success: false,
            message: [`Stall staff emails cannot include more than 10 emails.`]
        }

        //remove empty elements from staffEmails
        updatedDetails.staffEmails = updatedDetails.staffEmails.filter(em => em)

        //convert emails to lowercase
        updatedDetails.staffEmails = updatedDetails.staffEmails.map(em => em.trim().toLowerCase())

        //if other stall owner is added as staff, only check for other stall owners
        const filteredOutCurrentOwner = updatedDetails.staffEmails.filter(existing => existing !== oldStallDetails.ownerEmail)
        const addedOwnerAsStaff = await stallsRef.where("ownerEmail", "in", filteredOutCurrentOwner).get()
        if (!addedOwnerAsStaff.empty) {
            isSuccess = false
            messageArray.push(`Stall staff emails cannot include emails of other stall owners.`)
        }


        //if owner adds staff (>=1) already assigned to other stall, only check for other stall's staff
        const filteredOutExistingStaff = updatedDetails.staffEmails.filter(existing => !oldStallDetails.staffEmails.includes(existing))
        if (filteredOutExistingStaff.length !== 0) {
            const addedRegisteredStaff = await stallsRef.where("staffEmails", "array-contains-any", filteredOutExistingStaff).get()
            if (!addedRegisteredStaff.empty) {
                isSuccess = false
                messageArray.push(`Stall staff emails cannot include emails of stall staff assigned to another stall.`)
            }
        }


        //if owner add student/lecturer as staff
        for (let i in updatedDetails.staffEmails) {
            if (updatedDetails.staffEmails[i].endsWith('@student.tarc.edu.my') || updatedDetails.staffEmails[i].endsWith('@tarc.edu.my')) {
                isSuccess = false
                messageArray.push(`Stall staff emails cannot include TAR students or lecturers emails.`)
                break
            }
        }

        //if owner added themselves as staff
        if (updatedDetails.staffEmails.includes(oldStallDetails.ownerEmail)) {
            isSuccess = false
            messageArray.push(`Stall staff emails cannot include stall owner email.`)
        }
    }


    if (isSuccess) {
        let updateObj = {}

        if (updatedDetails.stallName !== undefined) {
            updateObj.stallName = updatedDetails.stallName
            updateObj.lowercaseStallName = updatedDetails.lowercaseStallName
        }
        if (updatedDetails.staffEmails !== undefined) {
            updateObj.staffEmails = updatedDetails.staffEmails
        }

        await stallsRef.doc(updatedDetails.stallID).update(updateObj)
    }

    return { success: isSuccess, message: messageArray }
})

exports.unregisterStall = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    let stallID = data.stallID

    await verifyStallOwner(stallID, context.auth.token)

    // delete emails which automatically signs users out
    await stallsRef.doc(stallID).update({ ownerEmail: '', staffEmails: [] })

    // delete stall
    await stallsRef.doc(stallID).delete()

    //delete subcollections
    await deleteCollection(`/stalls/${stallID}/menu`)

    //TODO: delete orders related to stall?
})

exports.addMenuItem = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    let newItem = data.newItem
    let stallID = data.stallID

    newItem.menuItemName = newItem.menuItemName.trim()
    newItem.lowercaseMenuItemName = newItem.menuItemName.trim().toLowerCase()
    newItem.isAvailable = true
    newItem.estWaitTime = newItem.isRequireWaiting ? defaultEstWaitTime : 0

    let isSuccess = true
    let messageArray = []

    const menuRef = stallsRef.doc(stallID).collection('menu')

    //if item name is empty
    if (newItem.menuItemName === '') {
        isSuccess = false
        messageArray.push(`Menu item name cannot be empty.`)
    }

    //if menu item or similar already exists
    const usedMenuItemName = await menuRef.where('lowercaseMenuItemName', '==', newItem.lowercaseMenuItemName).get()
    if (!usedMenuItemName.empty) {
        isSuccess = false
        messageArray.push(`\"${newItem.menuItemName}\" (or similar) already exists.`)
    }

    //if price is < 0 or > 99.99
    if (newItem.price < 0) {
        isSuccess = false
        messageArray.push(`Price cannot be less than RM 0.00`)
    } else if (newItem.price > 99.99) {
        isSuccess = false
        messageArray.push(`Price cannot be greater than RM 99.99.`)
    }

    //if price is somehow NaN
    if (isNaN(newItem.price)) {
        isSuccess = false
        messageArray.push(`Price must be a valid number.`)
    }

    //otherwise add new menu item and return success
    if (isSuccess) {
        await menuRef.add(newItem)
    }

    return { success: isSuccess, message: messageArray }
})

exports.updateItemDetails = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    const stallID = data.stallID
    let updatedDetails = data.updatedDetails

    let isSuccess = true
    let messageArray = []

    const menuRef = stallsRef.doc(stallID).collection('menu')

    const oldItemDetails = (await stallsRef.doc(stallID).collection('menu').doc(updatedDetails.menuItemID).get()).data()

    //perform validation if change in itemName
    if (updatedDetails.menuItemName !== undefined) {
        updatedDetails.lowercaseMenuItemName = updatedDetails.menuItemName.trim().toLowerCase()

        //if item name is empty
        if (updatedDetails.menuItemNam === '') {
            isSuccess = false
            messageArray.push(`Menu item name cannot be empty.`)
        }

        //if item name already in use
        if (updatedDetails.lowercaseMenuItemName !== oldItemDetails.lowercaseMenuItemName) {
            const usedMenuItemName = await menuRef.where('lowercaseMenuItemName', '==', updatedDetails.lowercaseMenuItemName).get()
            if (!usedMenuItemName.empty) {
                isSuccess = false
                messageArray.push(`\"${updatedDetails.menuItemName}\" (or similar) already exists.`)
            }
        }
    }

    //perform validation if change in price
    if (updatedDetails.price !== undefined) {
        //if price is < 0 or > 99.99
        if (updatedDetails.price < 0) {
            isSuccess = false
            messageArray.push(`Price cannot be less than RM 0.00`)
        } else if (updatedDetails.price > 99.99) {
            isSuccess = false
            messageArray.push(`Price cannot be greater than RM 99.99.`)
        }

        //if price is somehow NaN
        if (isNaN(updatedDetails.price)) {
            isSuccess = false
            messageArray.push(`Price must be a valid number.`)
        }

    }

    if (isSuccess) {
        let updateObj = {}

        if (updatedDetails.menuItemName !== undefined) {
            updateObj.menuItemName = updatedDetails.menuItemName
            updateObj.lowercaseMenuItemName = updatedDetails.lowercaseMenuItemName
        }
        if (updatedDetails.price !== undefined) {
            updateObj.price = updatedDetails.price
        }
        if (updatedDetails.isRequireWaiting !== undefined) {
            updateObj.isRequireWaiting = updatedDetails.isRequireWaiting
            updateObj.estWaitTime = updatedDetails.isRequireWaiting ? defaultEstWaitTime : 0
        }

        await menuRef.doc(updatedDetails.menuItemID).update(updateObj)
    }

    return { success: isSuccess, message: messageArray }
})

exports.reportCustomer = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    let isSuccess = true
    let messageArray = []
    let report = data.report

    if (report.reason === '') {
        isSuccess = false
        messageArray.push(`Reason cannot be empty.`)
    }

    //IF the customer has already been reported by the current stall in the past 3 days
    const existingReportSnap = await reportsRef.where("customerID", "==", report.customerID).where("stallID", "==", report.stallID).get()
    const existingReportDoc = existingReportSnap.docs[0]
    if (existingReportDoc) {
        if (dayjs(existingReportDoc.data().reportTimestamp.toDate()).diff(dayjs(), 'day') < reportMinDay) {
            isSuccess = false
            messageArray.push(`The stall has already reported this customer in the past ${reportMinDay} days.`)
        }
    }

    //Report customer
    if (isSuccess) {
        report.reportTimestamp = Timestamp.now()
        report.stallUserID = context.auth.uid

        await reportsRef.add(report)
    }

    return { success: isSuccess, message: messageArray }
})

exports.cancelOrder = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    let isSuccess = true
    let messageArray = []

    let orderID = data.orderID
    let remarkStall = data.remarkStall

    //IF order doesn't exist, RETURN early
    const orderDoc = await ordersRef.doc(orderID).get()
    if (!orderDoc.exists) {
        return { success: false, message: [`Order does not exist.`] }
    }

    //IF reason is empty
    if (remarkStall === '') {
        isSuccess = false
        messageArray.push(`Reason cannot be empty.`)
    }

    //IF order is already cancelled or mark unclaimed
    switch (orderDoc.data().orderStatus) {
        case 'Cancelled':
            isSuccess = false
            messageArray.push(`Order had already been cancelled.`)
            break
        case 'Unclaimed':
            isSuccess = false
            messageArray.push(`Order had already been marked unclaimed.`)
            break
        default:
            isSuccess = true
    }

    //Cancel order
    if (isSuccess) {
        await ordersRef.doc(orderID).update({ orderStatus: 'Cancelled' })
    }

    return { success: isSuccess, message: messageArray }
})

exports.orderMarkReady = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    const orderID = data.orderID

    await ordersRef.doc(orderID).update({
        orderStatus: 'Ready'
    })

    //TODO: send notification

})

exports.orderStartCooking = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    const orderID = data.orderID

    await ordersRef.doc(orderID).update({
        cookingStartTime: Timestamp.now(),
        orderStatus: 'Cooking'
    })

    //TODO: send notification

})

exports.orderEndCooking = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyStallUser(context.auth.token)

    const orderID = data.orderID

    const now = dayjs().tz(tz)

    const orderDoc = await ordersRef.doc(orderID).get()
    const cookingStartTime = dayjs(orderDoc.data().cookingStartTime.toDate()).tz(tz)

    const cookDuration = now.diff(cookingStartTime, 'minute')

    //update order
    await ordersRef.doc(orderID).update({ orderStatus: 'Ready' })

    //IF cookDuration are within limits, calculate new estWaitTime and update Item
    if (cookDuration > minCookDuration && cookDuration < maxCookDuration) {
        let newEstWaitTime = Math.round((cookDuration + orderDoc.data().estWaitTime) / 2)

        //update item estWaitTime

    }


    //TODO: send notification

})