"use client"

import { useState, useEffect } from "react"
import Sidebar from "../Sidebar/Sidebar"
import TopNavbar from "../Navbar/TopNavbar"
import Footer from "../Footer/Footer"
import "../../assets/global.css"

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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* Navbar outside of main content */}
      <TopNavbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Main Content Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            marginLeft: isMobile || !isSidebarOpen ? 0 : "280px", // Adjust based on sidebar state
            maxWidth: isMobile ? "100%" : "auto", // Limit width on mobile
            overflowX: "auto", // Enable horizontal scrolling if content exceeds width
          }}
        >
          <main
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f3f4f6",
              padding: isMobile ? "12px" : "32px", // Adjust padding for mobile and larger screens
              overflowX: "auto", // Enable horizontal scrolling for main content
            }}
          >
            <div style={{ flex: 1 }}>{children}</div>
            <div className="text-center text-lg-start">
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default MainContentPage
