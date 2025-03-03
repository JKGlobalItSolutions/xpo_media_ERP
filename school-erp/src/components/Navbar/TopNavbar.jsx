"use client"

import { useState, useEffect } from "react"
import { auth, db } from "../../Firebase/config"
import { signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"

// Logout Confirmation Modal Component
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Logout</h2>
        <p className="modal-message">Are you sure you want to logout?</p>
        <div className="modal-buttons">
          <button className="modal-button confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="modal-button cancel" onClick={onClose}>
            No
          </button>
        </div>
      </div>
    </div>
  )
}

function TopNavbar({ toggleSidebar, isMobile }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [schoolName, setSchoolName] = useState("")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSchoolName = async () => {
      const user = auth.currentUser
      if (user) {
        const schoolDoc = await getDoc(doc(db, "Schools", user.uid))
        if (schoolDoc.exists()) {
          setSchoolName(schoolDoc.data().SchoolName || "")
        }
      }
    }
    fetchSchoolName()
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
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
        <span style={{ fontSize: "18px", fontWeight: "500" }}>{schoolName || "School Name"}</span>

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
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1100;
        }

        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
          text-align: center;
        }

        .modal-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .modal-message {
          margin-bottom: 1.5rem;
          color: #666;
        }

        .modal-buttons {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        .modal-button {
          padding: 0.5rem 2rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .modal-button:hover {
          opacity: 0.9;
        }

        .modal-button.confirm {
          background-color: #0B3D7B;
          color: white;
        }

        .modal-button.cancel {
          background-color: #6c757d;
          color: white;
        }
      `}</style>
    </nav>
  )
}

export default TopNavbar

