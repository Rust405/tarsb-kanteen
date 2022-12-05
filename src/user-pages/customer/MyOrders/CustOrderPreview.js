import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const CustOrderPreview = ({
    counter
}) => {
    return (
        <div>
            <Box sx={{ overflow: 'auto' }}>
                <Typography variant="body" component="h3" align="center">Order<br />Preview</Typography>
                <Divider />
                <p>{counter}</p>
                <Divider />
                <Typography>Customer version</Typography>
                <Divider />
            </Box>
        </div>
    );
}

export default CustOrderPreview