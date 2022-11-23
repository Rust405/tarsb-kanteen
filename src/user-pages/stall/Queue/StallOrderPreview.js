import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const StallOrderPreview = ({
    counter
}) => {
    return (
        <div>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <Typography variant="body" component="h3" align="center">Order<br />Preview</Typography>
                <Divider />
                <p>{counter}</p>
                <Divider />
                <Typography>Stall version</Typography>
                <Divider />
            </Box>
        </div>
    );
}

export default StallOrderPreview