import axios from "axios";

const api = axios.create({
    baseURL : 'http://localhost:8000/',
    headers : {
        'Content-Type' : 'application/json'
    }
})

export const setAuthToken = (token) => {
    if(token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete api.defaults.headers.common['Authorization']
    }
}

export const signupUser = async (userData) => await api.post('/users/signup/', userData)
export const loginUser = async (userData) => await api.post('/users/login/', userData)
export const refreshToken = async (refreshToken) => await api.post('/users/token/refresh/',{
    refresh : refreshToken
})
export const getProfile = async () => await api.get('/users/profile/')
export const updateProfile = async (formData) => await api.post('/users/profile/update/', formData, {
    headers : { 'Content-Type' : 'multipart/form-data' }
})
export const deleteUser = async () => await api.delete('/users/profile/delete')
export const fetchFollowers = async () => await api.get('/users/edge/', {
    params : { direction : 'followers' }
})
export const fetchFollowing = async () => await api.get('/users/edge/', {
    params : { direction : 'following' }
})
export const fetchUsers = async () => await api.get('/users/list/')
export const followUser = async (userId) => await api.post('/users/edge/', {
    to_user : userId
})
export const unfollowUser = async (userId) => await api.delete('/users/edge', {
    data : { to_user : userId}
})


export const createPost = async (postData) => await api.post('/post', postData)
export const uploadMedia = async (formData) => await api.put('/post/media/', formData, {
    headers : { 'Content-Type' : 'multipart/form-data' }
})
export const publishPost = async (postId) => await api.put(`/post/${postId}`, {
    is_published : true
})
export const fetchUserFeed = async () => await api.get('/post/')
export const likePost = async (postId) => await api.post('/post/like/', {
    post : postId
})
export const unlikePost = async (postId) => await api.delete('/post/like/', {
    data : { post : postId }
})
export const fetchLikes = async (postId) => await api.get('/post/like/', {
    params : { post_id : postId}
})
export const commentOnPost = async (commentData) => await api.post('/post/comment/', commentData)
export const deleteComment = async (commentId) => await api.delete('/post/comment/', {
    data : { id : commentId }
})
export const fetchComments = async (postId) => await api.get('/post/comment/', {
    params : { post_id : postId }
})
