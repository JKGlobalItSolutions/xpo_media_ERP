import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from "react-bootstrap"

const OtherCandidates = () => {
  const [standard, setStandard] = useState("")
  const [feeHeading, setFeeHeading] = useState("")
  const [feeAmount, setFeeAmount] = useState("")
  const [feeHeadings, setFeeHeadings] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (feeHeading && feeAmount) {
      setFeeHeadings([...feeHeadings, { heading: feeHeading, amount: feeAmount }])
      setFeeHeading("")
      setFeeAmount("")
    }
  }

  const handleReset = () => {
    setStandard("")
    setFeeHeading("")
    setFeeAmount("")
    setFeeHeadings([])
  }

  const totalFee = feeHeadings.reduce((sum, fee) => sum + Number.parseFloat(fee.amount || 0), 0)

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              <h2>Students</h2>
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span to="">Administration</span>
                <span className="separator">&gt;</span>
                <Link to="/admin/tuition-setup">Tuition Fee Setup</Link>
                <span className="separator">&gt;</span>
                <span className="current">Other Candidates</span>
              </nav>

              <div className="form-card mt-3">
                <div className="header p-3">
                  <h2 className="m-0 d-none d-lg-block ">Student Fee Setup-Others Candidates</h2>
                  <h6 className="m-0 d-lg-none ">Student Fee Setup-Others Candidates</h6>
                </div>

                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                      <Col xs={12} md={6} lg={4}>
                        <Form.Group>
                          <Form.Label>Select Standard</Form.Label>
                          <Form.Select value={standard} onChange={(e) => setStandard(e.target.value)}>
                            <option value="">Select Standard</option>
                            <option value="3rd Standard">3rd Standard</option>
                            <option value="4th Standard">4th Standard</option>
                            <option value="5th Standard">5th Standard</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6} lg={4}>
                        <Form.Group>
                          <Form.Label>Select Fee Heading</Form.Label>
                          <Form.Select value={feeHeading} onChange={(e) => setFeeHeading(e.target.value)}>
                            <option value="">Select Fee Heading</option>
                            <option value="2nd term fee">2nd term fee</option>
                            <option value="1st term fee">1st term fee</option>
                            <option value="3rd term fee">3rd term fee</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6} lg={4}>
                        <Form.Group>
                          <Form.Label>Fee</Form.Label>
                          <Form.Control
                            type="number"
                            value={feeAmount}
                            onChange={(e) => setFeeAmount(e.target.value)}
                            placeholder="Enter fee amount"
                          />
                        </Form.Group>
                      </Col>
                      {/* <Col xs={12} md={6} lg={3}>
                        <Form.Group>
                          <Form.Label>Total Fee</Form.Label>
                          <Form.Control type="text" value={totalFee.toFixed(2)} readOnly />
                        </Form.Group>
                      </Col> */}
                    </Row>


                    <Row>
                      
                      <Col xs={12} md={6} lg={9}>
                        <div className="fee-table">
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Select Fee Heading</th>
                                <th>Amount in Rs</th>
                              </tr>
                            </thead>
                            <tbody>
                              {feeHeadings.map((fee, index) => (
                                <tr key={index}>
                                  <td>{fee.heading}</td>
                                  <td>{fee.amount}</td>
                                </tr>
                              ))}
                              {[...Array(4 - feeHeadings.length)].map((_, index) => (
                                <tr key={`empty-${index}`}>
                                  <td>&nbsp;</td>
                                  <td>&nbsp;</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Col>
                    
                    </Row>
                    <Row>
                    <Col xs={12} md={6} lg={3}>
                        <Form.Group>
                          <Form.Label>Total Fee</Form.Label>
                          <Form.Control type="text" value={totalFee.toFixed(2)} readOnly />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mt-3">
                      <Col xs={12}>
                        <div className="d-flex gap-2">
                          <Button variant="primary" type="submit">
                            Save
                          </Button>
                          <Button variant="danger" type="button" onClick={handleReset}>
                            Reset
                          </Button>
                          <Button variant="secondary" type="button">
                            Cancel
                          </Button>
                        </div>
                      </Col>
                    </Row>
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

export default OtherCandidates

