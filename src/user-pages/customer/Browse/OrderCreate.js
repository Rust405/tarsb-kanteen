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

const earliestPickupTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T08:00`)
const latestPickupTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T17:00`)

const OrderCreate = ({ selectedItems, setSelectedItems }) => {
    const [remark, setRemark] = useState('')
    const [isTakeaway, setIsTakeaway] = useState(false)
    const [isPreorder, setIsPreorder] = useState(false)
    const [pickupDateTime, setPickupDateTime] = useState(dayjs().add(30, 'minute'))

    const [minTime, setMinTime] = useState(earliestPickupTime)
    const [minDate, setMinDate] = useState(dayjs())

    const [isValid, setIsValid] = useState(true)

    const handlePlaceOrder = () => {
        alert("Not yet implemented.")
    }

    const resetFields = () => {
        setSelectedItems([])
        setRemark('')
        setIsTakeaway(false)
        setIsPreorder(false)
    }

    useEffect(() => { if (selectedItems.length === 0) resetFields() }, [selectedItems])

    //TODO: remove weekends

    //IF pickup today, minTime = now + 30 min, ELSE anyday use earliest
    useEffect(() => {
        if (dayjs().isSame(pickupDateTime, 'day')) {
            setMinTime(dayjs().add(30, 'minute'))
        }
        else {
            setMinTime(earliestPickupTime)
        }
    }, [pickupDateTime])


    //update pickup date time everytime isPreorder toggled
    useEffect(() => {
        if (!isPreorder) return

        //IF current time passed latestpickuptime, THEN set to next day earliest, BUT if next day is weekend, THEN increment to next day
        if (dayjs().diff(latestPickupTime.add(30, 'minute')) > 0) {
            let nextDayEarliest = earliestPickupTime.add(1, 'day')

            while (nextDayEarliest.day() === 0 || nextDayEarliest.day() === 6) {
                nextDayEarliest = nextDayEarliest.add(1, 'day')
            }

            setMinDate(nextDayEarliest)
            setPickupDateTime(nextDayEarliest)
        } else {
            setPickupDateTime(dayjs().add(30, 'minute'))
        }
    }, [isPreorder])

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
                                    <Checkbox checked={isPreorder} onChange={e => setIsPreorder(e.target.checked)} />
                                }
                                labelPlacement="start"
                                label="Pre-order?"
                                disabled={false}
                            />

                            {isPreorder &&
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={'en-sg'} >
                                    <DateTimePicker
                                        label="Pickup Time & Date"
                                        value={pickupDateTime}
                                        onChange={v => setPickupDateTime(v)}
                                        onError={(reason, value) => reason ? setIsValid(false) : setIsValid(true)}
                                        renderInput={(params) => <TextField {...params} />}
                                        minDate={minDate}
                                        maxDate={minDate.add(7, 'day')}
                                        minTime={minTime}
                                        maxTime={latestPickupTime}
                                        shouldDisableDate={date => {
                                            return date.day() === 0 || date.day() === 6
                                        }}
                                    />
                                </LocalizationProvider>
                            }

                        </Stack>

                        <Stack sx={{ m: 2 }} spacing={2}>
                            <Button
                                disabled={isPreorder && !isValid}
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