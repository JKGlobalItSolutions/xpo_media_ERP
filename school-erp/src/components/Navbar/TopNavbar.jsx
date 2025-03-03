"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "../../Firebase/config";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore"; // Updated imports
import { useNavigate } from "react-router-dom";
import { ref, getDownloadURL } from "firebase/storage";
import { Container, Image } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User } from "lucide-react";

function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

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
  );
}

function TopNavbar({ toggleSidebar, isMobile }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchoolData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          // Query the "Schools" collection by email instead of UID
          const schoolsCollection = collection(db, "Schools");
          const q = query(schoolsCollection, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const schoolDoc = querySnapshot.docs[0]; // Assuming email is unique
            const data = schoolDoc.data();
            setSchoolName(data.SchoolName || "");

            if (data.profileImage) {
              try {
                // Use email in the storage path for consistency
                const storageRef = ref(storage, `profile/${user.email}/profileImage`);
                const url = await getDownloadURL(storageRef);
                setProfileImage(url);
              } catch (error) {
                console.error("Error fetching profile image:", error);
                setProfileImage(""); // Fallback to empty string if image fetch fails
              }
            } else {
              setProfileImage("");
            }
          } else {
            console.warn("No school profile found for this email");
            setSchoolName("");
            setProfileImage("");
          }
        } catch (error) {
          console.error("Error fetching school data:", error);
          toast.error("Failed to load school data");
        }
      }
    };

    fetchSchoolData();
  }, []); // Runs once on mount, updates with auth state changes

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
    setShowLogoutModal(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSettingsClick = () => {
    navigate("/settings");
    setIsDropdownOpen(false);
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
        <span style={{ fontSize: "18px", fontWeight: "500" }}>{schoolName || "School Name"}</span>

        <div
          style={{
            position: "relative",
            display: "flex",
            height: "32px",
            width: "32px",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={toggleDropdown}
        >
          {profileImage ? (
            <Image
              src={profileImage}
              roundedCircle
              width={32}
              height={32}
              onError={(e) => {
                e.target.style.display = "none"; // Hide broken image
              }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <User size={20} color="#0B3D7B" />
            </div>
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
      <ToastContainer />
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
  );
}

export default TopNavbar;