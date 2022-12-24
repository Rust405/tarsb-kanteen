import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'

import FastfoodIcon from '@mui/icons-material/Fastfood'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SettingsIcon from '@mui/icons-material/Settings'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PrintIcon from '@mui/icons-material/Print'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import LogoutIcon from '@mui/icons-material/Logout'

import { logout } from '../utils/firebase'
import { ROUTE } from '../constants'

import { useTheme } from '@mui/material/styles'

const drawerWidth = 240

const customer = {
    pageName: ['My Orders', 'Browse', 'Settings & Info'],
    icons: [<FastfoodIcon />, <MenuBookIcon />, <SettingsIcon />],
    links: [ROUTE.CUSTOMER.MYORDERS, ROUTE.CUSTOMER.BROWSE, ROUTE.CUSTOMER.USERSETTINGS]
}

const stallOwner = {
    pageName: ['Queue', 'Menu', 'Stall', 'Generate Summary', 'Settings & Info'],
    icons: [<ListAltIcon />, <MenuBookIcon />, <StorefrontIcon />, <PrintIcon />, <SettingsIcon />],
    links: [ROUTE.STALL.QUEUE, ROUTE.STALL.MENU, ROUTE.STALL.STALLSETTINGS, ROUTE.STALL.GENERATESUMMARY, ROUTE.STALL.USERSETTINGS]
}

const stallStaff = {
    pageName: ['Queue', 'Menu', 'Generate Summary', 'Settings & Info'],
    icons: [<ListAltIcon />, <MenuBookIcon />, <PrintIcon />, <SettingsIcon />],
    links: [ROUTE.STALL.QUEUE, ROUTE.STALL.MENU, ROUTE.STALL.GENERATESUMMARY, ROUTE.STALL.USERSETTINGS]
}

const NavigationDrawer = ({
    navOpen,
    handleDrawerToggle,
    userType,
    staffRole,
    stallStatus,
    userInfo
}) => {
    const { pathname: pathName } = useLocation()
    const theme = useTheme()

    const { displayName, email, photoURL } = userInfo

    let navOption
    if (userType === 'customer') {
        navOption = customer
    } else if (userType === 'stallUser') {
        navOption = staffRole === 'owner' ? stallOwner : stallStaff
    }

    //logout collapse
    const [openCollapse, setOpenCollapse] = useState(false)
    const handleOpenLogout = () => setOpenCollapse(!openCollapse)

    const drawer = (
        <>
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List sx={{ '&& .Mui-selected': { borderLeft: `4px solid ${theme.palette.primary.main}`, } }}>
                    {userType === 'stallUser' &&
                        <>
                            <Box sx={{ m: 1 }} display="flex" justifyContent="center">
                                {stallStatus ?
                                    <Typography>Stall is currently  <Box
                                        component="span"
                                        sx={{
                                            color: stallStatus === "open" ? 'green' : 'red',
                                            fontWeight: 'bold'
                                        }}>
                                        {stallStatus}
                                    </Box>
                                    </Typography>
                                    :
                                    <Typography>Loading...</Typography>}
                            </Box>
                            <Divider />
                        </>
                    }

                    {navOption.pageName.map(
                        (page, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton
                                    selected={pathName === `/${navOption.links[index]}`}
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
                                <ListItemIcon >
                                    <Avatar sx={{ width: '24px', height: '24px' }} src={photoURL} alt={displayName} referrerPolicy="no-referrer" />
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
        </>)

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
            <Drawer
                variant="temporary"
                open={navOpen}
                onClose={() => {
                    handleDrawerToggle()
                    setOpenCollapse(false)
                }}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: {
                        xs: 'block', sm: 'none'
                    },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                }}
            >
                {drawer}
            </Drawer>
        </div >
    );
}

export default NavigationDrawer