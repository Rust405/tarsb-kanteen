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
import Snackbar from '@mui/material/Snackbar'
import Divider from '@mui/material/Divider'

import RemoveIcon from '@mui/icons-material/Remove'

import { closeStall, openStall, updateStallDetails } from '../../../utils/firebase'
import { Alert } from '../../../utils/customComponents'

const StallSettings = ({ stallSnapshot, stallDocRef, stallID }) => {

    const [disableSwitch, setDisableSwitch] = useState(false)

    const handleStatusToggle = () => {
        setDisableSwitch(true)

        if (stallSnapshot.status === 'open') {
            closeStall(stallDocRef)
                .then(() => setDisableSwitch(false))
        } else if (stallSnapshot.status === 'closed') {
            openStall(stallDocRef)
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
        var hasChanges = false
        var updatedDetails = {
            stallID: stallID,
            stallName: null,
            staffEmails: null
        }

        //only send details that was changed
        if (stallName !== stallSnapshot.stallName) {
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
            setOpenSavedSnack(false)
            setNewStaffEmail('')

            updateStallDetails(updatedDetails)
                .then(result => {
                    let response = result.data
                    if (response.success) {
                        setIsEditing(false)
                        setOpenSavedSnack(true)
                    } else {
                        setOpenErrSnack(true)
                        setErrMsgs(response.message)
                    }
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

    const [errMsgs, setErrMsgs] = useState([])
    const [openErrSnack, setOpenErrSnack] = useState(false)
    const handleCloseErrSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenErrSnack(false)
    }

    const [openSavedSnack, setOpenSavedSnack] = useState(false)
    const handleCloseSavedSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenSavedSnack(false)
    }

    const handleUnregister = () => {
        //TODO: implement somehow
        alert("This feature is currently unavailable.")
    }

    if (!stallSnapshot) return <CircularProgress />

    return (
        <div className="stall-settings">
            <Box sx={{ m: 2 }}>
                <Typography variant="h6" gutterBottom>Stall Status</Typography>

                <Stack direction="row" alignItems="center" spacing={2}>
                    <Switch
                        checked={stallSnapshot.status === 'open'}
                        onChange={handleStatusToggle}
                        disabled={disableSwitch}
                    />
                    <Typography variant="body1">
                        The stall is now {stallSnapshot.status} and {stallSnapshot.status === 'open' ? "accepting" : "not accepting"} orders.
                    </Typography>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ m: 2 }}>
                <Typography variant="h6" gutterBottom>Stall Details {isEditing && "(Editing)"}</Typography>

                <Stack spacing={2}>
                    <TextField label="Stall Name" variant="outlined" size="small" autoComplete='off'
                        value={stallName} onChange={(e) => setStallName(e.target.value)} disabled={!isEditing || isValidating} />

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
                            <TextField label="Staff Email" variant="outlined" size="small" autoComplete='off'
                                value={newStaffEmail}
                                onChange={(e) => setNewStaffEmail(e.target.value)}
                                disabled={isValidating}
                                inputProps={{ style: { textTransform: "lowercase" } }}
                                onKeyPress={(e) => { if (e.key === 'Enter') handleAddStaff() }}
                            />
                            <Button onClick={handleAddStaff} disabled={newStaffEmail.trim() === '' || isValidating}>Add</Button>
                        </Stack>
                    }

                    {/* Enable editing button */}
                    {!isEditing &&
                        <Box display="flex" justifyContent="center">
                            <Button onClick={() => setIsEditing(true)}>Edit Stall Details</Button>
                        </Box>
                    }

                    {/* Details Edit buttons */}
                    {isEditing &&
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Button onClick={handleRemoveChanges} disabled={isValidating} >Cancel</Button>
                            <Box sx={{ position: 'relative' }}>
                                <Button onClick={handleSaveChanges} disabled={isValidating}>
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

            </Box>

            <Divider />

            <Box sx={{ m: 2 }} display="flex" justifyContent="center">
                <Button variant="outlined" color="error" onClick={handleUnregister}>Unregister Stall</Button>
            </Box>

            {/* Changes saved snackbar */}
            <Snackbar open={openSavedSnack} autoHideDuration={3000} onClose={handleCloseSavedSnack} >
                <Alert onClose={handleCloseSavedSnack} severity="success" sx={{ width: '100%' }}>
                    Changes saved
                </Alert>
            </Snackbar>

            {/* Error messages snackbar */}
            <Snackbar open={openErrSnack} autoHideDuration={5000 * errMsgs.length} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>
                    {errMsgs.length > 1 ?
                        errMsgs.map((errMsg, i) => <Typography key={i}>{`• ${errMsg}`}</Typography>)
                        :
                        <div>{errMsgs[0]}</div>
                    }
                </Alert>
            </Snackbar>

        </div>
    )
}

export default StallSettings