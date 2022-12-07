import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db, toggleItemAvail } from '../../../utils/firebase'
import currency from 'currency.js'

const Menu = ({ stallID, selectedItem, setSelectedItem }) => {
    const [menuSnapshot, setMenuSnapshot] = useState(null)
    const [updatedItems, setUpdatedItems] = useState([])

    const menuRef = collection(db, "stalls", stallID, 'menu')
    const q = query(menuRef, orderBy('menuItemName'))

    useEffect(() => {
        const unsubscribe = onSnapshot(q, snapshot => {
            setMenuSnapshot(snapshot.docs)

            setUpdatedItems([])

            snapshot.docChanges().forEach(change => {
                if (change.type === "modified") { setUpdatedItems([...updatedItems, change.doc]) }
            })
        })
        return () => {
            unsubscribe()
            setSelectedItem(null)
        }
    }, [])

    //TODO: handle deleted item

    //update selectedItem if modified externally
    useEffect(() => {
        if (selectedItem) {
            const latestDoc = updatedItems.find(doc => doc.id === selectedItem.id)
            if (latestDoc) {
                setSelectedItem({ id: latestDoc.id, data: latestDoc.data() })
            }
        }
    }, [updatedItems])

    const [disableSwitch, setDisableSwitch] = useState(false)
    const handleAvailabilityToggle = (menuItemID, isAvailable) => {
        const itemDocRef = doc(menuRef, menuItemID)
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
            {!menuSnapshot &&
                <Box display="flex" justifyContent="center">
                    <CircularProgress />
                </Box>
            }

            {menuSnapshot && <div>
                {menuSnapshot.length === 0 &&
                    <Typography>No menu items found. Start adding menu items with "Add New Item".</Typography>
                }

                {menuSnapshot.length !== 0 &&
                    <List sx={{ '&& .Mui-selected': { borderLeft: '4px solid #3f50b5' } }} >
                        {menuSnapshot.map(
                            doc => (
                                <ListItem
                                    button
                                    key={doc.id}
                                    ContainerComponent="div"
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
                                </ListItem>
                            )
                        )}
                    </List>
                }
            </div>}


        </div >
    )
}

export default Menu