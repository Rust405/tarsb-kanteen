import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'

import { useState } from 'react'
import { reportCustomer } from '../../../utils/firebase'

const ReportCustomerDialog = ({
    stallID,
    reportData, setReportData,
    openReportCustomer, setOpenReportCustomer,
    isValidating, setIsValidating,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg
}) => {

    const [reason, setReason] = useState('')

    const handleCloseReportCustomer = () => {
        if (isValidating) return

        setReason('')
        setReportData(null)
        setOpenReportCustomer(false)
    }

    const handleReportCustomer = () => {
        if (!reportData) return

        let report = {
            reason: reason,
            customerID: reportData.customerID,
            orderID: reportData.orderID,
            stallID: stallID
        }

        setIsValidating(true)
        setOpenErrSnack(false)

        reportCustomer({ report: report })
            .then(result => {
                let response = result.data
                if (response.success) {
                    setIsValidating(false)
                    setSucMsg(`Report has been successfully created.`)
                    setOpenSucSnack(true)
                    handleCloseReportCustomer()
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
        <div className="report-user-dialog">
            <Dialog open={openReportCustomer} onClose={handleCloseReportCustomer}  >
                <DialogTitle>Report Customer?</DialogTitle>

                <DialogContent>
                    <Stack spacing={2}>
                        <Typography>
                            By proceeding, you will be reporting this customer to the Administration Office for review. A reason is required for the report.
                        </Typography>

                        <TextField
                            inputProps={{ maxLength: 150 }}
                            multiline
                            rows={2}
                            label="Reason (required)"
                            value={reason} onChange={(e) => setReason(e.target.value)}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseReportCustomer} disabled={isValidating}>Cancel</Button>

                    <Button onClick={handleReportCustomer} disabled={reason === '' || isValidating} autoFocus>Proceed</Button>
                </DialogActions>

            </Dialog>
        </div>
    )
}

export default ReportCustomerDialog