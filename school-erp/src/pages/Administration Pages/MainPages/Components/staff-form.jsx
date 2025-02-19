import { Form, Button, Row, Col } from "react-bootstrap"

const StaffForm = ({ formData, handleInputChange, handleSubmit, handleReset, editingStaffId }) => {
  // Sample data for dropdowns
  const sampleStates = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"]
  const sampleDistricts = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"]
  const sampleCommunities = [
    "Forward Community",
    "Backward Community",
    "Most Backward Community",
    "Scheduled Caste",
    "Scheduled Tribe",
  ]
  const sampleCastes = ["Brahmin", "Yadav", "Reddy", "Nadar", "Thevar"]
  const sampleReligions = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist"]
  const sampleNationalities = ["Indian", "American", "British", "Canadian", "Australian"]

  // Default options for Designation and Category
  const defaultDesignations = [
    "Teacher",
    "Principal",
    "Vice Principal",
    "Administrator",
    "Librarian",
    "Counselor",
    "IT Specialist",
    "Accountant",
  ]

  const defaultCategories = ["Teaching Staff", "Non-Teaching Staff", "Administrative Staff", "Support Staff"]

  return (
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
              required
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
              required
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
            <Form.Label>State</Form.Label>
            <Form.Select name="state" value={formData.state} onChange={handleInputChange}>
              <option value="">Select State</option>
              {sampleStates.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>District</Form.Label>
            <Form.Select name="district" value={formData.district} onChange={handleInputChange}>
              <option value="">Select District</option>
              {sampleDistricts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date Of Birth</Form.Label>
            <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
          </Form.Group>
        </Col>

        {/* Middle Column */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Community</Form.Label>
            <Form.Select name="community" value={formData.community} onChange={handleInputChange}>
              <option value="">Select Community</option>
              {sampleCommunities.map((community, index) => (
                <option key={index} value={community}>
                  {community}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Caste</Form.Label>
            <Form.Select name="caste" value={formData.caste} onChange={handleInputChange}>
              <option value="">Select Caste</option>
              {sampleCastes.map((caste, index) => (
                <option key={index} value={caste}>
                  {caste}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Religion</Form.Label>
            <Form.Select name="religion" value={formData.religion} onChange={handleInputChange}>
              <option value="">Select Religion</option>
              {sampleReligions.map((religion, index) => (
                <option key={index} value={religion}>
                  {religion}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nationality</Form.Label>
            <Form.Select name="nationality" value={formData.nationality} onChange={handleInputChange}>
              <option value="">Select Nationality</option>
              {sampleNationalities.map((nationality, index) => (
                <option key={index} value={nationality}>
                  {nationality}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Designation</Form.Label>
            <Form.Select name="designation" value={formData.designation} onChange={handleInputChange} required>
              <option value="">Select Designation</option>
              {defaultDesignations.map((designation, index) => (
                <option key={index} value={designation}>
                  {designation}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

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
            <Form.Select name="category" value={formData.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              {defaultCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Right Column */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Marital Status</Form.Label>
            <Form.Select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
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
            <Form.Control
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              placeholder="Enter experience"
            />
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
            <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
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

      <div className="d-flex justify-content-end mt-3">
        <Button variant="secondary" onClick={handleReset} className="me-2">
          Reset
        </Button>
        <Button variant="primary" type="submit">
          {editingStaffId ? "Update" : "Save"}
        </Button>
      </div>
    </Form>
  )
}

export default StaffForm

