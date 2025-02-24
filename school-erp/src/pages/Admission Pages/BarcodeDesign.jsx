"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Form, Button, Row, Col, Container, Dropdown } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { QRCodeSVG } from "qrcode.react"
import CryptoJS from "crypto-js"

// Define a constant for the encryption key
const ENCRYPTION_KEY = "your-secret-key-here" // Replace with a secure key

const QRCodeDesign = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentName: "",
    fatherName: "",
    streetVillage: "",
    district: "",
    placePincode: "",
    phoneNumber: "",
    studentType: "",
    standard: "",
    section: "",
    gender: "",
    community: "",
    caste: "",
    dateOfBirth: "",
    dateOfAdmission: "",
  })

  const [administrationId, setAdministrationId] = useState(null)
  const [qrCodeData, setQRCodeData] = useState("")
  const [allAdmissionNumbers, setAllAdmissionNumbers] = useState([])
  const [filteredAdmissionNumbers, setFilteredAdmissionNumbers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const adminSnapshot = await getDocs(adminRef)
        if (!adminSnapshot.empty) {
          setAdministrationId(adminSnapshot.docs[0].id)
        } else {
          console.error("No administration document found")
          toast.error("Failed to initialize. No administration found.")
        }
      } catch (error) {
        console.error("Error fetching Administration ID:", error)
        toast.error("Failed to initialize. Please try again.")
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchAllAdmissionNumbers()
    }
  }, [administrationId])

  useEffect(() => {
    if (formData.admissionNumber) {
      generateQRCodeData()
    }
  }, [formData])

  const fetchAllAdmissionNumbers = async () => {
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const snapshot = await getDocs(admissionsRef)
      const numbers = snapshot.docs.map((doc) => doc.data().admissionNumber)
      setAllAdmissionNumbers(numbers)
    } catch (error) {
      console.error("Error fetching admission numbers:", error)
      toast.error("Failed to fetch admission numbers. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "admissionNumber") {
      if (value.length > 0) {
        filterAdmissionNumbers(value)
      } else {
        setShowDropdown(true)
        setFilteredAdmissionNumbers(allAdmissionNumbers)
      }
    }
  }

  const filterAdmissionNumbers = (input) => {
    const filtered = allAdmissionNumbers.filter((number) => number.toLowerCase().includes(input.toLowerCase()))
    setFilteredAdmissionNumbers(filtered)
    setShowDropdown(filtered.length > 0)
  }

  const handleAdmissionNumberSelect = (selectedNumber) => {
    setFormData((prev) => ({ ...prev, admissionNumber: selectedNumber }))
    setShowDropdown(false)
    fetchStudentDetails(selectedNumber)
  }

  const handleInputFocus = () => {
    setShowDropdown(true)
    setFilteredAdmissionNumbers(allAdmissionNumbers)
  }

  const fetchStudentDetails = async (admissionNumber) => {
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(admissionsRef, where("admissionNumber", "==", admissionNumber))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs[0].data()
        setFormData({
          admissionNumber: studentData.admissionNumber,
          studentName: studentData.studentName,
          fatherName: studentData.fatherName,
          streetVillage: studentData.streetVillage,
          district: studentData.district,
          placePincode: studentData.placePincode,
          phoneNumber: studentData.phoneNumber,
          studentType: studentData.studentType,
          standard: studentData.standard,
          section: studentData.section,
          gender: studentData.gender,
          community: studentData.community,
          caste: studentData.caste,
          dateOfBirth: studentData.dateOfBirth,
          dateOfAdmission: studentData.dateOfAdmission,
        })
        toast.success("Student data fetched successfully!")
      } else {
        toast.error("No data found for this admission number.")
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data. Please try again.")
    }
  }

  const generateQRCodeData = () => {
    const essentialData = {
      admissionNumber: formData.admissionNumber,
      studentName: formData.studentName,
      standard: formData.standard,
      section: formData.section,
    }
    const qrData = JSON.stringify(essentialData)
    setQRCodeData(qrData)
  }

  const encryptQRCode = (data) => {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!qrCodeData) {
      toast.error("Please generate QR code data first.")
      return
    }

    try {
      if (!administrationId) {
        throw new Error("Administration ID is not set")
      }

      const encryptedQRCode = encryptQRCode(qrCodeData)
      const studentRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
        formData.admissionNumber,
      )

      await setDoc(studentRef, { encrypted: encryptedQRCode }, { merge: true })
      console.log("QR code saved successfully for admission number:", formData.admissionNumber)
      toast.success("QR code saved successfully!")
    } catch (error) {
      console.error("Error saving QR code:", error)
      toast.error(`Failed to save QR code: ${error.message}`)
    }
  }

  const handleReset = () => {
    setFormData({
      admissionNumber: "",
      studentName: "",
      fatherName: "",
      streetVillage: "",
      district: "",
      placePincode: "",
      phoneNumber: "",
      studentType: "",
      standard: "",
      section: "",
      gender: "",
      community: "",
      caste: "",
      dateOfBirth: "",
      dateOfAdmission: "",
    })
    setQRCodeData("")
    setShowDropdown(false)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="admission-form">
          {/* Header and Breadcrumb */}
          <div className="mb-4">
            <h2 className="mb-2">QR Code Design</h2>
            <nav className="custom-breadcrumb py-1 py-lg-3">
              <Link to="/home">Home</Link>
              <span className="separator mx-2">&gt;</span>
              <span>Admission Master</span>
              <span className="separator mx-2">&gt;</span>
              <span>QR Code Design</span>
            </nav>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded shadow-sm">
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Left Column - Form Fields */}
                <Col md={8}>
                  <div className="p-4">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Admission Number</Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              type="text"
                              name="admissionNumber"
                              value={formData.admissionNumber}
                              onChange={handleInputChange}
                              onFocus={handleInputFocus}
                              placeholder="Enter Admission Number"
                              autoComplete="off"
                            />
                            {showDropdown && (
                              <Dropdown.Menu show className="w-100">
                                {filteredAdmissionNumbers.map((number) => (
                                  <Dropdown.Item key={number} onClick={() => handleAdmissionNumberSelect(number)}>
                                    {number}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            )}
                          </div>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Student Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Father's Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Street/Village</Form.Label>
                          <Form.Control
                            type="text"
                            name="streetVillage"
                            value={formData.streetVillage}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>District</Form.Label>
                          <Form.Control
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Place/Pincode</Form.Label>
                          <Form.Control
                            type="text"
                            name="placePincode"
                            value={formData.placePincode}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Student Type</Form.Label>
                          <Form.Control
                            type="text"
                            name="studentType"
                            value={formData.studentType}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Standard</Form.Label>
                          <Form.Control
                            type="text"
                            name="standard"
                            value={formData.standard}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Section</Form.Label>
                          <Form.Control
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Gender</Form.Label>
                          <Form.Control
                            type="text"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Community</Form.Label>
                          <Form.Control
                            type="text"
                            name="community"
                            value={formData.community}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Caste</Form.Label>
                          <Form.Control
                            type="text"
                            name="caste"
                            value={formData.caste}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date Of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Date Of Admission</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfAdmission"
                            value={formData.dateOfAdmission}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Col>

                {/* Right Column - QR Code Preview */}
                <Col md={4} className="bg-light">
                  <div className="p-4 h-100 d-flex flex-column justify-content-center align-items-center">
                    <h5 className="mb-4">QR Code Preview</h5>
                    <div className="bg-white p-3 rounded shadow-sm" style={{ width: "120px", height: "120px" }}>
                      {qrCodeData && <QRCodeSVG value={qrCodeData} size={100} level="M" includeMargin={false} />}
                    </div>
                    <p className="mt-3 text-muted">Size: 100x100 pixels</p>
                    <p className="text-muted">Suitable for ID card printing</p>
                  </div>
                </Col>
              </Row>

              {/* Form Actions */}
              <Row className="mt-4">
                <Col className="d-flex justify-content-center gap-3 pb-4">
                  <Button variant="primary" className="custom-btn-clr">
                    New QR Code Design
                  </Button>
                  <Button type="submit" className="custom-btn-clr">
                    Save
                  </Button>
                  <Button variant="danger" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button variant="secondary">Cancel</Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Container>
      <ToastContainer />
    </MainContentPage>
  )
}

export default QRCodeDesign

