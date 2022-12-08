import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useEffect, useState } from 'react'
import { deleteMenuItem } from '../../../utils/firebase'

const delay = 2 //seconds

const DeleteItemDialog = ({
    openDeleteItemDialog, setOpenDeleteItemDialog,
    selectedItem,
    setOpenSucSnack, setSucMsg,
    stallID
}) => {
    const [disableProceed, setDisableProceed] = useState(true)

    useEffect(() => {
        openDeleteItemDialog ? setTimeout(() => { setDisableProceed(false) }, delay * 1000) : setDisableProceed(true)
    }, [openDeleteItemDialog])

    const [isDeleting, setIsDeleting] = useState(false)

    const handleCloseDialog = () => {
        if (isDeleting) return
        setOpenDeleteItemDialog(false)
    }

    const handleDeleteItem = () => {
        setIsDeleting(true)

        const deleted = selectedItem.data.menuItemName

        deleteMenuItem(stallID, selectedItem.id)
            .then(() => {
                setSucMsg(`${deleted} has been deleted.`)
                setOpenSucSnack(true)
                setIsDeleting(false)
                setOpenDeleteItemDialog(false)
            })
    }

    return (
        <div className="delete-item-dialog">
            <Dialog
                open={openDeleteItemDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>
                    Delete Menu Item "{selectedItem.data.menuItemName}"?
                </DialogTitle>

                <DialogContent>
                    <DialogContentText >
                        Note: Deleting this menu item will not affect any existing orders.
                        This process cannot be undone.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>

                    <Button onClick={handleDeleteItem} disabled={disableProceed || isDeleting} autoFocus>Proceed</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default DeleteItemDialog