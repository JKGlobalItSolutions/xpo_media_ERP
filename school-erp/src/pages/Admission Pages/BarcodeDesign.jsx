"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from "react-bootstrap"

const BarcodeDesign = () => {
  const [formData, setFormData] = useState({
    barcodeNumber: "",
    registerNumber: "",
    studentName: "",
    fatherName: "",
    address: "",
    pincode: "",
    district: "",
    mobileNumber: "",
    studentType: "",
    standard: "",
    section: "",
    gender: "",
    community: "",
    caste: "",
    dateOfBirth: "",
    dateOfAdmission: "",
    field1: "",
    field2: "",
    field3: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Data:", formData)
    // Add your form submission logic here
  }

  const handleReset = () => {
    setFormData({
      barcodeNumber: "",
      registerNumber: "",
      studentName: "",
      fatherName: "",
      address: "",
      pincode: "",
      district: "",
      mobileNumber: "",
      studentType: "",
      standard: "",
      section: "",
      gender: "",
      community: "",
      caste: "",
      dateOfBirth: "",
      dateOfAdmission: "",
      field1: "",
      field2: "",
      field3: "",
    })
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="admission-form">
          {/* Header and Breadcrumb */}
          <div className="mb-4">
            <h2 className="mb-2">Bar Code Design</h2>
            <nav className="custom-breadcrumb py-1 py-lg-3">
              <Link to="/home">Home</Link>
              <span className="separator mx-2">&gt;</span>
              <span>Admission Master</span>
              <span className="separator mx-2">&gt;</span>
              <Link to="/admission/barcode">Bar Code Design</Link>
            </nav>
          </div>

          {/* Form Content */}
          <div className="">
            <Form onSubmit={handleSubmit}>
              <Row className="flex-column-reverse flex-md-row">
                {/* Left Column - Form Fields */}
                <Col md={6}>
                  <div className="p-4">
                    <Row className="g-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Bar Code Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="barcodeNumber"
                            value={formData.barcodeNumber}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Register Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="registerNumber"
                            value={formData.registerNumber}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Student Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="studentName"
                            value={formData.studentName}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Father's Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Pincode</Form.Label>
                          <Form.Control
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>District</Form.Label>
                          <Form.Control
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Mobile Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="mobileNumber"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Student Type</Form.Label>
                          <Form.Control
                            type="text"
                            name="studentType"
                            value={formData.studentType}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Standard</Form.Label>
                          <Form.Control
                            type="text"
                            name="standard"
                            value={formData.standard}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Section</Form.Label>
                          <Form.Control
                            type="text"
                            name="section"
                            value={formData.section}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Gender</Form.Label>
                          <Form.Control
                            type="text"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Community</Form.Label>
                          <Form.Control
                            type="text"
                            name="community"
                            value={formData.community}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Caste</Form.Label>
                          <Form.Control type="text" name="caste" value={formData.caste} onChange={handleInputChange} />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Date Of Birth</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>Date Of Admission</Form.Label>
                          <Form.Control
                            type="date"
                            name="dateOfAdmission"
                            value={formData.dateOfAdmission}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </Col>

                {/* Right Column - Barcode Preview */}
                <Col md={6} className="bg-light">
                  <div className="p-4">
                    <div className="border rounded p-4 h-100 d-flex flex-column justify-content-center align-items-center">
                      <h5 className="mb-4">Barcode Preview</h5>
                      {/* Add your barcode preview component here */}
                      <div className="text-center">
                        {/* This is a placeholder for the barcode image */}
                        <div className="bg-white p-4 rounded shadow-sm" style={{ minHeight: "200px" }}>
                          <p className="text-muted">Barcode will be generated here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Form Actions */}
              <Row className="mt-4">
                <Col className="d-flex justify-content-center gap-3">
                  <Button variant="primary">New Barcode Design</Button>
                  <Button type="submit" variant="primary">
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
    </MainContentPage>
  )
}

export default BarcodeDesign

