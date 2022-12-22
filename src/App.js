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

import useOnlineStatus from 'react-online-hook'
import Offline from './error-pages/Offline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { orange } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: orange[500],
      contrastText: 'white'
    }
  }
})

function App(props) {
  const { window } = props
  const container = window !== undefined ? () => window().document.body : undefined
  const navigate = useNavigate()
  const { pathname: pathName } = useLocation()
  const { isOnline } = useOnlineStatus()

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
    if (user) {
      authenticateUser()
    } else {
      setUserType(null)
      setStaffRole(null)
    }
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
  if (isSearchingStaff) return <Loading loadingMsg="Seraching database for stall user..." />

  return (
    <ThemeProvider theme={theme}>
      <div className="App">

        {/* Login Page */}
        {!user && !userType && <Login />}

        {/* New Stall User Landing Page */}
        {isNewStallUser && <NewStallUser setIsNewStallUser={setIsNewStallUser} email={user.email} />}

        {/* Customer Client */}
        {user && userType === 'customer' &&
          <CustomerClient
            container={container}
            userInfo={{ displayName: user.displayName, email: user.email, photoURL: user.photoURL }} />
        }

        {/* StallUser Client */}
        {user && userType === 'stallUser' && staffRole &&
          <StallClient
            container={container}
            staffRole={staffRole}
            stallID={stallID}
            userInfo={{ displayName: user.displayName, email: user.email, photoURL: user.photoURL }} />
        }

        {/* Logged In Snackbar */}
        {user && userType && staffRole &&
          <Snackbar open={openSnack} autoHideDuration={3000} onClose={handleCloseSnack} >
            <CUSTOMCOMPONENT.Alert onClose={handleCloseSnack} severity="success" sx={{ width: '100%' }}>
              Logged in with {user.email}
            </CUSTOMCOMPONENT.Alert>
          </Snackbar>
        }

      </div >
    </ThemeProvider>
  )
}

export default App