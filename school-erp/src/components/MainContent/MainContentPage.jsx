"use client"

import { useState, useEffect } from "react"
import Sidebar from "../Sidebar/Sidebar"
import TopNavbar from "../Navbar/TopNavbar"
import Footer from "../Footer/Footer"

function MainContentPage({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)
      if (!newIsMobile) {
        setIsSidebarOpen(true) // Keep sidebar open on larger screens
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial check for screen size
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      {/* Main Content Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: isMobile || !isSidebarOpen ? 0 : "280px", // Adjust based on sidebar state
        }}
      >
        {/* Navbar */}
        <TopNavbar toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f3f4f6",
            padding: isMobile ? "12px" : "32px", // Adjust padding for mobile and larger screens
          }}
        >
          <div style={{ flex: 1 }}>{children}</div>
          <div className="text-center text-lg-start">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainContentPage

