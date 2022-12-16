import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useEffect } from 'react'

import { db } from '../../../utils/firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

const MyOrders = () => {

    useEffect(function fetchOrders() {

    }, [])

    return (
        <div className="my-orders">

            <Box sx={{ p: 2 }}>
                <Typography paragraph>
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                    MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders MyOrders
                </Typography>
            </Box>
        </div>
    )
}

export default MyOrders
