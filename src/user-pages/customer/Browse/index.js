import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'

import { useState, useEffect } from 'react'
import { db } from '../../../utils/firebase'
import { capitalizeFirstLetter } from '../../../utils/tools'
import { collection, orderBy, query, onSnapshot } from 'firebase/firestore'

import currency from 'currency.js'

const Browse = () => {

    const [stallsSnapshot, setStallsSnapshot] = useState(null)
    const [selectedStall, setSelectedStall] = useState('')

    const [menuSnapshot, setMenuSnapshot] = useState(null)

    //Stall collection
    useEffect(() => {
        const q = query(collection(db, "stalls"), orderBy('stallName'))

        const unsubscribe = onSnapshot(q, snapshot => {
            setStallsSnapshot(snapshot.docs)
        })

        return () => {
            unsubscribe()
            setSelectedStall('')
        }
    }, [])

    //Menu subcollection
    useEffect(() => {
        if (selectedStall) {
            const q = query(collection(db, "stalls", selectedStall.id, 'menu'), orderBy('menuItemName'))

            const unsubscribe = onSnapshot(q, snapshot => {
                setMenuSnapshot(snapshot.docs)
            })
            return () => {
                unsubscribe()
                setMenuSnapshot(null)
            }
        }
    }, [selectedStall])


    //select first stall in stalls snapshot
    useEffect(() => {
        if (stallsSnapshot) {
            if (!selectedStall) {
                setSelectedStall(stallsSnapshot[0])
            }
        }
    }, [stallsSnapshot])

    //TODO: handle stall update
    //TODO: hanlde stall delete

    //TODO: remove selected item from order if deleted, or disabled
    //TODO: update selected item details if updated

    //TODO: separate out unavailable and non-coooking into 2 other lists?

    //TODO: figure out how to handle preorders :(

    //Note: dont disable selection if stall is closed cuz preorders
    //But make sure somehow preorder is not placed in an impossible time

    // TODO: make stall selector box sticky

    return (
        <div className="browse">

            {/* Loading stalls */}
            {!stallsSnapshot && <Box display="flex" justifyContent="center" sx={{ p: 2 }}><CircularProgress /></Box>}

            {/* No stalls */}
            {stallsSnapshot && stallsSnapshot.length === 0 && <Typography sx={{ p: 2 }}>There are currently no stalls registered.</Typography>}

            {/* Have stalls */}
            {stallsSnapshot && stallsSnapshot.length !== 0 && selectedStall && <div>
                {/* Stall Selector */}
                <Box sx={{ display: { xs: 'block', sm: 'flex' }, borderBottom: '2px solid lightgray', p: 1 }}>
                    {/* Stall select dropdown */}
                    <Box sx={{ p: 1, width: '100%' }}>
                        <FormControl fullWidth>
                            <Select
                                value={selectedStall}
                                onChange={e => setSelectedStall(e.target.value)}
                                onClose={() => setTimeout(() => { document.activeElement.blur() }, 0)}
                            >
                                {stallsSnapshot.map(stallDoc =>
                                    <MenuItem value={stallDoc} key={stallDoc.id}>{stallDoc.data().stallName}</MenuItem>
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

                        {/* TODO: calculate wait time for stall */}
                        <Typography>Wait time for new orders: TODO min(s)</Typography>
                    </Box>
                </Box>

                {!menuSnapshot && <Typography sx={{ p: 2 }}>Loading menu items...</Typography>}

                {menuSnapshot &&
                    <Box sx={{ p: 2 }}>
                        {/* No Menu */}
                        {menuSnapshot.length === 0 && <Typography>No menu items found. This stall has not listed any menu items.</Typography>}

                        {/* Menu list */}
                        {menuSnapshot.length !== 0 &&
                            <List sx={{ '&& .Mui-selected': { borderLeft: '4px solid #3f50b5' } }} >
                                {menuSnapshot.map(
                                    doc => (
                                        <ListItemButton
                                            disabled={!doc.data().isAvailable}
                                            key={doc.id}
                                            sx={{
                                                m: '12px 0',
                                                border: '2px solid lightgray',
                                                borderRadius: '8px',

                                            }}
                                            onClick={() => console.log("CLicked")}
                                        >
                                            <ListItemText
                                                primary={
                                                    doc.data().menuItemName +  ` ${doc.data().isRequireWaiting ? `(est. ${doc.data().estWaitTime} min)` : ''}`
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

        </div>
    )
}

export default Browse