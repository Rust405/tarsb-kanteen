import { logout } from '../../utils/firebase'

const NewStallUser = () => {
    return (
        <div className="new-stall-user">
            <p>Are you a stall staff? Please inform your corresponding stall owner to add your Google account email address for access.</p>
            <button onClick={logout}>Log Out</button>

        </div>
    );
}

export default NewStallUser;