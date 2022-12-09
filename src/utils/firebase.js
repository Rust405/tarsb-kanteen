import { initializeApp } from "firebase/app"
import { getFirestore, setDoc, doc, getDoc, query, collection, where, getDocs, updateDoc, connectFirestoreEmulator, deleteDoc } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signOut, signInWithRedirect } from "firebase/auth"
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions"

const useEmulators = true //set to true when testing, otherwise set to false in production

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
provider.setCustomParameters({ prompt: 'select_account' })

export const auth = getAuth()

const functions = getFunctions(app, "asia-southeast1")

//emulators
if (useEmulators) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectFunctionsEmulator(functions, "localhost", 5001)
}

export const signInWithGoogle = async () => {
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
}

export const logout = () => signOut(auth)

//[START Stall functions]
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

export const toggleStallStatus = async (stallDocRef, status) => {
  await updateDoc(stallDocRef, { status: status })
}

export const updateStallDetails = httpsCallable(functions, 'updateStallDetails')

export const unregisterStall = httpsCallable(functions, 'unregisterStall')

export const addMenuItem = httpsCallable(functions, 'addMenuItem')

export const toggleItemAvail = async (itemDocRef, isAvailable) => {
  await updateDoc(itemDocRef, { isAvailable: isAvailable })
}

export const updateItemDetails = httpsCallable(functions, 'updateItemDetails')

export const deleteMenuItem = async (stallID, itemID) => {
  await deleteDoc(doc(db, "stalls", stallID, "menu", itemID))
}
//[END Stall functions]


