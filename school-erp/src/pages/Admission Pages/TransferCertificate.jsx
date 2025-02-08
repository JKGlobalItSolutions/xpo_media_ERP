"use client"

import { useState, useRef } from "react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import { Link } from "react-router-dom"

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
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
                  <Link to="/administration" className="text-decoration-none">
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

        <div className="transfer-form">
          {/* Header with Admission Number Input */}
          <div className="header p-3 d-flex justify-content-between align-items-center custom-btn-clr">
            <h4 className="m-0">Transfer Form</h4>
            <Form.Control
              type="text"
              placeholder="Enter Admission Number"
              value={formData.admissionNumber}
              onChange={handleInputChange}
              name="admissionNumber"
              className="w-auto"
              style={{ maxWidth: "200px" }}
            />
          </div>

          {/* Form Content */}
          <div className="content-wrapper p-4">
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

                  <Form.Group className="mb-3">
                    <Form.Label>Student name</Form.Label>
                    <Form.Control
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Enter student full name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Father's name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mother's name</Form.Label>
                    <Form.Control
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Permanent Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Place Name</Form.Label>
                    <Form.Select name="placeName" value={formData.placeName} onChange={handleInputChange}>
                      <option value="">Select Place</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Bus Route Number</Form.Label>
                    <Form.Select name="busRouteNumber" value={formData.busRouteNumber} onChange={handleInputChange}>
                      <option value="">Select Route Number</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Communication Add</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="communicationAdd"
                      value={formData.communicationAdd}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Control
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Religion</Form.Label>
                    <Form.Select name="religion" value={formData.religion} onChange={handleInputChange}>
                      <option value="">Select Religion</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Community</Form.Label>
                    <Form.Select name="community" value={formData.community} onChange={handleInputChange}>
                      <option value="">Select Community</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Right Column */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Caste</Form.Label>
                    <Form.Select name="caste" value={formData.caste} onChange={handleInputChange}>
                      <option value="">Select Caste</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select name="state" value={formData.state} onChange={handleInputChange}>
                      <option value="">Select State</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Standard</Form.Label>
                    <Form.Select name="standard" value={formData.standard} onChange={handleInputChange}>
                      <option value="">Select Standard</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select name="section" value={formData.section} onChange={handleInputChange}>
                      <option value="">Select Section</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date Of Birth</Form.Label>
                    <Form.Select name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange}>
                      <option value="">Select Date</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date Of Admission</Form.Label>
                    <Form.Select name="dateOfAdmission" value={formData.dateOfAdmission} onChange={handleInputChange}>
                      <option value="">Select Date</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Studied Standard</Form.Label>
                    <Form.Select name="studiedStandard" value={formData.studiedStandard} onChange={handleInputChange}>
                      <option value="">Select Standard</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Studied Year</Form.Label>
                    <Form.Select name="studiedYear" value={formData.studiedYear} onChange={handleInputChange}>
                      <option value="">Select Year</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Studied School Name</Form.Label>
                    <Form.Select
                      name="studiedSchoolName"
                      value={formData.studiedSchoolName}
                      onChange={handleInputChange}
                    >
                      <option value="">Select School</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Parent Occupation</Form.Label>
                    <Form.Select name="parentOccupation" value={formData.parentOccupation} onChange={handleInputChange}>
                      <option value="">Select Occupation</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Control
                      type="text"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      placeholder="Enter blood group"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date Of Relieve</Form.Label>
                    <Form.Select name="dateOfRelieve" value={formData.dateOfRelieve} onChange={handleInputChange}>
                      <option value="">Select Date</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
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
                  <Button type="submit" className="custom-btn-clr">
                    Save
                  </Button>
                  <Button variant="secondary">Cancel</Button>
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

