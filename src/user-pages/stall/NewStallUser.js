import { logout } from '../../utils/firebase'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'

import InfoIcon from '@mui/icons-material/Info'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}))


const NewStallUser = ({ setIsNewStallUser }) => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/')
    }, [])

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
                <Stack spacing={4}>
                    <Item>
                        <Typography variant="h5">Are you a stall staff?</Typography>
                        <Typography variant="body2" >Please inform your corresponding stall owner to add your Google account email address for access.</Typography>
                    </Item>
                    <Item>
                        <Typography variant="h5">Are you a stall owner?</Typography>
                        <Typography variant="body2" >Please input the <strong>Stall Registration Code</strong> you received from the <strong>Administration Office</strong> before proceeding to register your stall.</Typography>
                        
                        <Box sx={{m:2}} display="flex" justifyContent="center">
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <TextField label="Stall Registration Code" variant="outlined" size="small" />
                                <Button variant="contained" onClick={handleRegister} >Register Stall</Button>
                            </Stack>
                        </Box>
                    </Item>
                    <Item>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon />
                            <Typography variant="body2">If you are a customer, unfortunately we currently do not support guest accounts, you may order at the stall physically.</Typography>
                        </Stack>
                    </Item>

                    <Button variant="outlined" color="error" onClick={handleLogout} >Log Out</Button>

                </Stack>

            </Box>

        </div >
    )
}

export default NewStallUser