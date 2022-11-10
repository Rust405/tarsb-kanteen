import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const ApplicationBar = ({
  handleDrawerToggle,
  pathName
}) => {
  const titles = {
    '/customer/myorders': 'My Orders',
    '/customer/browse': 'Browse',
    '/customer/usersettings': 'Settings',
    '/stall/queue': 'Queue',
    '/stall/menu': 'Menu',
    '/stall/generatesummary': 'Generate Summary',
    '/stall/usersettings': 'Settings',
    '/stall/stallsettings': 'Stall'
  }

  return (
    <AppBar position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
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
        <Typography variant="h6" noWrap component="div">
          {titles[pathName] ? titles[pathName] : 'TARSB Kanteen'}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default ApplicationBar;