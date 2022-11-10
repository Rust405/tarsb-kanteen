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

  //props passing test
  const [counter, setCounter] = useState(1)
  const handleIncCounter = () => {
    setCounter(counter + 1)
  }

  const sidebarContent = {
    '/customer/myorders': <OrderPreview counter={counter} />,
    '/customer/browse': <OrderCreate />,
    '/stall/queue': < OrderPreview />,
    '/stall/menu': <MenuItemCUD />
  }

  const [user, loading] = useAuthState(auth)

  //TODO: Redirect user useEffect


  //TODO: Prettier loading screen or component
  if (loading) {
    return (
      <div>
        Authenticating with Google...
      </div>
    )
  }

  return (
    <div className="App">
      {user ? (
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
            />
          </div>

          <div className="main-content">
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <Routes>
                {/* TODO: / route, consider the sidebar as well */}
                <Route path="/customer/myorders" element={<MyOrders handleIncCounter={handleIncCounter} />} />
                <Route path="/customer/browse" element={<Browse />} />
                <Route path="/customer/usersettings" element={<CustomerUserSettings />} />

                <Route path="/stall/queue" element={<Queue />} />
                <Route path="/stall/menu" element={<Menu />} />
                <Route path="/stall/generatesummary" element={<GenerateSummary />} />
                <Route path="/stall/usersettings" element={<StallUserSettings />} />
                <Route path="/stall/stallsettings" element={<StallSettings />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Box>
          </div>

          <div className="multi-purpose-sidebar">
            {pathName in sidebarContent &&
              <MultiPurposeSidebar
                sidebarOpen={sidebarOpen}
                navOpen={navOpen}
                handleSidebarToggle={handleSidebarToggle}
                container={container}
                drawerContent={sidebarContent[pathName]}
              />
            }
          </div>
        </Box>
      ) : (
        <Login />
      )
      }
    </div>
  )
}

export default App;