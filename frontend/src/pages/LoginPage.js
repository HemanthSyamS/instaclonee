import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

const LoginPage = () => {

    const {loginUser,errors } = useContext(AuthContext)

    return (
        <div>
            <form onSubmit={loginUser}>
                <input type="text" name="username" placeholder="Enter Username" />
                <input type="text" name="password" placeholder="Enter password" />
                <input type="submit" />
            </form>
            {errors && <p style={{ color: 'red' }}>{errors}</p>}
        </div>
    )
}

export default LoginPage