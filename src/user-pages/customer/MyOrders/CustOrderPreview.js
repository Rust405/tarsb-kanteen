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

const CustOrderPreview = ({
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

    return (
        <div className="order-preview">
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
                            <Button onClick={() => setOpenIDDisplay(true)}>Show Order ID</Button>
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

                            {!selectedOrder.data.isPreOrder &&
                                <Typography variant="caption">
                                    {`Est. cooking time: ${selectedOrder.data.estWaitTime} min(s)`}
                                </Typography>
                            }

                            <Button
                                variant="outlined"
                                color="error"
                                disabled={
                                    selectedOrder.data.orderStatus === "Cooking"
                                    || selectedOrder.data.orderStatus === "Ready"
                                    || selectedOrder.data.orderStatus === "Completed"
                                    || selectedOrder.data.orderStatus === "Cancelled"
                                    || selectedOrder.data.orderStatus === "Unclaimed"
                                }
                                onClick={() => setOpenCancel(true)}
                            >
                                Cancel Order
                            </Button>
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

export default CustOrderPreview