import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'

import FlagIcon from '@mui/icons-material/Flag'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { db } from '../../../utils/firebase'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'

const itemStyle = {
    m: '12px 0',
    border: '2px solid lightgray',
    borderRadius: '8px',
}

const Queue = ({
    selectedOrder, setSelectedOrder
}) => {

    const [ordersSnapshot, setOrdersSnapshot] = useState(null)
    const [updatedOrders, setUpdatedOrders] = useState([])
    const [deletedOrders, setDeletedOrders] = useState([])

    useEffect(function fetchOrders() {
        const q = query(
            collection(db, "orders"),
            where("customerID", "==", "ESIRlXUGSnS5QeAjCFYTOiEtjxi1"),
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

    const handleSelect = (doc) => {
        if (selectedOrder && selectedOrder.id === doc.id) {
            setSelectedOrder(null)
            return
        }

        setSelectedOrder({ id: doc.id, data: doc.data() })
    }

    return (
        <div className="queue">
            <Box sx={{ p: 2 }}>
                {!ordersSnapshot && <Typography sx={{ p: 2 }}>Loading menu items...</Typography>}

                {ordersSnapshot && <div>
                    {/* No Orders */}
                    {ordersSnapshot.length === 0 && <Typography>You have not placed any orders.</Typography>}

                    {/* Orders */}
                    {ordersSnapshot.length > 0 &&
                        <List sx={{ '&& .Mui-selected': { borderLeft: '4px solid #3f50b5' } }} >

                            {/* Ready for pickup */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Ready').length > 0 && < Divider textAlign='left'>Ready To Claim</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Ready')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                            />
                                        </ListItemButton>

                                        <Tooltip title="Report User">
                                            <IconButton><FlagIcon /></IconButton>
                                        </Tooltip>
                                    </ListItem>
                                ))
                            }

                            {/* Cooking */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Cooking' && !doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Cooking</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Cooking' && !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                            />
                                        </ListItemButton>

                                        <Tooltip title="Report User">
                                            <IconButton><FlagIcon /></IconButton>
                                        </Tooltip>
                                    </ListItem>
                                ))
                            }

                            {/* Regular orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Order Queue</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                            />
                                        </ListItemButton>

                                        <Tooltip title="Report User">
                                            <IconButton><FlagIcon /></IconButton>
                                        </Tooltip>
                                    </ListItem>
                                ))
                            }


                            {/* Pre-orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Pre-Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <ListItemButton
                                            sx={itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={`Scheduled for pickup on ${dayjs(doc.data().pickupTimestamp.toDate()).format('DD/MM/YYYY (ddd) HH:mm')}`}
                                            />
                                        </ListItemButton>

                                        <Tooltip title="Report User">
                                            <IconButton><FlagIcon /></IconButton>
                                        </Tooltip>
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

export default Queue