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
import IconButton from '@mui/material/IconButton'
import PrintIcon from '@mui/icons-material/Print'
import Stack from '@mui/material/Stack'

import { useState, useEffect, useRef } from 'react'

import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../../utils/firebase'
import { shortOrderString } from '../../../utils/tools'
import currency from 'currency.js'

import dayjs from 'dayjs'
import 'dayjs/locale/en-sg'

import { useReactToPrint } from 'react-to-print'

const GenerateSumamry = ({
    stallID
}) => {
    const componentRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    })

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

    const totalString = (orders) => {
        let total = 0
        orders.forEach(doc => {
            total += doc.data().orderItems.reduce((acc, cur) => acc + cur.data.price, 0)
        })

        return currency(total).format({ symbol: 'RM ' })
    }

    return (
        <div className="generate-summary">
            <Box sx={{ p: 2 }} ref={componentRef}>
                {!cmpltOrders && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}

                {cmpltOrders &&
                    <>
                        {/* No Orders */}
                        {cmpltOrders.length === 0 && <Typography>There are currently no completed orders to display.</Typography>}

                        {/* Completed Orders */}
                        {cmpltOrders.length > 0 &&
                            <>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="h6">Completed Order Summary ({dayjs().format('DD/MM/YYYY')})</Typography>
                                    <IconButton onClick={handlePrint}><PrintIcon /></IconButton>
                                </Stack>

                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell align="right">Type</TableCell>
                                                <TableCell align="center">Menu Items</TableCell>
                                                <TableCell align="center">Subtotal</TableCell>
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
                                            <TableRow>
                                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                                <TableCell align="right">{totalString(cmpltOrders)}</TableCell>
                                            </TableRow>
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