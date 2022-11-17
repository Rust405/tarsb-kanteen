const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp()

exports.processSignUp = functions.auth.user().onCreate(async (user) => {
    const userType = (user.email.endsWith('@student.tarc.edu.my') || user.email.endsWith('@tarc.edu.my')) ? 'customer' : 'stallUser'
    const customClaims = { userType: userType }
    try {
        await getAuth().setCustomUserClaims(user.uid, customClaims)
    } catch (error) {
        console.log(error)
    }
})

exports.registerStall = functions.https.onCall((data, context) => {
    var newStall = data
    newStall.ownerEmail = context.context.auth.token.email
    newStall.status = "close"

    //cannot use registered stall name
    //cannot add other owner
    //cannot add registered staff
    //cannot add own (owner) email

})