import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { db } from '../../../utils/firebase'

const Menu = ({ stallID }) => {

    const [menuSnapshot, setMenuSnapshot] = useState(null)
    const menuRef = collection(db, "stalls", stallID, 'menu')
    const q = query(menuRef, orderBy('menuItemName'))

    useEffect(() => {
        const unsubscribe = onSnapshot(q, snapshot => setMenuSnapshot(snapshot.docs))
        return () => unsubscribe()
    }, [])

    // \/ will move to StalLClient.js
    const [selectedItemID, setSelectedItemID] = useState(null)


    return (
        <div className="menu">
            <Box>
                <List>
                    {menuSnapshot &&
                        menuSnapshot.map(
                            doc => (
                                <ListItem key={doc.id}>
                                    <ListItemButton>
                                        <ListItemText primary={doc.data().menuItemName} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        )
                    }
                </List>
            </Box>
        </div>
    )
}

export default Menu