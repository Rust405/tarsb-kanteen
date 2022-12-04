import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const MenuItemCUD = ({ setOpenNewItemDialog, selectedItem }) => {

    return (
        <div className="menu-item-cud">
            <Toolbar />
            <Box sx={{ overflow: 'auto' }} >
                <Box sx={{ m: 2 }} display="flex" justifyContent="center">
                    <Button variant="contained" onClick={() => setOpenNewItemDialog(true)}>Add New Item</Button>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="center">
                    <Typography variant="h6" align="center">Update<br />Menu Item Details</Typography>
                </Box>

                {/* TODO: Update menu item form */}

                {!selectedItem && <div>Select something.</div>}

                {selectedItem &&
                    <div>
                        {selectedItem.id}<br />
                        {selectedItem.data.menuItemName}<br />
                        {selectedItem.data.price}
                    </div>
                }


            </Box>
        </div>
    )
}

export default MenuItemCUD