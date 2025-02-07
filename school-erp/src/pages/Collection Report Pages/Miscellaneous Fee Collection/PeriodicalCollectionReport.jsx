"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Card, Container } from "react-bootstrap"

const DayCollectionReport = () => {
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
        <h2 className="mb-2">Miscellaneous Fee Collection</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="">Collection Report</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/collection-report/Miscellaneous-Fee-Collection">Miscellaneous Fee Collection</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Periodical Collection Report</span>
          </nav>
        </div>

        {/* Course Wise Fee Setting Card */}
        <Card className="mb-4">
          <Card.Header className="p-3" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
            <h5 className="m-0">Periodical Collection Report</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleCourseWiseSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Select Starting Date</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="date"
                    name="reportDate"
                    value={courseWiseData.reportDate}
                    onChange={handleCourseWiseChange}
                    onClick={(e) => e.target.showPicker()} // Open date picker when clicked anywhere on the field
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Select Ending Date</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Control
                    type="date"
                    name="reportDate"
                    value={courseWiseData.reportDate}
                    onChange={handleCourseWiseChange}
                    onClick={(e) => e.target.showPicker()} // Open date picker when clicked anywhere on the field
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button type="submit" style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}>
                  Generate
                </Button>
                <Button type="submit" style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}>
                  Save
                </Button>
                <Button variant="secondary">Cancel</Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* Footer */}
        <footer className="mt-4 text-muted">
          <small>
            © Copyrights{" "}
            <a href="#" className="text-decoration-none">
              XPO Media
            </a>{" "}
            2024. All rights reserved
          </small>
        </footer>
      </Container>
    </MainContentPage>
  )
}

export default DayCollectionReport
