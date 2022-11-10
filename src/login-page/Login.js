import { signInWithGoogle } from '../utils/firebase'

const Login = () => {
      //TODO: Redirect user useEffect

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