import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
const StallUserSettings = () => {
    return (
        <div className="user-settings">
            <Box sx={{ p: 2, maxWidth: "768px" }}>
                <Typography variant="h6">Settings</Typography>
                <Typography>
                    Settings Setting Settings Settings Settings Setting Settings Settings Settings Setting Settings Settings
                    Settings Setting Settings Settings Settings Setting Settings Settings Settings Setting Settings Settings
                    Settings Setting Settings Settings Settings Setting Settings Settings Settings Setting Settings Settings
                    Settings Setting Settings Settings Settings Setting Settings Settings Settings Setting Settings Settings
                </Typography>


                <Typography variant="h6">Info</Typography>
                <List sx={{ listStyleType: 'disc', pl: 4 }} >
                    <ListItem sx={{ display: 'list-item' }}><Typography>Customers can create regular orders only while the stall is open.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Customers can create pre-orders anytime regardless of the stall status or time.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Customers can create regular orders only on weekdays from 7am to 5pm.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Customers can only set pickup for pre-orders to weekdays from 7am to 5pm.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Customers can only set pickup for pre-orders to a minimum 30 minutes from the time of order and a maximum 1 week from the day of order.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>The stall can cancel an order at anytime. (Reason will be required)</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Each order can contain a maximum 1 menu item that requires waiting (cooking).</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>If a menu item is made unavailable, it will be automatically removed only from any existing customers' order creation.</Typography></ListItem>
                </List>

                <Typography variant="caption">The information above is subject to change*</Typography>
            </Box>
        </div>
    )
}

export default StallUserSettings