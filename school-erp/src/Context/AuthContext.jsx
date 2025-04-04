"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { auth, db } from "../Firebase/config"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"

// Create the auth context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentAcademicYear, setCurrentAcademicYear] = useState(null)

  // Handle auth state changes
  useEffect(() => {
    console.log("Setting up auth listener")
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is authenticated:", user.uid)
        setUser(user)

        // Check if user has a selected academic year
        try {
          const userDoc = await getDoc(doc(db, "Schools", user.uid))
          if (userDoc.exists() && userDoc.data().currentAcademicYear) {
            console.log("Found academic year in Firestore:", userDoc.data().currentAcademicYear)
            setCurrentAcademicYear(userDoc.data().currentAcademicYear)
            
            // Store in sessionStorage and localStorage as backup
            sessionStorage.setItem('currentAcademicYear', userDoc.data().currentAcademicYear)
            localStorage.setItem('currentAcademicYear', userDoc.data().currentAcademicYear)
            sessionStorage.setItem('userId', user.uid)
            localStorage.setItem('userId', user.uid)
          } else {
            console.log("No academic year found in Firestore")
            setCurrentAcademicYear(null)
            sessionStorage.removeItem('currentAcademicYear')
            localStorage.removeItem('currentAcademicYear')
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setCurrentAcademicYear(null)
        }
      } else {
        console.log("User is not authenticated")
        setUser(null)
        setCurrentAcademicYear(null)
        sessionStorage.removeItem('currentAcademicYear')
        sessionStorage.removeItem('userId')
        localStorage.removeItem('currentAcademicYear')
        localStorage.removeItem('userId')
      }
      
      setLoading(false)
    })

    // Check storage for backup on initial load
    const checkStorage = () => {
      const storedYear = sessionStorage.getItem('currentAcademicYear') || localStorage.getItem('currentAcademicYear')
      const storedUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId')
      
      if (storedYear && storedUserId && auth.currentUser && auth.currentUser.uid === storedUserId) {
        console.log("Restoring academic year from storage:", storedYear)
        setCurrentAcademicYear(storedYear)
      }
    }
    
    checkStorage()
    
    return () => unsubscribe()
  }, [])

  // Force logout function to handle database reset scenarios
  const forceLogout = async () => {
    try {
      sessionStorage.removeItem('currentAcademicYear')
      sessionStorage.removeItem('userId')
      localStorage.removeItem('currentAcademicYear')
      localStorage.removeItem('userId')
      setCurrentAcademicYear(null)
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Update academic year in both state and Firestore
  const updateCurrentAcademicYear = useCallback(async (year) => {
    console.log("Updating academic year in context:", year)
    
    if (!user) {
      console.error("Cannot update academic year: No user logged in")
      return
    }
    
    try {
      // Update Firestore first
      await setDoc(
        doc(db, "Schools", user.uid),
        {
          currentAcademicYear: year,
          updatedAt: new Date()
        },
        { merge: true }
      )
      
      // Then update state and storage
      setCurrentAcademicYear(year)
      sessionStorage.setItem('currentAcademicYear', year)
      localStorage.setItem('currentAcademicYear', year)
      sessionStorage.setItem('userId', user.uid)
      localStorage.setItem('userId', user.uid)
      
      console.log("Academic year updated successfully:", year)
      return year
    } catch (error) {
      console.error("Error updating academic year in Firestore:", error)
      return null
    }
  }, [user])

  // Refresh academic year from Firestore
  const refreshAcademicYear = useCallback(async () => {
    if (!user) return null
    
    try {
      const userDoc = await getDoc(doc(db, "Schools", user.uid))
      if (userDoc.exists() && userDoc.data().currentAcademicYear) {
        const year = userDoc.data().currentAcademicYear
        setCurrentAcademicYear(year)
        sessionStorage.setItem('currentAcademicYear', year)
        localStorage.setItem('currentAcademicYear', year)
        return year
      }
      return null
    } catch (error) {
      console.error("Error refreshing academic year:", error)
      return null
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        currentAcademicYear,
        updateCurrentAcademicYear,
        refreshAcademicYear,
        forceLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
