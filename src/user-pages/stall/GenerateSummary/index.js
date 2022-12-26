import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

import { useState, useEffect } from 'react'

import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { shortOrderString } from '../../../utils/tools'
import currency from 'currency.js'

const GenerateSumamry = ({
    stallID
}) => {

    const [cmpltOrders, setCmpltOrders] = useState(null)

    useEffect(function fetchCpmltOrders() {
        const q = query(
            collection(db, "orders"),
            where("stallID", "==", stallID),
            where("orderStatus", "==", 'Completed'),
            orderBy("estCmpltTimestamp", "asc")
        )

        const unsubscribe = onSnapshot(q, snapshot => {
            setCmpltOrders(snapshot.docs)
        })

        return () => {
            unsubscribe()
            setCmpltOrders(null)
        }

    }, [])

    const subTotalString = (orderItems) => {
        return currency(orderItems.reduce((acc, cur) => acc + cur.data.price, 0)).format({ symbol: 'RM ' })
    }

    return (
        <div className="generate-summary">
            <Box sx={{ p: 2 }}>
                {!cmpltOrders && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}

                {cmpltOrders &&
                    <>
                        {/* No Orders */}
                        {cmpltOrders.length === 0 && <Typography>There are currently no completed orders to display.</Typography>}

                        {/* Completed Orders */}
                        {cmpltOrders.length > 0 &&
                            <>
                                <Typography variant="h6">Completed Order Summary</Typography>

                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell align="right">Type</TableCell>
                                                <TableCell align="center">Menu Items</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {cmpltOrders.map(
                                                doc => (
                                                    <TableRow
                                                        key={doc.id}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell component="th" scope="row"> {doc.id} </TableCell>
                                                        <TableCell align="right">{doc.data().isPreOrder ? 'Pre-Order' : 'Order'}</TableCell>
                                                        <TableCell align="right">
                                                            {shortOrderString(doc.data().orderItems)}
                                                            <Button
                                                                onClick={() => {
                                                                    let itemNames = doc.data().orderItems.map(item => `${item.data.menuItemName} - ${currency(item.data.price).format({ symbol: 'RM ' })}`)
                                                                    alert(itemNames.join("\r\n"))
                                                                }}>
                                                                More
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell align="right">{subTotalString(doc.data().orderItems)}</TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        }
                    </>
                }
            </Box>
        </div>
    )
}

export default GenerateSumamry