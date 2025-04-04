"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import leftprofile from "../../images/leftprofile.jpg"
import logo from "../../images/Logo/logo.jpg"
import { Link, useNavigate } from "react-router-dom"
import { auth, db } from "../../Firebase/config"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { useAuthContext } from "../../Context/AuthContext"

// SchoolNameModal Component
function SchoolNameModal({ isOpen, onClose, onConfirm }) {
  const [schoolName, setSchoolName] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(schoolName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Enter School Name</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Enter your school name"
            className="modal-input"
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="modal-button confirm">
              Submit
            </button>
            <button type="button" className="modal-button cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>
        {`
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

          .modal-input {
            width: 100%;
            padding: 0.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
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
        `}
      </style>
    </div>
  )
}

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const { currentAcademicYear } = useAuthContext()

  // Check if user is already authenticated - only once on mount
  useEffect(() => {
    const checkAuthOnce = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "Schools", auth.currentUser.uid))
          if (userDoc.exists() && userDoc.data().currentAcademicYear) {
            // They have an academic year, redirect to home
            console.log("User already logged in with academic year, redirecting to home")
            navigate("/home", { replace: true })
          } else {
            // No academic year, redirect to year selection
            console.log("User logged in but no academic year, redirecting to year selection")
            navigate("/select-year", { replace: true })
          }
        } catch (error) {
          console.error("Error checking user data:", error)
        }
      }
    }

    checkAuthOnce()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user
      setUser(user)

      // Check if SchoolName exists
      const userDoc = await getDoc(doc(db, "Schools", user.uid))

      if (userDoc.exists()) {
        if (userDoc.data().SchoolName) {
          // Always navigate to year selection after login
          navigate("/select-year", { replace: true })
        } else {
          // If SchoolName doesn't exist, show the modal
          setShowModal(true)
        }
      } else {
        // If document doesn't exist, show the modal
        setShowModal(true)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to log in. Please check your credentials.")
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSchoolNameSubmit = async (schoolName) => {
    try {
      await setDoc(
        doc(db, "Schools", user.uid),
        {
          email: user.email,
          SchoolName: schoolName,
        },
        { merge: true },
      )
      setShowModal(false)
      // After setting school name, navigate to year selection
      navigate("/select-year", { replace: true })
    } catch (error) {
      console.error("Error saving school name:", error)
      setError("Failed to save school name. Please try again.")
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    // You might want to sign out the user if they cancel setting up their school name
    auth.signOut().then(() => {
      setError("School name is required to continue. Please log in again.")
    })
  }

  return (
    <div className="container-fluid p-0" style={{ height: "100vh", overflow: "hidden" }}>
      <div className="row m-0 h-100">
        {/* Left side illustration */}
        <div className="col-lg-6 d-none d-lg-block p-3" style={{ backgroundColor: "#fff" }}>
          <div className="d-flex justify-content-center align-items-center h-100">
            <img
              src={leftprofile || "/placeholder.svg?height=600&width=800"}
              alt="Education Illustration"
              className="img-fluid"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
        {/* Right side login form */}
        <div
          className="col-lg-6 col-md-12 d-flex align-items-center justify-content-center p-4"
          style={{ background: "linear-gradient(180deg, #1470E1 0%, #0B3D7B 100%)" }}
        >
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="text-center mb-4">
              <img
                src={logo || "/placeholder.svg?height=100&width=100"}
                alt="XPO Media ERP Logo"
                className="mb-3 rounded-circle"
                width="100"
                height="100"
              />
              <h1 className="text-white fw-bold mb-2" style={{ fontSize: "2rem" }}>
                Welcome to XPO Media ERP
              </h1>
              <p className="text-white mb-4" style={{ fontSize: "1rem", opacity: 0.9 }}>
                Your One-Stop Solution for Education and Management
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mb-3">
              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    backgroundColor: "#fff",
                    border: "none",
                  }}
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
                    backgroundColor: "#fff",
                    border: "none",
                  }}
                />
              </div>

              <div className="text-end mb-3">
                <Link to="/forgot-password" className="text-white text-decoration-none" style={{ fontSize: "0.9rem" }}>
                  Forgot Password?
                </Link>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button
                type="submit"
                className="btn w-100 mb-3"
                style={{
                  backgroundColor: "#FFE500",
                  color: "#000",
                  padding: "0.75rem",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                }}
              >
                Confirm
              </button>

              <div className="text-center text-white" style={{ fontSize: "0.9rem" }}>
                New to XPO Media?{" "}
                <Link
                  to="/register"
                  className="text-warning text-decoration-none fw-bold"
                  style={{ color: "#FFE500 !important" }}
                >
                  Register Now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SchoolNameModal isOpen={showModal} onClose={handleModalClose} onConfirm={handleSchoolNameSubmit} />
    </div>
  )
}

export default Login
