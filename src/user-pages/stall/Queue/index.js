import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

import FlagIcon from '@mui/icons-material/Flag'

import { useTheme } from '@mui/material/styles'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { db } from '../../../utils/firebase'
import { CUSTOMSTYLE } from '../../../constants'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import ReportCustomerDialog from './ReportCustomerDialog'

const overdueTrigger = 5 //minutes, time past estCmpltTimestamp to trigger overdue message

const Queue = ({
    selectedOrder, setSelectedOrder,
    isValidating, setIsValidating,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg,
    stallID
}) => {
    const theme = useTheme()

    const [ordersSnapshot, setOrdersSnapshot] = useState(null)
    const [updatedOrders, setUpdatedOrders] = useState([])
    const [deletedOrders, setDeletedOrders] = useState([])

    useEffect(function fetchOrders() {
        const q = query(
            collection(db, "orders"),
            where("stallID", "==", stallID),
            orderBy("estCmpltTimestamp", "asc"))

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
                if (latestDoc.data().orderStatus === 'Completed' || latestDoc.data().orderStatus === 'Unclaimed') {
                    setSelectedOrder(null)
                    return
                }

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

    const [openReportCustomer, setOpenReportCustomer] = useState(false)

    const [reportData, setReportData] = useState(null)
    const hanldeReportCustomer = (order) => {
        setReportData({
            customerID: order.data().customerID,
            orderID: order.id
        })
        setOpenReportCustomer(true)
    }

    const orderStatusString = (estCmpltDateTime) => {
        return dayjs().diff(estCmpltDateTime, 'minute') < overdueTrigger ?
            `Estimated to be ready at around ${estCmpltDateTime.format('HH:mm')}`
            :
            `Order may be overdue.`
    }

    return (
        <div className="queue">
            <Box sx={{ p: 2 }}>
                {!ordersSnapshot && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}

                {ordersSnapshot && <div>
                    {/* No Orders */}
                    {ordersSnapshot.length === 0 && <Typography>There are currently no orders to display.</Typography>}

                    {/* Orders */}
                    {ordersSnapshot.length > 0 &&
                        <List sx={{ '&& .Mui-selected': { borderLeft: `4px solid ${theme.palette.primary.main}` } }} >

                            {/* Ready to claim */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Ready').length > 0 && < Divider textAlign='left'>Ready To Claim</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Ready')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <Tooltip title="Report Customer">
                                            <IconButton
                                                sx={{ m: '4px' }}
                                                onClick={() => hanldeReportCustomer(doc)}>
                                                <FlagIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                            />
                                        </ListItemButton>

                                    </ListItem>
                                ))
                            }

                            {/* Cooking */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Cooking' && !doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>In Kitchen</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Cooking' && !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <Tooltip title="Report Customer">
                                            <IconButton
                                                sx={{ m: '4px' }}
                                                onClick={() => hanldeReportCustomer(doc)}>
                                                <FlagIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={orderStatusString(dayjs(doc.data().estCmpltTimestamp.toDate()))}
                                            />
                                        </ListItemButton>

                                    </ListItem>
                                ))
                            }

                            {/* Regular orders/ Order Queue */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Main Order Queue</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && !doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <Tooltip title="Report Customer">
                                            <IconButton
                                                sx={{ m: '4px' }}
                                                onClick={() => hanldeReportCustomer(doc)}>
                                                <FlagIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={orderStatusString(dayjs(doc.data().estCmpltTimestamp.toDate()))}
                                            />
                                        </ListItemButton>

                                    </ListItem>
                                ))
                            }


                            {/* Pre-orders */}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder).length > 0 && < Divider textAlign='left'>Pre-Orders</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Placed' && doc.data().isPreOrder)
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <Tooltip title="Report Customer">
                                            <IconButton
                                                sx={{ m: '4px' }}
                                                onClick={() => hanldeReportCustomer(doc)}>
                                                <FlagIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                                secondary={`Scheduled for pickup on ${dayjs(doc.data().pickupTimestamp.toDate()).format('DD/MM/YYYY (ddd) HH:mm')}`}
                                            />
                                        </ListItemButton>

                                    </ListItem>
                                ))
                            }

                            {/* Cancelled Orders*/}
                            {ordersSnapshot.filter(doc => doc.data().orderStatus === 'Cancelled').length > 0 && < Divider textAlign='left'>Cancelled</Divider>}

                            {ordersSnapshot
                                .filter(doc => doc.data().orderStatus === 'Cancelled')
                                .map(doc => (
                                    <ListItem key={doc.id}>
                                        <Tooltip title="Report Customer">
                                            <IconButton
                                                sx={{ m: '4px' }}
                                                onClick={() => hanldeReportCustomer(doc)}>
                                                <FlagIcon />
                                            </IconButton>
                                        </Tooltip>

                                        <ListItemButton
                                            sx={CUSTOMSTYLE.itemStyle}
                                            selected={selectedOrder && selectedOrder.id === doc.id}
                                            onClick={() => { handleSelect(doc) }}
                                        >
                                            <ListItemText
                                                primary={shortOrderString(doc.data().orderItems)}
                                            />
                                        </ListItemButton>

                                    </ListItem>
                                ))
                            }

                        </List>
                    }

                    <ReportCustomerDialog
                        stallID={stallID}
                        reportData={reportData} setReportData={setReportData}
                        openReportCustomer={openReportCustomer} setOpenReportCustomer={setOpenReportCustomer}
                        isValidating={isValidating} setIsValidating={setIsValidating}
                        setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                        setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                    />

                </div>
                }

            </Box >

        </div >
    )
}

export default Queue