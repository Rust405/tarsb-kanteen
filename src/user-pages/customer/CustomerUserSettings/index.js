import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const CustomerUserSettings = ({ isTokenFound, isFetchingToken }) => {
    return (
        <div className="user-settings">
            <Box sx={{ p: 2, maxWidth: "768px" }}>
                <Typography variant="h6">Settings</Typography>

                {!isFetchingToken &&
                    <Box sx={{ m: 2 }}>
                        {isTokenFound &&
                            <Typography>
                                Notifications are <strong>enabled</strong>.<br />For pre-orders, you will receive a remidner notification 10 minutes before the specified pickup.
                            </Typography>
                        }
                        {!isTokenFound &&
                            <Typography>
                                Notifications are <strong>disabled</strong>.<br />Please allow notifications to receive push notifications on your orders.
                            </Typography>
                        }
                    </Box>
                }

                <Typography variant="h6">Info</Typography>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Typography>Rules/Restrictions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List sx={{ listStyleType: 'disc', pl: 4 }} >
                            <ListItem sx={{ display: 'list-item' }}><Typography>Regular orders can be created only while the stall is open.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Pre-orders can be created anytime regardless of the stall status or time.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Regular orders can be created only on weekdays from 7am to 5pm.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Pickup for pre-orders can be only set to weekdays from 7am to 5pm.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Pickup for pre-orders can be only set to a minimum 30 minutes from the time of order and a maximum 1 week from the day of order.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Pickup for pre-orders is automatically set to 30 minutes from the time of order, it will automatically be set to the next weekday at 7am if required.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Orders can be cancelled by the stall at anytime. (Reason will be provided)</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Orders can be cancelled by the customer anytime as long as cooking has not started.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>The stall reserves the right to create a report on the customer when necessary.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Each order can contain a maximum 1 menu item that requires waiting (cooking).</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Menu items can be automatically removed from order creation due to unavailability.</Typography></ListItem>
                            <ListItem sx={{ display: 'list-item' }}><Typography>Guest accounts for outsiders is currently not supported.</Typography></ListItem>
                        </List>
                        <Typography variant="caption">The information above is subject to change*</Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} >
                        <Typography>Installation</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography paragraph>TARSB Kanteeen can be installed on most of your devices!</Typography>

                        <Typography paragraph>On desktop Google Chrome, you can find the "Install TARSB Kanteen" button in the address bar.</Typography>

                        <Typography paragraph>On Android Google Chrome, click on '⋮' and select "Install app".</Typography>

                        <Typography paragraph>For other browsers and devices, you may look up "How to install PWA on (your device/browser)".</Typography>

                        <Typography paragraph>Once installed, you may access TARSB Kanteen on your device like any other application!</Typography>
                    </AccordionDetails>
                </Accordion>

            </Box>
        </div>
    )
}

export default CustomerUserSettings