"use client"

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import MainRouter from "./Router/MainRouter"
import { AuthProvider, useAuthContext } from "./Context/AuthContext"
import "bootstrap/dist/css/bootstrap.min.css"
import AdministrationRoute from "./Router/SubRouters/AdministrationRoute"
import Login from "./pages/Auth/Login" // Assuming you have a Login component

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Main router with authentication logic
const AppRoutes = () => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      {/* Login route - accessible to everyone */}
      <Route path="/login" element={user ? <Navigate to="/home" replace /> : <Login />} />

      {/* Protected routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdministrationRoute />
          </ProtectedRoute>
        }
      />

      {/* Use MainRouter for other routes with protection */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainRouter />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App

