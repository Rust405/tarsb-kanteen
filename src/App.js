import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'

import ApplicationBar from './components/ApplicationBar'
import NavigationDrawer from './components/NavigationDrawer'

//user pages
import MyOrders from './user-pages/customer/MyOrders'
import Browse from './user-pages/customer/Browse'
import CustomerUserSettings from './user-pages/customer/CustomerUserSettings'

//stall pages
import Queue from './user-pages/stall/Queue'
import Menu from './user-pages/stall/Menu'
import GenerateSummary from './user-pages/stall/GenerateSummary'
import StallUserSettings from './user-pages/stall/StallUserSettings'
import StallSettings from './user-pages/stall/StallSettings'
import NotFound from './error-pages/NotFound'
import NewStallUser from './user-pages/stall/NewStallUser'

//sidebar
import MultiPurposeSidebar from './components/MultiPurposeSidebar'
import OrderPreview from './components/OrderPreview'
import OrderCreate from './components/OrderCreate'
import MenuItemCUD from './components/MenuItemCUD'

import Login from './login-page/Login'

import { auth, findStallUser } from './utils/firebase'
import { useAuthState } from "react-firebase-hooks/auth"

function App(props) {
  const { window } = props
  const { pathname: pathName } = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const container = window !== undefined ? () => window().document.body : undefined
  const navigate = useNavigate()

  const handleDrawerToggle = (e) => {
    if (
      e &&
      e.type === 'keydown' &&
      (e.key === 'Tab' || e.key === 'Shift')
    ) {
      return;
    }
    setNavOpen(!navOpen)
  }

  const handleSidebarToggle = (e) => {
    if (
      e &&
      e.type === 'keydown' &&
      (e.key === 'Tab' || e.key === 'Shift')
    ) {
      return;
    }
    setSidebarOpen(!sidebarOpen)
  }

  //props passing test, TODO: change to Redux maybe
  const [counter, setCounter] = useState(1)
  const handleIncCounter = () => {
    setCounter(counter + 1)
  }

  const [user, loading] = useAuthState(auth)
  const [userType, setUserType] = useState(null)
  const [isFetchingUserType, setIsFetchingUserType] = useState(false)

  const [stallID, setStallID] = useState(false)
  const [staffRole, setStaffRole] = useState(null)
  const [isSearchingStaff, setIsSearchingStaff] = useState(false)
  const [isNewStallUser, setIsNewStallUser] = useState(false)

  useEffect(() => {
    if (user) {
      setIsFetchingUserType(true)
      fetchUserType()
        .then(fetchedUserType => {
          setUserType(fetchedUserType)
          setIsFetchingUserType(false)
        })
    } else {
      setUserType(null)
      setStaffRole(null)
    }
  }, [user])

  const fetchUserType = async () => {
    var tokenResult = await auth.currentUser.getIdTokenResult()
    while (tokenResult.claims.userType === undefined) {
      tokenResult = await auth.currentUser.getIdTokenResult(true)
    }
    return tokenResult.claims.userType
  }

  useEffect(() => {
    redirectUser()
  }, [userType])

  const redirectUser = () => {
    if (userType === 'customer') {
      navigate('/customer/myorders', { replace: true })
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
            navigate('/stall/queue', { replace: true })
          }
        })
    }
  }

  //Loading pages
  if (loading) return <Typography variant="paragraph">Authenticating with Google..</Typography>
  if (isFetchingUserType) return <Typography variant="paragraph">Setting user...</Typography>
  if (isSearchingStaff) return <Typography variant="paragraph">Seraching for staff in database...</Typography>

  return (
    <div className="App">

      {/* Login Page */}
      {!user && !userType && <Login />
      }

      {/* New Stall User Landing Page */}
      {isNewStallUser && <NewStallUser setIsNewStallUser={setIsNewStallUser} />}

      {/* Customer App */}
      {user && userType === 'customer' &&
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />

          <div className="application-bar">
            <ApplicationBar handleDrawerToggle={handleDrawerToggle} pathName={pathName} />
          </div>

          <div className="navigation-drawer">
            <NavigationDrawer
              navOpen={navOpen}
              handleDrawerToggle={handleDrawerToggle}
              container={container}
              userType={userType}
            />
          </div>

          <div className="main-content">
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <Routes>
                <Route exact path="/" element={<div>Loading...</div>} />
                <Route path="/customer/myorders" element={<MyOrders handleIncCounter={handleIncCounter} />} />
                <Route path="/customer/browse" element={<Browse />} />
                <Route path="/customer/usersettings" element={<CustomerUserSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </div>

          <div className="multi-purpose-sidebar">
            <Routes>
              <Route path='/customer/myorders'
                element={
                  <MultiPurposeSidebar
                    sidebarOpen={sidebarOpen}
                    navOpen={navOpen}
                    handleSidebarToggle={handleSidebarToggle}
                    container={container}
                    drawerContent={<OrderPreview counter={counter} />} />}
              />
              <Route path='/customer/browse'
                element={
                  <MultiPurposeSidebar
                    sidebarOpen={sidebarOpen}
                    navOpen={navOpen}
                    handleSidebarToggle={handleSidebarToggle}
                    container={container}
                    drawerContent={<OrderCreate />} />}
              />
              <Route path='*' element={<></>} />
            </Routes>
          </div>

        </Box>
      }

      {/* StallUser App */}
      {user && userType === 'stallUser' && staffRole &&
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />

          <div className="application-bar">
            <ApplicationBar handleDrawerToggle={handleDrawerToggle} pathName={pathName} />
          </div>

          <div className="navigation-drawer">
            <NavigationDrawer
              navOpen={navOpen}
              handleDrawerToggle={handleDrawerToggle}
              container={container}
              userType={userType}
            />
          </div>

          <div className="main-content">
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <Routes>
                <Route exact path="/" element={<div>Loading...</div>} />
                <Route path="/stall/queue" element={<Queue />} />
                <Route path="/stall/menu" element={<Menu />} />
                <Route path="/stall/generatesummary" element={<GenerateSummary />} />
                <Route path="/stall/usersettings" element={<StallUserSettings />} />
                <Route path="/stall/stallsettings" element={<StallSettings staffRole={staffRole} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </div>

          <div className="multi-purpose-sidebar">
            <Routes>
              <Route path='/stall/queue'
                element={
                  <MultiPurposeSidebar
                    sidebarOpen={sidebarOpen}
                    navOpen={navOpen}
                    handleSidebarToggle={handleSidebarToggle}
                    container={container}
                    drawerContent={< OrderPreview />} />}
              />
              <Route path='/stall/menu'
                element={
                  <MultiPurposeSidebar
                    sidebarOpen={sidebarOpen}
                    navOpen={navOpen}
                    handleSidebarToggle={handleSidebarToggle}
                    container={container}
                    drawerContent={<MenuItemCUD />} />}
              />
              <Route path='*' element={<></>} />
            </Routes>
          </div>

        </Box>
      }

    </div >
  )
}

export default App;