const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

exports.processSignUp = functions.auth.user().onCreate(async (user) => {
    const userType = (user.email.endsWith('@student.tarc.edu.my') || user.email.endsWith('@tarc.edu.my')) ? 'customer' : 'stallUser'
    const customClaims = { userType: userType }
    try {
        await getAuth().setCustomUserClaims(user.uid, customClaims)
    } catch (error) {
        console.log(error)
    }
})

exports.registerStall = functions.https.onCall(async (data, context) => {
    var newStall = data
    newStall.ownerEmail = context.auth.token.email
    newStall.status = "close"

    var isSuccess = true
    var messageArray = []

    const stallsRef = db.collection('stalls')

    //return early if staffEmails somehow > 10, otherwise likely problem with array-contains-any
    if (newStall.staffEmails.length > 10) return {
        success: false,
        message: `Stall staff emails cannot include more than 10 emails.`
    }


    //if stall name already in use by another stall
    const usedStallName = await stallsRef.where('stallName', '==', newStall.stallName).get()
    if (!usedStallName.empty) {
        isSuccess = false
        messageArray.push(`\"${newStall.stallName}\" is already in use by another stall.`)
    }


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


    // //otherwise add stall and return success

    //return
    return { success: isSuccess, message: messageArray }
})