import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'

const Loading = ({ loadingMsg }) => {
    return (
        <div className="loading">
            <Box sx={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)'
            }}>
                <Stack alignItems="center" spacing={2}>
                    <Typography align="center" variant="body">{loadingMsg}</Typography>
                    <CircularProgress />
                </Stack>

            </Box>
        </div>)
}

export default Loading