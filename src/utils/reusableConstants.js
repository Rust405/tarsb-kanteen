import React from 'react'
import MuiAlert from '@mui/material/Alert'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import { useLocation } from 'react-router-dom'

export const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

export const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary
}))

export const { pathname: pathName } = useLocation()