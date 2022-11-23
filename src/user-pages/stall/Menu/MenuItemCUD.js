import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MenuItemCUD = () => {
    return (
        <div className="menu-item-cud">
            <div>
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <Typography variant="body" component="h3" align="center"> Menu Item<br />CUD</Typography>
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

export default MenuItemCUD;