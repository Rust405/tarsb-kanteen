import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import dayjs from 'dayjs'
import currency from 'currency.js'
import CancelOrderDialog from './CancelOrderDialog'
import OrderIDDisplay from './OrderIDDisplay'

import { useEffect, useState } from 'react'
import { orderEndCooking, orderMarkClaimed, orderMarkReady, orderMarkUnclaimed, orderStartCooking } from '../../../utils/firebase'

const StallOrderPreview = ({
    selectedOrder, setSelectedOrder,
    isValidating, setIsValidating,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg
}) => {

    const remarkString = (remark) => {
        return remark !== '' ? remark : '-'
    }

    const [openCancel, setOpenCancel] = useState(false)
    const [openIDDisplay, setOpenIDDisplay] = useState(false)

    useEffect(function closeDialogs() {
        setOpenCancel(false)
        setOpenIDDisplay(false)
    }, [selectedOrder])

    const handleMarkClaimed = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        const orderID = selectedOrder.id

        orderMarkClaimed(orderID)
            .then(() => {
                setIsValidating(false)
                setSucMsg(`Order #${orderID} has been marked claimed.`)
                setOpenSucSnack(true)
            })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsValidating(false)
            })
    }

    const handleMarkUnclaimed = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        const orderID = selectedOrder.id

        orderMarkUnclaimed(orderID)
            .then(() => {
                setIsValidating(false)
                setSucMsg(`Order #${orderID} has been marked unclaimed.`)
                setOpenSucSnack(true)
            })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsValidating(false)
            })
    }

    const handleMarkReady = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        const orderID = selectedOrder.id

        orderMarkReady({ orderID: orderID })
            .then(() => {
                setIsValidating(false)
                setSucMsg(`Order #${orderID} has been marked ready to claim.`)
                setOpenSucSnack(true)
            })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsValidating(false)
            })
    }

    const handleStartCooking = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        const orderID = selectedOrder.id

        orderStartCooking({ orderID: orderID })
            .then(() => {
                setIsValidating(false)
                setSucMsg(`Order #${orderID} has been marked started cooking.`)
                setOpenSucSnack(true)
            })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsValidating(false)
            })

    }

    const handleEndCooking = () => {

        const orderID = selectedOrder.id

        orderEndCooking({ orderID: orderID })
    }

    const primaryOrderActionText = (order) => {
        switch (order.orderStatus) {
            case 'Placed':
                return order.estWaitTime > 0 ? 'Start Cooking' : 'Mark Ready'
            case 'Cooking':
                return 'End Cooking'
            case 'Ready':
                return 'Mark Claimed'
            default:
                return ''
        }
    }

    const primaryOrderAction = (order) => {
        switch (order.orderStatus) {
            case 'Placed':
                order.estWaitTime > 0 ? handleStartCooking() : handleMarkReady()
                break
            case 'Cooking':
                handleEndCooking()
                break
            case 'Ready':
                handleMarkClaimed()
                break
            default:
                return
        }
    }

    return (
        <div className='order-preview'>
            <Box sx={{ overflow: 'auto' }}>
                {!selectedOrder &&
                    <Typography sx={{ m: 2 }} align="center">Select an order to view its details.</Typography>
                }

                {selectedOrder &&
                    <div>
                        <Box display="flex" justifyContent="center">
                            <Typography variant="h6" align="center">Order<br />Preview</Typography>
                        </Box>

                        <Box display="flex" justifyContent="center" sx={{ m: 2 }}>
                            <Button disabled={isValidating} onClick={() => setOpenIDDisplay(true)}>Verify Order</Button>
                        </Box>

                        <Typography align="center" sx={{ m: 2 }}>Placed on: {dayjs(selectedOrder.data.orderTimestamp.toDate()).format('DD/MM/YYYY (ddd) HH:mm')}</Typography>

                        <Divider />

                        <Box sx={{ m: 2 }}>
                            {selectedOrder.data.orderItems.map(
                                item => (
                                    <Typography key={item.id}>{item.data.menuItemName} - {currency(item.data.price).format({ symbol: 'RM ' })}</Typography>
                                )
                            )}
                        </Box>

                        <Divider />

                        <Box sx={{ m: 2 }}>
                            <Stack>
                                <Typography variant="caption">
                                    Customer Remark: {remarkString(selectedOrder.data.remarkCustomer)}
                                </Typography>
                                <Typography variant="caption">
                                    Stall Remark: {remarkString(selectedOrder.data.remarkCustomer)}
                                </Typography>
                            </Stack>
                        </Box>

                        <Divider />

                        <Stack sx={{ m: 2 }} spacing={2}>
                            <Typography>
                                {`Total: ${currency(
                                    selectedOrder.data.orderItems.reduce((acc, cur) => acc + cur.data.price, 0)
                                ).format({ symbol: 'RM ' })}`}
                            </Typography>


                            <Typography sx={{ fontWeight: 'bold' }}>
                                {selectedOrder.data.isTakeaway ? 'Takeaway' : 'Dine-In'}
                            </Typography>

                            {/* Primary Order Action */}
                            <Button
                                variant="contained"
                                disabled={isValidating}
                                onClick={() => primaryOrderAction(selectedOrder.data)}
                            >
                                {primaryOrderActionText(selectedOrder.data)}
                            </Button>

                            {/* Secondary Order Action */}
                            {selectedOrder.data.orderStatus === "Ready" &&
                                <Button
                                    disabled={isValidating}
                                    onClick={handleMarkUnclaimed}>
                                    Mark Unclaimed
                                </Button>
                            }

                            {/* Cancel Order Button */}
                            {(selectedOrder.data.orderStatus === "Placed" || selectedOrder.data.orderStatus === "Cooking") &&
                                <Button
                                    variant="outlined"
                                    color="error"
                                    disabled={isValidating}
                                    onClick={() => setOpenCancel(true)}
                                >
                                    Cancel Order
                                </Button>
                            }
                        </Stack>

                        <CancelOrderDialog
                            orderID={selectedOrder.id} setSelectedOrder={setSelectedOrder}
                            openCancel={openCancel} setOpenCancel={setOpenCancel}
                            isValidating={isValidating} setIsValidating={setIsValidating}
                            setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                            setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg} />

                        <OrderIDDisplay
                            orderID={selectedOrder.id}
                            openIDDisplay={openIDDisplay} setOpenIDDisplay={setOpenIDDisplay} />
                    </div>
                }
            </Box>
        </div>
    )
}

export default StallOrderPreview