import React, { useState } from 'react';

import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse';

import FastfoodIcon from '@mui/icons-material/Fastfood'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SettingsIcon from '@mui/icons-material/Settings'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PrintIcon from '@mui/icons-material/Print'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';


import { Link } from 'react-router-dom'

import { auth, logout } from '../utils/firebase'

const drawerWidth = 240;

const customer = {
    pages: ['My Orders', 'Browse', 'Settings'],
    icons: [<FastfoodIcon />, <MenuBookIcon />, <SettingsIcon />],
    links: ['/customer/myorders', '/customer/browse', '/customer/usersettings']
}

const stallUser = {
    pages: ['Queue', 'Menu', 'Stall', 'Generate Summary', 'Settings'],
    icons: [<ListAltIcon />, <MenuBookIcon />, <StorefrontIcon />, <PrintIcon />, <SettingsIcon />],
    links: ['/stall/queue', '/stall/menu', '/stall/stallsettings', '/stall/generatesummary', '/stall/usersettings']
}

const NavigationDrawer = ({
    navOpen,
    handleDrawerToggle,
    container,
    role
}) => {
    const displayName = auth.currentUser.displayName
    const email = auth.currentUser.email

    //TODO: update navigation drawer based on type of user
    var navOption = (role === 'customer') ? customer : stallUser

    //logout collapse
    const [openCollapse, setOpenCollapse] = useState(false);
    const handleOpenLogout = () => {
        setOpenCollapse(!openCollapse);
    }

    const drawer = (
        <div>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {navOption.pages.map(
                        (page, index) => (
                            <ListItem key={page} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={navOption.links[index]}
                                    onClick={handleDrawerToggle}
                                    onKeyDown={handleDrawerToggle}
                                >
                                    <ListItemIcon>
                                        {navOption.icons[index]}
                                    </ListItemIcon>
                                    <ListItemText primary={page} />
                                </ListItemButton>
                            </ListItem>
                        )
                    )}

                    <Divider />

                    <Tooltip title={displayName} placement="right" disableInteractive>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleOpenLogout} >
                                <ListItemIcon>
                                    <AccountCircleIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primaryTypographyProps={{ style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                    primary={displayName} />
                                {openCollapse ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                    <Collapse in={openCollapse} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <Tooltip title={`Log out of ${email}`} placement="right" disableInteractive>
                                <ListItemButton sx={{ pl: 4 }} onClick={logout}>
                                    <ListItemIcon>
                                        <LogoutIcon style={{ color: 'red' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primaryTypographyProps={{ style: { color: 'red' } }}
                                        primary="Log Out" />
                                </ListItemButton>
                            </Tooltip>
                        </List>
                    </Collapse>
                </List>
            </Box>
        </div>)

    return (
        <div className="navigation-drawer">
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>

            {/* Mobile Drawer */}
            <SwipeableDrawer
                container={container}
                open={navOpen}
                onOpen={handleDrawerToggle}
                onClose={() => { handleDrawerToggle(); setOpenCollapse(false) }}
                disableSwipeToOpen={false}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                }}
            >
                {drawer}
            </SwipeableDrawer>
        </div >
    );
}

export default NavigationDrawer;