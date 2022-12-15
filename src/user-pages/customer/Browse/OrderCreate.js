import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import RefreshIcon from '@mui/icons-material/Refresh'

import dayjs from 'dayjs'
import 'dayjs/locale/en-sg'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

import currency from 'currency.js'
import { useState, useEffect } from 'react'
import { createOrder } from '../../../utils/firebase'

const earliestOrderTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T07:00`)
const latestOrderTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T17:00`)

const OrderCreate = ({
    selectedItems, setSelectedItems,
    selectedStall,
    isValidating, setIsValidating,
    setOpenSucSnack, setSucMsg,
    setOpenErrSnack, setErrMsgs,
}) => {

    const [remark, setRemark] = useState('')
    const [isTakeaway, setIsTakeaway] = useState(false)
    const [isPreOrder, setIsPreOrder] = useState(false)
    const [pickupTimestamp, setPickupTimestamp] = useState(dayjs().add(30, 'minute'))

    const [minTime, setMinTime] = useState(earliestOrderTime)
    const [minDate, setMinDate] = useState(dayjs())

    const [isValid, setIsValid] = useState(true)

    const handlePlaceOrder = () => {
        let order = { orderItems: selectedItems, isTakeaway: isTakeaway, isPreOrder: isPreOrder, remarkCustomer: remark }

        setIsValidating(true)
        setOpenErrSnack(false)

        if (isPreOrder) {
            if (pickupTimestamp.isValid()) {
                order.pickupTimestamp = pickupTimestamp.toDate()
            } else {
                setOpenErrSnack(true)
                setErrMsgs(['Invalid pickup date provided.'])
                setIsValidating(false)
                return
            }
        }

        createOrder({ stallID: selectedStall.id, order: order })
            .then(result => {
                let response = result.data
                if (response.success) {
                    setIsValidating(false)
                    setSucMsg(`Order has been created with ID: ${response.message}`)
                    setOpenSucSnack(true)
                    resetFields()
                } else {
                    setOpenErrSnack(true)
                    setErrMsgs(response.message)
                    setIsValidating(false)
                }
            })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsValidating(false)
            })
    }

    const resetFields = () => {
        setRemark('')
        setIsTakeaway(false)
        setIsPreOrder(false)
    }

    useEffect(() => { if (selectedItems.length === 0) resetFields() }, [selectedItems])

    //IF pickup today, minTime = now + 30 min, ELSE anyday use earliest
    useEffect(() => {
        if (pickupTimestamp.isSame(dayjs(), 'day') && pickupTimestamp.diff(earliestOrderTime) > 0) {
            setMinTime(dayjs().add(30, 'minute'))
        }
        else {
            setMinTime(earliestOrderTime)
        }
    }, [pickupTimestamp])

    function isWeekend(date) { return date.day() === 0 || date.day() === 6 }

    //update pickup date time everytime isPreOrder toggled
    useEffect(() => { if (isPreOrder) updatePickup() }, [isPreOrder])

    const updatePickup = () => {
        //IF today is weekday AND now is at least 30 min before latestOrderTime AND has passed earliestOrderTime, THEN set pickuptime to 30 minutes from now
        if (!isWeekend(dayjs()) && dayjs().add(30, 'minute').diff(latestOrderTime) < 0 && dayjs().diff(earliestOrderTime) > 0) {
            setPickupTimestamp(dayjs().add(30, 'minute'))
            return
        }

        //IF today is weekday AND now is at least 30 minutes before earliestOrderTime, THEN set pickuptime to today earliestOrderTime
        if (!isWeekend(dayjs()) && dayjs().add(30, 'minute').diff(earliestOrderTime) < 0) {
            setPickupTimestamp(earliestOrderTime)
            return
        }

        //ELSE set pickuptime to nextdayEarliest, BUT IF nextday is weekend, THEN incremenet until Monday earliest
        let nextDayEarliest = earliestOrderTime.add(1, 'day')

        while (isWeekend(nextDayEarliest)) {
            nextDayEarliest = nextDayEarliest.add(1, 'day')
        }

        setMinDate(nextDayEarliest)
        setPickupTimestamp(nextDayEarliest)
    }

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
                                inputProps={{ maxLength: 50 }}
                                disabled={isValidating}
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
                                style={{ pointerEvents: "none" }}
                                control={
                                    <Checkbox checked={isTakeaway} onChange={e => setIsTakeaway(e.target.checked)} style={{ pointerEvents: "auto" }} />
                                }
                                labelPlacement="start"
                                label="Takeaway?"
                                disabled={isValidating}
                            />

                            <FormControlLabel
                                style={{ pointerEvents: "none" }}
                                control={
                                    <Checkbox checked={isPreOrder} onChange={e => setIsPreOrder(e.target.checked)} style={{ pointerEvents: "auto" }} />
                                }
                                labelPlacement="start"
                                label="Pre-order?"
                                disabled={isValidating}
                            />

                            {isPreOrder &&
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <IconButton onClick={updatePickup} disabled={isValidating} >
                                        <RefreshIcon />
                                    </IconButton>

                                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-sg'} >
                                        <DateTimePicker
                                            label="Pickup Time & Date"
                                            value={pickupTimestamp}
                                            onChange={v => setPickupTimestamp(v)}
                                            onAccept={() => setIsValid(true)}
                                            onError={(reason, value) => { reason ? setIsValid(false) : setIsValid(true) }}
                                            renderInput={(params) => <TextField {...params} error={!isValid} disabled={isValidating} />}
                                            minDate={minDate}
                                            maxDate={minDate.add(7, 'day')}
                                            minTime={minTime}
                                            maxTime={latestOrderTime}
                                            shouldDisableDate={date => isWeekend(date)}
                                        />
                                    </LocalizationProvider>
                                </Stack>
                            }

                        </Stack>


                        <Stack sx={{ m: 2 }} spacing={2} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <Button
                                    disabled={
                                        (isPreOrder && !isValid) || (!isPreOrder && dayjs().diff(earliestOrderTime) < 0) || (!isPreOrder && dayjs().diff(latestOrderTime) > 0) || (!isPreOrder && isWeekend(dayjs())) || isValidating
                                    }
                                    variant="contained"
                                    onClick={handlePlaceOrder}
                                >
                                    {isValidating ? "Validating..." : "Place Order"}
                                </Button>
                                {isValidating &&
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-12px',
                                            marginLeft: '-12px',
                                        }}
                                    />
                                }
                            </Box>


                            <Button
                                disabled={isValidating}
                                variant="outlined"
                                color="error"
                                onClick={() => {
                                    resetFields()
                                    setSelectedItems([])
                                }}>
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