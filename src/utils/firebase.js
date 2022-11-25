import { initializeApp } from "firebase/app"
import { getFirestore, setDoc, doc, getDoc, query, collection, where, getDocs, updateDoc, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signOut, signInWithRedirect } from "firebase/auth"
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions"

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
export const db = getFirestore(app)
const provider = new GoogleAuthProvider()
export const auth = getAuth()
const functions = getFunctions(app, "asia-southeast1")

//emulators
connectFirestoreEmulator(db, 'localhost', 8080)
connectFunctionsEmulator(functions, "localhost", 5001)

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithRedirect(auth, provider)
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
    alert(`Login with Google cancelled.\n${err.message}`)
  }
}

export const logout = () => signOut(auth)

export const findStallUser = async (email) => {
  const queryOwner = query(collection(db, "stalls"), where("ownerEmail", "==", email))
  const queryStaff = query(collection(db, "stalls"), where("staffEmails", "array-contains", email))

  const resultOwner = await getDocs(queryOwner)
  if (resultOwner.docs.length === 1) return { stallID: resultOwner.docs[0].id, staffRole: "owner" }

  const resultStaff = await getDocs(queryStaff)
  if (resultStaff.docs.length === 1) return { stallID: resultStaff.docs[0].id, staffRole: "staff" }

  //new stall user
  return null
}

export const registerStall = httpsCallable(functions, 'registerStall')

export const openStall = async (stallDocRef) => {
  await updateDoc(stallDocRef, { status: "open" })
}

export const closeStall = async (stallDocRef) => {
  await updateDoc(stallDocRef, { status: "closed" })
}

