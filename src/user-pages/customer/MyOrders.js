// import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const MyOrders = ({ handleIncCounter }) => {

    return (
        <div className="my-orders">
            <Button
                variant="contained"
                onClick={handleIncCounter}
            >
                Increment
            </Button>
        </div>
    );
}

export default MyOrders;
