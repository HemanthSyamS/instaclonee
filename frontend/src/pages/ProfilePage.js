import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

const ProfilePage = () => {

    const {profile, loading, deleteUser, } = useContext(AuthContext)
    const [localProfile, setLocalProfile] = useState(profile)
    // console.log("profile page : ",localProfile)

    useEffect(() => {
        if(profile) {
            setLocalProfile(profile)
        }
    },[profile])

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
        </div>
    )
}
export default ProfilePage