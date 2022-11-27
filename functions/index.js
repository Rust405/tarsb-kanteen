const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

const stallsRef = db.collection('stalls')

exports.processSignUp = functions.region('asia-southeast1').auth.user().onCreate(async (user) => {
    const userType = (user.email.endsWith('@student.tarc.edu.my') || user.email.endsWith('@tarc.edu.my')) ? 'customer' : 'stallUser'
    const customClaims = { userType: userType }
    try {
        await getAuth().setCustomUserClaims(user.uid, customClaims)
    } catch (error) {
        console.log(error)
    }
})

exports.registerStall = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    let newStall = data
    newStall.stallName = newStall.stallName.trim()
    newStall.lowercaseStallName = newStall.stallName.trim().toLowerCase()
    newStall.ownerEmail = context.auth.token.email
    newStall.status = "closed"

    let isSuccess = true
    let messageArray = []

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
    let updatedDetails = data

    let isSuccess = true
    let messageArray = []

    const oldStallDetails = (await db.collection('stalls').doc(updatedDetails.stallID).get()).data()

    //perform validation if change in stallName
    if (updatedDetails.stallName) {
        updatedDetails.lowercaseStallName = updatedDetails.stallName.trim().toLowerCase()

        //if stall name already in use by another stall, only check if not a change of name casing
        if (updatedDetails.lowercaseStallName != oldStallDetails.lowercaseStallName) {
            const usedStallName = await stallsRef.where('lowercaseStallName', '==', updatedDetails.lowercaseStallName).get()
            if (!usedStallName.empty) {
                isSuccess = false
                messageArray.push(`\"${updatedDetails.stallName}\" (or similar) is already in use by another stall.`)
            }
        }

    }

    //perform validation if change in staffEmails
    if (updatedDetails.staffEmails && updatedDetails.staffEmails.length !== 0) {

        //return early if staffEmails somehow > 10, otherwise problem with array-contains-any
        if (updatedDetails.staffEmails.length > 10) return {
            success: false,
            message: [`Stall staff emails cannot include more than 10 emails.`]
        }

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
        if (updatedDetails.stallName && !updatedDetails.staffEmails) {
            await stallsRef.doc(updatedDetails.stallID).update({ stallName: updatedDetails.stallName })
        }
        else if (updatedDetails.staffEmails && !updatedDetails.stallName) {
            await stallsRef.doc(updatedDetails.stallID).update({ staffEmails: updatedDetails.staffEmails })
        }
        else if (updatedDetails.staffEmails && updatedDetails.stallName) {
            await stallsRef.doc(updatedDetails.stallID).update(
                {
                    stallName: updatedDetails.stallName,
                    staffEmails: updatedDetails.staffEmails
                }
            )
        }
    }

    return { success: isSuccess, message: messageArray }
})
