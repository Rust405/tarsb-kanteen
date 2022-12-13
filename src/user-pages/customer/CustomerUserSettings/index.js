import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'

const CustomerUserSettings = () => {
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
                    <ListItem sx={{ display: 'list-item' }}><Typography>Regular orders can be created only while the stall is open.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Pre-orders can be created anytime regardless of the stall status or time.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Regular orders can be created only on weekdays from 7am to 5pm.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Pickup for pre-orders can be only set to weekdays from 7am to 5pm.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Pickup for pre-orders can be only set to a minimum 30 minutes from the time of order and a maximum 1 week from the day of order.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Orders can be cancelled by the stall at anytime. (Reason will be provided)</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Each order can contain a maximum 1 menu item that requires waiting (cooking).</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Menu items can be automatically removed from order creation due to unavailability.</Typography></ListItem>
                    <ListItem sx={{ display: 'list-item' }}><Typography>Guest accounts for outsiders is currently not supported.</Typography></ListItem>
                </List>


                <Typography variant="caption">The information above is subject to change*</Typography>
            </Box>
        </div>
    )
}

export default CustomerUserSettings