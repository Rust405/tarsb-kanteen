import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { auth, db } from '../../../utils/firebase'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'

import { CUSTOMSTYLE } from '../../../constants'

import { useTheme } from '@mui/material/styles'


const overdueTrigger = 5 //minutes, time past estCmpltTimestamp to trigger overdue message

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
        return dayjs().diff(estCmpltDateTime, 'minute') < overdueTrigger ?
            `Estimated to be ready at around ${estCmpltDateTime.format('HH:mm')}`
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
                {!ordersSnapshot && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}

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
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={`${doc.data().isPreOrder ? 'Pre-Order' : 'Order'} ready to claim at \"${doc.data().stallName}\"`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            }

                            {/* Cooking */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Cooking').length > 0 && < Divider textAlign='left'>In Kitchen</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Cooking')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
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
                                    </ListItem>
                                ))
                            }

                            {/* Placed Regular orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>My Regular Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
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
                                    </ListItem>
                                ))
                            }


                            {/* Placed Pre-orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>My Pre-Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
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
                                    </ListItem>
                                ))
                            }


                            {/* Completed Orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Completed').length > 0 && < Divider textAlign='left'>Completed</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Completed')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={`Completed ${doc.data().isPreOrder ? 'Pre-Order' : 'Order'}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            }


                            {/* Cancelled Orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Cancelled').length > 0 && < Divider textAlign='left'>Cancelled</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Cancelled')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={`Cancelled ${doc.data().isPreOrder ? 'Pre-Order' : 'Order'}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))
                            }

                            {/* Unclaimed Orders*/}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Unclaimed').length > 0 && < Divider textAlign='left'>Unclaimed Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Unclaimed')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={`Unclaimed ${doc.data().isPreOrder ? 'Pre-Order' : 'Order'}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
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
