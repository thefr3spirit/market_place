import { createContext, useContext, useEffect, useState } from 'react'
import apiClient from '../api/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      apiClient
        .get('/users/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password })
    const { access_token, user: userData } = res.data
    localStorage.setItem('token', access_token)
    setToken(access_token)
    setUser(userData)
    return userData
  }

  const register = async (username, email, password, phone) => {
    const res = await apiClient.post('/auth/register', {
      username,
      email,
      password,
      phone: phone || null,
    })
    const { access_token, user: userData } = res.data
    localStorage.setItem('token', access_token)
    setToken(access_token)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await apiClient.put('/users/me', data)
    setUser(res.data)
    return res.data
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
