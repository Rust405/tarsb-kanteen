import { logout } from '../../utils/firebase'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'

import PropTypes from 'prop-types'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}))

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

const RegisterStallDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}))

const RegisterStallDialogTitle = ({ children, onClose, ...other }) => {
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

RegisterStallDialogTitle.propTypes = { children: PropTypes.node, onClose: PropTypes.func.isRequired }

const NewStallUser = ({ setIsNewStallUser, email }) => {
    const navigate = useNavigate()

    const stallRegCode = process.env.REACT_APP_STALL_REG_CODE
    const [openSnack, setOpenSnack] = useState(false)
    const [disableReg, setDisableReg] = useState(true)
    const [regCodeInput, setRegCodeInput] = useState('')

    const [openDialog, setOpenDialog] = useState(false)
    const handleOpenDialog = () => setOpenDialog(true)
    const handleCloseDialog = () => setOpenDialog(false)

    useEffect(() => {
        navigate('/')
        setOpenSnack(true)
    }, [])

    const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenSnack(false)
    }

    useEffect(() => { regCodeInput === stallRegCode ? setDisableReg(false) : setDisableReg(true) }, [regCodeInput])

    const handleLogout = () => {
        setIsNewStallUser(false)
        logout()
    }

    const [stallName, setStallName] = useState('')
    const [staffEmails, setStaffEmails] = useState('')
    const [disableSave, setDisableSave] = useState(true)

    useEffect(() => { stallName === '' ? setDisableSave(true) : setDisableSave(false) }, [stallName])

    const handleRegister = () => {
        const staffEmailsArray = staffEmails.split(',').map(item => item.trim()).filter(element => element)
        const newStall = {
            stallName: stallName,
            staffEmails: staffEmailsArray
        }

        console.log(newStall)

        //TODO: limit to 10 staff emails

        //TODO: deploy registerStall

        //save & continue -> checking... -> ???
    }

    return (
        <div className="new-stall-user">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Stack sx={{ m: 2 }} spacing={4}>
                    {/* Are you a stall staff? */}
                    <Item>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>Are you a stall staff?</Typography>
                        <Typography variant="body2" >Please inform your corresponding stall owner to add your Google account email address for access.</Typography>
                    </Item>

                    {/* Are you a stall owner? */}
                    <Item>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>Are you a stall owner?</Typography>
                        <Typography variant="body2" >Please enter the <strong>Stall Registration Code</strong> you received from the <strong>Administration Office</strong> before proceeding to register your stall.</Typography>

                        <Box sx={{ m: 2 }} display="flex" justifyContent="center">
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TextField type="password" label="Stall Registration Code" variant="outlined" size="small"
                                    value={regCodeInput} onChange={(e) => setRegCodeInput(e.target.value)} />
                                <Button variant="contained" size="small" onClick={handleOpenDialog} disabled={disableReg}>Register Stall</Button>
                            </Stack>
                        </Box>
                    </Item>

                    {/* Info for customer */}
                    <Item>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon />
                            <Typography variant="body2">If you are a customer, unfortunately we currently do not support guest accounts, you may order at the stalls physically.</Typography>
                        </Stack>
                    </Item>

                    {/* Logout button */}
                    <Box display="flex" justifyContent="center">
                        <Tooltip title={`Log out of ${email}`} placement="right" disableInteractive>
                            <Button variant="outlined" color="error" onClick={handleLogout} >Log Out</Button>
                        </Tooltip>
                    </Box>
                </Stack>
            </Box>

            {/* New stall user snackbar */}
            <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack} >
                <Alert onClose={handleCloseSnack} severity="info" sx={{ width: '100%' }}>
                    New stall user detected
                </Alert>
            </Snackbar>

            {/* Register Stall Dialog */}
            <RegisterStallDialog onClose={handleCloseDialog} aria-labelledby="register-dialog-title" open={openDialog} >

                <RegisterStallDialogTitle id="register-dialog-title" onClose={handleCloseDialog}>Register Stall</RegisterStallDialogTitle>

                <DialogContent dividers>
                    <Stack spacing={4}>
                        <TextField label="Stall Name" variant="outlined"
                            value={stallName} onChange={(e) => setStallName(e.target.value)} />

                        <TextField label="Stall Staff Email(s)" multiline maxRows={3}
                            helperText="Note: Separate multiple emails by comma (,)"
                            value={staffEmails} onChange={(e) => setStaffEmails(e.target.value)} />

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon /><Typography>You can change these settings later.</Typography>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button autoFocus disabled={disableSave} onClick={handleRegister}>Save & Continue</Button>
                </DialogActions>

            </RegisterStallDialog>
        </div >
    )
}

export default NewStallUser