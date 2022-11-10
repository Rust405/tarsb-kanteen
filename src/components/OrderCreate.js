import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const OrderCreate = () => {
    return (
        <div className="order-create">
               <div>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <Typography
                    variant="body"
                    component="h3"
                    align="center"
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {"Order\nCreate"}
                </Typography>
                <Divider />
                <p>Test</p>
                <Divider />
                <p>Test</p>
                <Divider />
            </Box>
        </div>
        </div>
    );
}

export default OrderCreate;