import { logout } from '../../../utils/firebase'
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

import InfoIcon from '@mui/icons-material/Info'
import RegisterStallDialog from './RegisterStallDialog'

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

const NewStallUser = ({ setIsNewStallUser, email }) => {
    const navigate = useNavigate()

    const stallRegCode = process.env.REACT_APP_STALL_REG_CODE
    const [regCodeInput, setRegCodeInput] = useState('')

    const [errMsgs, setErrMsgs] = useState([])

    useEffect(() => {
        navigate('/')
        setOpenSnack(true)
    }, [])

    const [openDialog, setOpenDialog] = useState(false)
    const handleOpenDialog = () => setOpenDialog(true)

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
            <RegisterStallDialog openDialog={openDialog} setOpenDialog={setOpenDialog} setErrMsgs={setErrMsgs} setOpenErrSnack={setOpenErrSnack} />

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