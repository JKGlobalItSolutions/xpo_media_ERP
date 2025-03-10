"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../Firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { useLocation } from "react-router-dom"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Prevent back button navigation on login page
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/") {
      // Push current state to history to prevent going back
      window.history.pushState(null, "", window.location.pathname)

      const handlePopState = () => {
        // Push again when back button is clicked to prevent navigation
        window.history.pushState(null, "", window.location.pathname)
      }

      window.addEventListener("popstate", handlePopState)

      return () => {
        window.removeEventListener("popstate", handlePopState)
      }
    }
  }, [location.pathname])

  return <AuthContext.Provider value={{ user, loading }}>{!loading && children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

