import { useEffect, useState } from 'react'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

import RemoveIcon from '@mui/icons-material/Remove'

import { toggleStallStatus, updateStallDetails } from '../../../utils/firebase'
import UnregisterStallDialog from './UnregisterStallDialog'

const StallSettings = ({
    stallSnapshot, stallDocRef, stallID,
    setOpenErrSnack, setErrMsgs,
    setSucMsg, setOpenSucSnack
}) => {
    const [disableSwitch, setDisableSwitch] = useState(false)

    const handleStatusToggle = () => {
        setDisableSwitch(true)

        if (stallSnapshot.status === 'open') {
            toggleStallStatus(stallDocRef, "closed")
                .then(() => setDisableSwitch(false))
        } else if (stallSnapshot.status === 'closed') {
            toggleStallStatus(stallDocRef, "open")
                .then(() => setDisableSwitch(false))
        }
    }

    const [stallName, setStallName] = useState('')
    const [staffEmails, setStaffEmails] = useState('')
    const [newStaffEmail, setNewStaffEmail] = useState('')

    function resetFields() {
        setStallName(stallSnapshot.stallName)
        setStaffEmails(stallSnapshot.staffEmails)
    }

    useEffect(() => { if (stallSnapshot) resetFields() }, [stallSnapshot])

    const [isEditing, setIsEditing] = useState(false)
    const [isValidating, setIsValidating] = useState(false)

    const handleRemoveChanges = () => {
        resetFields()
        setIsEditing(false)
        setNewStaffEmail('')
    }

    const handleSaveChanges = () => {
        let hasChanges = false
        let updatedDetails = { stallID: stallID }

        //only send details that was changed
        if (stallName.trim() !== stallSnapshot.stallName) {
            updatedDetails.stallName = stallName.trim()
            hasChanges = true
        }
        if (!staffEmails.every((val, index) => val === stallSnapshot.staffEmails[index]) || staffEmails.length != stallSnapshot.staffEmails.length) {
            updatedDetails.staffEmails = staffEmails
            hasChanges = true
        }

        if (hasChanges) {
            setIsValidating(true)
            setOpenErrSnack(false)
            setOpenSucSnack(false)
            setNewStaffEmail('')

            updateStallDetails({ updatedDetails: updatedDetails })
                .then(result => {
                    let response = result.data
                    if (response.success) {
                        setIsEditing(false)
                        setSucMsg('Changes saved')
                        setOpenSucSnack(true)
                    } else {
                        setOpenErrSnack(true)
                        setErrMsgs(response.message)
                    }
                    setIsValidating(false)
                })
                .catch(err => {
                    console.warn(err)
                    setOpenErrSnack(true)
                    setErrMsgs(['Unable to proceed. A server error has occured.'])
                    setIsValidating(false)
                })
        } else {
            handleRemoveChanges()
        }

    }

    const handleAddStaff = () => {
        if (newStaffEmail.trim() !== '' && !staffEmails.includes(newStaffEmail.trim())) {
            setStaffEmails([...staffEmails, newStaffEmail.trim()])
        }
        setNewStaffEmail('')
    }

    const handleRemoveStaff = (index) => {
        setStaffEmails([
            ...staffEmails.slice(0, index),
            ...staffEmails.slice(index + 1, staffEmails.length)
        ])
    }

    const [openDialog, setOpenDialog] = useState(false)
    const handleUnregister = () => {
        let errMsgs = []
        let hasErrs = false

        setOpenErrSnack(false)

        if (stallSnapshot.status !== 'closed') {
            errMsgs.push('Please ensure the stall is closed before proceeding.')
            hasErrs = true
        }
        if (stallSnapshot.orderQueue.length !== 0 || stallSnapshot.preOrderList.length !== 0) {
            errMsgs.push('Please fulfill or cancel any unfulfilled orders before proceeding.')
            hasErrs = true
        }

        if (!hasErrs) {
            setOpenDialog(true)
        } else {
            setOpenErrSnack(true)
            setErrMsgs(errMsgs)
        }
    }

    if (!stallSnapshot) return <CircularProgress />

    return (
        <div className="stall-settings">
            <Box sx={{ p: 2, width: "100%", maxWidth: "540px" }}>
                <Stack spacing={2}>
                    <div>
                        <Typography variant="h6" gutterBottom>Stall Status</Typography>

                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Switch
                                checked={stallSnapshot.status === 'open'}
                                onChange={handleStatusToggle}
                                disabled={disableSwitch}
                            />
                            <Typography variant="body1">
                                The stall is now {stallSnapshot.status === 'open' ? "open and is accepting" : "closed and is not accepting"} orders.
                            </Typography>
                        </Stack>
                    </div>

                    <Divider />

                    <div>
                        <Typography variant="h6" gutterBottom>Stall Details {isEditing && "(Editing)"}</Typography>

                        <Stack spacing={2}>
                            <TextField label="Stall Name" size="small" autoComplete='off'
                                value={stallName} onChange={e => setStallName(e.target.value)} disabled={!isEditing || isValidating} />

                            <Typography>Staff Emails ({staffEmails.length === 0 ? "None" : staffEmails.length}) </Typography>

                            {staffEmails.length !== 0 &&
                                <Paper style={{ maxHeight: 128, overflow: 'auto' }}>
                                    <List>
                                        {staffEmails.map(
                                            (staffEmail, index) => (
                                                <ListItem key={index}
                                                    disabled={!isEditing || isValidating}
                                                    secondaryAction={
                                                        isEditing && !isValidating &&
                                                        <IconButton
                                                            onClick={() => handleRemoveStaff(index)} >
                                                            <RemoveIcon />
                                                        </IconButton>
                                                    }>
                                                    {staffEmail}
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                </Paper>
                            }

                            {staffEmails.length <= 9 && isEditing &&
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <TextField label="Staff Email" size="small" autoComplete='off'
                                        value={newStaffEmail}
                                        onChange={e => setNewStaffEmail(e.target.value)}
                                        disabled={isValidating}
                                        inputProps={{ style: { textTransform: "lowercase" } }}
                                        onKeyPress={e => { if (e.key === 'Enter') handleAddStaff() }}
                                    />
                                    <Button onClick={handleAddStaff} disabled={newStaffEmail.trim() === '' || isValidating}>Add</Button>
                                </Stack>
                            }

                            {/* Enable editing button */}
                            {!isEditing &&
                                <Box display="flex" justifyContent="center">
                                    <Button variant="contained" onClick={() => setIsEditing(true)}>Edit Stall Details</Button>
                                </Box>
                            }

                            {/* Details Edit buttons */}
                            {isEditing &&
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Button onClick={handleRemoveChanges} disabled={isValidating} >Cancel</Button>
                                    <Box sx={{ position: 'relative' }}>
                                        <Button onClick={handleSaveChanges} disabled={stallName.trim() === '' || isValidating}>
                                            {isValidating ? "Validating..." : "Save Changes"}
                                        </Button>
                                        {isValidating &&
                                            <CircularProgress
                                                size={24}
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    marginTop: '-12px',
                                                    marginLeft: '-12px',
                                                }}
                                            />
                                        }
                                    </Box>
                                </Stack>
                            }

                        </Stack>
                    </div>

                    <Divider />

                    <Box display="flex" justifyContent="center">
                        <Button variant="outlined" size="small" color="error" onClick={handleUnregister} disabled={isEditing}>Unregister Stall</Button>
                    </Box>
                </Stack>
            </Box>

            <UnregisterStallDialog openDialog={openDialog} setOpenDialog={setOpenDialog} stallName={stallSnapshot.stallName} stallID={stallID} setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs} />
        </div>
    )
}

export default StallSettings