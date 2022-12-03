import React, { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

import PropTypes from 'prop-types'

import InfoIcon from '@mui/icons-material/Info'
import CloseIcon from '@mui/icons-material/Close'

import { Alert } from '../../../utils/customComponents'
import CurrencyInput from 'react-currency-input-field'
import { addMenuItem } from '../../../utils/firebase'

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': { padding: theme.spacing(2) },
    '& .MuiDialogActions-root': { padding: theme.spacing(1) },
}))

const CustomDialogTitle = ({ children, onClose, ...other }) => {
    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    )
}

CustomDialogTitle.propTypes = { children: PropTypes.node, onClose: PropTypes.func.isRequired }

const AddItemDialog = ({ openNewItemDialog, setOpenNewItemDialog, stallID }) => {

    const [isValidating, setIsValidating] = useState(false)

    const handleCloseDialog = () => {
        if (isValidating) return
        setOpenNewItemDialog(false)
        setItemName('')
        setItemPrice('0.00')
    }

    const [itemName, setItemName] = useState('')
    const [itemPrice, setItemPrice] = useState('0.00')
    const [itemRequireWaiting, setItemRequireWaiting] = useState(true)

    const handleAddNewItem = () => {
        const newItem = {
            menuItemName: itemName,
            price: itemPrice,
            isRequireWaiting: itemRequireWaiting
        }

        setIsValidating(true)
        setOpenErrSnack(false)

        addMenuItem({ newItem: newItem, stallID: stallID })
            .then(result => {
                let response = result.data
                if (response.success) {
                    setIsValidating(false)
                    console.log("Success")

                    //close dialog
                    //TODO: success snack?, order of operation might be a problem
                } else {
                    setOpenErrSnack(true)
                    setErrMsgs(response.message)
                    setIsValidating(false)
                }
            })
            .catch(err => {
                console.warn(err)
                setOpenErrSnack(true)
                setErrMsgs(['Unable to proceed. A server error has occured.'])
                setIsValidating(false)
            })
    }

    const [errMsgs, setErrMsgs] = useState([])
    const [openErrSnack, setOpenErrSnack] = useState(false)
    const handleCloseErrSnack = (event, reason) => {
        if (reason === 'clickaway') return
        setOpenErrSnack(false)
    }

    return (
        <div className="add-item-dialog">
            <CustomDialog onClose={handleCloseDialog} aria-labelledby="register-dialog-title" open={openNewItemDialog} >

                <CustomDialogTitle id="register-dialog-title" onClose={handleCloseDialog}>Add New Menu Item</CustomDialogTitle>

                <DialogContent dividers>
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

                        <Box display="flex" justifyContent="flex-start">
                            <FormControlLabel
                                control={
                                    <Checkbox checked={itemRequireWaiting} onChange={e => setItemRequireWaiting(e.target.checked)} />
                                }
                                labelPlacement="start"
                                label="Require waiting?"
                                disabled={isValidating}
                            />
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon /><Typography variant="caption">Ticking 'Require waiting' allows customers to view auto-calculated estimated wait time.</Typography>
                        </Stack>

                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Box sx={{ position: 'relative' }}>
                        <Button autoFocus
                            disabled={itemName.trim() === '' || itemPrice > 99.99 || isValidating}
                            onClick={handleAddNewItem}>
                            {isValidating ? "Validating..." : "Save & Continue"}
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
                </DialogActions>
            </CustomDialog>

            {/* Error messages snackbar */}
            <Snackbar open={openErrSnack} autoHideDuration={5000 * errMsgs.length} onClose={handleCloseErrSnack}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                <Alert onClose={handleCloseErrSnack} severity="error" sx={{ width: '100%' }}>
                    {errMsgs.length > 1 ?
                        errMsgs.map((errMsg, i) => <Typography key={i}>{`• ${errMsg}`}</Typography>)
                        :
                        <div>{errMsgs[0]}</div>
                    }
                </Alert>
            </Snackbar>
        </div>
    )
}

export default AddItemDialog