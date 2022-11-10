import { signInWithGoogle } from '../utils/firebase'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Login = () => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate('/')
    }, [])

    return (
        <div className="login">
            <h2>Login</h2>
            <button onClick={signInWithGoogle}>
                Login with Google
            </button>
        </div>
    );
}

export default Login;