import React,{useContext } from "react" 
import AuthContext from "../context/AuthContext"

const FindFriends = () => {
    const {users, followUser, unfollowUser } = useContext(AuthContext)

    return (
        <div>
            <h2>Find Friends</h2>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.user.username}
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