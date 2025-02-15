import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import MainContentPage from '../../../components/MainContent/MainContentPage';
import { Link, useLocation } from "react-router-dom";


const StaffMaster = () => {
  const [formData, setFormData] = useState({
    staffCode: '',
    name: '',
    familyHeadName: '',
    numberStreetName: '',
    placePinCode: '',
    district: '',
    gender: '',
    dateOfBirth: '',
    community: '',
    caste: '',
    religion: '',
    designation: '',
    educationQualification: '',
    salary: '',
    pfNumber: '',
    category: '',
    maritalStatus: '',
    majorSubject: '',
    optionalSubject: '',
    extraTalentDlNo: '',
    experience: '',
    classInCharge: '',
    dateOfJoining: '',
    emailBankAcId: '',
    totalLeaveDays: '',
    mobileNumber: '',
    status: '',
    dateOfRelieve: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Add your form submission logic here
  };

  const handleReset = () => {
    setFormData({
      staffCode: '',
      name: '',
      familyHeadName: '',
      numberStreetName: '',
      placePinCode: '',
      district: '',
      gender: '',
      dateOfBirth: '',
      community: '',
      caste: '',
      religion: '',
      designation: '',
      educationQualification: '',
      salary: '',
      pfNumber: '',
      category: '',
      maritalStatus: '',
      majorSubject: '',
      optionalSubject: '',
      extraTalentDlNo: '',
      experience: '',
      classInCharge: '',
      dateOfJoining: '',
      emailBankAcId: '',
      totalLeaveDays: '',
      mobileNumber: '',
      status: '',
      dateOfRelieve: ''
    });
  };

  return (
  <MainContentPage>
      <div>
      <div className="mb-4">
                <nav className="custom-breadcrumb py-1 py-lg-3">
                  <Link to="/home">Home</Link>
                  <span className="separator mx-2">&gt;</span>
                  <Link>Administration</Link>
                  <span className="separator mx-2">&gt;</span>
                  <span>Staff Master</span>
                </nav>
              </div>
      <div style={{backgroundColor:"#0B3D7B"}} className=" text-white p-3 rounded-top">
        <h2>New Staff Adding</h2>
      </div>
      
      <div className="bg-white p-4 rounded-bottom shadow">
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Left Column */}
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Staff Code</Form.Label>
                <Form.Control
                  type="text"
                  name="staffCode"
                  value={formData.staffCode}
                  onChange={handleInputChange}
                  placeholder="Enter staff code"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Family Head Name</Form.Label>
                <Form.Control
                  type="text"
                  name="familyHeadName"
                  value={formData.familyHeadName}
                  onChange={handleInputChange}
                  placeholder="Enter family head name"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Number & Street Name</Form.Label>
                <Form.Control
                  type="text"
                  name="numberStreetName"
                  value={formData.numberStreetName}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Place/Pin Code</Form.Label>
                <Form.Control
                  type="text"
                  name="placePinCode"
                  value={formData.placePinCode}
                  onChange={handleInputChange}
                  placeholder="Enter place and pin code"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>District</Form.Label>
                <Form.Select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                >
                  <option value="">Select District</option>
                  {/* Add district options */}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date Of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Community</Form.Label>
                <Form.Select
                  name="community"
                  value={formData.community}
                  onChange={handleInputChange}
                >
                  <option value="">Select Community</option>
                  {/* Add community options */}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Caste</Form.Label>
                <Form.Select
                  name="caste"
                  value={formData.caste}
                  onChange={handleInputChange}
                >
                  <option value="">Select Caste</option>
                  {/* Add caste options */}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Religion</Form.Label>
                <Form.Select
                  name="religion"
                  value={formData.religion}
                  onChange={handleInputChange}
                >
                  <option value="">Select Religion</option>
                  {/* Add religion options */}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Designation</Form.Label>
                <Form.Select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                >
                  <option value="">Select Designation</option>
                  {/* Add designation options */}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Middle Column */}
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Education Qualification</Form.Label>
                <Form.Control
                  type="text"
                  name="educationQualification"
                  value={formData.educationQualification}
                  onChange={handleInputChange}
                  placeholder="Enter qualification"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Salary</Form.Label>
                <Form.Control
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="Enter salary"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>P.F.Number</Form.Label>
                <Form.Control
                  type="text"
                  name="pfNumber"
                  value={formData.pfNumber}
                  onChange={handleInputChange}
                  placeholder="Enter PF number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {/* Add category options */}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Marital Status</Form.Label>
                <Form.Select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                >
                  <option value="">Select Marital Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Major Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="majorSubject"
                  value={formData.majorSubject}
                  onChange={handleInputChange}
                  placeholder="Enter major subject"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Optional Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="optionalSubject"
                  value={formData.optionalSubject}
                  onChange={handleInputChange}
                  placeholder="Enter optional subject"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Extra Talent/Dl.No</Form.Label>
                <Form.Control
                  type="text"
                  name="extraTalentDlNo"
                  value={formData.extraTalentDlNo}
                  onChange={handleInputChange}
                  placeholder="Enter extra talent/DL number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience</Form.Label>
                <Form.Select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                >
                  <option value="">Select Experience</option>
                  {/* Add experience options */}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Class IN charge</Form.Label>
                <Form.Control
                  type="text"
                  name="classInCharge"
                  value={formData.classInCharge}
                  onChange={handleInputChange}
                  placeholder="Enter class in charge"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date Of Joining</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>

            {/* Right Column */}
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Email/Bank A/C ID</Form.Label>
                <Form.Control
                  type="text"
                  name="emailBankAcId"
                  value={formData.emailBankAcId}
                  onChange={handleInputChange}
                  placeholder="Enter email/bank account ID"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Total Leave Days</Form.Label>
                <Form.Control
                  type="number"
                  name="totalLeaveDays"
                  value={formData.totalLeaveDays}
                  onChange={handleInputChange}
                  placeholder="Enter total leave days"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date Of Relieve</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfRelieve"
                  value={formData.dateOfRelieve}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Form Buttons */}
          <Row className="mt-4">
            <Col className="d-flex justify-content-center gap-3">
              <Button type="submit" variant="primary">
                Save
              </Button>
              <Button type="button" variant="danger" onClick={handleReset}>
                Reset
              </Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  </MainContentPage>
  );
};

export default StaffMaster;