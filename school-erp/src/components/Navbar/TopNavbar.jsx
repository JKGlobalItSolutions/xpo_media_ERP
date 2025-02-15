import React, { useState } from "react";

function TopNavbar({ toggleSidebar, isMobile }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

  return (
    <nav
      style={{
        display: "flex",
        height: "64px",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#0B3D7B",
        padding: "0 16px",
        color: "white",
      }}
    >
      {isMobile && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        </div>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Add any additional elements here */}
        </div>
        <button
          style={{
            borderRadius: "50%",
            padding: "4px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "white",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
        <span style={{ fontSize: "18px", fontWeight: "500" }}>kathirvel</span>

        <div
          style={{
            position: "relative",
            display: "flex",
            height: "32px",
            width: "32px",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={toggleDropdown}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B3D7B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "64px",
              right: "16px",
              backgroundColor: "white",
              borderRadius: "4px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "8px 16px",
                border: "none",
                background: "none",
                color: "#0B3D7B",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNavbar;