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

import { useTheme } from '@mui/material/styles'

const itemStyle = {
    m: '12px 0',
    border: '2px solid lightgray',
    borderRadius: '8px',
}

const MyOrders = ({
    selectedOrder, setSelectedOrder
}) => {
    const theme = useTheme()

    const [ordersSnapshot, setOrdersSnapshot] = useState(null)
    const [updatedOrders, setUpdatedOrders] = useState([])
    const [deletedOrders, setDeletedOrders] = useState([])

    useEffect(function fetchOrders() {
        const q = query(
            collection(db, "orders"),
            where("customerID", "==", auth.currentUser.uid),
            orderBy("orderTimestamp", "desc"))

        const unsubscribe = onSnapshot(q, snapshot => {
            setOrdersSnapshot(snapshot.docs)

            setUpdatedOrders([])
            setDeletedOrders([])

            snapshot.docChanges().forEach(change => {
                if (change.type === "modified") { setUpdatedOrders([...updatedOrders, change.doc]) }
                if (change.type === "removed") { setDeletedOrders([...deletedOrders, change.doc]) }
            })
        })
        return () => {
            unsubscribe()
            setOrdersSnapshot(null)
            setSelectedOrder(null)
        }
    }, [])

    //updated selectedOrder if modified
    useEffect(function handleOrdersUpdated() {
        if (updatedOrders.length > 0 && selectedOrder) {
            const latestDoc = updatedOrders.find(doc => doc.id === selectedOrder.id)
            if (latestDoc) {
                setSelectedOrder({ id: latestDoc.id, data: latestDoc.data() })
            }
        }
    }, [updatedOrders])

    //set selectedOrder to null if deleted
    useEffect(function handleOrdersDeleted() {
        if (deletedOrders.length > 0 && selectedOrder) {
            const deletedDoc = deletedOrders.find(doc => doc.id === selectedOrder.id)
            if (deletedDoc) {
                setSelectedOrder(null)
            }
        }
    }, [deletedOrders])

    const shortOrderString = (orderItems) => {
        let orderString = orderItems[0].data.menuItemName

        if (orderItems.length > 1) {
            orderString += ` + ${orderItems.length - 1} other item(s)`
        }

        return orderString
    }

    const orderStatusString = (estCmpltDateTime, stallName) => {
        return dayjs().diff(estCmpltDateTime) < 0 ?
            `Estimated to complete at around ${estCmpltDateTime.format('HH:mm')}`
            :
            `Order may be overdue. Try checking with \"${stallName}\".`
    }

    const handleSelect = (doc) => {
        if (selectedOrder && selectedOrder.id === doc.id) {
            setSelectedOrder(null)
            return
        }

        setSelectedOrder({ id: doc.id, data: doc.data() })
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
                        <List sx={{
                            '&& .Mui-selected': {
                                borderLeft: `4px solid ${theme.palette.primary.main}`
                            }
                        }} >

                            {/* Ready for pickup */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Ready').length > 0 && < Divider textAlign='left'>Ready To Claim</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Ready')
                                .map(doc => (
                                    <ListItemButton
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={selectedOrder && selectedOrder.id === doc.id}
                                        onClick={() => { handleSelect(doc) }}
                                    >
                                        <ListItemText
                                            primary={shortOrderString(doc.data().orderItems)}
                                            secondary={`${doc.data().isPreOrder ? 'Pre-Order' : 'Order'} ready to claim at \"${doc.data().stallName}\"`}
                                        />
                                    </ListItemButton>
                                ))
                            }


                            {/* Regular orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Regular Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItemButton
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={selectedOrder && selectedOrder.id === doc.id}
                                        onClick={() => { handleSelect(doc) }}
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
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Pre-Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItemButton
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={selectedOrder && selectedOrder.id === doc.id}
                                        onClick={() => { handleSelect(doc) }}
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


                            {/* Completed Orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Completed').length > 0 && < Divider textAlign='left'>Completed</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Completed')
                                .map(doc => (
                                    <ListItemButton
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={selectedOrder && selectedOrder.id === doc.id}
                                        onClick={() => { handleSelect(doc) }}
                                    >
                                        <ListItemText
                                            primary={shortOrderString(doc.data().orderItems)}
                                            secondary={`Completed ${doc.data().isPreOrder ? 'Pre-Order' : 'Order'}`}
                                        />
                                    </ListItemButton>
                                ))
                            }


                            {/* Cancelled Orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Cancelled').length > 0 && < Divider textAlign='left'>Cancelled</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Cancelled')
                                .map(doc => (
                                    <ListItemButton
                                        key={doc.id}
                                        sx={itemStyle}
                                        selected={selectedOrder && selectedOrder.id === doc.id}
                                        onClick={() => { handleSelect(doc) }}
                                    >
                                        <ListItemText
                                            primary={shortOrderString(doc.data().orderItems)}
                                            secondary={`Cancelled ${doc.data().isPreOrder ? 'Pre-Order' : 'Order'}`}
                                        />
                                    </ListItemButton>
                                ))
                            }
                        </List>
                    }
                </div>
                }

            </Box >
        </div >
    )
}

export default MyOrders
