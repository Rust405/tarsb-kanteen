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

const MyOrders = ({
    selectedOrder, setSelectedOrder
}) => {

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


    const shortOrderString = (orderItems) => {
        let orderString = orderItems[0].data.menuItemName

        if (orderItems.length > 1) {
            orderString += ` + ${orderItems.length - 1} other item(s)`
        }

        return orderString
    }

    const orderStatusString = (estCmpltDateTime, stallName) => {
        return dayjs().diff(estCmpltDateTime) < 0 ?
            `Estimated to complete at around ${estCmpltDateTime.format('LT')}`
            :
            `Order may be overdue. Try checking with \"${stallName}\".`
    }

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

                            {/* Ready for pickup */}
                            {/* TODO: ready to claim at stallName */}

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
                                            primary={shortOrderString(doc.data().orderItems)}
                                            secondary={
                                                orderStatusString(
                                                    dayjs(doc.data().estCmpltTimestamp.toDate()),
                                                    doc.data().stallName
                                                )
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
                                            primary={shortOrderString(doc.data().orderItems)}
                                            secondary={
                                                `Pickup at \"${doc.data().stallName}\" on ${dayjs(doc.data().pickupTimestamp.toDate()).format('DD/MM/YYYY (ddd) HH:mm')}`
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
