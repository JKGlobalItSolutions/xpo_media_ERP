import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in on initial load
    const token = localStorage.getItem("token")
    if (token) {
      setIsAuth(true)
      // You might want to fetch user data here
      // and set it using setUser
    }
  }, [])

  const login = async (email, password) => {
    // Implement your login logic here
    // This is a mock implementation
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful login
      const mockUser = { id: 1, name: "John Doe", email }
      const mockToken = "mock-jwt-token"

      // Save token to localStorage
      localStorage.setItem("token", mockToken)

      setIsAuth(true)
      setUser(mockUser)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    // Implement your logout logic here
    localStorage.removeItem("token")
    setIsAuth(false)
    setUser(null)
  }

  const value = {
    isAuth,
    user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

