import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db, toggleItemAvail } from '../../../utils/firebase'
import currency from 'currency.js'

const Menu = ({ stallID, selectedItem, setSelectedItem }) => {
    const [menuSnapshot, setMenuSnapshot] = useState(null)
    const [updatedItems, setUpdatedItems] = useState([])
    const [deletedItems, setDeletedItems] = useState([])

    useEffect(() => {
        const q = query(collection(db, "stalls", stallID, 'menu'), orderBy('menuItemName'))

        const unsubscribe = onSnapshot(q, snapshot => {
            setMenuSnapshot(snapshot.docs)

            setUpdatedItems([])
            setDeletedItems([])

            snapshot.docChanges().forEach(change => {
                if (change.type === "modified") { setUpdatedItems([...updatedItems, change.doc]) }
                if (change.type === "removed") { setDeletedItems([...deletedItems, change.doc]) }
            })
        })
        return () => {
            unsubscribe()
            setSelectedItem(null)
        }
    }, [])


    //update selectedItem if modified 
    useEffect(() => {
        if (selectedItem) {
            const latestDoc = updatedItems.find(doc => doc.id === selectedItem.id)
            if (latestDoc) {
                setSelectedItem({ id: latestDoc.id, data: latestDoc.data() })
            }
        }
    }, [updatedItems])

    //set selectedItem to null if deleted
    useEffect(() => {
        if (selectedItem) {
            const deletedDoc = deletedItems.find(doc => doc.id === selectedItem.id)
            if (deletedDoc) {
                setSelectedItem(null)
            }
        }
    }, [deletedItems])

    const [disableSwitch, setDisableSwitch] = useState(false)
    const handleAvailabilityToggle = (menuItemID, isAvailable) => {
        const itemDocRef = doc(collection(db, "stalls", stallID, 'menu'), menuItemID)
        setDisableSwitch(menuItemID)

        if (isAvailable) {
            toggleItemAvail(itemDocRef, false)
                .then(() => setDisableSwitch(null))
        } else {
            toggleItemAvail(itemDocRef, true)
                .then(() => setDisableSwitch(null))
        }
    }

    //TODO: separate cooking and non-cooking???

    return (
        <div className="menu">
            <Box sx={{ p: 2 }}>
                {/* Loading */}
                {!menuSnapshot && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}

                {menuSnapshot && <div>
                    {/* No Menu */}
                    {menuSnapshot.length === 0 && <Typography>No menu items found. Start adding menu items with "Add New Item".</Typography>}

                    {/* Menu List */}
                    {menuSnapshot.length !== 0 &&
                        <List
                            sx={{
                                '&& .Mui-selected': { borderLeft: '4px solid #3f50b5' }
                            }}
                        >
                            {menuSnapshot.map(
                                doc => (
                                    <ListItemButton
                                        key={doc.id}
                                        sx={{
                                            m: '12px 0',
                                            border: '2px solid lightgray',
                                            borderRadius: '8px',

                                        }}
                                        selected={selectedItem && selectedItem.id === doc.id}
                                        onClick={() => {
                                            if (selectedItem && selectedItem.id === doc.id) {
                                                setSelectedItem(null)
                                            } else {
                                                setSelectedItem({ id: doc.id, data: doc.data() })
                                            }
                                        }}>
                                        <ListItemText
                                            primary={doc.data().menuItemName}
                                            secondary={currency(doc.data().price).format({ symbol: 'RM ' })}
                                        />

                                        <ListItemSecondaryAction>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography>{doc.data().isAvailable ? "Available" : "Unavailable"}</Typography>
                                                <Switch
                                                    disabled={disableSwitch === doc.id}
                                                    checked={doc.data().isAvailable}
                                                    onChange={() => handleAvailabilityToggle(doc.id, doc.data().isAvailable)} />
                                            </Stack>
                                        </ListItemSecondaryAction>
                                    </ListItemButton>
                                )
                            )}
                        </List>
                    }
                </div>}

            </Box>
        </div >
    )
}

export default Menu