import React, { createContext, useCallback, useEffect, useState } from 'react'
import {jwtDecode} from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import {
    setAuthToken,
    signupUser,
    loginUser,
    refreshToken,
    getProfile,
    updateProfile,
    deleteUser,
    fetchFollowers,
    fetchFollowing,
    fetchUsers,
    followUser,
    unfollowUser,
} from './api'

const AuthContext = createContext()

export default AuthContext

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        const tokens = localStorage.getItem('authTokens')
        return tokens ? jwtDecode(JSON.parse(tokens).access) : null
    })
    const [authTokens, setAuthTokens] = useState(() => {
        const tokens = localStorage.getItem('authTokens')
        return tokens ? JSON.parse(tokens) : null
    })
    const [profile, setProfile] = useState(() => {
        const storedProfile = localStorage.getItem('profile')
        return storedProfile ? JSON.parse(storedProfile) : null
    })
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        setAuthToken(authTokens ? authTokens.access : null)
    })

    const handleSignup = async (e) => {
        e.preventDefault()
        const {username, email, password } = e.target
        try{
            setLoading(true)
            const response = await signupUser({
                username : username.value,
                email : email.value,
                password : password.value,
            })
            if(response.status === 201) {
                alert('Successfully created your profile, please login.')
                navigate('/login')
            }
        } catch (error) {
            console.error('Signup failed : ', error)
            setErrors(error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        const {username, password} = e.target
        try{
            setLoading(true)
            const response = await loginUser({
                username : username.value,
                password : password.value,
            })
            const data = response.data
            localStorage.setItem('authTokens',JSON.stringify(data))
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            navigate("/")
        } catch (error) {
            let errorMessage = 'Failed, please try again.'
            if(error.response) {
                if(error.response.status === 400) {
                    errorMessage = 'Invalid username or password.'
                } else if(error.response.status === 401) {
                    errorMessage = 'Unauthorized access, check your credentials.'
                } else if(error.response.status === 500) {
                    errorMessage = 'Server error, try again later.'
                } else {
                    errorMessage = 'Network error, check your connection.'
                }
                console.error('Login failed : ', error)
                setErrors(errorMessage)
            }
        } finally{
            setLoading(false)
        }
    }

    const handleLogout = useCallback((e) => {
        localStorage.removeItem('authTokens')
        localStorage.removeItem('profile')
        setAuthTokens(null)
        setUser(null)
        setProfile(null)
        alert("Logged out.")
        navigate('/login')
    },[navigate])

    const handleTokenRefresh = useCallback(async () => {   
        if(!authTokens.access){
            handleLogout()
            return
        }
        try {
            const response = await refreshToken(authTokens?.refresh)
            const data = response.data
            if (response.status === 200) {
                const newTokens = {...authTokens, access : data.access}
                setAuthTokens(newTokens)
                setUser(jwtDecode(data.access))
                localStorage.setItem('authTokens', JSON.stringify(newTokens))
            } else {
                handleLogout()
            }
        } catch (error) {
            handleLogout()
            console.error(`Error refreshing token: ${error}`)
        } finally{
            setLoading(false)
        }
    },[authTokens, handleLogout])

    const handleGetProfile = useCallback(async () => {
        if(profile) {
            setLoading(false)
            return
        }
        try{
            setLoading(true)
            const response = await getProfile()
            if(response.status === 200) {
                setProfile(response.data)
                localStorage.setItem('profile', JSON.stringify(response.data))
            } else if(response.status === 401) {
                handleLogout()
            }
        } catch (error) {
            console.error('Error fetching profile details', error)
            handleLogout()
        } finally{
            setLoading(false)
        }
    },[ handleLogout, profile])
    
    const handleUpdateProfile = useCallback(async (formData) => {
        setErrors(null);
        try{
            setLoading(true)
            const response = await updateProfile(formData)
            if (response.status === 200) {
                setProfile(response.data)
                localStorage.setItem('profile', JSON.stringify(response.data))
                navigate('/profile')
                return response.data
            } else {
                throw new Error('Failed to update profile.')
            }
        } catch (error) {
            console.error('Error updating profile', error)
            setErrors(error.response? error.response.data : 'Unknown error occured.')
        } finally {
            setLoading(false)
        }
    },[ navigate])

    const handleFollowUser = async (userId) => {
        try {
            await followUser(userId)
            setFollowing((prev) => {
                const updatedFollowing = [...prev, {to_user : {id : userId }}]
                updateUserFollowStatus(updatedFollowing)
                return updatedFollowing
            })
        } catch (error) {
            console.error('Error following user', error)
        }
    }

    const handleUnfollowUser = async (userId) => {
        try {
            await unfollowUser(userId)
            setFollowing((prev) => {
                const updatedFollowing = prev.filter(follow => follow.to_user.id !==userId)
                updateUserFollowStatus(updatedFollowing)
                return updatedFollowing
            })
        } catch (error) {
            console.error('Error unfollowing user', error)
        }
    }

    const handleDeleteUser = async () => {
        try{
            setLoading(true)
            const response = await deleteUser()
            if(response.status === 204) {
                alert("User deleted successfully !")
                handleLogout()
                setAuthTokens(null)
                setProfile(null)
                navigate('/signup')
            }
        } catch (error) {
            console.error("Error deleting User : ", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if(authTokens){
            handleGetProfile()

        }
    },[authTokens, handleGetProfile])

    useEffect(() => {
        if (authTokens && profile) {
            fetchFollowers().then(response => setFollowers(response.data.results))
            fetchFollowing().then(response => setFollowing(response.data.results))
            fetchUsers().then(response => setUsers(response.data))
        }
    },[authTokens, profile,])

    const updateUserFollowStatus = useCallback((updatedFollowing) => {
        setUsers((prevUsers) => prevUsers.map(user => ({
            ...user,
            is_following : updatedFollowing.some(follow => follow.to_user.id === user.id)
        })))
        setProfile((prevProfile) => ({
            ...prevProfile,
            data : {
                ...prevProfile.data,
                following_count : updatedFollowing.length,
            }
        }))
    },[])

    const contextData = {
        user,
        authTokens,
        signupUser : handleSignup,
        loginUser : handleLogin,
        profile,
        following,
        followers,
        users,
        loading,
        errors,
        logoutUser : handleLogout,
        updateToken : handleTokenRefresh,
        getProfile : handleGetProfile,
        deleteUser : handleDeleteUser,
        updateProfile : handleUpdateProfile,
        fetchFollowers,
        fetchFollowing,
        fetchUsers,
        followUser : handleFollowUser,
        unfollowUser : handleUnfollowUser,
    }
    
    useEffect(() => {
        const REFRESH_INTERVAL = 1000 * 60 * 4
        const interval = setInterval(() => {
            if(authTokens) {
                handleTokenRefresh()
            }
        }, REFRESH_INTERVAL);
        return () => clearInterval(interval)
    },[authTokens, handleTokenRefresh])

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}
