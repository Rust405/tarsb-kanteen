import Typography from '@mui/material/Typography';

const StallSettings = (
    { staffType }
) => {
    if (staffType === 'staff') return <div className="stall-settings">
        <Typography paragraph>
            Permission denied. Only stall owner can access/modify stall settings.
        </Typography>
    </div>
    else
        return (
            <div className="stall-settings">
                <Typography paragraph>
                    Stall Settings
                </Typography>
            </div>
        );
}

export default StallSettings;