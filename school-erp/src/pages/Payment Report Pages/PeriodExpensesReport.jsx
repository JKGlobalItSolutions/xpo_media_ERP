import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';

const PeriodExpensesReport = () => {
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
              <nav className=" py-1 py-lg-3">
                <Link className='text-decoration-none' to="/home">Home</Link>
                <span className="separator ms-2 ">&gt;</span>
                <Link to="/payment-report" className='ms-2 text-decoration-none ' >Payment Reports</Link>
                <span className="separator ms-2  ">&gt;</span>
                <span className=" ms-2 current col-12  ">Period  Expenses Report</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header custom-btn-clr p-3">
                  <h2 className="m-0 d-none d-lg-block">Period  Expenses Report</h2>
                  <h6 className="m-0 d-lg-none">Period  Expenses Report</h6>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Select Starting Date</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="date"
                          placeholder="Add Class"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Select Ending Date</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="date"
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
                            Generate
                          </Button>
                          <Button 
                            variant="danger" 
                            type="button"
                            className="reset-btn px-4 py-2"
                            onClick={handleReset}
                          >
                            View
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

export default PeriodExpensesReport;