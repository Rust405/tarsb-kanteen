import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const OrderCreate = () => {
    return (
        <div className="order-create">
            <div>
                <Box sx={{ overflow: 'auto' }}>
                    <Typography variant="body" component="h3" align="center" >Order<br />Create</Typography>
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