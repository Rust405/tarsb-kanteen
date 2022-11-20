import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const Loading = ({ loadingMsg }) => {
    return (
        <div className="loading">
            <Box sx={{ width: '100%' }} display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="body">{loadingMsg}</Typography>
            </Box>
        </div>)
}

export default Loading