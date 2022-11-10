import Typography from '@mui/material/Typography';

const NotFound = () => {
    return (
        <div className="not-found">
            <Typography variant="h4">
                Error 404
            </Typography>
            <Typography paragraph>
                Page not found.
            </Typography>
        </div>
    );
}

export default NotFound;