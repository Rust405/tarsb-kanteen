import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const OrderPreview = ({
    counter
}) => {
    return (
        <div>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <Typography
                    variant="body"
                    component="h3"
                    align="center"
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {"Order\nPreview"}
                </Typography>
                <Divider />
                <p>{counter}</p>
                <Divider />
            </Box>
        </div>
    );
}

export default OrderPreview;