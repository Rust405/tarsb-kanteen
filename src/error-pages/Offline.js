import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CloudOffIcon from '@mui/icons-material/CloudOff'
import Stack from '@mui/material/Stack'

const Offline = () => {
    return (
        <div className="offline">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="calc(100vh - 16px)">
                <Stack alignItems="center" spacing={2}>
                    <Typography variant="boduy">You are offline.</Typography>
                    <CloudOffIcon />
                </Stack>
            </Box>
        </div>
    )
}

export default Offline