"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import MainRouter from "./Router/MainRouter"
import { AuthProvider, useAuthContext } from "./Context/AuthContext"
import "bootstrap/dist/css/bootstrap.min.css"
import YearSelector from "./components/YearlySelector/YearSelector"
import Login from "./pages/Auth/Login"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Login route */}
          <Route path="/login" element={<Login />} />
          
          {/* Year selection route */}
          <Route path="/select-year" element={<YearSelector />} />
          
          {/* All other routes are handled by MainRouter */}
          <Route path="/*" element={<MainRouter />} />
          
          {/* Root path - redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 1.5rem;
            color: #0B3D7B;
            background-color: #f8f9fa;
          }
        `}</style>
      </AuthProvider>
    </Router>
  )
}

export default App
