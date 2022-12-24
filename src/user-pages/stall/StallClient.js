import React, { useState, useEffect } from 'react'
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

import { db, auth, logout, requestFCMToken, messaging } from '../../utils/firebase'
import { doc, onSnapshot } from "firebase/firestore"
import { onMessage } from 'firebase/messaging'

import { ROUTE, CUSTOMCOMPONENT } from '../../constants'

import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const StallClient = ({ staffRole, stallID, userInfo }) => {
    const [navOpen, setNavOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { pathname } = useLocation()
    useEffect(() => setSidebarOpen(false), [pathname])

    const stallDocRef = doc(db, "stalls", stallID)

    //current working stall snapshot
    const [stallSnapshot, setStallSnapshot] = useState(null)
    useEffect(function fetchStalls() {
        const unsubscribe = onSnapshot(stallDocRef, doc =>
            setStallSnapshot(doc.data())
        )
        return unsubscribe
    }, [])

    //immediately logout user if removed from stall or stall is unregistered
    useEffect(() => {
        if (stallSnapshot) {
            let authEmail = auth.currentUser.email
            if ((!stallSnapshot.staffEmails.includes(authEmail) && stallSnapshot.ownerEmail !== authEmail) || stallSnapshot.ownerEmail === '') {
                logout()
            }
        }
    }, [stallSnapshot])

    //Info snackbar
    const [openInfoSnack, setOpenInfoSnack] = useState(false)
    const [infoMsg, setInfoMsg] = useState('')
    const handleCloseInfoSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenInfoSnack(false)
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

    //MENU PAGE
    const [selectedItem, setSelectedItem] = useState(null)
    const [isValidating, setIsValidating] = useState(false)

    //QUEUE PAGE
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
            toast.info(
                <>
                    <Typography sx={{ fontWeight: 'bold' }}>{payload.notification.title}</Typography>
                    <Typography>{payload.notification.body}</Typography>
                </>
            )
        })

        return unsubMsg
    }, [])

    return (
        <div className="stall-client">
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                <div className="application-bar">
                    <ApplicationBar navOpen={navOpen} setNavOpen={setNavOpen} />
                </div>

                <div className="navigation-drawer">
                    <NavigationDrawer
                        navOpen={navOpen} setNavOpen={setNavOpen}
                        userType={'stallUser'}
                        staffRole={staffRole}
                        stallStatus={stallSnapshot ? stallSnapshot.status : null}
                        userInfo={userInfo}
                    />
                </div>

                <div className="main-content" style={{ width: '100%' }}>
                    <Toolbar />
                    <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', height: { xs: 'calc(100vh - 56px - 56px)', sm: 'calc(100vh - 64px)' } }}>
                        <Routes>
                            <Route exact path="/" element={<CircularProgress />} />
                            <Route path={ROUTE.STALL.QUEUE} element={
                                <Queue
                                    selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
                                    isValidating={isValidating} setIsValidating={setIsValidating}
                                    setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                    setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                                    stallID={stallID}
                                />
                            } />
                            <Route path={ROUTE.STALL.MENU} element={<Menu stallID={stallID} selectedItem={selectedItem} setSelectedItem={setSelectedItem} isValidating={isValidating} />} />
                            <Route path={ROUTE.STALL.GENERATESUMMARY} element={<GenerateSummary />} />
                            <Route path={ROUTE.STALL.USERSETTINGS} element={<StallUserSettings isTokenFound={isTokenFound} isFetchingToken={isFetchingToken} />} />
                            {staffRole === 'owner' &&
                                <Route
                                    path={ROUTE.STALL.STALLSETTINGS}
                                    element={<StallSettings stallSnapshot={stallSnapshot} stallDocRef={stallDocRef} stallID={stallID}
                                        setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                        setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg} />}
                                />
                            }
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Box>
                </div>

                <div className="multi-purpose-sidebar">
                    <Routes>
                        <Route path={ROUTE.STALL.QUEUE}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                                    drawerContent={
                                        < StallOrderPreview
                                            selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                                        />
                                    }
                                    bleedMsg={selectedOrder ? 'Order Selected' : 'No Order Selected'}
                                />}
                        />
                        <Route path={ROUTE.STALL.MENU}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                                    drawerContent={
                                        <MenuItemCUD
                                            selectedItem={selectedItem}
                                            stallID={stallID}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                                        />
                                    }
                                    bleedMsg={selectedItem ? 'Item Selected' : 'No Item Selected'}
                                />}
                        />
                        <Route path='*' element={<></>} />
                    </Routes>
                </div>
            </Box >

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

            {/* Push Notifications */}
            <ToastContainer position="top-center" />
        </div >
    )
}

export default StallClient