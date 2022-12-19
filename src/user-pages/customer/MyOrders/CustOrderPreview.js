import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'

import currency from 'currency.js'

const CustOrderPreview = ({
    selectedOrder
}) => {

    const remarkString = (remark) => {
        return remark !== '' ? remark : '-'
    }

    const estWaitTimeString = (orderItems) => {
        return orderItems.reduce((acc, cur) => acc + cur.data.estWaitTime, 0)
    }

    const handleCancelOrder = () => {
        alert("Not yet implemented.")
    }

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

                        <Typography align="center" sx={{ m: 2 }}>{`#${selectedOrder.id}`}</Typography>


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

                            <Typography variant="caption">
                                Est. cooking time: {estWaitTimeString(selectedOrder.data.orderItems)}
                            </Typography>

                            <Button variant="outlined" color="error" onClick={handleCancelOrder}>
                                Cancel Order
                            </Button>
                        </Stack>
                    </div>
                }
            </Box>
        </div>
    )
}

export default CustOrderPreview