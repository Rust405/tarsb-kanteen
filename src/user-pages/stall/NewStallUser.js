import { logout } from '../../utils/firebase'
import Button from '@mui/material/Button'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const NewStallUser = ({ setIsNewStallUser }) => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/')
    }, [])

    const handleLogout = () => {
        setIsNewStallUser(false)
        logout()
    }

    return (
        <div className="new-stall-user">
            <p>Are you a stall staff? Please inform your corresponding stall owner to add your Google account email address for access.</p>
            <Button variant="contained" onClick={handleLogout} > Log Out </Button>
        </div>
    )
}

export default NewStallUser