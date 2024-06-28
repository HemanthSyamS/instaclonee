import React,{useContext, useEffect, useState} from "react"
import AuthContext from "../context/AuthContext"
import axios from "axios"

const FindFriends = () => {
    const {followUser, unfollowUser, authTokens } = useContext(AuthContext)
    const [users, setUsers] = useState([])

    useEffect(() => {
        const fetchUsers = async () => {
            try{
                const response = await axios.get('http://localhost:8000/users/list', {
                    headers : {
                        'Authorization' : `Bearer ${authTokens?.access}`
                    }
                })
                setUsers(response.data)
            } catch (error) {
                console.error('Error fetching users : ',error)
            }
        }
        fetchUsers()
    }, [authTokens])

    return (
        <div>
            <h2>Find Friends</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.username}
                        {user.is_following ? (
                            <button onClick={() => unfollowUser(user.id)}>Unfollow</button>
                        ) : (
                            <button onClick={() => followUser(user.id)}>Follow</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default FindFriends