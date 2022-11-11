import { initializeApp } from "firebase/app"
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"

//TODO: Move variables to .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

//Authentication
const provider = new GoogleAuthProvider()
const auth = getAuth()

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider)
    const user = res.user
    const email = user.email
    const emailDomain = email.substring(email.indexOf('@') + 1)
    const role = (emailDomain === 'student.tarc.edu.my' || emailDomain === 'tarc.edu.my') ? 'customer' : 'stallUser'

    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        role: role
      })
    }

  } catch (err) {
    alert("Login with Google cancelled")
  }
}

const logout = () => {
  signOut(auth)
}

const fetchUserRole = async (uid) => {
  try {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef)
    return (docSnap.data().role)
  } catch (err) {
    alert("Unable to fetch user role")
  }
}

export { db, auth, signInWithGoogle, logout, fetchUserRole }
