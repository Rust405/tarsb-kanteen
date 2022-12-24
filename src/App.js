import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Snackbar from '@mui/material/Snackbar'

import Login from './Login'
import Loading from './Loading'

import { auth, createUserIfNotExists, findStallUser } from './utils/firebase'
import { useAuthState } from "react-firebase-hooks/auth"

import CustomerClient from './user-pages/customer/CustomerClient'
import StallClient from './user-pages/stall/StallClient'
import NewStallUser from './user-pages/stall/NewStallUser'

import { ROUTE, CUSTOMCOMPONENT } from './constants'

import Offline from './error-pages/Offline'

function App() {
  const navigate = useNavigate()
  const { pathname: pathName } = useLocation()

  //online/offline
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const setOnline = () => setIsOnline(true)
  const setOffline = () => setIsOnline(false)

  useEffect(function registerLineListener() {
    window.addEventListener('offline', setOffline)
    window.addEventListener('online', setOnline)
    return () => {
      window.removeEventListener('offline', setOffline)
      window.removeEventListener('online', setOnline)
    }
  }, [])

  //Snackbar log in success
  const [openSnack, setOpenSnack] = useState(false)
  const handleCloseSnack = (event, reason) => {
    if (reason === 'clickaway') return
    setOpenSnack(false)
  }

  //user variables
  const [user, loading] = useAuthState(auth)
  const [userType, setUserType] = useState(null)
  const [isFetchingUserType, setIsFetchingUserType] = useState(false)

  //stall avariables
  const [stallID, setStallID] = useState(false)
  const [staffRole, setStaffRole] = useState(null)
  const [isSearchingStaff, setIsSearchingStaff] = useState(false)
  const [isNewStallUser, setIsNewStallUser] = useState(false)

  useEffect(() => {
    if (!user) {
      setUserType(null)
      setStaffRole(null)
      return
    }
    authenticateUser()
  }, [user])

  function authenticateUser() {
    createUserIfNotExists(user)
    setIsFetchingUserType(true)
    fetchUserType()
      .then(fetchedUserType => {
        setUserType(fetchedUserType)
        setIsFetchingUserType(false)
        setOpenSnack(true)
      })
  }

  async function fetchUserType() {
    let tokenResult = await auth.currentUser.getIdTokenResult()
    while (tokenResult.claims.userType === undefined) {
      tokenResult = await auth.currentUser.getIdTokenResult(true)
    }
    return tokenResult.claims.userType
  }

  //redirect user after login
  useEffect(function redirectUser() {
    if (userType === 'customer') {
      if (pathName === '/') navigate(ROUTE.CUSTOMER.MYORDERS, { replace: true })
    }
    else if (userType === 'stallUser') {
      setIsSearchingStaff(true)

      findStallUser(user.email)
        .then((result) => {
          if (result === null) {
            setIsSearchingStaff(false)
            setIsNewStallUser(true)
          } else {
            setStallID(result.stallID)
            setStaffRole(result.staffRole)
            setIsSearchingStaff(false)

            if (pathName === '/') navigate(ROUTE.STALL.QUEUE, { replace: true })
          }
        })
    }
  }, [userType])

  //offline
  if (!isOnline) return <Offline />

  //Loading pages
  if (loading) return <Loading loadingMsg="Authenticating with Google..." />
  if (isFetchingUserType) return <Loading loadingMsg="Setting user... (This may take a while for new users)" />
  if (isSearchingStaff) return <Loading loadingMsg="Searching database for stall user..." />

  return (
    <div className="App">

      {/* Login Page */}
      {!user && !userType && <Login />}

      {/* New Stall User Landing Page */}
      {isNewStallUser && <NewStallUser setIsNewStallUser={setIsNewStallUser} email={user.email} />}

      {/* Customer Client */}
      {user && userType === 'customer' &&
        <CustomerClient
          userInfo={{ displayName: user.displayName, email: user.email, photoURL: user.photoURL }} />
      }

      {/* StallUser Client */}
      {user && userType === 'stallUser' && staffRole &&
        <StallClient
          staffRole={staffRole}
          stallID={stallID}
          userInfo={{ displayName: user.displayName, email: user.email, photoURL: user.photoURL }} />
      }

      {/* Logged In Snackbar */}
      {user && userType &&
        <Snackbar open={openSnack} autoHideDuration={3000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
          <CUSTOMCOMPONENT.Alert onClose={handleCloseSnack} severity="success" sx={{ width: '100%' }}>
            Logged in with {user.email}
          </CUSTOMCOMPONENT.Alert>
        </Snackbar>
      }

    </div >
  )
}

export default App