import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const NotFound = () => {
    return (
        <div className="not-found">
            <Box sx={{ m: 2 }}>
                <Typography variant="h4">
                    Error 404
                </Typography>
                <Typography paragraph>
                    Page not found.
                </Typography>
            </Box>
        </div>
    )
}

export default NotFound