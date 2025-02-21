"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Card, Container } from "react-bootstrap"
import Footer from "../../components/Footer/Footer"

const PromotionHigher = () => {
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
          <h2 className="mb-2">Promotion Higher</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div to="/admission">Admission Master</div>
            <span className="separator mx-2">&gt;</span>
            <span>Promotion Higher</span>
          </nav>
        </div>

        {/* Course Wise Fee Setting Card */}
        <Card className="mb-4">
          <Card.Header className="p-3 custom-btn-clr">
            <h5 className="m-0">Promotion Higher</h5>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleCourseWiseSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Selected Program to be Promote</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Select name="sex" value={courseWiseData.sex} onChange={handleCourseWiseChange}>
                    <option value="">Name of the fee account transfer</option>
                  </Form.Select>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <Form.Label>Select Promoted Programs</Form.Label>
                </div>
                <div className="col-md-9">
                  <Form.Select name="feeHead" value={courseWiseData.feeHead} onChange={handleCourseWiseChange}>
                    <option value="">Name of the fee account transfer</option>
                  </Form.Select>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2 mt-4">
                <Button type="submit" className="custom-btn-clr">
                  Promote
                </Button>
              </div>
            </Form>

            {/* Instructions Banner */}
            <div className="mt-4 p-4" style={{ backgroundColor: "#0B3D7B", color: "white", borderRadius: "4px" }}>
              <h5 className="mb-3">Please follow the instructions before promotion processing</h5>
              <ol className="m-0 ps-3">
                <li className="mb-2">Please take a database backup before Promotion Processing</li>
                <li className="mb-2">Please enter correct password for promotion processing</li>
                <li className="mb-2">The Promotion Process is start with higher program only</li>
                <li className="mb-2">The Old higher candidates are deleted at the time of promotion process</li>
                <li className="mb-2">The Fee structure is finalized before promotion operation</li>
              </ol>
            </div>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-center gap-2 mt-4">
          <Button type="submit" className="custom-btn-clr">
            Delete
          </Button>
          <Button variant="secondary">Cancel</Button>
        </div>

        {/* Footer */}
       
      </Container>
    </MainContentPage>
  )
}

export default PromotionHigher