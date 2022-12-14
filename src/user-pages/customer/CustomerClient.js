import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'

import ApplicationBar from '../../app-components/ApplicationBar'
import NavigationDrawer from '../../app-components/NavigationDrawer'
import MultiPurposeSidebar from '../../app-components/MultiPurposeSidebar'

//user pages
import MyOrders from './MyOrders'
import Browse from './Browse'
import CustomerUserSettings from './CustomerUserSettings'

import NotFound from '../../error-pages/NotFound'

import { Alert } from '../../constants/components'
import { ROUTE } from '../../constants'

//sidebar
import CustOrderPreview from './MyOrders/CustOrderPreview'
import OrderCreate from './Browse/OrderCreate'

const CustomerClient = ({ container, userInfo }) => {
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

    //Error snackbar
    const [openErrSnack, setOpenErrSnack] = useState(false)
    const [errMsgs, setErrMsgs] = useState([])
    const handleCloseErrSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenErrSnack(false)
    }

    //Success snackbar
    const [openSucSnack, setOpenSucSnack] = useState(false)
    const [sucMsg, setSucMsg] = useState('')
    const handleCloseSucSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenSucSnack(false)
    }

    //BROWSE page
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedStall, setSelectedStall] = useState('')
    const [isValidating, setIsValidating] = useState(false)

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
                        userType={'customer'}
                        userInfo={userInfo}
                    />
                </div>

                <div className="main-content" style={{ width: '100%' }}>
                    <Toolbar />
                    <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
                        <Routes>
                            <Route exact path="/" element={<CircularProgress />} />
                            <Route path={ROUTE.CUSTOMER.MYORDERS} element={<MyOrders />} />
                            <Route
                                path={ROUTE.CUSTOMER.BROWSE}
                                element={
                                    <Browse selectedItems={selectedItems} setSelectedItems={setSelectedItems}
                                        selectedStall={selectedStall} setSelectedStall={setSelectedStall}
                                        isValidating={isValidating}
                                    />}
                            />
                            <Route path={ROUTE.CUSTOMER.USERSETTINGS} element={<CustomerUserSettings />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Box>
                </div>

                <div className="multi-purpose-sidebar">
                    <Routes>
                        <Route path={ROUTE.CUSTOMER.MYORDERS}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen}
                                    navOpen={navOpen}
                                    handleSidebarToggle={handleSidebarToggle}
                                    container={container}
                                    drawerContent={
                                        <CustOrderPreview />
                                    }
                                />}
                        />
                        <Route path={ROUTE.CUSTOMER.BROWSE}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen}
                                    navOpen={navOpen}
                                    handleSidebarToggle={handleSidebarToggle}
                                    container={container}
                                    drawerContent={
                                        <OrderCreate selectedItems={selectedItems} setSelectedItems={setSelectedItems} selectedStall={selectedStall}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg} />
                                    }
                                />}
                        />
                        <Route path='*' element={<></>} />
                    </Routes>
                </div>

            </Box>

            {/* Success snackbar */}
            < Snackbar open={openSucSnack} autoHideDuration={5000} onClose={handleCloseSucSnack} >
                <Alert onClose={handleCloseSucSnack} severity="success" sx={{ width: '100%' }}>
                    {sucMsg}
                </Alert>
            </Snackbar >

            {/* Error messages snackbar */}
            < Snackbar open={openErrSnack} autoHideDuration={5000 * errMsgs.length} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>
                    {errMsgs.length > 1 ?
                        errMsgs.map((errMsg, i) => <Typography key={i}>{`• ${errMsg}`}</Typography>)
                        :
                        <div>{errMsgs[0]}</div>
                    }
                </Alert>
            </Snackbar >
        </div>)
}

export default CustomerClient