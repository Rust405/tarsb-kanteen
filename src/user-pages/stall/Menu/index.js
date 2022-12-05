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

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db } from '../../../utils/firebase'

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

    const handleAvailabilityToggle = () => {
        console.log("Toggle")
    }

    return (
        <div className="menu">
            {/* TODO: Replace with Skeleton */}
            {!menuSnapshot && <div>Loading...</div>}

            {menuSnapshot &&
                <List>
                    {menuSnapshot.map(
                        doc => (
                            <ListItem button key={doc.id} ContainerComponent="div"
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
                                            checked={doc.data().isAvailable}
                                            onChange={handleAvailabilityToggle} />
                                    </Stack>
                                </ListItemSecondaryAction>
                            </ListItem>
                        )
                    )}
                </List>
            }
        </div>
    )
}

export default Menu