"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container } from "react-bootstrap";

const PlaceSetup = () => {
  const [formData, setFormData] = useState({
    placeName: "",
    routeNumber: "",
    fee: "",
    driverName: "",
    conductorName: "",
  });

  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
  };

  const handleReset = () => {
    setFormData({
      placeName: "",
      routeNumber: "",
      fee: "",
      driverName: "",
      conductorName: "",
    });
  };

  // Sample data for dropdowns
  const drivers = ["Driver 1", "Driver 2", "Driver 3"];
  const conductors = ["Conductor 1", "Conductor 2", "Conductor 3"];

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
                <span className="current col-12">Place Setup</span>
              </nav>

              {/* Main Form Section */}
              <div className="form-section">
                {/* Header */}
                <div
                  style={{
                    backgroundColor: "#0B3D7B",
                    color: "white",
                    padding: "15px 20px",
                    fontSize: "24px",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                  }}
                >
                  Van / Bus Route Place Setup
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
                      <Form.Label style={{ fontSize: "18px" }}>
                        Place Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="placeName"
                        value={formData.placeName}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>
                        Route Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="routeNumber"
                        value={formData.routeNumber}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>
                        Van / Bus Fee
                      </Form.Label>
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

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>
                        Driver Name
                      </Form.Label>
                      <Form.Select
                        name="driverName"
                        value={formData.driverName}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Select Driver</option>
                        {drivers.map((driver, index) => (
                          <option key={index} value={driver}>
                            {driver}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontSize: "18px" }}>
                        Conductor Name
                      </Form.Label>
                      <Form.Select
                        name="conductorName"
                        value={formData.conductorName}
                        onChange={handleChange}
                        style={{
                          height: "45px",
                          border: "1px solid #0B3D7B",
                          borderRadius: "4px",
                        }}
                      >
                        <option value="">Select Conductor</option>
                        {conductors.map((conductor, index) => (
                          <option key={index} value={conductor}>
                            {conductor}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                  

                    <Row className="mt-4">
                      <div className="col-12 d-flex flex-wrap justify-content-center gap-3">
                        <Button
                          className="btn btn-primary flex-grow-1 flex-md-grow-0"
                          style={{ backgroundColor: "#0B3D7B", border: "none" }}
                        >
                          Insert
                        </Button>
                       
                        <Button
                          className="btn btn-primary flex-grow-1 flex-md-grow-0"
                          style={{ backgroundColor: "#0B3D7B", border: "none" }}
                        >
                          Save
                        </Button>
                      
                        <Button
                          className="btn btn-secondary flex-grow-1 flex-md-grow-0"
                          style={{ backgroundColor: "#6C757D", border: "none" }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Row>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </MainContentPage>
  );
};

export default PlaceSetup;
