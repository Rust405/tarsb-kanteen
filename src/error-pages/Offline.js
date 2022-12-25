import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import Stack from '@mui/material/Stack'

const Offline = () => {
    return (
        <div className="offline">
            <Box sx={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)'
            }}>
                <Stack alignItems="center" spacing={2}>
                    <Typography align="center" variant="boduy">You are offline.</Typography>
                    <CloudOffIcon />
                </Stack>
            </Box>
        </div>
    )
}

export default Offline