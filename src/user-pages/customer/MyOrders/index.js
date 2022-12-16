import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'

import { auth, db } from '../../../utils/firebase'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'

const MyOrders = () => {

    const [orders, setOrders] = useState([])

    useEffect(function fetchOrders() {
        const q = query(
            collection(db, "orders"),
            where("customerID", "==", auth.currentUser.uid),
            orderBy("orderTimestamp", "desc")
        )

        const unsubscribe = onSnapshot(q, snapshot => {
            setOrders(snapshot.docs)
        })

        return () => {
            unsubscribe()
            setOrders([])
        }
    }, [])

    //test
    useEffect(() => {
        orders.map(doc => console.log(`${doc.id} - ${doc.data().orderStatus}`))
    }, [orders])

    return (
        <div className="my-orders">
            <Box sx={{ p: 2 }}>

            </Box>
        </div>
    )
}

export default MyOrders
