import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

import CurrencyInput from 'react-currency-input-field'

import { useState, useEffect } from 'react'

const MenuItemCUD = ({ setOpenNewItemDialog, selectedItem }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [isValidating, setIsValidating] = useState(false)

    const [itemName, setItemName] = useState('')
    const [itemPrice, setItemPrice] = useState('0.00')
    const [itemRequireWaiting, setItemRequireWaiting] = useState(false)

    function resetFields() {
        if (selectedItem) {
            setItemName(selectedItem.data.menuItemName)
            setItemPrice(selectedItem.data.price)
            setItemRequireWaiting(selectedItem.data.isRequireWaiting)
        }
    }

    useEffect(() => { if (!isValidating && !isEditing) handleRemoveChanges() }, [selectedItem])

    const handleSaveChanges = () => {
        console.log("Edit")
    }

    const handleRemoveChanges = () => {
        resetFields()
        setIsEditing(false)
    }

    const handleDeleteItem = () => {
        console.log("Delete")
    }

    return (
        <div className="menu-item-cud">
            <Box sx={{ overflow: 'auto' }} >
                <Box sx={{ m: 2 }} display="flex" justifyContent="center">
                    <Button variant="contained"
                        onClick={() => {
                            setOpenNewItemDialog(true)
                            handleRemoveChanges()
                        }}>
                        Add New Item
                    </Button>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="center">
                    <Typography variant="h6" align="center">Update<br />Menu Item Details</Typography>
                </Box>

                {/* Update Item Form */}
                {/* TODO: \/ make prettier */}
                {!selectedItem && <div><br />Select something.</div>}

                {selectedItem &&
                    <Stack sx={{ m: 2 }} spacing={2}>
                        <TextField label="Item Name" value={itemName} disabled={isValidating || !isEditing}
                            onChange={e => setItemName(e.target.value)} autoComplete='off' />

                        <CurrencyInput label="Item Price" autoComplete='off' customInput={TextField} disabled={isValidating || !isEditing}
                            value={itemPrice}
                            onValueChange={value => setItemPrice(value)}
                            intlConfig={{ locale: 'en-MY', currency: 'MYR' }}
                            decimalScale={2}
                            disableAbbreviations={true}
                            disableGroupSeparators={true}
                            error={itemPrice > 99.99}
                            helperText={itemPrice > 99.99 && "Item price cannot exceed RM 99.99"}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox checked={itemRequireWaiting} onChange={e => setItemRequireWaiting(e.target.checked)} />
                            }
                            labelPlacement="start"
                            label="Require waiting?"
                            disabled={isValidating || !isEditing}
                        />

                        {!isEditing &&
                            <Button
                                variant="contained"
                                onClick={() => setIsEditing(true)} >
                                Edit Item Details
                            </Button>
                        }

                        {isEditing &&
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Button onClick={handleRemoveChanges} disabled={isValidating} size="small">Cancel</Button>
                                <Box sx={{ position: 'relative' }}>
                                    <Button
                                        onClick={handleSaveChanges}
                                        disabled={itemName.trim() === '' || itemPrice > 99.99 || isValidating}>
                                        {isValidating ? "Validating..." : "Save Changes"}
                                    </Button>
                                    {isValidating &&
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-12px',
                                                marginLeft: '-12px',
                                            }}
                                        />
                                    }
                                </Box>
                            </Stack>
                        }

                        <Divider />

                        <Button
                            variant="outlined" color="error"
                            disabled={isValidating || isEditing}
                            onClick={handleDeleteItem}
                        >
                            Delete Item
                        </Button>
                    </Stack>
                }


            </Box>
        </div >
    )
}

export default MenuItemCUD