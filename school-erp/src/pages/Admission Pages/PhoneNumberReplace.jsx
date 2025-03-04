"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Card, Container, Dropdown } from "react-bootstrap"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db, auth } from "../../Firebase/config"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const PhoneNumberReplace = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentName: "",
    currentPhoneNumber: "",
    newPhoneNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [filteredAdmissionNumbers, setFilteredAdmissionNumbers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const adminSnapshot = await getDocs(adminRef)
        if (!adminSnapshot.empty) {
          setAdministrationId(adminSnapshot.docs[0].id)
        } else {
          console.error("No administration document found")
          toast.error("Failed to fetch administration data")
        }
      } catch (error) {
        console.error("Error fetching Administration ID:", error)
        toast.error("Failed to fetch administration data")
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchAdmissionNumbers()
    }
  }, [administrationId])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchAdmissionNumbers = async () => {
    try {
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const snapshot = await getDocs(studentsRef)
      const admissionNumbersData = snapshot.docs.map((doc) => doc.data().admissionNumber).filter(Boolean)
      setAdmissionNumbers(admissionNumbersData)
      setFilteredAdmissionNumbers(admissionNumbersData)
    } catch (error) {
      console.error("Error fetching admission numbers:", error)
      toast.error("Failed to fetch admission numbers")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "admissionNumber") {
      const filtered = admissionNumbers.filter((num) => num.toLowerCase().includes(value.toLowerCase()))
      setFilteredAdmissionNumbers(filtered)
      setShowDropdown(true)
    }

    if (name === "newPhoneNumber" && value === formData.currentPhoneNumber) {
      toast.warn("Please enter a different phone number than the current one.")
    }
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
  }

  const handleAdmissionNumberSelect = (admissionNumber) => {
    setFormData((prev) => ({
      ...prev,
      admissionNumber: admissionNumber,
    }))
    setShowDropdown(false)
    fetchStudentDetails(admissionNumber)
  }

  const fetchStudentDetails = async (admissionNumber) => {
    setIsLoading(true)
    try {
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(studentsRef, where("admissionNumber", "==", admissionNumber))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs[0].data()
        setFormData((prev) => ({
          ...prev,
          studentName: studentData.studentName,
          currentPhoneNumber: studentData.phoneNumber,
          newPhoneNumber: "", // Reset new phone number when fetching new student details
        }))
        toast.success("Student details fetched successfully")
      } else {
        toast.error("No student found with this admission number")
        setFormData((prev) => ({
          ...prev,
          studentName: "",
          currentPhoneNumber: "",
          newPhoneNumber: "",
        }))
      }
    } catch (error) {
      console.error("Error fetching student details:", error)
      toast.error("Failed to fetch student details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.admissionNumber || !formData.newPhoneNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.newPhoneNumber === formData.currentPhoneNumber) {
      toast.warn("Please enter a different phone number than the current one.")
      return
    }

    setIsLoading(true)
    try {
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(studentsRef, where("admissionNumber", "==", formData.admissionNumber))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0]
        await updateDoc(doc(studentsRef, studentDoc.id), {
          phoneNumber: formData.newPhoneNumber,
        })
        toast.success("Phone number updated successfully")
        setFormData({
          admissionNumber: "",
          studentName: "",
          currentPhoneNumber: "",
          newPhoneNumber: "",
        })
      } else {
        toast.error("No student found with this admission number")
      }
    } catch (error) {
      console.error("Error updating phone number:", error)
      toast.error("Failed to update phone number")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Header and Breadcrumb */}
        <div className="mb-4">
          <h2 className="mb-2">Phone Number Replace</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Admission Master</span>
            <span className="separator mx-2">&gt;</span>
            <span>Phone Number Replace</span>
          </nav>
        </div>

        {/* Phone Number Replacement Card */}
        <Card className="mb-4">
          <Card.Header className="p-3 custom-btn-clr">
            <h5 className="m-0">Phone Number Replacement</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Admission Number</Form.Label>
                </div>
                <div className="col-md-9 position-relative" ref={dropdownRef}>
                  <Form.Control
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder="Enter or Select Admission Number"
                    autoComplete="off"
                    ref={inputRef}
                  />
                  {showDropdown && (
                    <Dropdown.Menu
                      show
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                        position: "absolute",
                        zIndex: 1000,
                      }}
                    >
                      {filteredAdmissionNumbers.map((num, index) => (
                        <Dropdown.Item key={index} onClick={() => handleAdmissionNumberSelect(num)}>
                          {num}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  )}
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Student Name</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control type="text" value={formData.studentName} readOnly placeholder="Student Name" />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Current Phone Number</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="text"
                    value={formData.currentPhoneNumber}
                    readOnly
                    placeholder="Current Phone Number"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>New Phone Number</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="tel"
                    name="newPhoneNumber"
                    value={formData.newPhoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter New Phone Number"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button type="submit" className="custom-btn-clr" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Phone Number"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setFormData({
                      admissionNumber: "",
                      studentName: "",
                      currentPhoneNumber: "",
                      newPhoneNumber: "",
                    })
                  }
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      <style>
        {`
          .custom-breadcrumb {
            padding: 0.5rem 1rem;
          }

          .custom-breadcrumb a {
            color: #0B3D7B;
            text-decoration: none;
          }

          .custom-breadcrumb .separator {
            margin: 0 0.5rem;
            color: #6c757d;
          }

          .custom-btn-clr {
            background-color: #0B3D7B;
            border-color: #0B3D7B;
          }

          .custom-btn-clr:hover {
            background-color: #082b56;
            border-color: #082b56;
          }

          .dropdown-menu {
            max-height: 200px;
            overflow-y: auto;
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default PhoneNumberReplace

