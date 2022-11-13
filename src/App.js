import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'

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

//sidebar
import MultiPurposeSidebar from './components/MultiPurposeSidebar'
import OrderPreview from './components/OrderPreview'
import OrderCreate from './components/OrderCreate'
import MenuItemCUD from './components/MenuItemCUD'

import { auth } from './utils/firebase'
import { useAuthState } from "react-firebase-hooks/auth"

import Login from './login-page/Login'
import Authenticating from './loading-pages/Authenticating'
import Authorizing from './loading-pages/Authorizing'

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

  //props passing test, TODO: change to Redux
  const [counter, setCounter] = useState(1)
  const handleIncCounter = () => {
    setCounter(counter + 1)
  }

  const [user, loading] = useAuthState(auth)
  const [role, setRole] = useState(null)
  const [isFetchingRole, setIsFetchingRole] = useState(false)

  useEffect(() => {
    if (user) {
      setIsFetchingRole(true)
      fetchRole()
    } else {
      setRole(null)
    }
  }, [user])

  const fetchRole = async () => {
    var tokenResult = await auth.currentUser.getIdTokenResult()
    while (tokenResult.claims.role === undefined) {
      tokenResult = await auth.currentUser.getIdTokenResult(true)
    }
    setRole(tokenResult.claims.role)
    setIsFetchingRole(false)
  }

  //TODO: after sign in as stallUser
  if (role === 'stallUser') {
    //check firestore if they are part of a stall
    //...if found as owner, set current stall and continue
    //...if found as staff, set current stall and continue, but send a prop to stallsettings page to hide content
    //...else show the new user screen, disable other routes
  }

  const Redirect = () => {
    useEffect(() => {
      role === 'customer' ? navigate('/customer/myorders') : navigate('/stall/queue')
    }, [])
    return
  }

  if (loading) return <Authenticating />
  if (isFetchingRole) return <Authorizing />

  return (
    <div className="App">

      {!user && !role &&
        <Login />
      }

      {user && role &&
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
              role={role}
            />
          </div>

          <div className="main-content">
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />

              {role === 'customer' &&
                <Routes>
                  <Route exact path="/" element={<Redirect />} />
                  <Route path="/customer/myorders" element={<MyOrders handleIncCounter={handleIncCounter} />} />
                  <Route path="/customer/browse" element={<Browse />} />
                  <Route path="/customer/usersettings" element={<CustomerUserSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              }
              {role === 'stallUser' &&
                <Routes>
                  <Route exact path="/" element={<Redirect />} />
                  <Route path="/stall/queue" element={<Queue />} />
                  <Route path="/stall/menu" element={<Menu />} />
                  <Route path="/stall/generatesummary" element={<GenerateSummary />} />
                  <Route path="/stall/usersettings" element={<StallUserSettings />} />
                  <Route path="/stall/stallsettings" element={<StallSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              }
            </Box>
          </div>

          <div className="multi-purpose-sidebar">
            {role === 'customer' && (
              (pathName === '/customer/myorders' &&
                <MultiPurposeSidebar
                  sidebarOpen={sidebarOpen}
                  navOpen={navOpen}
                  handleSidebarToggle={handleSidebarToggle}
                  container={container}
                  drawerContent={<OrderPreview counter={counter} />}
                />
              )
              ||
              (pathName === '/customer/browse' &&
                <MultiPurposeSidebar
                  sidebarOpen={sidebarOpen}
                  navOpen={navOpen}
                  handleSidebarToggle={handleSidebarToggle}
                  container={container}
                  drawerContent={<OrderCreate />} />
              )
            )}

            {role === 'stallUser' && (
              (pathName === '/stall/queue' &&
                <MultiPurposeSidebar
                  sidebarOpen={sidebarOpen}
                  navOpen={navOpen}
                  handleSidebarToggle={handleSidebarToggle}
                  container={container}
                  drawerContent={< OrderPreview />}
                />
              )
              ||
              (pathName === '/stall/menu' &&
                <MultiPurposeSidebar
                  sidebarOpen={sidebarOpen}
                  navOpen={navOpen}
                  handleSidebarToggle={handleSidebarToggle}
                  container={container}
                  drawerContent={<MenuItemCUD />}
                />
              )
            )}

          </div>

        </Box>
      }

    </div >
  )
}

export default App;