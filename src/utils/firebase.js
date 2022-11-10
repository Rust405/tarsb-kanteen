import { initializeApp } from "firebase/app"
import { getFirestore, query, getDocs, collection, where, addDoc, } from "firebase/firestore"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { getRole } from "./tools";

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
    const role = getRole(user.email)

    const q = query(collection(db, "users"), where("uid", "==", user.uid))
    const docs = await getDocs(q)
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        role: role,
        isStallOwner: false
      })
    }
  } catch (err) {
    alert("Google Login Cancelled")
  }
}

const logout = () => {
  signOut(auth)
}

export { db, auth, signInWithGoogle, logout }
