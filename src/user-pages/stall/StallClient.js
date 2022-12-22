import React, { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'

import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'

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

import { db, auth, logout } from '../../utils/firebase'
import { doc, onSnapshot } from "firebase/firestore"

import { ROUTE, CUSTOMCOMPONENT } from '../../constants'

const StallClient = ({ container, staffRole, stallID, userInfo }) => {
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

    const stallDocRef = doc(db, "stalls", stallID)

    //current working stall snapshot
    const [stallSnapshot, setStallSnapshot] = useState(null)
    useEffect(function fetchStalls() {
        const unsubscribe = onSnapshot(stallDocRef, doc =>
            setStallSnapshot(doc.data())
        )
        return () => unsubscribe()
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

    return (
        <div className="stall-client">
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
                        userType={'stallUser'}
                        staffRole={staffRole}
                        stallStatus={stallSnapshot ? stallSnapshot.status : null}
                        userInfo={userInfo}
                    />
                </div>

                <div className="main-content" style={{ width: '100%' }}>
                    <Toolbar />
                    <Box component="main" sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 'calc(100vh - 80px)' }}>
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
                            <Route path={ROUTE.STALL.USERSETTINGS} element={<StallUserSettings />} />
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
                                    sidebarOpen={sidebarOpen}
                                    handleSidebarToggle={handleSidebarToggle}
                                    container={container}
                                    drawerContent={
                                        < StallOrderPreview
                                            selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                                        />
                                    }
                                />}
                        />
                        <Route path={ROUTE.STALL.MENU}
                            element={
                                <MultiPurposeSidebar
                                    sidebarOpen={sidebarOpen}
                                    handleSidebarToggle={handleSidebarToggle}
                                    container={container}
                                    drawerContent={
                                        <MenuItemCUD
                                            selectedItem={selectedItem}
                                            stallID={stallID}
                                            isValidating={isValidating} setIsValidating={setIsValidating}
                                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                                        />
                                    }
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
                        <div>{errMsgs[0]}</div>
                    }
                </CUSTOMCOMPONENT.Alert>
            </Snackbar >
        </div >
    )
}

export default StallClient