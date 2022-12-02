import React, { useState } from 'react'

import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import ListItem from '@mui/material/ListItem'
import List from '@mui/material/List'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Snackbar from '@mui/material/Snackbar'

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

    return (
        <div className="add-item-dialog">
            <CustomDialog onClose={handleCloseDialog} aria-labelledby="register-dialog-title" open={openNewItemDialog} >

                <CustomDialogTitle id="register-dialog-title" onClose={handleCloseDialog}>Add New Item</CustomDialogTitle>

                <DialogContent dividers>

                </DialogContent>

                <DialogActions>

                </DialogActions>
            </CustomDialog>
        </div>
    )
}

export default AddItemDialog