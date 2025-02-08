"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Card, Container } from "react-bootstrap"

const SectionReplace = () => {
  const [courseWiseData, setCourseWiseData] = useState({
    course: "",
    sex: "",
    feeHead: "",
    amount: "",
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
          <h2 className="mb-2">Section Replace</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admission">Admission Master</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Demand Report</span>
          </nav>
        </div>

        {/* Course Wise Fee Setting Card */}
        <Card className="mb-4">
          <Card.Header className="p-3" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
            <h5 className="m-0">Section Replacement</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleCourseWiseSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Register Number</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Select name="course" value={courseWiseData.course} onChange={handleCourseWiseChange}>
                    <option value="">1 term</option>
                  </Form.Select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Present Section</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Select name="sex" value={courseWiseData.sex} onChange={handleCourseWiseChange}>
                    <option value="">Name of the fee account transfer</option>
                  </Form.Select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>New Section</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Select name="feeHead" value={courseWiseData.feeHead} onChange={handleCourseWiseChange}>
                    <option value="">Name of the fee account transfer</option>
                  </Form.Select>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button type="submit" style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}>
                  Replace
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

export default SectionReplace

