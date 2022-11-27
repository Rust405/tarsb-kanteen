import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

const UnregisterStallDialog = ({ openDialog, setOpenDialog }) => {

    const handleUnregisterStall = () => {
        //TODO:
        alert("Not yet implemented")
    }

    return (
        <div className="unregister-stall-dialog">
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">Unregister Stall? </DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Before your proceed, please note that all users
                        associated with the stall will be automatically logged out.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleUnregisterStall} autoFocus>Proceed</Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}

export default UnregisterStallDialog