import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'

import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import currency from 'currency.js'
import { useState, useEffect } from 'react'

const OrderCreate = ({ selectedItems, setSelectedItems }) => {

    const today = new Date().toLocaleDateString("en-MY")

    const [remark, setRemark] = useState('')
    const [isTakeaway, setIsTakeaway] = useState(false)
    const [isPreorder, setIsPreorder] = useState(false)
    const [pickupDateTime, setpickupDateTime] = useState(dayjs('2014-08-18T21:11:54'))

    const handlePlaceOrder = () => {
        alert("Not yet implemented.")
    }

    //TODO: date time limitsssss, low date is 30 minutes today, max is uh idk

    return (
        <div className="order-create">
            <Box sx={{ overflow: 'auto' }}>
                <Box display="flex" justifyContent="center">
                    <Typography variant="h6" align="center">New<br />Order</Typography>
                </Box>

                <Typography align="center">{today}</Typography>

                <Divider />

                {selectedItems.length > 0 &&
                    <div>
                        <Box sx={{ m: 2 }}>
                            {selectedItems.map(
                                item => (
                                    <Typography key={item.id}>{item.data.menuItemName} - {currency(item.data.price).format({ symbol: 'RM ' })}</Typography>
                                )
                            )}
                        </Box>

                        <Divider />

                        <Box sx={{ m: 2 }}>
                            <TextField
                                sx={{ width: '100%' }}
                                value={remark}
                                onChange={e => setRemark(e.target.value)}
                                label="Remark (optional)"
                                multiline
                                rows={3}
                            />
                        </Box>

                        <Divider />

                        <Typography sx={{ m: 2 }}>
                            {`Total: ${currency(
                                selectedItems.reduce((acc, cur) => acc + cur.data.price, 0)
                            ).format({ symbol: 'RM ' })}`}
                        </Typography>

                        <Stack sx={{ m: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox checked={isTakeaway} onChange={e => setIsTakeaway(e.target.checked)} />
                                }
                                labelPlacement="start"
                                label="Takeaway?"
                                disabled={false}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox checked={isPreorder} onChange={e => setIsPreorder(e.target.checked)} />
                                }
                                labelPlacement="start"
                                label="Pre-order?"
                                disabled={false}
                            />

                            {isPreorder &&
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        label="Pickup Time & Date"
                                        value={pickupDateTime}
                                        onChange={v => setpickupDateTime(v)}
                                        renderInput={(params) => <TextField {...params} />} />
                                </LocalizationProvider>
                            }

                        </Stack>

                        <Stack sx={{ m: 2 }} spacing={2}>
                            <Button
                                variant="contained"
                                onClick={handlePlaceOrder}
                            >
                                Place Order
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setSelectedItems([])}>
                                Clear Order
                            </Button>
                        </Stack>
                    </div>
                }

                {
                    selectedItems.length === 0 &&
                    <Typography sx={{ m: 2 }} align="center">Select an item to start ordering.</Typography>
                }
            </Box >
        </div >
    )
}

export default OrderCreate