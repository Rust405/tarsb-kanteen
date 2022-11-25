import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'

const Loading = ({ loadingMsg }) => {
    return (
        <div className="loading">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Stack alignItems="center" spacing={2}>
                    <Typography variant="body">{loadingMsg}</Typography>
                    <CircularProgress />
                </Stack>

            </Box>
        </div>)
}

export default Loading