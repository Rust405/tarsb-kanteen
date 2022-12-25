import Drawer from '@mui/material/Drawer'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { grey } from '@mui/material/colors'
import Toolbar from '@mui/material/Toolbar'

const drawerWidth = 300
const drawerBleeding = 56

const MultiPurposeSidebar = ({
    sidebarOpen,
    setSidebarOpen,
    drawerContent,
    bleedMsg
}) => {

    const handleSidebarToggle = (e) => {
        if (e && e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) return
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <div className="order-preview">
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                anchor="right"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    display: {
                        xs: 'none',
                        sm: 'block'
                    },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                open
            >
                <Toolbar />
                {drawerContent}
            </Drawer>

            {/* Mobile Drawer */}

            <SwipeableDrawer
                anchor="bottom"
                open={sidebarOpen}
                onOpen={handleSidebarToggle}
                onClose={handleSidebarToggle}
                swipeAreaWidth={sidebarOpen ? 0 : drawerBleeding}
                disableSwipeToOpen={false}
                ModalProps={{
                    keepMounted: true
                }}
                sx={{
                    zIndex: 1,
                    display: {
                        xs: 'block',
                        sm: 'none'
                    },
                    '& .MuiDrawer-paper': {
                        height: `calc(75% - ${drawerBleeding}px)`,
                        overflow: 'visible',
                    }
                }}
            >

                {/* Sidebar swipeable edge */}
                <Box
                    sx={{
                        backgroundColor: 'primary.main',
                        position: 'absolute',
                        top: -drawerBleeding,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                        visibility: 'visible',
                        right: 0,
                        left: 0
                    }}
                >
                    {/* Puller */}
                    <Box
                        sx={{
                            width: 30,
                            height: 6,
                            backgroundColor: grey[300],
                            borderRadius: 3,
                            position: 'absolute',
                            top: 8,
                            left: 'calc(50% - 15px)'
                        }}
                    />
                    <Typography sx={{ p: 2, color: 'white' }}>{bleedMsg}</Typography>
                </Box>

                {/* Sidebar content */}
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        px: 2,
                        pb: 2,
                        height: '100%',
                        overflow: 'auto'
                    }}
                >
                    {drawerContent}
                </Box>
            </SwipeableDrawer>

        </div>
    )
}

export default MultiPurposeSidebar