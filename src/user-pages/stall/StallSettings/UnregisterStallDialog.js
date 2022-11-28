import { useState } from 'react'

import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'


const UnregisterStallDialog = ({ openDialog, setOpenDialog, stallName }) => {

    const [confirmation, setConfirmation] = useState('')

    const handleUnregisterStall = () => {
        //TODO:
        alert("Not yet implemented")
    }

    const handleCloseDialog = () => {
        setConfirmation('')
        setOpenDialog(false)
    }

    return (
        <div className="unregister-stall-dialog">
            <Dialog open={openDialog} onClose={handleCloseDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">Unregister Stall? </DialogTitle>

                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Before your proceed, please note that all users
                        associated with the stall will be automatically logged out.
                        This process cannot be undone.
                    </DialogContentText>

                    <Box sx={{ m: 2 }}>
                        <Typography> Confirm the unregistration of this stall by typing its name: <strong>{stallName}</strong></Typography>
                        <TextField size="small" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder={stallName} />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleUnregisterStall} disabled={confirmation !== stallName} autoFocus>Proceed</Button>
                </DialogActions>
            </Dialog>
        </div >
    )
}

export default UnregisterStallDialog