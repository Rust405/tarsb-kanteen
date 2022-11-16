import { logout } from '../../utils/firebase'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
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

    }

    return (
        <div className="new-stall-user">
            <Box sx={{ width: '100%' }}>
                <Stack spacing={2}>
                    <Item>
                        <Typography variant="paragraph">Are you a stall staff? Please inform your corresponding stall owner to add your Google account email address for access.</Typography>
                    </Item>
                    <Item>
                        <Button variant="contained" onClick={handleLogout} > Log Out </Button>
                    </Item>
                    <Item>
                        <Typography variant="paragraph">Are you a stall owner?</Typography>
                    </Item>
                    <Item>
                        <Button variant="contained" onClick={handleRegister} >Register Stall</Button>
                    </Item>
                </Stack>
            </Box>

        </div>
    )
}

export default NewStallUser