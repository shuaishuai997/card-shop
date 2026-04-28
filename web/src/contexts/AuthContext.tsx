import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  user: any
  login: (token: string, user: any) => void
  logout: () => void
  loading: boolean
  manageToken: string | null
  manageLogin: (token: string) => void
  manageLogout: () => void
  manageLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 买家 token
  const [token, setToken] = useState<string | null>(localStorage.getItem('buyer_token'))
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('buyer_user') || 'null'))
  const [loading, setLoading] = useState(false)

  // 管理员 token
  const [manageToken, setManageToken] = useState<string | null>(localStorage.getItem('manage_token'))
  const [manageLoading, setManageLoading] = useState(false)

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('buyer_token', newToken)
    localStorage.setItem('buyer_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    localStorage.removeItem('buyer_token')
    localStorage.removeItem('buyer_user')
    setToken(null)
    setUser(null)
  }

  const manageLogin = (newToken: string) => {
    localStorage.setItem('manage_token', newToken)
    setManageToken(newToken)
  }

  const manageLogout = () => {
    localStorage.removeItem('manage_token')
    setManageToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        loading,
        manageToken,
        manageLogin,
        manageLogout,
        manageLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}