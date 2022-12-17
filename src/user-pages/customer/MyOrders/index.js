import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { auth, db } from '../../../utils/firebase'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'

const itemStyle = {
    m: '12px 0',
    border: '2px solid lightgray',
    borderRadius: '8px',
}

const MyOrders = () => {

    const [ordersSnapshot, setOrdersSnapshot] = useState(null)

    useEffect(function fetchOrders() {
        const q = query(
            collection(db, "orders"),
            where("customerID", "==", auth.currentUser.uid),
            orderBy("orderTimestamp", "desc")
        )

        const unsubscribe = onSnapshot(q, snapshot => {
            setOrdersSnapshot(snapshot.docs)
        })

        return () => {
            unsubscribe()
            setOrdersSnapshot(null)
        }
    }, [])

    return (
        <div className="my-orders">
            <Box sx={{ p: 2 }}>
                {!ordersSnapshot && <Typography sx={{ p: 2 }}>Loading menu items...</Typography>}

                {ordersSnapshot && <div>
                    {/* No Orders */}
                    {ordersSnapshot.length === 0 && <Typography>You have not placed any orders.</Typography>}

                    {/* Orders */}
                    {ordersSnapshot.length > 0 &&
                        <List sx={{ '&& .Mui-selected': { borderLeft: '4px solid #3f50b5' } }} >

                            {/* Regular orders */}
                            {ordersSnapshot.filter(doc => !doc.data().isPreOrder).length > 0 &&
                                < Divider textAlign='left'>Regular Orders</Divider>
                            }

                            {ordersSnapshot
                                .filter(doc => !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItemButton
                                        disabled={false}
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={false}
                                        onClick={() => { }}
                                    >
                                        <ListItemText
                                            primary={`Order \"${doc.id}\"`}
                                            secondary={
                                                `${doc.data().orderStatus}, estimated to complete at around ${dayjs(doc.data().estCmpltTimestamp.toDate()).format('LT')}`
                                            }
                                        />
                                    </ListItemButton>
                                ))
                            }

                            {/* Pre-orders */}
                            {ordersSnapshot.filter(doc => doc.data().isPreOrder).length > 0 &&
                                < Divider textAlign='left'>Pre-Orders</Divider>
                            }

                            {ordersSnapshot
                                .filter(doc => doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItemButton
                                        disabled={false}
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={false}
                                        onClick={() => { }}
                                    >
                                        <ListItemText
                                            primary={`Order \"${doc.id}\"`}
                                            secondary={
                                                `Pickup on ${dayjs(doc.data().pickupTimestamp.toDate()).format('LLLL')}`
                                            }
                                        />
                                    </ListItemButton>
                                ))
                            }
                        </List>
                    }
                </div>
                }

            </Box>
        </div>
    )
}

export default MyOrders
