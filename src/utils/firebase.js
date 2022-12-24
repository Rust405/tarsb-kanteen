import { initializeApp } from "firebase/app"
import { getFirestore, setDoc, doc, getDoc, query, collection, where, getDocs, updateDoc, connectFirestoreEmulator, deleteDoc } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signOut, signInWithRedirect } from "firebase/auth"
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

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

const db = getFirestore(app)

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

const auth = getAuth()

const functions = getFunctions(app, "asia-southeast1")

const messaging = getMessaging(app)

export const requestToken = (setTokenFound) => {
  return getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
    .then((currentToken) => {
      if (currentToken) {
        console.log('current token for client: ', currentToken)
        setTokenFound(true)
      } else {
        console.log('No registration token available. Request permission to generate one.')
        setTokenFound(false)
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    })
}

//emulators
if (useEmulators) {
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectFunctionsEmulator(functions, "localhost", 5001)
}

export const signInWithGoogle = async () => {
  await signInWithRedirect(auth, provider)
}

export const createUserIfNotExists = async (user) => {
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

export const registerStall = httpsCallable(functions, 'stallFunctions-registerStall')

export const toggleStallStatus = async (stallDocRef, status) => {
  await updateDoc(stallDocRef, { status: status })
}

export const updateStallDetails = httpsCallable(functions, 'stallFunctions-updateStallDetails')

export const unregisterStall = httpsCallable(functions, 'stallFunctions-unregisterStall')

export const addMenuItem = httpsCallable(functions, 'stallFunctions-addMenuItem')

export const toggleItemAvail = async (itemDocRef, isAvailable) => {
  await updateDoc(itemDocRef, { isAvailable: isAvailable })
}

export const updateItemDetails = httpsCallable(functions, 'stallFunctions-updateItemDetails')

export const deleteMenuItem = async (stallID, itemID) => {
  await deleteDoc(doc(db, "stalls", stallID, "menu", itemID))
}

export const reportCustomer = httpsCallable(functions, 'stallFunctions-reportCustomer')

export const stallCancelOrder = httpsCallable(functions, 'stallFunctions-cancelOrder')

export const orderMarkClaimed = async (orderID) => {
  const orderDocRef = doc(db, "orders", orderID)

  await updateDoc(orderDocRef, { orderStatus: 'Completed' })
}

export const orderMarkUnclaimed = async (orderID) => {
  const orderDocRef = doc(db, "orders", orderID)

  await updateDoc(orderDocRef, { orderStatus: 'Unclaimed' })
}

export const orderMarkReady = httpsCallable(functions, 'stallFunctions-orderMarkReady')

export const orderStartCooking = httpsCallable(functions, 'stallFunctions-orderStartCooking')

export const orderEndCooking = httpsCallable(functions, 'stallFunctions-orderEndCooking')

//[END Stall functions]


//[START Customer functions]
export const createOrder = httpsCallable(functions, 'customerFunctions-createOrder')

export const customerCancelOrder = httpsCallable(functions, 'customerFunctions-cancelOrder')

//[END Customer functions]

export { db, auth }
