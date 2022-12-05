import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'

import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db, toggleItemAvail } from '../../../utils/firebase'

const Menu = ({ stallID, selectedItem, setSelectedItem }) => {
    const [menuSnapshot, setMenuSnapshot] = useState(null)
    const menuRef = collection(db, "stalls", stallID, 'menu')
    const q = query(menuRef, orderBy('menuItemName'))

    useEffect(() => {
        const unsubscribe = onSnapshot(q, snapshot => {
            setMenuSnapshot(snapshot.docs)

            if (selectedItem) {
                updateSelectedItem(snapshot)
            }
        })
        return () => {
            unsubscribe()
            setSelectedItem(null)
        }
    }, [])

    function updateSelectedItem(snapshot) {
        snapshot.docChanges().forEach(change => {
            if (change.type === "modified" && change.doc.id === selectedItem.id) {
                setSelectedItem({ id: change.doc.id, data: change.doc.data() })
            }
        })
    }

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

    return (
        <div className="menu">
            {/* TODO: Replace with Skeleton */}
            {!menuSnapshot && <div>Loading...</div>}

            {menuSnapshot && <div>
                {/* TODO: nicer message */}
                {menuSnapshot.length === 0 && <div>No menu items.</div>}

                {menuSnapshot.length !== 0 &&
                    <List>
                        {menuSnapshot.map(
                            doc => (
                                <ListItem
                                    button
                                    key={doc.id}
                                    ContainerComponent="div"
                                    sx={{
                                        m: '12px 0',
                                        border: '1px solid'
                                    }}
                                    selected={selectedItem && selectedItem.id === doc.id}
                                    onClick={() => setSelectedItem({ id: doc.id, data: doc.data() })}
                                >
                                    <ListItemText
                                        primary={doc.data().menuItemName}
                                        // TODO: currency .00
                                        secondary={`RM ${doc.data().price}`}
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


        </div>
    )
}

export default Menu