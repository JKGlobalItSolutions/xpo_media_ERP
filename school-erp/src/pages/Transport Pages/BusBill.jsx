"use client"

import { useState } from "react"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { Calendar, Clock } from "lucide-react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import BusLogo from "../../images/Logo/buslogo.png"
import { Link } from "react-router-dom"

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
      <div className="mb-2">
        <nav className="custom-breadcrumb py-1">
          <Link to="/home">Home</Link>
          <span className="separator mx-2">&gt;</span>
          <div>Transaction</div>
          <span className="separator mx-2">&gt;</span>
          <span>New Bus Bill</span>
        </nav>
      </div>
      <div className="bus-van-bill-container">
        {/* Header */}
        <div className="header custom-btn-clr">
          <Container fluid className="py-2">
            <Row className="align-items-center">
              <Col xs={12} lg={6} className="d-flex align-items-center">
                <img
                  src={BusLogo || "/placeholder.svg"}
                  alt="School Bus"
                  className="img-fluid me-2"
                  style={{ width: "40px", height: "40px" }}
                />
                <h1 className="mb-0" style={{ fontSize: "20px" }}>
                  Bus / Van Bill
                </h1>
              </Col>
              <Col xs={12} lg={6} className="mt-2 mt-lg-0">
                <Row className="align-items-center">
                  <Col xs={6} className="d-flex align-items-center">
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="me-2"
                    />
                    <Calendar className="text-white" size={16} />
                  </Col>
                  <Col xs={6} className="d-flex align-items-center">
                    <Form.Control
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="me-2"
                    />
                    <Clock className="text-white" size={16} />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>

        {/* Main Form */}
        <Container fluid className="py-2">
          <Row>
            {/* Left Column */}
            <Col md={4}>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Bill Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Admission Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Student Name</Form.Label>
                  <Form.Select
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  >
                    <option value="">Select Student</option>
                  </Form.Select>
                </Form.Group>

                <Row>
                  <Col xs={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1">Standard</Form.Label>
                      <Form.Select
                        name="standard"
                        value={formData.standard}
                        onChange={handleChange}
                        className="form-control-sm"
                        style={{ border: "1px solid #0B3D7B" }}
                      >
                        <option value="">Select</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1">Section</Form.Label>
                      <Form.Select
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="form-control-sm"
                        style={{ border: "1px solid #0B3D7B" }}
                      >
                        <option value="">Select</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>
              </Form>
            </Col>

            {/* Middle Column */}
            <Col md={4}>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Place Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="placeName"
                    value={formData.placeName}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Bus Route Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="busRouteNumber"
                    value={formData.busRouteNumber}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Month / Term</Form.Label>
                  <Form.Select
                    name="monthTerm"
                    value={formData.monthTerm}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  >
                    <option value="">Select</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Total Balance Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="totalBalanceAmount"
                    value={formData.totalBalanceAmount}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Fee Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="feeAmount"
                    value={formData.feeAmount}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1">Balance Amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="balanceAmount"
                    value={formData.balanceAmount}
                    onChange={handleChange}
                    className="form-control-sm"
                    style={{ border: "1px solid #0B3D7B" }}
                  />
                </Form.Group>
              </Form>
            </Col>

            {/* Right Column */}
            <Col md={4}>
              <Row className="mb-2">
                <Col>
                  <Form.Group>
                    <Form.Label className="mb-1">Enter concess %</Form.Label>
                    <Form.Control
                      type="text"
                      name="concessPercentage"
                      value={formData.concessPercentage}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ border: "1px solid #0B3D7B" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col>
                  <Form.Group>
                    <Form.Label className="mb-1">Concess Head</Form.Label>
                    <Form.Control
                      type="text"
                      name="concessHead"
                      value={formData.concessHead}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ border: "1px solid #0B3D7B" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col>
                  <Form.Group>
                    <Form.Label className="mb-1">Enter Concess</Form.Label>
                    <Form.Control
                      type="text"
                      name="enterConcess"
                      value={formData.enterConcess}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ border: "1px solid #0B3D7B" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Payment Mode Section */}
              <div className="payment-mode-section p-2 mb-2 custom-btn-clr">
                <h6 className="text-white mb-2">Payment Mode</h6>
                <div className="d-flex gap-3 mb-2">
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

                <Form.Group className="mb-2">
                  <Form.Label className="text-light mb-1">Cheque / D.D.Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="chequeNumber"
                    value={formData.chequeNumber}
                    onChange={handleChange}
                    className="form-control-sm"
                  />
                </Form.Group>

                {/* Concession Box */}
                <div className="concession-box p-2 bg-white text-dark">
                  <h6 className="mb-2">Concession</h6>
                  <Row className="mb-2">
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="mb-1">Enter Concess %</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="mb-1">Paid:</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="mb-1">Enter Concess</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                    <Col xs={6}>
                      <Form.Group>
                        <Form.Label className="mb-1">Balance:</Form.Label>
                        <Form.Control type="text" size="sm" />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>

          {/* Tables Section */}
          <Row className="mt-2">
            <Col md={8}>
              <div className="table-responsive">
                <Table bordered size="sm" style={{ border: "1px solid #0B3D7B" }}>
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
            <Col md={4}>
              <div className="table-responsive">
                <Table bordered size="sm" style={{ border: "1px solid #0B3D7B" }}>
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
          <Row className="mt-3">
            <div className="col-12 d-flex flex-wrap justify-content-center gap-2">
              <Button className="btn btn-primary btn-sm flex-grow-1 flex-md-grow-0 custom-btn-clr">Insert</Button>
              <Button className="btn btn-primary btn-sm flex-grow-1 flex-md-grow-0 custom-btn-clr">Bill Cancel</Button>
              <Button className="btn btn-primary btn-sm flex-grow-1 flex-md-grow-0 custom-btn-clr">Save</Button>
              <Button className="btn btn-primary btn-sm flex-grow-1 flex-md-grow-0 custom-btn-clr">View</Button>
              <Button
                className="btn btn-secondary btn-sm flex-grow-1 flex-md-grow-0"
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
            margin-bottom: 5px;
          }
        }
      `}</style>
    </MainContentPage>
  )
}

export default NewBusBill

