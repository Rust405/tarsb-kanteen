import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

const ApplicationBar = ({ handleDrawerToggle }) => {

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
        <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>TARSB Kanteen</Typography>

        {/* Mobile Title */}
        <Typography variant="h6" component="div" sx={{ display: { xs: 'block', sm: 'none' } }}>Test</Typography>
      </Toolbar>
    </AppBar>
  )
}

export default ApplicationBar