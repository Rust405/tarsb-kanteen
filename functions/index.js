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
});
