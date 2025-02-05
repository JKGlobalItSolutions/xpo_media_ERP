import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import leftprofile from "../../images/leftprofile.jpg";
import logo from "../../images/Logo/logo.jpg";
import { Link, useNavigate } from "react-router-dom";
import { auth } from '../../Firebase/config';
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // If successful, navigate to home page
      navigate("/home");
    } catch (error) {
      setError("Failed to log in. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
        <div className="col-lg-6 col-md-12 d-flex align-items-center justify-content-center p-4" style={{ background:"linear-gradient(180deg, #1470E1 0%, #0B3D7B 100%)" }}>
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
    </div>
  );
}

export default Login;