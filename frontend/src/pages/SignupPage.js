import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

const SingnupPage = () => {

    const { signupUser,errors } = useContext(AuthContext)

    return (
        <div>
            <form onSubmit={signupUser}>
                <input type="text" name="username" placeholder="Enter Username" />
                <input type="text" name="email" placeholder="Enter Email" />
                <input type="text" name="password" placeholder="Enter Password" />
                <input type="submit" />
            </form>
            {errors && <p style={{ color: 'red' }}>{errors}</p>}
        </div>
    )
}

export default SingnupPage