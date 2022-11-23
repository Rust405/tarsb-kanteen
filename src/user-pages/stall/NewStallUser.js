import { logout, registerStall } from '../../utils/firebase'
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
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'

import PropTypes from 'prop-types'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'

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
    const [regCodeInput, setRegCodeInput] = useState('')

    const [stallName, setStallName] = useState('')
    const [staffEmails, setStaffEmails] = useState([])
    const [newStaffEmail, setNewStaffEmail] = useState('')

    const [isValidating, setIsValidating] = useState(false)
    const [formBtnText, setFormBtnText] = useState('Save & Continue')
    const [errMsgs, setErrMsgs] = useState([])

    useEffect(() => {
        navigate('/')
        setOpenSnack(true)
    }, [])

    const [openDialog, setOpenDialog] = useState(false)
    const handleOpenDialog = () => setOpenDialog(true)
    const handleCloseDialog = () => setOpenDialog(false)

    const [openSnack, setOpenSnack] = useState(false)
    const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenSnack(false)
    }

    const [openErrSnack, setOpenErrSnack] = useState(false)
    const handleCloseErrSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenErrSnack(false)
    }

    const handleLogout = () => {
        setIsNewStallUser(false)
        logout()
    }

    const handleAddStaff = () => {
        if (newStaffEmail !== '' && !staffEmails.includes(newStaffEmail)) {
            setStaffEmails([...staffEmails, newStaffEmail])
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
            stallName: stallName,
            lowercaseStallName: stallName.toLowerCase(),
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
                                <Button variant="contained" size="small" onClick={handleOpenDialog} disabled={regCodeInput !== stallRegCode}>Register Stall</Button>
                            </Stack>
                        </Box>
                    </Item>

                    {/* Info for customer */}
                    <Item>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon />
                            <Typography variant="caption">If you are a customer, unfortunately we currently do not support guest accounts, you may order at the stalls physically.</Typography>
                        </Stack>
                    </Item>

                    {/* Logout button */}
                    <Box display="flex" justifyContent="center">
                        <Tooltip title={`Log out of ${email}`} placement="right" disableInteractive>
                            <Button variant="outlined" color="error" onClick={handleLogout}>Log Out</Button>
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
                                <Button variant="text" onClick={handleAddStaff} disabled={newStaffEmail === '' || isValidating}>Add</Button>
                            </Stack>
                        }

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon /><Typography variant="caption">You can change these settings later.</Typography>
                        </Stack>
                    </Stack>

                </DialogContent>

                <DialogActions>
                    <Button autoFocus disabled={stallName === '' || isValidating} onClick={handleRegister}>{formBtnText}</Button>
                </DialogActions>
            </RegisterStallDialog>

            {/* Error messages snackbar */}
            <Snackbar open={openErrSnack} autoHideDuration={6000 * errMsgs.length} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>
                    {errMsgs.length > 1 ?
                        errMsgs.map((errMsg, i) => <Typography key={i}>{`• ${errMsg}`}</Typography>)
                        :
                        <div>{errMsgs[0]}</div>
                    }
                </Alert>
            </Snackbar>
        </div >
    )
}

export default NewStallUser