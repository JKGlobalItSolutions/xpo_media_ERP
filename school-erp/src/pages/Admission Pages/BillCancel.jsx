"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Card, Container } from "react-bootstrap"

const BillCancel = () => {
  const [formData, setFormData] = useState({
    billNumber: "",
    name: "",
    standard: "",
    section: "",
    date: "",
    description: "",
    otp: ""
  })

  const [timer, setTimer] = useState(0)
  const [isOtpSent, setIsOtpSent] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateOTP = () => {
    setIsOtpSent(true)
    setTimer(60) // Start 60 second timer
  }

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Data:", formData)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Header and Breadcrumb */}
        <div className="mb-4">
          <h2 className="mb-2">Bill Cancel</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div to="/admission">Admission Master</div>
            <span className="separator mx-2">&gt;</span>
            <span>Bill Cancel</span>
          </nav>
        </div>

        {/* Bill Cancel Form Card */}
        <Card className="mb-4">
          <Card.Header className="p-3 custom-btn-clr">
            <h5 className="m-0">Bill Cancel</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Bill Number</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="text"
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Name</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Standard</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="text"
                    name="standard"
                    value={formData.standard}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Section</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Date</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Description</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Button
                    onClick={handleGenerateOTP}
                    className="custom-btn-clr"
                  >
                    Generate OTP
                  </Button>
                </div>
                <div className="col-md-6">
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    disabled={!isOtpSent}
                  />
                </div>
                <div className="col-md-3">
                  {timer > 0 && (
                    <span className="align-middle">{formatTime(timer)}</span>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button 
                  type="submit" 
                  className="custom-btn-clr"
                >
                  Save
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

      
      </Container>
    </MainContentPage>
  )
}

export default BillCancel