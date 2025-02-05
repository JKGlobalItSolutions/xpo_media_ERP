import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainContentPage from "../../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col } from "react-bootstrap";


const AttendanceCertificate = () => {
  const [admissionNo, setAdmissionNo] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [daysAttendance, setDaysAttendance] = useState("");
  const [percentage, setPercentage] = useState("");

  const handleReset = () => {
    setAdmissionNo("");
    setCandidateName("");
    setWorkingDays("");
    setDaysAttendance("");
    setPercentage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", {
      admissionNo,
      candidateName,
      workingDays,
      daysAttendance,
      percentage,
    });
  };

  return (
    <MainContentPage>
      <div className="px-lg-3 px-0">
        <Row>
          <Col xs={12}>
            <div className="fee-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator"> &gt; </span>
                <span>Administration</span>
                <span className="separator"> &gt; </span>
                <Link to="/admin/certificate">Certificate Preparation</Link>
                <span className="separator"> &gt; </span>
                <span className="current">Attendance Certificate</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3" style={{ backgroundColor: "#0B3D7B", color: "#fff" }}>
                  <h2 className="m-0">Attendance Certificate</h2>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                      <Col xs={12} md={6}>
                        <Form.Group>
                          <Form.Label>Enter Admission No</Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              as="select"
                              value={admissionNo}
                              onChange={(e) => setAdmissionNo(e.target.value)}
                              className="custom-input"
                            >
                              <option value="">Select an option</option>
                              <option value="1">Admission No 1</option>
                              <option value="2">Admission No 2</option>
                            </Form.Control>
                            <span
                              className="dropdown-icon position-absolute"
                              style={{
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                fontSize: "1.2rem",
                                color: "#495057",
                              }}
                            >
                              ▼
                            </span>
                          </div>
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group>
                          <Form.Label>Enter Candidate Name</Form.Label>
                          <div className="position-relative">
                            <Form.Control
                              as="select"
                              value={candidateName}
                              onChange={(e) => setCandidateName(e.target.value)}
                              className="custom-input"
                            >
                              <option value="">Select an option</option>
                              <option value="John Doe">John Doe</option>
                              <option value="Jane Doe">Jane Doe</option>
                            </Form.Control>
                            <span
                              className="dropdown-icon position-absolute"
                              style={{
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                pointerEvents: "none",
                                fontSize: "1.2rem",
                                color: "#495057",
                              }}
                            >
                              ▼
                            </span>
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label>This is certify that</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={`This is certify that`}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label>No.Of.Working Days</Form.Label>
                          <Form.Control
                            type="number"
                            value={workingDays}
                            onChange={(e) => setWorkingDays(e.target.value)}
                            className="custom-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label>No.Of.Days Attendance</Form.Label>
                          <Form.Control
                            type="number"
                            value={daysAttendance}
                            onChange={(e) => setDaysAttendance(e.target.value)}
                            className="custom-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={4}>
                        <Form.Group>
                          <Form.Label>Percentage</Form.Label>
                          <Form.Control
                            type="number"
                            value={percentage}
                            onChange={(e) => setPercentage(e.target.value)}
                            className="custom-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="button-group mt-4">
                      <Button
                        style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}
                        type="submit"
                        className="px-4 py-2"
                      >
                        Save
                      </Button>
                      <Button
                        variant="danger"
                        type="button"
                        className="px-4 py-2 mx-2"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                      <Button variant="secondary" type="button" className="px-4 py-2">
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </MainContentPage>
  );
};

export default AttendanceCertificate;