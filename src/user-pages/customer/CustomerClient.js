import React, { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'

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

import { ROUTE, CUSTOMCOMPONENT } from '../../constants'
import { messaging, requestFCMToken } from '../../utils/firebase'
import { onMessage } from 'firebase/messaging'

const CustomerClient = ({ userInfo }) => {
    const [navOpen, setNavOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { pathname } = useLocation()
    useEffect(() => setSidebarOpen(false), [pathname])

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

    //Info snackbar
    const [openInfoSnack, setOpenInfoSnack] = useState(false)
    const [infoMsg, setInfoMsg] = useState('')
    const handleCloseInfoSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenInfoSnack(false)
    }

    //BROWSE page
    const [selectedItems, setSelectedItems] = useState([])
    const [selectedStall, setSelectedStall] = useState(null)
    const [isValidating, setIsValidating] = useState(false)

    //MYORDERS page
    const [selectedOrder, setSelectedOrder] = useState(null)

    // FCM / Push Notification
    const [isTokenFound, setTokenFound] = useState(false)
    const [isFetchingToken, setIsFetchingToken] = useState(false)
    const showRequestSnack = () => {
        setInfoMsg('Please allow notifications to receive push notifications on orders.')
        setOpenInfoSnack(true)
    }

    useEffect(() => {
        setIsFetchingToken(true)
        requestFCMToken(setTokenFound, showRequestSnack)
            .then(setIsFetchingToken(false))

        const unsubMsg = onMessage(messaging, payload => {
            console.log("title", payload.notification.title)
            console.log("body", payload.notification.body)
        })

        return unsubMsg
    }, [])


    return (
        <div className="customer-client">
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                <div className="application-bar">
                    <ApplicationBar navOpen={navOpen} setNavOpen={setNavOpen} />
                </div>

                <div className="navigation-drawer">
                    <NavigationDrawer
                        navOpen={navOpen} setNavOpen={setNavOpen}
                        userType={'customer'}
                        userInfo={userInfo}
                    />
                </div>

                <div className="main-content" style={{ width: '100%' }}>
                    <Toolbar />
                    <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', height: { xs: 'calc(100vh - 56px - 56px)', sm: 'calc(100vh - 64px)' } }}>
                        <Routes>
                            <Route exact path="/" element={<CircularProgress />} />
                            <Route path={ROUTE.CUSTOMER.MYORDERS} element={<MyOrders selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />} />
                            <Route
                                path={ROUTE.CUSTOMER.BROWSE}
                                element={
                                    <Browse selectedItems={selectedItems} setSelectedItems={setSelectedItems}
                                        selectedStall={selectedStall} setSelectedStall={setSelectedStall}
                                        setOpenInfoSnack={setOpenInfoSnack} setInfoMsg={setInfoMsg}
                                        isValidating={isValidating}
                                    />}
                            />
                            <Route path={ROUTE.CUSTOMER.USERSETTINGS} element={<CustomerUserSettings isTokenFound={isTokenFound} isFetchingToken={isFetchingToken} />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Box>
                </div>

                <div className="multi-purpose-sidebar">
                    <Routes>
                        <Route path={ROUTE.CUSTOMER.MYORDERS}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                                    drawerContent={
                                        <CustOrderPreview
                                            selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                                        />
                                    }
                                    bleedMsg={selectedOrder ? 'Order Selected' : 'No Order Selected'}
                                />}
                        />
                        <Route path={ROUTE.CUSTOMER.BROWSE}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                                    drawerContent={
                                        <OrderCreate selectedItems={selectedItems} setSelectedItems={setSelectedItems} selectedStall={selectedStall}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg} />
                                    }
                                    bleedMsg={`${(selectedItems.length > 0 ? selectedItems.length : 'No')} Item(s) Selected`}
                                />}
                        />
                        <Route path='*' element={<></>} />
                    </Routes>
                </div>

            </Box>

            {/* Success snackbar */}
            < Snackbar open={openSucSnack} autoHideDuration={5000} onClose={handleCloseSucSnack} >
                <CUSTOMCOMPONENT.Alert onClose={handleCloseSucSnack} severity="success" sx={{ width: '100%' }}>
                    {sucMsg}
                </CUSTOMCOMPONENT.Alert>
            </Snackbar >

            {/* Error messages snackbar */}
            < Snackbar open={openErrSnack} autoHideDuration={5000 * errMsgs.length} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <CUSTOMCOMPONENT.Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>
                    {errMsgs.length > 1 ?
                        errMsgs.map((errMsg, i) => <Typography key={i}>{`• ${errMsg}`}</Typography>)
                        :
                        <Typography>{errMsgs[0]}</Typography>
                    }
                </CUSTOMCOMPONENT.Alert>
            </Snackbar >

            {/* Info Snackbar */}
            < Snackbar open={openInfoSnack} autoHideDuration={5000} onClose={handleCloseInfoSnack} >
                <CUSTOMCOMPONENT.Alert onClose={handleCloseInfoSnack} severity="info" sx={{ width: '100%' }}>
                    {infoMsg}
                </CUSTOMCOMPONENT.Alert>
            </Snackbar >

        </div>)
}

export default CustomerClient