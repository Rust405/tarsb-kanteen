import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

const StallSettings = ({ stallSnapshot }) => {

    return (
        <div className="stall-settings">
            {stallSnapshot &&
                <Typography> Stall Status: {stallSnapshot.status}</Typography>
            }

            <Button variant="outlined">Open Stall</Button>
            <Button variant="outlined">Close Stall</Button>

        </div>
    )
}

export default StallSettings;