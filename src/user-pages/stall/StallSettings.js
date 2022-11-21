import Typography from '@mui/material/Typography'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import { useEffect, useState } from 'react'

const StallSettings = (
    { staffRole }
) => {
    const [statusMsg, setStatusMsg] = useState({ status: 'open', accept: 'accepting' })
    const [checked, setChecked] = useState(false)

    const handleCheckChange = (event) => {
        setChecked(event.target.checked)
    }

    //change status message depending on switch
    useEffect(() => {
        checked ?
            setStatusMsg({ status: 'open', accept: 'accepting' })
            :
            setStatusMsg({ status: 'closed', accept: 'not accepting' })
    }, [checked])

    if (staffRole === 'staff')
        return (
            <div className="stall-settings">
                <Typography paragraph>
                    You do not have permission to access this page. Only the stall owner can access or modify stall settings.
                </Typography>
            </div>
        )
    else
        return (
            <div className="stall-settings">

                <Typography variant="h6">Stall Status</Typography>

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch checked={checked} onChange={handleCheckChange} />
                    <Typography>{`The stall is now ${statusMsg.status} and ${statusMsg.accept} orders.`}</Typography>
                </Stack>

            </div>
        );
}

export default StallSettings;