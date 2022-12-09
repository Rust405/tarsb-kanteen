import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import CircularProgress from '@mui/material/CircularProgress'

import { useState, useEffect } from 'react'
import { db } from '../../../utils/firebase'
import { capitalizeFirstLetter } from '../../../utils/tools'
import { collection, orderBy, query, onSnapshot } from 'firebase/firestore'

const Browse = () => {

    const [stallsSnapshot, setStallsSnapshot] = useState(null)
    const [selectedStall, setSelectedStall] = useState('')

    const [menuSnapshot, setMenuSnapshot] = useState(null)

    //stall collection
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

    //menu subcollection
    useEffect(() => {
        if (selectedStall) {
            const q = query(collection(db, "stalls", selectedStall.id, 'menu'), orderBy('menuItemName'))

            const unsubscribe = onSnapshot(q, snapshot => {
                setMenuSnapshot(snapshot.docs)
            })
            return () => {
                unsubscribe()
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


    return (
        <div className="browse">
            {/* Loading */}
            {!stallsSnapshot &&
                <Box display="flex" justifyContent="center" sx={{ p: 2 }}>
                    <CircularProgress />
                </Box>
            }

            {/* No stalls */}
            {stallsSnapshot && stallsSnapshot.length === 0 &&
                <Typography sx={{ p: 2 }}>There are currently no stalls registered.</Typography>
            }

            {stallsSnapshot && stallsSnapshot.length !== 0 && selectedStall &&
                <div>
                    <Box sx={{ display: { xs: 'block', sm: 'flex' }, borderBottom: '2px solid lightgray', p: 1 }}>
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

                            {/* TODO: */}
                            <Typography>Wait time for new orders: {"10"} - {"20"} min(s)</Typography>
                        </Box>

                    </Box>

                    {/* Menu */}
                    <Box sx={{ p: 2 }}>
                        {menuSnapshot.length === 0 &&
                            <Typography>No menu items found. This stall has not listed any menu items.</Typography>
                        }

                        {menuSnapshot.length !== 0 &&
                            <div>Something</div>
                        }
                    </Box>

                </div>
            }

        </div>
    )
}

export default Browse