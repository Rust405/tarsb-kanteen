import { useState } from 'react'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'

import CloseIcon from '@mui/icons-material/Close'
import RemoveIcon from '@mui/icons-material/Remove'

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

    const [stallName, setStallName] = useState(stallSnapshot.stallName)


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
                    <Typography variant="body1">
                        The stall is now {stallSnapshot.status} and {stallSnapshot.status === 'open' ? "accepting" : "not accepting"} orders.
                    </Typography>
                </Stack>
            }

            <Typography variant="h6">Stall Details</Typography>
        </div>
    )
}

export default StallSettings