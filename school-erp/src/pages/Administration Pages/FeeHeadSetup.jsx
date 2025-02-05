import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import './FeeHeadSetup.css';

const FeeHeadSetup = () => {
  const [feeHead, setFeeHead] = useState('');
  const [accountHead, setAccountHead] = useState('');
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Fee Head:', feeHead);
    console.log('Account Head:', accountHead);
  };

  const handleReset = () => {
    setFeeHead('');
    setAccountHead('');
  };

  return (
    <MainContentPage>
      <Container fluid className="px-3">
        <Row>
          <Col xs={12}>
            <div className="fee-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span>Administration</span>
                <span className="separator">&gt;</span>
                <span className="current">Fee Head Setup</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3">
                  <h2 className="m-0">Fee Head Setup</h2>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                      <Col xs={12} md={4} className="label-col mb-2 mb-md-0">
                        <Form.Label className="mb-0">Enter New Fee Head</Form.Label>
                      </Col>
                      <Col xs={12} md={8}>
                        <Form.Control
                          type="text"
                          placeholder="1 term"
                          value={feeHead}
                          onChange={(e) => setFeeHead(e.target.value)}
                          className="custom-input"
                        />
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col xs={12} md={4} className="label-col mb-2 mb-md-0">
                        <Form.Label className="mb-0">Enter Account Head</Form.Label>
                      </Col>
                      <Col xs={12} md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Name of the fee account transfer"
                          value={accountHead}
                          onChange={(e) => setAccountHead(e.target.value)}
                          className="custom-input"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={12}>
                        <div className="button-group mt-4">
                          <Button 
                            variant="primary" 
                            type="submit"
                            className="create-fee-btn px-4 py-2"
                          >
                            Create Fee Head
                          </Button>
                          <Button 
                            variant="danger" 
                            type="button"
                            className="reset-btn px-4 py-2"
                            onClick={handleReset}
                          >
                            Reset
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

export default FeeHeadSetup;