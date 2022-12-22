import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

import { useState } from 'react'
import { stallCancelOrder } from '../../../utils/firebase'

const CancelOrderDialog = ({
    orderID, setSelectedOrder,
    openCancel, setOpenCancel,
    isValidating, setIsValidating,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg
}) => {

    const [remarkStall, setRemarkStall] = useState('')

    const handleCloseCancel = () => {
        if (isValidating) return

        setOpenCancel(false)
    }

    const handleCancelOrder = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        stallCancelOrder({ orderID: orderID, remarkStall: remarkStall })
            .then(result => {
                let response = result.data
                if (response.success) {
                    setIsValidating(false)
                    setSucMsg(`Order #${orderID} has been successfully cancelled.`)
                    setOpenSucSnack(true)
                    setSelectedOrder(null)
                    setOpenCancel(false)
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

    return (
        <div className="cancel-order-dialog">
            <Dialog open={openCancel} onClose={handleCloseCancel}  >
                <DialogTitle>Proceed with order cancellation?</DialogTitle>

                <DialogContent>
                    <Stack spacing={2}>
                        <Typography>
                            Once the order is cancelled, it cannot be undone.
                            A reason for cancellation is required, it will be viewed by the customer as a stall remark.
                        </Typography>
                        
                        <Typography>(Existing stall remark will be overwritten)</Typography>

                        <TextField
                            multiline
                            rows={2}
                            label="Reason (required)"
                            value={remarkStall} onChange={(e) => setRemarkStall(e.target.value)}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseCancel} disabled={isValidating}>Cancel</Button>

                    <Button onClick={handleCancelOrder} disabled={remarkStall === '' || isValidating} autoFocus>Proceed</Button>
                </DialogActions>

            </Dialog>
        </div>
    )
}

export default CancelOrderDialog