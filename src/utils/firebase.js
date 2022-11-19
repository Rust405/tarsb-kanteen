import { initializeApp } from "firebase/app"
import { getFirestore, setDoc, doc, getDoc, query, collection, where, getDocs } from "firebase/firestore"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const provider = new GoogleAuthProvider()
const auth = getAuth()
const functions = getFunctions(app)

const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, provider)
    const user = res.user

    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        email: user.email,
        name: user.displayName,
        reminderTiming: 10
      })
    }

  } catch (err) {
    alert("Login with Google cancelled")
  }
}

const logout = () => signOut(auth)

const findStallUser = async (email) => {
  const queryOwner = query(collection(db, "stalls"), where("ownerEmail", "==", email))
  const queryStaff = query(collection(db, "stalls"), where("staffEmails", "array-contains", email))

  const resultOwner = await getDocs(queryOwner)
  if (resultOwner.docs.length === 1) return { stallID: resultOwner.docs[0].id, staffRole: "owner" }

  const resultStaff = await getDocs(queryStaff)
  if (resultStaff.docs.length === 1) return { stallID: resultStaff.docs[0].id, staffRole: "staff" }

  //new stall user
  return null
}

const registerStall = httpsCallable(functions, 'registerStall')

export { db, auth, signInWithGoogle, logout, findStallUser, registerStall }
