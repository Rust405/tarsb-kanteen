import { signInWithGoogle } from './utils/firebase'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import GoogleIcon from '@mui/icons-material/Google'
import InfoIcon from '@mui/icons-material/Info'

const Login = () => {
    const navigate = useNavigate()

    useEffect(() => navigate('/'), [])

    return (
        <div className='login'>
            <Box sx={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)'
            }}>
                <Stack spacing={3}>
                    <Typography variant='h2' align='center' sx={{ fontWeight: 'bold' }}>TARSB<br />Kanteen</Typography>
                    <Typography variant='body' align='center'>Log in with your Google account to get started!</Typography>
                    <Stack direction='row' alignItems='center' spacing={1}>
                        <InfoIcon /><Typography variant='caption'>If you are a TAR student or lecturer/staff, use your email ending in tarc.edu.my.</Typography>
                    </Stack>

                    <Box display='flex' justifyContent='center'>
                        <Button startIcon={<GoogleIcon />} variant='contained' onClick={signInWithGoogle} >Login with Google</Button>
                    </Box>

                </Stack>
            </Box>
        </div>
    );
}

export default Login;