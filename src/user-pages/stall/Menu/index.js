import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
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
        const unsubscribe = onSnapshot(q, snapshot => setMenuSnapshot(snapshot.docs))
        return () => unsubscribe()
    }, [])

    return (
        <div className="menu">

            {/* TODO: Replace with skeleton */}
            {!menuSnapshot && <div>Loading...</div>}

            {menuSnapshot &&
                <List>
                    {menuSnapshot.map(
                        doc => (
                            <ListItem key={doc.id}>
                                <ListItemButton
                                    selected={selectedItem && selectedItem.id === doc.id}
                                    onClick={() => setSelectedItem({ id: doc.id, data: doc.data() })}
                                >
                                    <ListItemText primary={doc.data().menuItemName} />
                                </ListItemButton>
                            </ListItem>
                        )
                    )}
                </List>
            }
        </div>
    )
}

export default Menu