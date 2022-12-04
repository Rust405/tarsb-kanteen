import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'

import CurrencyInput from 'react-currency-input-field'

import { useState, useEffect } from 'react'

const MenuItemCUD = ({ setOpenNewItemDialog, selectedItem }) => {
    const [isValidating, setIsValidating] = useState(false)

    const [itemName, setItemName] = useState('')
    const [itemPrice, setItemPrice] = useState('0.00')
    const [itemRequireWaiting, setItemRequireWaiting] = useState(true)

    useEffect(() => {
        if (selectedItem) {
            setItemName(selectedItem.data.menuItemName)
            setItemPrice(selectedItem.data.price)
            setItemRequireWaiting(selectedItem.data.isRequireWaiting)
        }
    }, [selectedItem])

    return (
        <div className="menu-item-cud">
            <Toolbar />
            <Box sx={{ overflow: 'auto' }} >
                <Box sx={{ m: 2 }} display="flex" justifyContent="center">
                    <Button variant="contained" onClick={() => setOpenNewItemDialog(true)}>Add New Item</Button>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="center">
                    <Typography variant="h6" align="center">Update<br />Menu Item Details</Typography>
                </Box>

                {/* TODO: Update menu item form */}

                {!selectedItem && <div>Select something.</div>}

                {selectedItem &&
                    <Stack spacing={2}>
                        <TextField label="Item Name" value={itemName} disabled={isValidating}
                            onChange={e => setItemName(e.target.value)} autoComplete='off' />

                        <CurrencyInput label="Item Price" autoComplete='off' customInput={TextField} disabled={isValidating}
                            value={itemPrice}
                            onValueChange={value => setItemPrice(value)}
                            intlConfig={{ locale: 'en-MY', currency: 'MYR' }}
                            decimalScale={2}
                            disableAbbreviations={true}
                            disableGroupSeparators={true}
                            error={itemPrice > 99.99}
                            helperText={itemPrice > 99.99 && "Item price cannot exceed RM 99.99"}
                        />
                    </Stack>
                }


            </Box>
        </div>
    )
}

export default MenuItemCUD