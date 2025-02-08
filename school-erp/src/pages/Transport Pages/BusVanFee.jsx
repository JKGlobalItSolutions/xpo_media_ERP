import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';

const BusVanFee = () => {
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
                <span>Transport</span>
                <span className="separator">&gt;</span>
                <span className="current col-12">Bus / Van Fee Head Setup</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header custom-btn-clr p-3">
                  <h2 className="m-0 d-none d-lg-block">Bus / Van Fee Heading Setup</h2>
                  <h6 className="m-0 d-lg-none">Bus / Van Fee Heading Setup</h6>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Enter New Fee Head</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          placeholder="Add Class"
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
                            type="submit"
                            className="add-program-btn px-4 py-2 custom-btn-clr"
                          >
                            Insert
                          </Button>
                          <Button 
                            variant="danger" 
                            type="button"
                            className="reset-btn px-4 py-2"
                            onClick={handleReset}
                          >
                            Save
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

export default BusVanFee;