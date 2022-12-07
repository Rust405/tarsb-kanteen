import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'

import AddItemDialog from './AddItemDialog'

import CurrencyInput from 'react-currency-input-field'
import { useState, useEffect } from 'react'
import { updateItemDetails } from '../../../utils/firebase'
import DeleteItemDialog from './DeleteItemDialog'

const MenuItemCUD = ({
    selectedItem,
    stallID,
    setOpenErrSnack, setErrMsgs,
    setOpenSucSnack, setSucMsg
}) => {
    const [openNewItemDialog, setOpenNewItemDialog] = useState(false)
    const [openDeleteItemDialog, setOpenDeleteItemDialog] = useState(false)

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

    //disable editing and update fields to latest if selected item changes
    const { id: selectedID } = selectedItem ? selectedItem : { id: null }
    useEffect(() => {
        if (!selectedID) setOpenDeleteItemDialog(false)
        handleRemoveChanges()
    }, [selectedID])

    //only update fields to latest if not editing/validating
    const { data: selectedData } = selectedItem ? selectedItem : { data: null }
    useEffect(() => { if (!isValidating && !isEditing) { resetFields() } }, [selectedData])

    const handleSaveChanges = () => {
        let hasChanges = false
        let updatedDetails = { menuItemID: selectedItem.id }

        //only send details that was changed
        if (itemName.trim() !== selectedItem.data.menuItemName) {
            updatedDetails.menuItemName = itemName.trim()
            hasChanges = true
        }
        if (itemPrice !== selectedItem.data.price) {
            updatedDetails.price = parseFloat(itemPrice)
            hasChanges = true
        }
        if (itemRequireWaiting !== selectedItem.data.isRequireWaiting) {
            updatedDetails.isRequireWaiting = itemRequireWaiting
            hasChanges = true
        }


        if (hasChanges) {
            setIsValidating(true)
            setOpenErrSnack(false)
            setOpenSucSnack(false)

            updateItemDetails({ updatedDetails: updatedDetails, stallID: stallID })
                .then(result => {
                    let response = result.data
                    if (response.success) {
                        setIsEditing(false)
                        setSucMsg('Changes saved')
                        setOpenSucSnack(true)
                    } else {
                        setOpenErrSnack(true)
                        setErrMsgs(response.message)
                    }
                    setIsValidating(false)
                })
                .catch(err => {
                    console.warn(err)
                    setOpenErrSnack(true)
                    setErrMsgs(['Unable to proceed. A server error has occured.'])
                    setIsValidating(false)
                })
        } else {
            handleRemoveChanges()
        }
    }

    const handleRemoveChanges = () => {
        resetFields()
        setIsEditing(false)
    }

    return (
        <div className="menu-item-cud">
            <Box sx={{ overflow: 'auto' }} >

                {/* Add New Item */}
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

                {!selectedItem &&
                    <Typography sx={{ m: 2 }} align="center">Select a menu item to update its details.</Typography>
                }

                {/* Update Item Form */}
                {selectedItem &&
                    <div>
                        <Box display="flex" justifyContent="center">
                            <Typography variant="h6" align="center">Update<br />Menu Item Details</Typography>
                        </Box>

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
                                    onClick={() => { setIsEditing(true) }} >
                                    Edit Item Details
                                </Button>
                            }

                            {isEditing &&
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Button onClick={handleRemoveChanges} disabled={isValidating} size="small">Cancel</Button>
                                    <Box sx={{ position: 'relative' }}>
                                        <Button
                                            onClick={handleSaveChanges}
                                            disabled={itemName.trim() === '' || itemPrice > 99.99 || isNaN(itemPrice) || isValidating}>
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
                                onClick={() => setOpenDeleteItemDialog(true)}
                            >
                                Delete Item
                            </Button>
                        </Stack>
                    </div>
                }
            </Box>

            {/* New Item Dialog */}
            <AddItemDialog
                openNewItemDialog={openNewItemDialog} setOpenNewItemDialog={setOpenNewItemDialog}
                setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                setOpenErrSnack={setOpenErrSnack} setErrMsgs={setErrMsgs}
                stallID={stallID}
            />

            {/* Delete Item Dialog */}
            {selectedItem &&
                <DeleteItemDialog
                    openDeleteItemDialog={openDeleteItemDialog} setOpenDeleteItemDialog={setOpenDeleteItemDialog} selectedItem={selectedItem}
                    setOpenSucSnack={setOpenSucSnack} setSucMsg={setSucMsg}
                    stallID={stallID}
                />
            }
        </div >
    )
}

export default MenuItemCUD