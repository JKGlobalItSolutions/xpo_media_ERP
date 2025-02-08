import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';

const BusBalanceReport = () => {
  const [formData, setFormData] = useState({
    standard: false,
    term: false,
    route: false,
    status: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
  };

  const handleReset = () => {
    setFormData({
      standard: false,
      term: false,
      route: false,
      status: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <Row>
          <Col xs={12}>
            <div className="course-setup-container" style={{ border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
              {/* Header */}
              <div className="custom-btn-clr" style={{  padding: '20px',  borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
                <h2 className="mb-0">Bus Balance Report</h2>
              </div>

              {/* Form */}
              <Form onSubmit={handleSubmit} className="px-4 py-4">
                {[{ label: 'Standard', name: 'standard' }, { label: 'Term / Month', name: 'term' }, { label: 'Routewise', name: 'route' }].map((field, index) => (
                  <Row className="mb-4 align-items-center" key={index}>
                    <Col md={3} className="d-flex align-items-center">
                      <Form.Check 
                        type="checkbox" 
                        name={field.name} 
                        checked={formData[field.name]} 
                        onChange={handleChange} 
                        className="me-3"
                        style={{ width: '20px', height: '20px', borderColor: '#0B3D7B' }}
                      />
                      <Form.Label className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}>{field.label}</Form.Label>
                    </Col>
                    <Col md={9}>
                      {formData[field.name] && (
                        <Form.Select 
                          name={`${field.name}Select`}
                          onChange={handleChange}
                          style={{ borderColor: '#0B3D7B', borderRadius: '5px', height: '45px' }}
                        >
                          <option value="">Select {field.label}</option>
                        </Form.Select>
                      )}
                    </Col>
                  </Row>
                ))}

                {/* Status Field */}
                <Row className="mb-4 align-items-center">
                  <Col md={3} className="d-flex align-items-center">
                    <div className="me-3" style={{ width: '20px', height: '20px' }}></div>
                    <Form.Label className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}>Status</Form.Label>
                  </Col>
                  <Col md={9}>
                    <Form.Select 
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      style={{ borderColor: '#0B3D7B', borderRadius: '5px', height: '45px' }}
                    >
                      <option value="">Select Status</option>
                    </Form.Select>
                  </Col>
                </Row>

                {/* Buttons */}
                <Row className="justify-content-center gap-3">
                  <Button
                    className="custom-btn-clr"
                    type="submit"
                    style={{ 
                      width: '150px',
                      fontSize: '1.1rem'
                    }}
                  >
                    Process
                  </Button>
                  <Button
                    className="custom-btn-clr"
                    style={{ 
                      border: 'none',
                      width: '100px',
                      fontSize: '1.1rem'
                    }}
                  >
                    View
                  </Button>
                  <Button
                    onClick={handleReset}
                    style={{ 
                      backgroundColor: '#808080',
                      border: 'none',
                      width: '150px',
                      fontSize: '1.1rem'
                    }}
                  >
                    Cancel
                  </Button>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </MainContentPage>
  );
};

export default BusBalanceReport;
