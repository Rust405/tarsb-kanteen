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

import RemoveIcon from '@mui/icons-material/Remove'

import { closeStall, openStall, updateStallDetails } from '../../../utils/firebase'

const StallSettings = ({ stallSnapshot, stallDocRef }) => {

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

    useEffect(() => {
        if (stallSnapshot) resetFields()
    }, [stallSnapshot])

    const [isEditing, setIsEditing] = useState(false)
    const [isValidating, setIsValidating] = useState(false)

    const handleCancelChanges = () => {
        resetFields()
        setIsEditing(false)
        setNewStaffEmail('')
    }


    //TODO: Backend and err snackbar
    const handleSaveChanges = () => {
        const updatedDetails = {
            stallName: stallName.trim(),
            lowercaseStallName: stallName.trim().toLowerCase(),
            staffEmails: staffEmails
        }

        setIsValidating(true)
        setNewStaffEmail('')

        // updateStallDetails(updatedDetails)
        //     .then(
        //         setIsValidating(false)
        //     )

        //test
        setTimeout(() => { setIsValidating(false) }, 5000)
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

    if (!stallSnapshot) return <CircularProgress />

    return (
        <div className="stall-settings">

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

            {/* TODO: upgdate UI, sort out sizing*/}
            <br /><br />

            <Typography variant="h6" gutterBottom>Stall Details</Typography>

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
                {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Stall Details</Button>}

                {/* Details Edit buttons */}
                {isEditing &&
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Button onClick={handleCancelChanges} disabled={isValidating} >Cancel</Button>
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


        </div>
    )
}

export default StallSettings