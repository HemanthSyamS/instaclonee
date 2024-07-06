import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

const ProfilePage = () => {

    const {profile, loading, deleteUser, followers, following } = useContext(AuthContext)
    const [localProfile, setLocalProfile] = useState(profile)
    // console.log("profile page : ",followers)

    useEffect(() => {
        if(profile) {
            setLocalProfile(({
                ...profile,
                data : {
                    ...profile.data,
                    follower_count : followers.length,
                    following_count : following.length,
                }
            }))
        }
    },[profile, followers, following])

    if(loading) {
        return <div>Loading ...</div>
    }

    if(!localProfile) {
        return <div>No profile data found.</div>
    }

    const profilePicUrl = localProfile.data.profile_pic ? 
        `http://localhost:8000${localProfile.data.profile_pic}` : 
        'http://localhost:8000/media/profile_pic/default_profile_pic.jpg'

    return (
        <div>
            <div>
                <img
                    src={profilePicUrl}
                    alt="profile pic"
                    style={{width : '150px', height: '150px', borderRadius: '50%'}}
                />  
            </div>
            <p>Username : {localProfile.data.user.username}</p>
            <p>Name : {localProfile.data.user.first_name} {localProfile.data.user.last_name}</p>
            <p>Bio : {localProfile.data.bio}</p>
            <p>Email : {localProfile.data.user.email}</p>
            <p>Followers : {localProfile.data.follower_count}</p>
            <p>Following : {localProfile.data.following_count}</p>
            <Link to='/profile/update'>Edit profile</Link>
            <button style={{background : 'red'}} onClick={deleteUser}>Delete User</button>
            <h3>Followers : </h3>
            <ul>
                {followers.map(follower => (
                    follower.from_user && follower.from_user.user && (
                        <li key={follower.from_user.id}>{follower.from_user.user.username}</li>
                    )
                ))}
            </ul>
            <h3>Following : </h3>
            <ul>
                {following.map(follow => (
                    follow.to_user && follow.to_user.user && (
                        <li key={follow.to_user.id}>{follow.to_user.user.username}</li>
                    )
                ))}
            </ul>
        </div>
    )
}
export default ProfilePage