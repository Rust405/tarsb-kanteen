import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'

import ApplicationBar from '../../app-components/ApplicationBar'
import NavigationDrawer from '../../app-components/NavigationDrawer'
import MultiPurposeSidebar from '../../app-components/MultiPurposeSidebar'

//user pages
import MyOrders from './MyOrders'
import Browse from './Browse'
import CustomerUserSettings from './CustomerUserSettings'

import NotFound from '../../error-pages/NotFound'

//sidebar
import CustOrderPreview from './MyOrders/CustOrderPreview'
import OrderCreate from './Browse/OrderCreate'

const CustomerClient = ({ container, userType, userInfo }) => {
    const [navOpen, setNavOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleDrawerToggle = (e) => {
        if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return
        setNavOpen(!navOpen)
    }

    const handleSidebarToggle = (e) => {
        if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return
        setSidebarOpen(!sidebarOpen)
    }

    //props passing test
    const [counter, setCounter] = useState(1)
    const handleIncCounter = () => {
        setCounter(counter + 1)
    }
    //end props passing test

    return (
        <div className="customer-client">
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                <div className="application-bar">
                    <ApplicationBar handleDrawerToggle={handleDrawerToggle} />
                </div>

                <div className="navigation-drawer">
                    <NavigationDrawer
                        navOpen={navOpen}
                        handleDrawerToggle={handleDrawerToggle}
                        container={container}
                        userType={userType}
                        userInfo={userInfo}
                    />
                </div>

                <div className="main-content" style={{ width: '100%' }}>
                    <Toolbar />
                    <Box component="main" sx={{ flexGrow: 1, p: 2 }}>
                        <Routes>
                            <Route exact path="/" element={<CircularProgress />} />
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
                                    drawerContent={<CustOrderPreview counter={counter} />} />}
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
        </div>)
}

export default CustomerClient