import { signInWithGoogle } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

const Login = () => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/')
    }, [])

    return (
        <div className="login">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Button variant="contained" onClick={signInWithGoogle} >Login with Google</Button>
            </Box>
        </div>
    );
}

export default Login;