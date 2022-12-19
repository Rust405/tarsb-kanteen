import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { customerCancelOrder } from '../../../utils/firebase'

const CancelOrderDialog = ({
    orderID,
    openCancel, setOpenCancel,
    isValidating, setIsValidating,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg
}) => {

    const handleCloseCancel = () => {
        if (isValidating) return

        setOpenCancel(false)
    }

    const handleCancelOrder = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        customerCancelOrder({ orderID: orderID })
            .then(result => {
                let response = result.data
                if (response.success) {
                    setIsValidating(false)
                    setSucMsg(`Order #${orderID} has been successfully cancelled.`)
                    setOpenSucSnack(true)
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
                    <DialogContentText>
                        Once the order is cancelled, it cannot be undone.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseCancel} disabled={isValidating}>No</Button>

                    <Button onClick={handleCancelOrder} disabled={isValidating} autoFocus>Yes</Button>
                </DialogActions>

            </Dialog>
        </div>
    )
}

export default CancelOrderDialog