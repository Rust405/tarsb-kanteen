import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import dayjs from 'dayjs'
import currency from 'currency.js'
import CancelOrderDialog from './CancelOrderDialog'
import OrderIDDisplay from './OrderIDDisplay'

import { useState } from 'react'

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

    const handleStartCooking = () => {
        alert("handleStartCooking")
    }

    const handleMarkReady = () => {
        alert("handleMarkReady")
    }

    const handleEndCooking = () => {
        alert("handleEndCooking")
    }

    const handleMarkClaimed = () => {
        alert("handleMarkClaimed")
    }

    const handleMarkUnclaimed = () => {
        alert("handleMarkUnclaimed")
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
                            <Button onClick={() => setOpenIDDisplay(true)}>Verify Order</Button>
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
                                onClick={() => primaryOrderAction(selectedOrder.data)}
                            >
                                {primaryOrderActionText(selectedOrder.data)}
                            </Button>

                            {/* Secondary Order Action */}
                            {selectedOrder.data.orderStatus === "Ready" &&
                                <Button variant="contained" onClick={handleMarkUnclaimed} >Mark Unclaimed</Button>
                            }

                            {(selectedOrder.data.orderStatus === "Placed" || selectedOrder.data.orderStatus === "Cooking") &&
                                <Button
                                    variant="outlined"
                                    color="error"
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