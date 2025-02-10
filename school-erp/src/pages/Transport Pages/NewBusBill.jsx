"use client"

import { useState } from "react"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { Calendar, Clock } from "lucide-react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import BusLogo from "../../images/Logo/buslogo.png"
import { Link } from "react-router-dom";


const NewBusBill = () => {
  const [formData, setFormData] = useState({
    billNumber: "",
    admissionNumber: "",
    studentName: "",
    standard: "",
    section: "",
    fatherName: "",
    placeName: "",
    busRouteNumber: "",
    monthTerm: "",
    totalBalanceAmount: "",
    feeAmount: "",
    balanceAmount: "",
    concessPercentage: "",
    concessHead: "",
    enterConcess: "",
    paymentMode: "",
    chequeNumber: "",
    date: "",
    time: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  return (
    <MainContentPage>
      <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link >Transaction
            </Link>
            <span className="separator mx-2">&gt;</span>
            <span>New Bus Bill</span>
          </nav>
        </div>
      <div className="bus-van-bill-container">
        {/* Header */}
        <div className="header custom-btn-clr">
          <Container fluid>
            <Row className="align-items-center">
              <div className="col-12 col-lg-4 d-flex align-items-center justify-content-between d-md-flex">
                <img src={BusLogo || "/placeholder.svg"} alt="School Bus" className="img-fluid col-3 ms-lg-3" />
                <h1 className="mb-0 me-lg-5 me-3 " style={{ fontSize: "24px" }}>
                  Bus / Van Bill
                </h1>
              </div>
              <div className="col-lg-2"></div>
              <div className="col-12 col-lg-6 mt-3 mt-md-0">
                <Row className="align-items-center">
                  <div className="col-6 col-sm-6 d-flex align-items-center mt-2 mt-sm-0">
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="me-2"
                    />
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div className="col-6 col-sm-6 d-flex align-items-center mt-2 mt-sm-0">
                    <Form.Control
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="me-2"
                    />
                    <Clock className="text-white" size={20} />
                  </div>
                </Row>
              </div>
            </Row>
          </Container>
        </div>

        {/* Main Form */}
        <Container fluid className="py-4">
          <Row>
            {/* Left Column */}
            <Col md={7}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Bill Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Admission Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Student Name</Form.Label>
                  <Form.Select
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  >
                    <option value="">Select Student</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Standard</Form.Label>
                      <Form.Select
                        name="standard"
                        value={formData.standard}
                        onChange={handleChange}
                        style={{ border: "1px solid #0B3D7B" }}
                      >
                        <option value="">Select Standard</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Section</Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        style={{ border: "1px solid #0B3D7B" }}
                      >
                        <option value="">Select Section</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Place Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="placeName"
                    value={formData.placeName}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bus Route Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="busRouteNumber"
                    value={formData.busRouteNumber}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Month / Term</Form.Label>
                  <Form.Select
                    name="monthTerm"
                    value={formData.monthTerm}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  >
                    <option value="">Select Month/Term</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Total Balance Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="totalBalanceAmount"
                    value={formData.totalBalanceAmount}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Fee Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Balance Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="balanceAmount"
                    value={formData.balanceAmount}
                    onChange={handleChange}
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>
              </Form>
            </Col>

            {/* Right Column */}
            <Col md={5}>
              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Enter concess %</Form.Label>
                    <Form.Control
                      type="text"
                      name="concessPercentage"
                      value={formData.concessPercentage}
                      onChange={handleChange}
                      style={{ border: "1px solid #0B3D7B" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Concess Head</Form.Label>
                    <Form.Control
                      type="text"
                      name="concessHead"
                      value={formData.concessHead}
                      onChange={handleChange}
                      style={{ border: "1px solid #0B3D7B" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Group>
                    <Form.Label>Enter Concess</Form.Label>
                    <Form.Control
                      type="text"
                      name="enterConcess"
                      value={formData.enterConcess}
                      onChange={handleChange}
                      style={{ border: "1px solid #0B3D7B" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Payment Mode Section */}
              <div className="payment-mode-section p-3 mb-3 custom-btn-clr">
                <h5>Payment Mode</h5>
                <div className="d-flex gap-4">
                  <Form.Check
                    type="radio"
                    label="Cheque"
                    name="paymentMode"
                    value="cheque"
                    checked={formData.paymentMode === "cheque"}
                    onChange={handleChange}
                    className="text-white"
                  />
                  <Form.Check
                    type="radio"
                    label="DD"
                    name="paymentMode"
                    value="dd"
                    checked={formData.paymentMode === "dd"}
                    onChange={handleChange}
                    className="text-white"
                  />
                  <Form.Check
                    type="radio"
                    label="Cash"
                    name="paymentMode"
                    value="cash"
                    checked={formData.paymentMode === "cash"}
                    onChange={handleChange}
                    className="text-white"
                  />
                </div>

                <Form.Group className="mt-3">
                  <Form.Label className="text-light">Cheque / D.D.Number</Form.Label>
                  <Form.Control type="text" name="chequeNumber" value={formData.chequeNumber} onChange={handleChange} />
                </Form.Group>

                {/* Concession Box */}
                <div className="concession-box mt-3 p-3 bg-white text-dark">
                  <h6>Concession</h6>
                  <Row>
                    <Col>
                      <Form.Group>
                        <Form.Label>Enter Concess %</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Paid:</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col>
                      <Form.Group>
                        <Form.Label>Enter Concess</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group>
                        <Form.Label>Balance:</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>

          {/* Tables Section */}
          <Row className="mt-4">
            <Col md={7}>
              <div className="table-responsive">
                <Table bordered style={{ border: "1px solid #0B3D7B" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                      <th>Month / Term</th>
                      <th>Paid Amount in Rs</th>
                      <th>Balance Amount in Rs</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Col>
            <Col md={5}>
              <div className="table-responsive">
                <Table bordered style={{ border: "1px solid #0B3D7B" }}>
                  <tbody>
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

          {/* Buttons */}
          <Row className="mt-4">
            <div className="col-12 d-flex flex-wrap justify-content-center gap-3">
              <Button className="btn btn-primary flex-grow-1 flex-md-grow-0 custom-btn-clr">Insert</Button>
              <Button className="btn btn-primary flex-grow-1 flex-md-grow-0 custom-btn-clr">Bill Cancel</Button>
              <Button className="btn btn-primary flex-grow-1 flex-md-grow-0 custom-btn-clr">Save</Button>
              <Button className="btn btn-primary flex-grow-1 flex-md-grow-0 custom-btn-clr">View</Button>
              <Button
                className="btn btn-secondary flex-grow-1 flex-md-grow-0"
                style={{ backgroundColor: "#6C757D", border: "none" }}
              >
                Cancel
              </Button>
            </div>
          </Row>
        </Container>
      </div>
      <style jsx>{`
        .custom-btn-clr {
          background-color: #0B3D7B;
          border-color: #0B3D7B;
        }
        .table-responsive {
          overflow-x: auto;
        }
        @media (max-width: 768px) {
          .btn {
            width: 100%;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </MainContentPage>
  )
}

export default NewBusBill

