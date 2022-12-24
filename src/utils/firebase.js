import { initializeApp } from "firebase/app"
import { getFirestore, setDoc, doc, getDoc, query, collection, where, getDocs, updateDoc, connectFirestoreEmulator, deleteDoc } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signOut, signInWithRedirect } from "firebase/auth"
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions"
import { getMessaging, getToken, onMessage } from "firebase/messaging"

const useEmulators = true //set to true when testing, otherwise set to false in production

const firebaseConfig = {
  apiKey: 'AIzaSyCZ4QPFiT_rsNCDdTJlqEL0P0-d0zzEo_Q',
  authDomain: 'tarsb-kanteen-2022.firebaseapp.com',
  projectId: 'tarsb-kanteen-2022',
  storageBucket: 'tarsb-kanteen-2022.appspot.com',
  messagingSenderId: '1003054218699',
  appId: '1:1003054218699:web:050c22fd2ec953898aca4e',
  measurementId: 'G-NPEZ8SK1Y4'
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

const provider = new GoogleAuthProvider()
provider.setCustomParameters({ prompt: 'select_account' })

const auth = getAuth()

const functions = getFunctions(app, "asia-southeast1")

const messaging = getMessaging(app)

export const requestToken = async (setTokenFound, showRequestSnack) => {
  return getToken(messaging, { vapidKey: 'BDOXep7kAlQRWJAXvdFjxXTLlydcHT0lVlv2HwVHATUJ8wqOef9rFkQf4AJgHHO94CacKMAWHXqKQUHI8hK7UcI' })
    .then(currentToken => {
      if (currentToken) {
        setTokenFound(true)
        console.log("token", currentToken)
        return
      }

      setTokenFound(false)
      showRequestSnack()
    })
    .catch(err => {
      setTokenFound(false)
      showRequestSnack()
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
    setDoc(docRef, {
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
