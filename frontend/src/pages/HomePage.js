import React, { useContext } from 'react'
import AuthContext from '../context/AuthContext';

const HomePage = () => {

    const { user } = useContext(AuthContext)

    return(user ? (
        <div>
            <h1>You are logged in to homepage.</h1>
        </div>
    ) : (
        <div>
            <h1>You are not logged in, redirecting ...</h1>
        </div>
    ))
}
export default HomePage;
