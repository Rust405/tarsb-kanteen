import { signInWithGoogle } from './utils/firebase'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import GoogleIcon from '@mui/icons-material/Google';

const Login = () => {
    const navigate = useNavigate()

    useEffect(() => navigate('/'), [])

    return (
        <div className="login">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Stack sx={{ m: 2 }} spacing={4}>
                    <Typography variant="h2" align="center" sx={{ fontWeight: 'bold' }}>TARSB<br />Kanteen</Typography>
                    <Typography variant="body" align="center">Log in with your Google account to get started!</Typography>

                    <Box display="flex" justifyContent="center">
                        <Button startIcon={<GoogleIcon />} variant="contained" onClick={signInWithGoogle} >Login with Google</Button>
                    </Box>
                </Stack>
            </Box>
        </div>
    );
}

export default Login;