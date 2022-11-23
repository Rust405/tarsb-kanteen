import { registerStall } from '../../../utils/firebase'
import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import PropTypes from 'prop-types'

import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}))

const CustomDialogTitle = ({ children, onClose, ...other }) => {
    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton aria-label="close" onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    )
}

CustomDialogTitle.propTypes = { children: PropTypes.node, onClose: PropTypes.func.isRequired }

const RegisterStallDialog = ({ openDialog, setOpenDialog, setErrMsgs, setOpenErrSnack }) => {
    const [stallName, setStallName] = useState('')
    const [staffEmails, setStaffEmails] = useState([])
    const [newStaffEmail, setNewStaffEmail] = useState('')

    const [isValidating, setIsValidating] = useState(false)
    const [formBtnText, setFormBtnText] = useState('Save & Continue')

    const handleCloseDialog = () => setOpenDialog(false)

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

    const handleRegister = () => {
        const newStall = {
            stallName: stallName.trim(),
            lowercaseStallName: stallName.trim().toLowerCase(),
            staffEmails: staffEmails
        }

        setIsValidating(true)
        setOpenErrSnack(false)
        setNewStaffEmail('')
        setFormBtnText('Validating...')

        registerStall(newStall)
            .then(result => {
                let response = result.data
                if (response.success) {
                    window.location.reload(true)

                } else {
                    setOpenErrSnack(true)
                    setErrMsgs(response.message)
                    setIsValidating(false)
                    setFormBtnText('Save & Continue')
                }
            })
    }

    return (
        <div className="register-stall-dialog">
            <CustomDialog onClose={handleCloseDialog} aria-labelledby="register-dialog-title" open={openDialog} >

                <CustomDialogTitle id="register-dialog-title" onClose={handleCloseDialog}>Register Stall</CustomDialogTitle>

                <DialogContent dividers>

                    <Stack spacing={2}>

                        <TextField label="Stall Name" variant="outlined" size="small" autoComplete='off'
                            value={stallName} onChange={(e) => setStallName(e.target.value)} disabled={isValidating} />

                        <Typography>Staff Emails (optional): </Typography>

                        {staffEmails.length !== 0 &&
                            <Paper style={{ maxHeight: 128, overflow: 'auto' }}>
                                <List>
                                    {staffEmails.map(
                                        (staffEmail, index) => (
                                            <ListItem key={index}
                                                secondaryAction={
                                                    <IconButton
                                                        disabled={isValidating}
                                                        onClick={() => handleRemoveStaff(index)}>
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

                        {staffEmails.length <= 9 &&
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <TextField label="Staff Email" variant="outlined" size="small" autoComplete='off'
                                    value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} disabled={isValidating} inputProps={{ style: { textTransform: "lowercase" } }} />
                                <Button variant="text" onClick={handleAddStaff} disabled={newStaffEmail.trim() === '' || isValidating}>Add</Button>
                            </Stack>
                        }

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon /><Typography variant="caption">You can change these settings later.</Typography>
                        </Stack>
                    </Stack>

                </DialogContent>

                <DialogActions>
                    <Button autoFocus disabled={stallName.trim() === '' || isValidating} onClick={handleRegister}>{formBtnText}</Button>
                </DialogActions>
            </CustomDialog>
        </div>
    );
}

export default RegisterStallDialog;