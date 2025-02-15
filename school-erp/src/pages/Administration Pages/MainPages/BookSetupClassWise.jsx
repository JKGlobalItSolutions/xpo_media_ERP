import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { Form, Button, Row, Col, Container, Table } from 'react-bootstrap';

const BookSetupClassWise = () => {
  const [standard, setStandard] = useState('');
  const [bookName, setBookName] = useState('');
  const [feeHeading, setFeeHeading] = useState('');
  const [amount, setAmount] = useState('');

  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Standard:', standard);
    console.log('Book Name:', bookName);
    console.log('Fee Heading:', feeHeading);
    console.log('Amount:', amount);
  };

  const handleReset = () => {
    setStandard('');
    setBookName('');
    setFeeHeading('');
    setAmount('');
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
                <span className="current col-12">Book Setup Class Wise</span>
              </nav>

              {/* Form Section */}
              <div className="form-container mt-4" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ color: '#0B3D7B', marginBottom: '20px', borderBottom: '2px solid #0B3D7B', paddingBottom: '10px' }}>Student Book Setup</h3>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="formStandard">
                        <Form.Label style={{ fontWeight: 'bold', color: '#0B3D7B' }}>Select Standard</Form.Label>
                        <Form.Control
                          as="select"
                          value={standard}
                          onChange={(e) => setStandard(e.target.value)}
                          required
                          style={{ borderRadius: '5px', borderColor: '#0B3D7B' }}
                        >
                          <option value="">Select Standard</option>
                          <option value="1">Standard 1</option>
                          <option value="2">Standard 2</option>
                          <option value="3">Standard 3</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formBookName">
                        <Form.Label style={{ fontWeight: 'bold', color: '#0B3D7B' }}>Select Book Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="2nd term feeNo's23000"
                          value={bookName}
                          onChange={(e) => setBookName(e.target.value)}
                          required
                          style={{ borderRadius: '5px', borderColor: '#0B3D7B' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col md={6}>
                      <Form.Group controlId="formFeeHeading">
                        <Form.Label style={{ fontWeight: 'bold', color: '#0B3D7B' }}>Select Fee Heading</Form.Label>
                        <Form.Control
                          as="select"
                          value={feeHeading}
                          onChange={(e) => setFeeHeading(e.target.value)}
                          required
                          style={{ borderRadius: '5px', borderColor: '#0B3D7B' }}
                        >
                          <option value="">Select Fee Heading</option>
                          <option value="1">Fee Heading 1</option>
                          <option value="2">Fee Heading 2</option>
                          <option value="3">Fee Heading 3</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formAmount">
                        <Form.Label style={{ fontWeight: 'bold', color: '#0B3D7B' }}>Amount in Rs</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Amount in Rs"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                          style={{ borderRadius: '5px', borderColor: '#0B3D7B' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col xs={12} className="d-flex justify-content-end">
                      <Button variant="primary" type="submit" style={{ backgroundColor: '#0B3D7B', borderColor: '#0B3D7B', marginRight: '10px' }}>
                        Insert
                      </Button>
                      <Button variant="secondary" type="button" onClick={handleReset} style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}>
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {/* Table Section */}
                <div className="mt-5">
                  <h4 style={{ color: '#0B3D7B', marginBottom: '20px' }}>Book List</h4>
                  <Table striped bordered hover>
                    <thead style={{ backgroundColor: '#0B3D7B', color: '#fff' }}>
                      <tr>
                        <th>Standard</th>
                        <th>Book Name</th>
                        <th>Fee Heading</th>
                        <th>Amount (Rs)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>2nd term feeNo's23000</td>
                        <td>Fee Heading 1</td>
                        <td>23000</td>
                        <td>
                          <Button variant="info" size="sm" style={{ marginRight: '5px' }}>Edit</Button>
                          <Button variant="danger" size="sm">Delete</Button>
                        </td>
                      </tr>
                      {/* Add more rows as needed */}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </MainContentPage>
  );
};

export default BookSetupClassWise;