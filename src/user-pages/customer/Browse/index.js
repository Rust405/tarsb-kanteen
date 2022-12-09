import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

import { useState, useEffect } from 'react'

const Browse = () => {

    const [selectedStall, setSelectedStall] = useState(10)

    useEffect(() => {

    }, [])

    return (
        <div className="browse">

            <Box
                sx={{
                    display: { xs: 'block', sm: 'flex' },
                    border: '2px solid lightgray',
                    p: 2
                }}
            >
                <Box sx={{ p: 2, width: 128, border: '2px solid lightgray' }}>
                    <FormControl fullWidth>
                        <Select value={selectedStall} onChange={e => setSelectedStall(e.target.value)} >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Stack sx={{ p: 2, border: '2px solid lightgray', }}>
                    <Typography>Status: Open </Typography>
                    <Typography>Wait time for new orders: 10 - 20 min(s)</Typography>
                </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
                <Typography paragraph>
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                    Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse Browse
                </Typography>
            </Box>

        </div>
    )
}

export default Browse