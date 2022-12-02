import React, { useState } from 'react'

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
import RemoveIcon from '@mui/icons-material/Remove'

import { Alert } from '../../../utils/customComponents'

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

const AddItemDialog = ({ openNewItemDialog, setOpenNewItemDialog }) => {

    const [isValidating, setIsValidating] = useState(false)

    const handleCloseDialog = () => {
        if (isValidating) return
        setOpenNewItemDialog(false)
    }

    const [itemName, setItemName] = useState('')
    const [itemPrice, setItemPrice] = useState(0.00)
    const [itemRequireCooking, setItemRequireCooking] = useState(true)

    const handleAddNewItem = () => {
        console.log("Name:" + itemName)
        console.log("RM " + itemPrice)
        console.log("Require cooking: " + itemRequireCooking)
    }

    return (
        <div className="add-item-dialog">
            <CustomDialog onClose={handleCloseDialog} aria-labelledby="register-dialog-title" open={openNewItemDialog} >

                <CustomDialogTitle id="register-dialog-title" onClose={handleCloseDialog}>Add New Menu Item</CustomDialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2}>
                        <TextField label="Item Name" value={itemName} onChange={e => setItemName(e.target.value)} variant="outlined" autoComplete='off' />

                        <TextField label="Price (RM)" value={itemPrice} onChange={e => setItemPrice(e.target.value)} variant="outlined" autoComplete='off' />

                        <Box display="flex" justifyContent="flex-start">
                            <FormControlLabel
                                control={
                                    <Checkbox checked={itemRequireCooking} onChange={e => setItemRequireCooking(e.target.checked)} />
                                }
                                labelPlacement="start"
                                label="Require cooking?"
                            />
                        </Box>

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <InfoIcon /><Typography variant="caption">Ticking 'Require cooking' will enable estimate cooking time calculation.</Typography>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Box sx={{ position: 'relative' }}>
                        <Button autoFocus disabled={itemName.trim() === '' || isValidating} onClick={handleAddNewItem}>
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
        </div>
    )
}

export default AddItemDialog