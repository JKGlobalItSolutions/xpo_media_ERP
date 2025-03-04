"use client"

import { useState, useEffect } from "react"
import { auth, db } from "../../Firebase/config"
import { signOut } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

// Logout Confirmation Modal Component
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "1rem",
            color: "#333",
          }}
        >
          Confirm Logout
        </h2>
        <p
          style={{
            marginBottom: "1.5rem",
            color: "#666",
          }}
        >
          Are you sure you want to logout?
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              padding: "0.5rem 2rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
              backgroundColor: "#0B3D7B",
              color: "white",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            Yes
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 2rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "500",
              backgroundColor: "#6c757d",
              color: "white",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}

function TopNavbar({ toggleSidebar, isMobile }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [schoolData, setSchoolData] = useState({ SchoolName: "", profileImage: "" })
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const user = auth.currentUser
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "Schools", user.uid), (doc) => {
        if (doc.exists()) {
          setSchoolData({
            SchoolName: doc.data().SchoolName || "",
            profileImage: doc.data().profileImage || "",
          })
        }
      })

      return () => unsubscribe()
    }
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
    setIsDropdownOpen(false)
  }

  const confirmLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
    setShowLogoutModal(false)
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  const handleSettingsClick = () => {
    navigate("/settings")
    setIsDropdownOpen(false)
  }

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
        <span style={{ fontSize: "18px", fontWeight: "500" }}>{schoolData.SchoolName || "School Name"}</span>

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
            overflow: "hidden",
          }}
          onClick={toggleDropdown}
        >
          {schoolData.profileImage ? (
            <img
              src={schoolData.profileImage || "/placeholder.svg"}
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
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
          )}
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
              onClick={handleSettingsClick}
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
              Settings
            </button>
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
      <LogoutModal isOpen={showLogoutModal} onClose={cancelLogout} onConfirm={confirmLogout} />
    </nav>
  )
}

export default TopNavbar

