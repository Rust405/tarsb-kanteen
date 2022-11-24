import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import { useEffect, useState } from 'react'

const StallSettings = (
    { staffRole }
) => {

    if (staffRole === 'staff') return (
        <div className="stall-settings">
            <Typography paragraph>
                You do not have permission to access this page. Only the stall owner can access or modify stall settings.
            </Typography>
        </div>
    )

    return (
        <div className="stall-settings">
            <Typography variant="h6">Stall Status</Typography>

        </div>
    )
}

export default StallSettings;