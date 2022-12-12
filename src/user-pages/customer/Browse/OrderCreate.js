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
import 'dayjs/locale/en-sg'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import currency from 'currency.js'
import { useState, useEffect } from 'react'

const earliestOrderTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T08:00`)
const latestOrderTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T17:00`)

const OrderCreate = ({ selectedItems, setSelectedItems, selectedStall }) => {
    const [remark, setRemark] = useState('')
    const [isTakeaway, setIsTakeaway] = useState(false)
    const [isPreOrder, setIsPreOrder] = useState(false)
    const [pickupTimestamp, setPickupTimestamp] = useState(dayjs().add(30, 'minute'))

    const [minTime, setMinTime] = useState(earliestOrderTime)
    const [minDate, setMinDate] = useState(dayjs())

    const [isValid, setIsValid] = useState(true)

    const handlePlaceOrder = () => {
        let order = { selectedStallID: selectedStall.id, orderItems: selectedItems, isTakeaway: isTakeaway, isPreOrder: isPreOrder }

        if (remark !== '') {
            order.remarkCustomer = remark
        }
        if (isPreOrder) {
            order.pickupTimestamp = pickupTimestamp
        }

        console.log(order)
    }

    const resetFields = () => {
        setSelectedItems([])
        setRemark('')
        setIsTakeaway(false)
        setIsPreOrder(false)
    }

    useEffect(() => { if (selectedItems.length === 0) resetFields() }, [selectedItems])

    //IF pickup today, minTime = now + 30 min, ELSE anyday use earliest
    useEffect(() => {
        if (dayjs().isSame(pickupTimestamp, 'day')) {
            setMinTime(dayjs().add(30, 'minute'))
        }
        else {
            setMinTime(earliestOrderTime)
        }
    }, [pickupTimestamp])

    function isWeekend(date) {
        return date.day() === 0 || date.day() === 6
    }

    //update pickup date time everytime isPreOrder toggled
    useEffect(() => {
        if (!isPreOrder) return

        //IF current time + 30 not passed latestpickuptime, THEN set pickuptime as current time + 30 (e.g. can only place preorder for today if before 1630)
        if (dayjs().add(30, 'minute').diff(latestOrderTime) < 0) {
            setPickupTimestamp(dayjs().add(30, 'minute'))
            return
        }

        //OTHERWISE set to next day earliest, WHILE next day is weekend, increment next day 
        let nextDayEarliest = earliestOrderTime.add(1, 'day')

        while (isWeekend(nextDayEarliest)) {
            nextDayEarliest = nextDayEarliest.add(1, 'day')
        }

        setMinDate(nextDayEarliest)
        setPickupTimestamp(nextDayEarliest)
    }, [isPreOrder])

    return (
        <div className="order-create">
            <Box sx={{ overflow: 'auto' }}>
                <Box display="flex" justifyContent="center">
                    <Typography variant="h6" align="center">New<br />Order</Typography>
                </Box>

                <Typography align="center">{dayjs().format('DD/MM/YYYY')}</Typography>

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
                                rows={2}
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
                                    <Checkbox checked={isPreOrder} onChange={e => setIsPreOrder(e.target.checked)} />
                                }
                                labelPlacement="start"
                                label="Pre-order?"
                                disabled={false}
                            />

                            {isPreOrder &&
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-sg'} >
                                    <DateTimePicker
                                        label="Pickup Time & Date"
                                        value={pickupTimestamp}
                                        onChange={v => setPickupTimestamp(v)}
                                        onError={(reason, value) => reason ? setIsValid(false) : setIsValid(true)}
                                        renderInput={(params) => <TextField {...params} />}
                                        minDate={minDate}
                                        maxDate={minDate.add(7, 'day')}
                                        minTime={minTime}
                                        maxTime={latestOrderTime}
                                        shouldDisableDate={date => isWeekend(date)}
                                    />
                                </LocalizationProvider>
                            }

                        </Stack>

                        <Stack sx={{ m: 2 }} spacing={2}>
                            <Button
                                disabled={(isPreOrder && !isValid) || (!isPreOrder && dayjs().diff(latestOrderTime) > 0)}
                                variant="contained"
                                onClick={handlePlaceOrder}
                            >
                                Place Order
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                onClick={resetFields}>
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