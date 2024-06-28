import axios from 'axios'
import React, { createContext, useCallback, useEffect, useState } from 'react'
import {jwtDecode} from 'jwt-decode'
import { useNavigate } from 'react-router-dom'

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
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState(null)

    const navigate = useNavigate()

    const signupUser = async (e) => {
        e.preventDefault()
        const {username, email, password } = e.target
        try{
            setLoading(true)
            const response = await axios.post('http://localhost:8000/users/signup/',{
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

    const loginUser = async (e) => {
        e.preventDefault()
        const {username, password} = e.target
        try{
            setLoading(true)
            const response = await axios.post('http://localhost:8000/users/login/',{
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

    const logoutUser = useCallback((e) => {
        localStorage.removeItem('authTokens')
        localStorage.removeItem('profile')
        setAuthTokens(null)
        setUser(null)
        setProfile(null)
        alert("Logged out.")
        navigate('/login')
    },[navigate])

    const updateToken = useCallback(async () => {   
        if(!authTokens.access){
            logoutUser()
            return
        }
        try {
            const response = await axios.post('http://localhost:8000/users/token/refresh/', {
                refresh: authTokens?.refresh,
            })
            const data = response.data
            if (response.status === 200) {
                const newTokens = {...authTokens, access : data.access}
                setAuthTokens(newTokens)
                setUser(jwtDecode(data.access))
                localStorage.setItem('authTokens', JSON.stringify(newTokens))
            } else {
                logoutUser()
            }
        } catch (error) {
            logoutUser()
            console.error(`Error refreshing token: ${error}`)
        } finally{
            setLoading(false)
        }
    },[authTokens, logoutUser])

    const getProfile = useCallback(async () => {
        if(profile) {
            setLoading(false)
            return
        }
        try{
            setLoading(true)
            const response = await axios.get('http://localhost:8000/users/profile/',{
                headers : {
                    'Authorization' : `Bearer ${authTokens?.access}`
                }
            })
            if(response.status === 200) {
                setProfile(response.data)
                localStorage.setItem('profile', JSON.stringify(response.data))
            } else if(response.status === 401) {
                logoutUser()
            }
        } catch (error) {
            console.error('Error fetching profile details', error)
            logoutUser()
        } finally{
            setLoading(false)
        }
    },[authTokens, logoutUser, profile])
    
    const updateProfile = useCallback(async (formData) => {
        setErrors(null);
        try{
            setLoading(true)
            const response = await axios.post('http://localhost:8000/users/profile/update/',formData,{
                headers : {
                    'Authorization' : `Bearer ${authTokens?.access}`,
                    'Content-Type' : 'multipart/form-data'
                }
            })
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
    },[authTokens, navigate])

    const deleteUser = async () => {
        try{
            setLoading(true)
            const response = await axios.delete('http://localhost:8000/users/profile/delete/',{
                headers : {
                    'Authorization' : `Bearer ${authTokens?.access}`
                }
            })
            if(response.status === 204) {
                alert("User deleted successfully !")
                logoutUser()
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
            getProfile()
        }
    },[authTokens, getProfile])

    const contextData = {
        user,
        authTokens,
        signupUser,
        loginUser,
        profile,
        loading,
        errors,
        logoutUser,
        updateToken,
        getProfile,
        deleteUser,
        updateProfile,
        // getFollowers,
        // getFollowing,
        // followUser,
        // unfollowUser,
    }
    
    useEffect(() => {
        const REFRESH_INTERVAL = 1000 * 60 * 4
        const interval = setInterval(() => {
            if(authTokens) {
                updateToken()
            }
        }, REFRESH_INTERVAL);
        return () => clearInterval(interval)
    },[authTokens, updateToken])

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}
