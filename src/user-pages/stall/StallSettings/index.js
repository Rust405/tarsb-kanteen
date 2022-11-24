import { useState } from 'react'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'

import { closeStall, openStall } from '../../../utils/firebase'


const StallSettings = ({ stallSnapshot, stallDocRef }) => {

    const [disableSwitch, setDisableSwitch] = useState(false)

    const handleStatusToggle = () => {
        setDisableSwitch(true)

        if (stallSnapshot.status === 'open') {
            closeStall(stallDocRef)
                .then(() => setDisableSwitch(false))
        } else if (stallSnapshot.status === 'closed') {
            openStall(stallDocRef)
                .then(() => setDisableSwitch(false))
        }
    }

    return (
        <div className="stall-settings">
            <Typography variant="h6">Stall Status</Typography>

            {stallSnapshot &&
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Switch
                        checked={stallSnapshot.status === 'open'}
                        onChange={handleStatusToggle}
                        disabled={disableSwitch}
                    />
                    <Typography variant="body1">The stall is now {stallSnapshot.status} and {stallSnapshot.status === 'open' ? "accepting" : "not accepting"} orders.</Typography>

                </Stack>
            }
        </div>
    )
}

export default StallSettings;