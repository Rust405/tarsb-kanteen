const functions = require('firebase-functions')
const firebase_tools = require('firebase-tools')
const { getFirestore } = require('firebase-admin/firestore')

const db = getFirestore()
const stallsRef = db.collection('stalls')

exports.registerStall = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    //verify user
    if (context.auth.token.userType !== 'stallUser') {
        console.log(`${context.auth.token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a stall user to register stall.'
        )
    }

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

async function verifyStallOwner(stallID, token) {
    const ownerEmail = (await stallsRef.doc(stallID).get()).data().ownerEmail

    if (token.userType !== 'stallUser' || token.email !== ownerEmail) {
        console.log(`${token.email} made an unauthorized function call.`)
        return false
    }

    return true
}

exports.updateStallDetails = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    let updatedDetails = data.updatedDetails

    let isSuccess = true
    let messageArray = []

    const oldStallDetails = (await stallsRef.doc(updatedDetails.stallID).get()).data()

    //verify user
    const isStallOwner = await verifyStallOwner(updatedDetails.stallID, context.auth.token)
    if (!isStallOwner) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a stall owner to update stall details.'
        )
    }

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

    //verify user
    const isStallOwner = await verifyStallOwner(stallID, context.auth.token)
    if (!isStallOwner) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a stall owner to unregister stall.'
        )
    }

    // delete emails which automatically signs users out
    await stallsRef.doc(stallID).update({ ownerEmail: '', staffEmails: [] })

    // delete stall
    await stallsRef.doc(stallID).delete()

    //delete subcollections
    await deleteCollection(`/stalls/${stallID}/menu`)
    await deleteCollection(`/stalls/${stallID}/orders`)
})

async function deleteCollection(path) {
    await firebase_tools.firestore
        .delete(path, {
            project: process.env.GCLOUD_PROJECT,
            recursive: true,
            force: true,
            token: functions.config().ci.token
        })
}

exports.addMenuItem = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    //verify user
    if (context.auth.token.userType !== 'stallUser') {
        console.log(`${context.auth.token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a stall user to add menu item.'
        )
    }

    let newItem = data.newItem
    let stallID = data.stallID

    newItem.menuItemName = newItem.menuItemName.trim()
    newItem.lowercaseMenuItemName = newItem.menuItemName.trim().toLowerCase()
    newItem.isAvailable = true
    newItem.isRequireWaiting ? newItem.estWaitTime = 5 : newItem.estWaitTime = 0

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
    //verify user
    if (context.auth.token.userType !== 'stallUser') {
        console.log(`${context.auth.token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a stall user to update menu item.'
        )
    }

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
            updatedDetails.isRequireWaiting ? updateObj.estWaitTime = 5 : updateObj.estWaitTime = 0
        }

        await menuRef.doc(updatedDetails.menuItemID).update(updateObj)
    }

    return { success: isSuccess, message: messageArray }
})