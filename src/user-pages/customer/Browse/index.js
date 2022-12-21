import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'
import Stack from '@mui/material/Stack'

import { useState, useEffect } from 'react'
import { db } from '../../../utils/firebase'
import { capitalizeFirstLetter } from '../../../utils/tools'
import { collection, orderBy, query, onSnapshot, limit, where, getDocs } from 'firebase/firestore'

import dayjs from 'dayjs'
import currency from 'currency.js'

const itemStyle = {
    m: '12px 0',
    border: '2px solid lightgray',
    borderRadius: '8px',
}

const Browse = ({
    selectedItems, setSelectedItems,
    selectedStall, setSelectedStall,
    setOpenInfoSnack, setInfoMsg,
    isValidating
}) => {
    const [stallsSnapshot, setStallsSnapshot] = useState(null)
    const [menuSnapshot, setMenuSnapshot] = useState(null)

    const [updatedStalls, setUpdatedStalls] = useState([])
    const [deletedStalls, setDeletedStalls] = useState([])

    const [updatedItems, setUpdatedItems] = useState([])
    const [deletedItems, setDeletedItems] = useState([])

    const [lastOrderSnap, setLastOrderSnap] = useState(null)
    const [waitTime, setWaitTime] = useState(0)

    //Stall collection
    useEffect(function fetchStalls() {
        const q = query(collection(db, "stalls"), orderBy('stallName'))

        const unsubscribe = onSnapshot(q, snapshot => {
            setStallsSnapshot(snapshot.docs)

            setUpdatedStalls([])
            setDeletedStalls([])

            snapshot.docChanges().forEach(change => {
                if (change.type === "modified") { setUpdatedStalls([...updatedStalls, change.doc]) }
                if (change.type === "removed") { setDeletedStalls([...deletedStalls, change.doc]) }
            })

        })

        return () => {
            unsubscribe()
            setSelectedStall(null)
        }
    }, [])

    //select first stall in stalls snapshot on load
    useEffect(() => { if (stallsSnapshot && !selectedStall) setSelectedStall(stallsSnapshot[0]) }, [stallsSnapshot])

    //update stall if updated
    useEffect(function handleStallUpdated() {
        if (updatedStalls.length > 0) {
            const latestStall = updatedStalls.find(doc => doc.id === selectedStall.id)
            if (latestStall) {
                setSelectedStall(latestStall)

                setOpenInfoSnack(false)
                setInfoMsg('The stall you are accessing recently updated its information.')
                setOpenInfoSnack(true)
            }
        }
    }, [updatedStalls])

    //select first stall if selected stall is unregistered 
    useEffect(function handleStallUnregister() {
        if (deletedStalls.length > 0) {
            const deletedStall = deletedStalls.find(doc => doc.id === selectedStall.id)
            if (deletedStall) {
                setSelectedStall(stallsSnapshot[0])

                setOpenInfoSnack(false)
                setInfoMsg('The stall you were accessing was recently unregistered.')
                setOpenInfoSnack(true)
            }
        }
    }, [deletedStalls])

    //Menu subcollection
    useEffect(function fetchMenu() {
        if (selectedStall) {
            const queryStall = query(collection(db, "stalls", selectedStall.id, 'menu'), orderBy('menuItemName'))

            const unsubscribeStall = onSnapshot(queryStall, snapshot => {
                setMenuSnapshot(snapshot.docs)

                setUpdatedItems([])
                setDeletedItems([])

                snapshot.docChanges().forEach(change => {
                    if (change.type === "modified") { setUpdatedItems([...updatedItems, change.doc]) }
                    if (change.type === "removed") { setDeletedItems([...deletedItems, change.doc]) }
                })
            })

            const queryLastOrder = query(collection(db, "orders"), where("stallID", "==", selectedStall.id), where("orderStatus", "==", "Placed"), where("isPreOrder", "==", false), orderBy("estCmpltTimestamp", "desc"), limit(1))

            const unsubscribeLastOrder = onSnapshot(queryLastOrder, snapshot => {
                setLastOrderSnap(snapshot.docs)
            })

            return () => {
                unsubscribeStall()
                unsubscribeLastOrder()
                setMenuSnapshot(null)
                setSelectedItems([])
            }
        }
    }, [selectedStall])

    useEffect(() => { if (lastOrderSnap) updateWaitTime() }, [lastOrderSnap])

    const updateWaitTime = () => {
        const lastOrderDoc = lastOrderSnap.find(doc => doc)
        if (lastOrderDoc) {
            const difference = dayjs(lastOrderDoc.data().estCmpltTimestamp.toDate()).diff(dayjs(), 'minute')
            difference > 0 ? setWaitTime(difference) : setWaitTime(0)
        } else {
            setWaitTime(0)
        }
    }

    //updated selectedItems if modified, remove selectedItems if made unavailable
    useEffect(function handleItemsUpdated() {
        if (updatedItems.length > 0) {
            const updatedDocs = []

            selectedItems.forEach(selectedItem => {
                const latestDoc = updatedItems.find(doc => doc.id === selectedItem.id)
                if (latestDoc) {
                    if (latestDoc.data().isAvailable) {
                        updatedDocs.push({ id: latestDoc.id, data: latestDoc.data() })
                    }
                } else {
                    updatedDocs.push(selectedItem)
                }
            })

            setSelectedItems(updatedDocs)

            setOpenInfoSnack(false)
            setInfoMsg('Some menu items have been updated or made unavailable by the stall!')
            setOpenInfoSnack(true)
        }
    }, [updatedItems])

    //remove selectedItem if removed
    useEffect(function handleItemsDeleted() {
        if (deletedItems.length > 0) {
            const remainingDocs = []

            selectedItems.forEach(selectedItem => {
                const deletedDoc = deletedItems.find(doc => doc.id === selectedItem.id)
                if (!deletedDoc) {
                    remainingDocs.push(selectedItem)
                }
            })

            setSelectedItems(remainingDocs)

            setOpenInfoSnack(false)
            setInfoMsg('Some menu items have been removed by the stall!')
            setOpenInfoSnack(true)
        }
    }, [deletedItems])

    const handleSelect = (doc) => {
        if (selectedItems.some(item => item.id === doc.id)) {
            setSelectedItems(selectedItems.filter(item => item.id !== doc.id))
            return
        }

        if (doc.data().isRequireWaiting && selectedItems.some(item => item.data.isRequireWaiting)) {
            setSelectedItems(
                [
                    ...selectedItems.filter(item => !item.data.isRequireWaiting),
                    { id: doc.id, data: doc.data() }
                ])
            return
        }

        setSelectedItems([...selectedItems, { id: doc.id, data: doc.data() }])
    }

    return (
        <div className="browse">

            {/* Loading stalls */}
            {!stallsSnapshot && <Box display="flex" justifyContent="center" sx={{ p: 2 }}><CircularProgress /></Box>}

            {/* No stalls */}
            {stallsSnapshot && stallsSnapshot.length === 0 && <Typography sx={{ p: 2 }}>There are currently no stalls registered.</Typography>}

            {/* Have stalls */}
            {stallsSnapshot && stallsSnapshot.length > 0 && selectedStall && <div>
                {/* Stall Selector */}
                <Box
                    sx={{
                        display: { xs: 'block', sm: 'flex' },
                        borderBottom: '2px solid lightgray',
                        p: 1,
                        position: '-webkit-sticky',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'white',
                        zIndex: 1
                    }}
                >
                    {/* Stall select dropdown */}
                    <Box sx={{ p: 1, width: '100%' }}>
                        <FormControl fullWidth>
                            <Select
                                disabled={isValidating}
                                MenuProps={{ sx: { "&& .Mui-selected": { borderLeft: '4px solid #3f50b5' } } }}
                                value={
                                    stallsSnapshot.find(doc => doc.id === selectedStall.id) ? selectedStall.id : ''
                                }
                                onChange={e => {
                                    setSelectedStall(stallsSnapshot.find(doc => doc.id === e.target.value))
                                }}
                                onClose={() => setTimeout(() => { document.activeElement.blur() }, 0)}
                            >
                                {stallsSnapshot.map(stallDoc =>
                                    <MenuItem value={stallDoc.id} key={stallDoc.id}>{stallDoc.data().stallName}</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Stall Info */}
                    <Box sx={{ p: 1, width: '100%' }}>
                        <Typography>Status: <Box
                            component="span"
                            sx={{
                                color: selectedStall.data().status === "open" ? 'green' : 'red',
                                fontWeight: 'bold'
                            }}>
                            {capitalizeFirstLetter(selectedStall.data().status)}
                        </Box>
                        </Typography>

                        <Stack direction="row" alignItems="center" >
                            <Typography>Est. wait for new orders: {waitTime} min(s)</Typography>
                            <IconButton onClick={updateWaitTime} >
                                <RefreshIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                </Box>

                {!menuSnapshot && <Typography sx={{ p: 2 }}>Loading menu items...</Typography>}

                {menuSnapshot &&
                    <Box sx={{ p: 2 }}>
                        {/* No Menu */}
                        {menuSnapshot.length === 0 && <Typography>No menu items found. This stall has not listed any menu items.</Typography>}

                        {/* Menu list */}
                        {menuSnapshot.length > 0 &&
                            <List sx={{ '&& .Mui-selected': { borderLeft: '4px solid #3f50b5' } }} >

                                {menuSnapshot.filter(doc => doc.data().isRequireWaiting && doc.data().isAvailable).length > 0 &&
                                    < Divider textAlign='left'>Requires Waiting</Divider>
                                }

                                {menuSnapshot
                                    .filter(doc => doc.data().isRequireWaiting && doc.data().isAvailable)
                                    .map(
                                        doc => (
                                            <ListItemButton
                                                disabled={isValidating}
                                                key={doc.id}
                                                sx={itemStyle}
                                                selected={selectedItems.some(item => item.id === doc.id)}
                                                onClick={() => handleSelect(doc)}
                                            >
                                                <ListItemText
                                                    primary={doc.data().menuItemName + ` (est. ${doc.data().estWaitTime} min)`}
                                                    secondary={currency(doc.data().price).format({ symbol: 'RM ' })}
                                                />
                                            </ListItemButton>
                                        )
                                    )}

                                {menuSnapshot.filter(doc => !doc.data().isRequireWaiting && doc.data().isAvailable).length > 0 &&
                                    <Divider textAlign='left'>Immediately Available</Divider>
                                }

                                {menuSnapshot
                                    .filter(doc => !doc.data().isRequireWaiting && doc.data().isAvailable)
                                    .map(
                                        doc => (
                                            <ListItemButton
                                                disabled={isValidating}
                                                key={doc.id}
                                                sx={itemStyle}
                                                selected={selectedItems.some(item => item.id === doc.id)}
                                                onClick={() => handleSelect(doc)}
                                            >
                                                <ListItemText
                                                    primary={doc.data().menuItemName}
                                                    secondary={currency(doc.data().price).format({ symbol: 'RM ' })}
                                                />
                                            </ListItemButton>
                                        )
                                    )}

                                {menuSnapshot.filter(doc => !doc.data().isAvailable).length > 0 &&
                                    <Divider textAlign='left'>Currently Unavailable</Divider>
                                }

                                {menuSnapshot
                                    .filter(doc => !doc.data().isAvailable)
                                    .map(
                                        doc => (
                                            <ListItemButton
                                                disabled
                                                key={doc.id}
                                                sx={itemStyle}
                                            >
                                                <ListItemText
                                                    primary={
                                                        doc.data().menuItemName + ` ${doc.data().isRequireWaiting ? `(est. ${doc.data().estWaitTime} min)` : ''}`
                                                    }
                                                    secondary={currency(doc.data().price).format({ symbol: 'RM ' })}
                                                />
                                            </ListItemButton>
                                        )
                                    )}

                            </List>
                        }
                    </Box>
                }
            </div>}

        </div >
    )
}

export default Browse