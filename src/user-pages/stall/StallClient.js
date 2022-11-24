import React, { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'

import ApplicationBar from '../../app-components/ApplicationBar'
import NavigationDrawer from '../../app-components/NavigationDrawer'
import MultiPurposeSidebar from '../../app-components/MultiPurposeSidebar'

//stall pages
import Queue from './Queue'
import Menu from './Menu'
import GenerateSummary from './GenerateSummary'
import StallUserSettings from './StallUserSettings'
import StallSettings from './StallSettings'

import NotFound from '../../error-pages/NotFound'

//sidebar
import StallOrderPreview from './Queue/StallOrderPreview'
import MenuItemCUD from './Menu/MenuItemCUD'

const StallClient = ({ container, userType, staffRole }) => {
    const [navOpen, setNavOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { pathname: pathName } = useLocation()

    const handleDrawerToggle = (e) => {
        if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return
        setNavOpen(!navOpen)
    }

    const handleSidebarToggle = (e) => {
        if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <div className="stall-client">
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
                        staffRole={staffRole}
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
                            {staffRole === 'owner' && <Route path="/stall/stallsettings" element={<StallSettings />} />}
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
                                    drawerContent={< StallOrderPreview />} />}
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
        </div>
    )
}

export default StallClient