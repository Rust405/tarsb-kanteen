import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

const OrderIDDisplay = ({ orderID, openIDDisplay, setOpenIDDisplay }) => {

    return (
        <div className="order-id-preview">
            <Dialog open={openIDDisplay} onClose={() => setOpenIDDisplay(false)}  >
                <DialogTitle>Order ID:</DialogTitle>

                <DialogContent>
                    <Typography variant="h5">{orderID}</Typography>
                    <Typography variant="caption">Request the customer to show their order ID.</Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenIDDisplay(false)}>Ok</Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}

export default OrderIDDisplay