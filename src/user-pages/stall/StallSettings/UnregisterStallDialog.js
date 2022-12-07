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
import Snackbar from '@mui/material/Snackbar'

import { Alert } from '../../../constants/components'
import { unregisterStall } from '../../../utils/firebase'

const UnregisterStallDialog = ({ openDialog, setOpenDialog, stallName, stallID }) => {
    const [confirmation, setConfirmation] = useState('')

    const handleUnregisterStall = () => {
        setIsUnregistering(true)
        unregisterStall({ stallID: stallID })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setIsUnregistering(false)
            })
    }

    const [isUnregistering, setIsUnregistering] = useState(false)
    const [openErrSnack, setOpenErrSnack] = useState(false)
    const handleCloseErrSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenErrSnack(false)
    }

    const handleCloseDialog = () => {
        if (isUnregistering) return
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
                        associated with the stall (incluyding yourself) will be automatically logged out.
                        This process cannot be undone.
                    </DialogContentText>

                    <Box sx={{ m: 2 }}>
                        <Typography> Confirm the unregistration of this stall by typing its name: <strong>{stallName}</strong></Typography>
                        <TextField size="small" value={confirmation} disabled={isUnregistering}
                            onChange={e => setConfirmation(e.target.value)} placeholder={stallName} />
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog} disabled={isUnregistering}>Cancel</Button>
                    <Button onClick={handleUnregisterStall} disabled={confirmation !== stallName || isUnregistering} autoFocus>Proceed</Button>
                </DialogActions>
            </Dialog>

            {/* Error messages snackbar */}
            <Snackbar open={openErrSnack} autoHideDuration={5000} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>Unable to proceed. A server error has occured.</Alert>
            </Snackbar>
        </div >
    )
}

export default UnregisterStallDialog