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
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'

import PropTypes from 'prop-types'

import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'

import { CUSTOMCOMPONENT } from '../../../constants'

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}))

const CustomDialogTitle = ({ children, onClose, ...other }) => {
    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
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

const RegisterStallDialog = ({ openDialog, setOpenDialog }) => {
    const [stallName, setStallName] = useState('')
    const [staffEmails, setStaffEmails] = useState([])
    const [newStaffEmail, setNewStaffEmail] = useState('')

    const [isValidating, setIsValidating] = useState(false)

    const handleCloseDialog = () => {
        if (isValidating) return
        setOpenDialog(false)
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

    const handleRegister = () => {
        const newStall = {
            stallName: stallName.trim(),
            staffEmails: staffEmails
        }

        setIsValidating(true)
        setOpenErrSnack(false)
        setNewStaffEmail('')

        registerStall({ newStall: newStall })
            .then(result => {
                let response = result.data
                if (response.success) {
                    window.location.reload(true)
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

    const [errMsgs, setErrMsgs] = useState([])
    const [openErrSnack, setOpenErrSnack] = useState(false)
    const handleCloseErrSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenErrSnack(false)
    }

    return (
        <div className="register-stall-dialog">
            <CustomDialog onClose={handleCloseDialog} aria-labelledby="register-dialog-title" open={openDialog} >

                <CustomDialogTitle id="register-dialog-title" onClose={handleCloseDialog}>Register Stall</CustomDialogTitle>

                <DialogContent dividers>

                    <Stack spacing={2}>

                        <TextField label="Stall Name" size="small" autoComplete='off'
                            value={stallName} onChange={e => setStallName(e.target.value)} disabled={isValidating} />

                        <Typography>Staff Emails ({staffEmails.length === 0 ? "Optional" : staffEmails.length}) </Typography>

                        {staffEmails.length !== 0 &&
                            <Paper style={{ maxHeight: 128, overflow: 'auto' }}>
                                <List>
                                    {staffEmails.map(
                                        (staffEmail, index) => (
                                            <ListItem key={index}
                                                disabled={isValidating}
                                                secondaryAction={
                                                    !isValidating &&
                                                    <IconButton
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

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon /><Typography variant="caption">You can change these settings later.</Typography>
                        </Stack>
                    </Stack>

                </DialogContent>

                <DialogActions>
                    <Box sx={{ position: 'relative' }}>
                        <Button autoFocus disabled={stallName.trim() === '' || isValidating} onClick={handleRegister}>
                            {isValidating ? "Validating..." : "Save & Continue"}
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
                </DialogActions>
            </CustomDialog>

            {/* Error messages snackbar */}
            <Snackbar open={openErrSnack} autoHideDuration={5000 * errMsgs.length} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <CUSTOMCOMPONENT.Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>
                    {errMsgs.length > 1 ?
                        errMsgs.map((errMsg, i) => <Typography key={i}>{`• ${errMsg}`}</Typography>)
                        :
                        <div>{errMsgs[0]}</div>
                    }
                </CUSTOMCOMPONENT.Alert>
            </Snackbar>
        </div>
    );
}

export default RegisterStallDialog;