import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";


const Header = () => {

    const { user, logoutUser } = useContext(AuthContext)

    return (
        <div>
            <Link to="/">Home</Link>
            <span> | </span>
            {user ? (
                <div>
                    <Link to='/profile'>Profile</Link>
                    <span> | </span>
                    <Link to='/find-friends'>Find Friends</Link>
                    <p onClick={logoutUser}>Logout</p>
                </div>
            ) : (
                <div>
                    <Link to="/login" >Login</Link>
                    <span> | </span>
                    <Link to="/signup" >Signup</Link>
                </div>
            )}
            {user && <p>Hello {user.username}!</p>}

        </div>
    )
}

export default Header