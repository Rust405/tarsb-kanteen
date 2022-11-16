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

import InfoIcon from '@mui/icons-material/Info'

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

const NewStallUser = ({ setIsNewStallUser }) => {
    const navigate = useNavigate()

    const stallRegCode = process.env.REACT_APP_STALL_REG_CODE
    const [openSnack, setOpenSnack] = useState(false)
    const [disableReg, setDisableReg] = useState(true)
    const [regCodeInput, setRegCodeInput] = useState('')

    useEffect(() => {
        navigate('/')
        setOpenSnack(true)
    }, [])

    const handleCloseSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenSnack(false)
    }

    const handleCodeInput = (e) => {
        setRegCodeInput(e.target.value)
    }

    useEffect(() => { regCodeInput === stallRegCode ? setDisableReg(false) : setDisableReg(true) }, [regCodeInput])

    const handleLogout = () => {
        setIsNewStallUser(false)
        logout()
    }

    const handleRegister = () => {
        console.log("Register clicked")
    }

    return (
        <div className="new-stall-user">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Stack sx={{ m: 2 }} spacing={4}>
                    <Item>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Are you a stall staff?</Typography>
                        <Typography variant="body2" >Please inform your corresponding stall owner to add your Google account email address for access.</Typography>
                    </Item>

                    <Item>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Are you a stall owner?</Typography>
                        <Typography variant="body2" >Please input the <strong>Stall Registration Code</strong> you received from the <strong>Administration Office</strong> before proceeding to register your stall.</Typography>

                        <Box sx={{ m: 2 }} display="flex" justifyContent="center">
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TextField label="Stall Registration Code" variant="outlined" size="small"
                                    value={regCodeInput} onChange={handleCodeInput} />
                                <Button variant="contained" size="small" onClick={handleRegister} disabled={disableReg}>Register Stall</Button>
                            </Stack>
                        </Box>
                    </Item>

                    <Item>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon />
                            <Typography variant="body2">If you are a customer, unfortunately we currently do not support guest accounts, you may order at the stall physically.</Typography>
                        </Stack>
                    </Item>
                    <Box display="flex" justifyContent="center">
                        <Button variant="outlined" color="error" onClick={handleLogout} >Log Out</Button>
                    </Box>
                </Stack>
            </Box>

            <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseSnack} >
                <Alert onClose={handleCloseSnack} severity="info" sx={{ width: '100%' }}>
                    New stall user detected
                </Alert>
            </Snackbar>

        </div >
    )
}

export default NewStallUser