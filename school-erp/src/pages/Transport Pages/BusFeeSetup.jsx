"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"

const BusFeeSetup = () => {
  const [formData, setFormData] = useState({
    boardingPoint: "",
    routeNumber: "",
    feeHeading: "",
    fee: "",
  })

  const [feeEntries, setFeeEntries] = useState([])
  const [totalFee, setTotalFee] = useState(0)

  const location = useLocation()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Data:", formData)
  }

  const handleReset = () => {
    setFormData({
      boardingPoint: "",
      routeNumber: "",
      feeHeading: "",
      fee: "",
    })
    setFeeEntries([])
    setTotalFee(0)
  }

  // Sample data for dropdowns
  const boardingPoints = ["Point 1", "Point 2", "Point 3"]
  const routeNumbers = ["Route 1", "Route 2", "Route 3"]
  const feeHeadings = ["Term 1", "Term 2", "Annual"]

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span>Transport</span>
                <span className="separator">&gt;</span>
                <span className="current">Bus Fee Setup</span>
              </nav>

              {/* Main Form Section */}
              <div className="form-section">
                {/* Header */}
                <div
                  className="custom-btn-clr"
                  style={{
                    padding: "15px 20px",
                    fontSize: "24px",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  Bus Fee Setup
                </div>

                {/* Form */}
                <div
                  style={{
                    padding: "30px",
                    backgroundColor: "white",
                    border: "1px solid #dee2e6",
                    borderBottomLeftRadius: "8px",
                    borderBottomRightRadius: "8px",
                  }}
                >
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>Enter Place / Boarding Point</Form.Label>
                      <Form.Select
                        name="boardingPoint"
                        value={formData.boardingPoint}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Select Boarding Point</option>
                        {boardingPoints.map((point, index) => (
                          <option key={index} value={point}>
                            {point}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>Select / Enter Route Number</Form.Label>
                      <Form.Select
                        name="routeNumber"
                        value={formData.routeNumber}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Select Route Number</option>
                        {routeNumbers.map((route, index) => (
                          <option key={index} value={route}>
                            {route}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>Select Fee Heading</Form.Label>
                      <Form.Select
                        name="feeHeading"
                        value={formData.feeHeading}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Select Fee Heading</option>
                        {feeHeadings.map((heading, index) => (
                          <option key={index} value={heading}>
                            {heading}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>Fee</Form.Label>
                      <Form.Control
                        type="text"
                        name="fee"
                        value={formData.fee}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      />
                    </Form.Group>

                    {/* Fee Table Section */}
                    <div className="mt-4">
                      <Row>
                        <Col md={3}>
                          <div
                            className="custom-btn-clr"
                            style={{
                              padding: "10px 15px",
                              borderRadius: "4px",
                            }}
                          >
                            Total Fee
                          </div>
                        </Col>
                        <Col md={9}>
                          <Table bordered style={{ border: "1px solid #0B3D7B" }}>
                            <thead>
                              <tr>
                                <th className="custom-btn-clr">Fee Description</th>
                                <th className="custom-btn-clr">Amount in Rs</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                              </tr>
                              <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                              </tr>
                              <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                              </tr>
                            </tbody>
                          </Table>
                        </Col>
                      </Row>
                    </div>

                 
                    <div className="d-flex flex-wrap justify-content-center gap-3 mt-5">
                      <Button  type="submit" className="custom-btn-clr">Insert</Button>
                      <Button  className="custom-btn-clr">Save</Button>
                      <Button  className="custom-btn-clr">View</Button>
                      <Button  onClick={handleReset} className="btn-cancel btn btn-secondary">Cancel</Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </MainContentPage>
  )
}

export default BusFeeSetup

