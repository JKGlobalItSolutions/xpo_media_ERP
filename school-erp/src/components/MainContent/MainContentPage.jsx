import { useState, useEffect } from "react"
import Sidebar from "../Sidebar/Sidebar"
import TopNavbar from "../Navbar/TopNavbar"

function MainContentPage({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768
      setIsMobile(newIsMobile)
      if (!newIsMobile) {
        setIsSidebarOpen(true)
      } else {
        setIsSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div style={{ display: "flex",  backgroundColor: "#f3f4f6" }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: isMobile ? 0 : "280px",
          transition: "margin-left 0.3s ease-in-out",
          overflow: "hidden",
        }}
      >
        <TopNavbar toggleSidebar={toggleSidebar} isMobile={isMobile} />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#f3f4f6",
            padding: "24px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainContentPage

