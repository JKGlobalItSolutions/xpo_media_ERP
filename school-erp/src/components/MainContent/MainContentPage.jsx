import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import TopNavbar from "../Navbar/TopNavbar";

function MainContentPage({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setIsSidebarOpen(true); // Keep sidebar open on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check for screen size
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#f3f4f6" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          marginLeft: isMobile || !isSidebarOpen ? 0 : "280px", // Adjust based on sidebar state
          overflow: "hidden",
        }}
      >
        {/* Navbar */}
        <TopNavbar toggleSidebar={toggleSidebar} isMobile={isMobile} />

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#f3f4f6",
            padding: isMobile ? "12px" : "32px", // Adjust padding for mobile and larger screens
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainContentPage;
