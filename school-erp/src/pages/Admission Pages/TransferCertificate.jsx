"use client"

import { useState, useRef } from "react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import { db } from "../../Firebase/config" // Adjust path to your Firebase config
import { collection, getDocs, query, where } from "firebase/firestore"

const TransferCertificate = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentPhoto: null,
    studentName: "",
    fatherName: "",
    motherName: "",
    permanentAddress: "",
    placeName: "",
    busRouteNumber: "",
    communicationAdd: "",
    nationality: "",
    religion: "",
    community: "",
    caste: "",
    state: "",
    standard: "",
    section: "",
    gender: "",
    dateOfBirth: "",
    dateOfAdmission: "",
    studiedStandard: "",
    studiedYear: "",
    studiedSchoolName: "",
    parentOccupation: "",
    bloodGroup: "",
    dateOfRelieve: "",
    status: "",
  })

  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const schoolId = "currentSchoolId" // Replace with actual school ID from auth system

  const fetchStudentData = async (admissionNum) => {
    try {
      setLoading(true)
      setError("")

      const admissionMasterRef = collection(db, `Schools/${schoolId}/AdmissionMaster`)
      const admissionMasterSnapshot = await getDocs(admissionMasterRef)

      let studentFound = false

      for (const docSnapshot of admissionMasterSnapshot.docs) {
        const studentId = docSnapshot.id
        const admissionSetupRef = collection(
          db,
          `Schools/${schoolId}/AdmissionMaster/${studentId}/AdmissionSetup`
        )
        const q = query(admissionSetupRef, where("admissionNumber", "==", admissionNum))
        const admissionSetupSnapshot = await getDocs(q)

        if (!admissionSetupSnapshot.empty) {
          studentFound = true
          const studentDoc = admissionSetupSnapshot.docs[0]
          const data = studentDoc.data()

          setFormData({
            admissionNumber: data.admissionNumber || "",
            studentPhoto: data.studentPhoto || null,
            studentName: data.studentName || "",
            fatherName: data.fatherName || "",
            motherName: data.motherName || "",
            permanentAddress: `${data.streetVillage || ""}, ${data.district || ""}, ${data.state || ""} - ${data.placePincode || ""}`,
            placeName: data.boardingPoint || "",
            busRouteNumber: data.busRouteNumber || "",
            communicationAdd: data.communicationAddress || "",
            nationality: data.nationality || "",
            religion: data.religion || "",
            community: data.community || "",
            caste: data.caste || "",
            state: data.state || "",
            standard: data.standard || "",
            section: data.section || "",
            gender: data.gender || "",
            dateOfBirth: data.dateOfBirth || "",
            dateOfAdmission: data.dateOfAdmission || "",
            studiedStandard: data.classLastStudied || "",
            studiedYear: data.studiedYear || "",
            studiedSchoolName: data.nameOfSchool || "",
            parentOccupation: `${data.fatherOccupation || ""} / ${data.motherOccupation || ""}`,
            bloodGroup: data.bloodGroup || "",
            dateOfRelieve: data.dateOfRelieve || "",
            status: data.status || (data.studentType === "New" ? "active" : "inactive"),
          })

          if (data.studentPhoto) {
            setPhotoPreview(data.studentPhoto)
          }
          break
        }
      }

      if (!studentFound) {
        setError("No student found with this admission number")
        resetForm()
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Error fetching student data")
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      admissionNumber: formData.admissionNumber,
      studentPhoto: null,
      studentName: "",
      fatherName: "",
      motherName: "",
      permanentAddress: "",
      placeName: "",
      busRouteNumber: "",
      communicationAdd: "",
      nationality: "",
      religion: "",
      community: "",
      caste: "",
      state: "",
      standard: "",
      section: "",
      gender: "",
      dateOfBirth: "",
      dateOfAdmission: "",
      studiedStandard: "",
      studiedYear: "",
      studiedSchoolName: "",
      parentOccupation: "",
      bloodGroup: "",
      dateOfRelieve: "",
      status: "",
    })
    setPhotoPreview(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "admissionNumber" && value.length > 0) {
      fetchStudentData(value)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        studentPhoto: file,
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Data:", formData)
    // Add your form submission logic here
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Transfer Certificate</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/home" className="text-decoration-none">
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/admission" className="text-decoration-none">
                    Admission
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Transfer Certificate
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="transfer-form bg-white rounded shadow-sm">
          {/* Header with Admission Number Input */}
          <div className="header p-3 d-flex justify-content-between align-items-center custom-btn-clr">
            <h4 className="m-0 text-white">Transfer Form</h4>
            <Form.Control
              type="text"
              placeholder="Enter Admission Number"
              value={formData.admissionNumber}
              onChange={handleInputChange}
              name="admissionNumber"
              className="w-auto"
              style={{ maxWidth: "200px" }}
              disabled={loading}
            />
          </div>

          {/* Form Content */}
          <div className="content-wrapper p-4">
            {loading && <div className="text-center mb-3">Loading student data...</div>}
            {error && <div className="text-center mb-3 text-danger">{error}</div>}
            <Form onSubmit={handleSubmit}>
              <Row>
                {/* Left Column */}
                <Col md={6}>
                  <div className="text-center mb-4">
                    <h6>Student Photo</h6>
                    <div
                      className="photo-upload-circle mx-auto"
                      onClick={handlePhotoClick}
                      style={{
                        width: "150px",
                        height: "150px",
                        border: "2px dashed #ccc",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      {photoPreview ? (
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Student"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="text-center text-muted">
                          <div>Upload Photo Here</div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      style={{ display: "none" }}
                    />
                  </div>

                  <Form.Group className="mb-3" key="studentName">
                    <Form.Label>Student Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student full name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="fatherName">
                    <Form.Label>Father's Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="motherName">
                    <Form.Label>Mother's Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="permanentAddress">
                    <Form.Label>Permanent Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      placeholder="Enter permanent address"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="placeName">
                    <Form.Label>Place Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="placeName"
                      value={formData.placeName}
                      onChange={handleInputChange}
                      placeholder="Enter place name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="busRouteNumber">
                    <Form.Label>Bus Route Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="busRouteNumber"
                      value={formData.busRouteNumber}
                      onChange={handleInputChange}
                      placeholder="Enter bus route number"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="communicationAdd">
                    <Form.Label>Communication Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="communicationAdd"
                      value={formData.communicationAdd}
                      onChange={handleInputChange}
                      placeholder="Enter communication address"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="nationality">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Control
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      placeholder="Enter nationality"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="religion">
                    <Form.Label>Religion</Form.Label>
                    <Form.Control
                      type="text"
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      placeholder="Enter religion"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="community">
                    <Form.Label>Community</Form.Label>
                    <Form.Control
                      type="text"
                      name="community"
                      value={formData.community}
                      onChange={handleInputChange}
                      placeholder="Enter community"
                      disabled={loading}
                    />
                  </Form.Group>
                </Col>

                {/* Right Column */}
                <Col md={6}>
                  <Form.Group className="mb-3" key="caste">
                    <Form.Label>Caste</Form.Label>
                    <Form.Control
                      type="text"
                      name="caste"
                      value={formData.caste}
                      onChange={handleInputChange}
                      placeholder="Enter caste"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="state">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="standard">
                    <Form.Label>Standard</Form.Label>
                    <Form.Control
                      type="text"
                      name="standard"
                      value={formData.standard}
                      onChange={handleInputChange}
                      placeholder="Enter standard"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="section">
                    <Form.Label>Section</Form.Label>
                    <Form.Control
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="Enter section"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="gender">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" key="dateOfBirth">
                    <Form.Label>Date Of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="dateOfAdmission">
                    <Form.Label>Date Of Admission</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfAdmission"
                      value={formData.dateOfAdmission}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="studiedStandard">
                    <Form.Label>Studied Standard</Form.Label>
                    <Form.Control
                      type="text"
                      name="studiedStandard"
                      value={formData.studiedStandard}
                      onChange={handleInputChange}
                      placeholder="Enter studied standard"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="studiedYear">
                    <Form.Label>Studied Year</Form.Label>
                    <Form.Control
                      type="text"
                      name="studiedYear"
                      value={formData.studiedYear}
                      onChange={handleInputChange}
                      placeholder="Enter studied year"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="studiedSchoolName">
                    <Form.Label>Studied School Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="studiedSchoolName"
                      value={formData.studiedSchoolName}
                      onChange={handleInputChange}
                      placeholder="Enter studied school name"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="parentOccupation">
                    <Form.Label>Parent Occupation</Form.Label>
                    <Form.Control
                      type="text"
                      name="parentOccupation"
                      value={formData.parentOccupation}
                      onChange={handleInputChange}
                      placeholder="Enter parent occupation"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="bloodGroup">
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Control
                      type="text"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      placeholder="Enter blood group"
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="dateOfRelieve">
                    <Form.Label>Date Of Relieve</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfRelieve"
                      value={formData.dateOfRelieve}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" key="status">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={loading}
                    >
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Form Actions */}
              <Row className="mt-4">
                <Col className="d-flex justify-content-center gap-3">
                  <Button type="submit" className="custom-btn-clr" disabled={loading}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={resetForm} disabled={loading}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Container>
    </MainContentPage>
  )
}

export default TransferCertificate