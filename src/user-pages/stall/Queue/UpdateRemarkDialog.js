import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

import { useState } from 'react'
import { updateRemarkStall } from '../../../utils/firebase'

const UpdateRemarkDialog = ({
    orderID, currentRemark,
    openUpdateRemark, setOpenUpdateRemark,
    isValidating, setIsValidating,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg
}) => {

    const [remarkStall, setRemarkStall] = useState(currentRemark)

    const handleCloseUpdateRemark = () => {
        if (isValidating) return

        setOpenUpdateRemark(false)
    }

    const handleUpdateRemark = () => {
        setIsValidating(true)
        setOpenErrSnack(false)

        updateRemarkStall({ orderID: orderID, remarkStall: remarkStall.trim() })
            .then(result => {
                let response = result.data
                if (response.success) {
                    setIsValidating(false)
                    setSucMsg(`Stall remark has been updated for order #${orderID}.`)
                    setOpenSucSnack(true)
                    setOpenUpdateRemark(false)
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
        <div className="update-remark-dialog">
            <Dialog open={openUpdateRemark} onClose={handleCloseUpdateRemark}  >
                <DialogTitle>Update Stall Remark?</DialogTitle>

                <DialogContent>
                    <Stack spacing={2}>
                        <Typography>
                            If order was cancelled, stall remark cannot be empty.
                        </Typography>

                        <TextField
                            multiline
                            rows={2}
                            label="New Stall Remark"
                            value={remarkStall} onChange={(e) => setRemarkStall(e.target.value)}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseUpdateRemark} disabled={isValidating}>Cancel</Button>

                    <Button onClick={handleUpdateRemark} disabled={isValidating} autoFocus>Proceed</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default UpdateRemarkDialog