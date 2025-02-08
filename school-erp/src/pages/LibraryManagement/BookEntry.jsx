"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Card, Container } from "react-bootstrap"

const BookEntry = () => {
  const [courseWiseData, setCourseWiseData] = useState({
    course: "",
    sex: "",
    feeHead: "",
    amount: "",
    reportDate: "", // Added report date state
  })

  const [individualData, setIndividualData] = useState({
    adminNumber: "",
    name: "",
    feeHead: "",
    amount: "",
  })

  const handleCourseWiseChange = (e) => {
    const { name, value } = e.target
    setCourseWiseData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleIndividualChange = (e) => {
    const { name, value } = e.target
    setIndividualData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCourseWiseSubmit = (e) => {
    e.preventDefault()
    console.log("Course Wise Data:", courseWiseData)
  }

  const handleIndividualSubmit = (e) => {
    e.preventDefault()
    console.log("Individual Data:", individualData)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Header and Breadcrumb */}
        <div className="mb-4">
          <h2 className="mb-2">Book Entry</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="">LibraryManagement</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Book Entry</span>
          </nav>
        </div>

        {/* Course Wise Fee Setting Card */}
        <Card className="mb-4">
          <Card.Header className="p-3 custom-btn-clr" >
            <h5 className="m-0">Book Entry</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleCourseWiseSubmit}>
              <div className="row">
                <div className="col-12 col-lg-6">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <Form.Label>Admisssion Number</Form.Label>
                    </div>
                    <div className="col-md-8">
                      <Form.Control
                        type="text"
                        name="reportDate"
                        value={courseWiseData.reportDate}
                        onChange={handleCourseWiseChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <Form.Label>Standard</Form.Label>
                    </div>
                    <div className="col-md-8">
                      <Form.Control
                        type="text"
                        name="reportDate"
                        value={courseWiseData.reportDate}
                        onChange={handleCourseWiseChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <Form.Label>Book Title</Form.Label>
                    </div>
                    <div className="col-md-8">
                      <Form.Select
                        name="feeHead"
                        value={courseWiseData.feeHead}
                        onChange={handleCourseWiseChange}
                      >
                        <option value="">Select Head</option>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Lab Fee">Lab Fee</option>
                        <option value="Sports Fee">Sports Fee</option>
                      </Form.Select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <Form.Label>Submission Date</Form.Label>
                    </div>
                    <div className="col-md-8">
                      <Form.Control
                        type="text"
                        name="reportDate"
                        value={courseWiseData.reportDate}
                        onChange={handleCourseWiseChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <Form.Label>Status</Form.Label>
                    </div>
                    <div className="col-md-8">
                      <Form.Control
                        type="text"
                        name="reportDate"
                        value={courseWiseData.reportDate}
                        onChange={handleCourseWiseChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="row mb-3">
                  <div className="col-md-3">
                    <Form.Label>Student Name</Form.Label>
                  </div>
                  <div className="col-md-9">
                    <Form.Control
                      type="text"
                      name="reportDate"
                      value={courseWiseData.reportDate}
                      onChange={handleCourseWiseChange}
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
                        name="reportDate"
                        value={courseWiseData.reportDate}
                        onChange={handleCourseWiseChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <Form.Label>Issued Date</Form.Label>
                    </div>
                    <div className="col-md-9">
                      <Form.Select
                        name="feeHead"
                        value={courseWiseData.feeHead}
                        onChange={handleCourseWiseChange}
                      >
                        <option value="">Select Head</option>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Library Fee">Library Fee</option>
                        <option value="Lab Fee">Lab Fee</option>
                        <option value="Sports Fee">Sports Fee</option>
                      </Form.Select>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <Form.Label>Book ID</Form.Label>
                    </div>
                    <div className="col-md-9">
                      <Form.Control
                        type="text"
                        name="reportDate"
                        value={courseWiseData.reportDate}
                        onChange={handleCourseWiseChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button type="submit" className="custom-btn-clr">
                  Insert
                </Button>
                <Button type="submit" className="custom-btn-clr">
                  Save
                </Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </MainContentPage>
  )
}

export default BookEntry