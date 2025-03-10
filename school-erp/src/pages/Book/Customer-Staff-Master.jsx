import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from 'react-bootstrap';

const CustomerStaffMaster = () => {
  const [className, setClassName] = useState('');
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Class Name:', className);
  };

  const handleReset = () => {
    setClassName('');
  };

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
                <span>Administration</span>
                <span className="separator">&gt;</span>
                <span className="current col-12">Customer / Staff Master
                </span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3">
                  <h2 className="m-0 d-none d-lg-block">Customer / Staff master</h2>
                  <h6 className="m-0 d-lg-none">Customer / Staff Master</h6>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Customer / Staff Code</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          placeholder="Enter Your User Name"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Customer / Staff Name</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="password"
                          placeholder="Enter Your Supplier Name"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Address 1</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="password"
                          placeholder="Enter Your Address"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Address 2</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="password"
                          placeholder="Enter Your Address"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Phone Number</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="password"
                          placeholder="Enter Your Phone Number"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">E-Mail</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="password"
                          placeholder="Enter Your E-Mail"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Contact Person</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="password"
                          placeholder="Enter Your Contact Person"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                 

                    <Row>
                      <Col xs={12}>
                        <div className="button-group mt-4">
                          <Button 
                          style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                            type="submit"
                            className="custom-btn-clr px-4 py-2"
                          >
                            New
                          </Button>
                          <Button 
                          style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                            type="submit"
                            className="custom-btn-clr px-4 py-2"
                          >
                            Save
                          </Button>
                          <Button 
                          style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                            type="submit"
                            className="custom-btn-clr px-4 py-2"
                          >
                            View
                          </Button>
                          <Button 
                            variant="danger" 
                            type="button"
                            className="reset-btn px-4 py-2"
                            onClick={handleReset}
                          >
                            Delete
                          </Button>
                          <Button 
                            variant="secondary" 
                            type="button"
                            className="cancel-btn px-4 py-2"
                          >
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
  );
};

export default CustomerStaffMaster;