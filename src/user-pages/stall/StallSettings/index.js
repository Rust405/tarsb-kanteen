import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { useEffect, useState } from 'react'

const StallSettings = () => {

    return (
        <div className="stall-settings">
            <Typography variant="h6">Stall Status</Typography>

            <Button variant="outlined">Open Stall</Button>
            <Button variant="outlined">Close Stall</Button>

            <Typography>Status: </Typography>
        </div>
    )
}

export default StallSettings;