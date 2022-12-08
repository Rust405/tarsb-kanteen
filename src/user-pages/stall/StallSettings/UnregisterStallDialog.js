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

import { unregisterStall } from '../../../utils/firebase'

const UnregisterStallDialog = ({ openDialog, setOpenDialog, stallName, stallID, setOpenErrSnack, setErrMsgs }) => {
    const [confirmation, setConfirmation] = useState('')

    const [isUnregistering, setIsUnregistering] = useState(false)

    const handleCloseDialog = () => {
        if (isUnregistering) return
        setConfirmation('')
        setOpenDialog(false)
    }

    const handleUnregisterStall = () => {
        setIsUnregistering(true)
        setOpenErrSnack(false)

        unregisterStall({ stallID: stallID })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsUnregistering(false)
            })
    }

    return (
        <div className="unregister-stall-dialog">
            <Dialog open={openDialog} onClose={handleCloseDialog} >
                <DialogTitle>Unregister Stall? </DialogTitle>

                <DialogContent>
                    <DialogContentText>
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
        </div >
    )
}

export default UnregisterStallDialog