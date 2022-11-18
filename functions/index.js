const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase/firestore')

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
    var newStall = data.newStall
    newStall.ownerEmail = context.context.auth.token.email
    newStall.status = "close"

    const stallsRef = db.collection('stalls')

    //if stall name already in use by another stall
    const usedStallName = await stallsRef.where('stallName', '==', newStall.stallName).get()
    if (!usedStallName.empty) return {
        success: false,
        message: `\"${newStall.stallName}\" is already in use by another stall.`
    }


    //if other stall owner is added as staff
    const addedOwnerAsStaff = await stallsRef.where("ownerEmail", "in", newStall.staffEmails).get()
    if (!addedOwnerAsStaff.empty) return {
        success: false,
        message: `Stall staff emails cannot include emails of other stall owners.`
    }


    //if owner adds staff (>=1) already assigned to other stall
    const addedRegisteredStaff = await stallsRef.where("staffEmails", "array-contains-any", newStall.staffEmails).get()
    if (!addedRegisteredStaff.empty) return {
        success: false,
        message: `Stall staff emails cannot include emails of stall staff assigned to another stall.`
    }

    //if owner add student/lecturer as staff
    var isAddedCustAsStaff = false
    newStall.staffEmails.forEach(staffEmail => {
        if (staffEmail.endsWith('@student.tarc.edu.my') || staffEmail.endsWith('@tarc.edu.my')) {
            isAddedCustAsStaff = true
        }
    })
    if (isAddedCustAsStaff) return {
        success: false,
        message: `Stall staff emails cannot include TAR students or lecturers emails.`
    }


    //if owner added themselves as staff
    if (newStall.staffEmails.includes(newStall.ownerEmail)) return {
        success: false,
        message: `Stall owner email cannot be included in stall staff emails.`
    }


    //otherwise add stall and return success

    //test
    return newStall
})