import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

import { ROUTE } from '../constants'
import { useLocation } from 'react-router-dom'

const pageName = ['My Orders', 'Browse', 'Settings & Info', 'Queue', 'Menu', 'Stall', 'Generate Summary', 'Settings & Info']
const links = [ROUTE.CUSTOMER.MYORDERS, ROUTE.CUSTOMER.BROWSE, ROUTE.CUSTOMER.USERSETTINGS, ROUTE.STALL.QUEUE, ROUTE.STALL.MENU, ROUTE.STALL.STALLSETTINGS, ROUTE.STALL.GENERATESUMMARY, ROUTE.STALL.USERSETTINGS]

const ApplicationBar = ({ handleDrawerToggle }) => {
  const { pathname: pathName } = useLocation()



  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          onKeyDown={handleDrawerToggle}
          sx={{
            mr: 2,
            display: {
              sm: 'none'
            }
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop Title */}
        <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
          TARSB Kanteen
        </Typography>

        {/* Mobile Title */}
        <Typography variant="h6" component="div" sx={{ display: { xs: 'block', sm: 'none' } }}>
          {
            links.findIndex(link => `/${link}` === pathName) > -1 ?
              pageName[links.findIndex(link => `/${link}` === pathName)]
              :
              'TARSB Kanteen'
          }
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default ApplicationBar