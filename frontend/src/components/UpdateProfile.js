import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";


const UpdateProfile = () => {
    const { profile, updateProfile  } = useContext(AuthContext)
    const [formData, setFormData] = useState({
        first_name : '',
        last_name : '',
        bio : '',
    })
    const [profilePicUrl, setProfilePicUrl] = useState('')
    const [newProfilePic, setNewProfilePic] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState(null)

    useEffect(() => {
        const storedProfile = profile || JSON.parse(localStorage.getItem('profile'))
        if (storedProfile) {
            setFormData({
                first_name : storedProfile.data.user.first_name || '',
                last_name : storedProfile.data.user.last_name || '',
                bio : storedProfile.data.bio || '',
            })
            setProfilePicUrl(storedProfile.data.profile_pic || '')
        }
    },[profile])

    const handleChange = (e) => {
        const {name, value} = e.target
        setFormData((prevState) => ({
            ...prevState,
            [name] : value ?? ''
        }))
    }

    const handleFileChange = (e) => {
        setNewProfilePic(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors(null)
        try{
            setLoading(true)
            const formDataObj = new FormData()
            Object.keys(formData).forEach((key) => {
                formDataObj.append(key, formData[key])
            })
            if(newProfilePic) {
                formDataObj.append('profile_pic', newProfilePic)
            }
            const updatedProfile = await updateProfile(formDataObj)
            if(updatedProfile) {
                alert('Profile updated successfully.')
                setProfilePicUrl(updatedProfile.data.profile_pic)
            }
        } catch (error) {
            setErrors(error.message || 'Unknown error occured.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Update profile</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name : </label>
                    <input 
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Last Name : </label>
                    <input 
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Profile Pic : </label>
                    {profilePicUrl && (
                        <div>
                            <img
                                src={`http://localhost:8000${profilePicUrl}`}
                                alt="Current profile pic"
                                style={{width: '150px', height: '150px', borderRadius: '50%'}}
                            />
                        </div>
                    )}
                    <input 
                        type="file"
                        name="profile_pic"
                        onChange={handleFileChange}
                    />
                </div>
                <div>
                    <label>Bio : </label>
                    <input 
                        type="text"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Updaing ...' : 'Update profile'}
                </button>
                {errors && <div style={{color : 'red'}}>{errors}</div>}
            </form>
        </div>
    )
}

export default UpdateProfile