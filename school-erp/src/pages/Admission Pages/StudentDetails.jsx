import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Container, Table, Button, Form, Modal, Row, Col } from "react-bootstrap"
import { Eye, Filter, FileText } from "lucide-react"
import MainContentPage from "../../components/MainContent/MainContentPage"

const StudentDetails = () => {
  const navigate = useNavigate()
  const [filterModalShow, setFilterModalShow] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    dateOfBirth: "",
    enrollmentDate: "",
    fees: "",
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Sample data
  const studentsData = [
    {
      id: "AFB1246EDF",
      name: "A.Ramachandhiran",
      class: "10th",
      section: "A",
      rollNumber: "124563",
      dateOfBirth: "09-05-2006",
      gender: "Male",
      parentName: "D.Vijayakumar",
      contact: "8648214597",
      fees: "Paid",
      enrollmentDate: "14-07-2010",
    },
    {
      id: "DFV2356DNT",
      name: "H.Jayakumar",
      class: "8th",
      section: "F",
      rollNumber: "546215",
      dateOfBirth: "11-07-2004",
      gender: "Male",
      parentName: "A.Mathivanan",
      contact: "7732456805",
      fees: "Paid",
      enrollmentDate: "11-07-2015",
    },
    {
      id: "MSF5739VBN",
      name: "D.Ganesh",
      class: "2nd",
      section: "B",
      rollNumber: "458632",
      dateOfBirth: "28-12-2014",
      gender: "Male",
      parentName: "P.Ramanujam",
      contact: "6958347512",
      fees: "Due",
      enrollmentDate: "18-07-2018",
    },
    // Add more sample data here
  ]

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    // Implement filter logic here
    setFilterModalShow(false)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilters({
      class: "",
      section: "",
      dateOfBirth: "",
      enrollmentDate: "",
      fees: "",
    })
  }

  const handleViewDetails = (studentId) => {
    navigate(`/admission/EditStudentDetails`)
  }

  return (
    <MainContentPage>
      <Container fluid>
        <div className="student-details card">
          <div className="card-header p-3" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
            <h4 className="mb-0">All Student Details</h4>
          </div>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-flex gap-3 align-items-center">
                <div className="search-box" style={{ width: "300px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Search by class, Section, Name & Teacher"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => setFilterModalShow(true)}
                  style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}
                >
                  <Filter className="me-2" size={16} />
                  SEARCH
                </Button>
              </div>
              <Button variant="success">
                <FileText className="me-2" size={16} />
                Export to Excel
              </Button>
            </div>

            <div className="table-responsive">
              <Table bordered hover className="align-middle">
                <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                  <tr>
                    <th>Student Photo</th>
                    <th>Admission</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Roll Number</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Parent/Guardian Name</th>
                    <th>Contact Information</th>
                    <th>Fees Detail</th>
                    <th>Address</th>
                    <th>Enrollment Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <Link to="#" className="text-primary">
                          View
                        </Link>
                      </td>
                      <td>{student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.section}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.dateOfBirth}</td>
                      <td>{student.gender}</td>
                      <td>{student.parentName}</td>
                      <td>{student.contact}</td>
                      <td>
                        <span
                          className={`badge ${student.fees === "Paid" ? "bg-success" : "bg-danger"}`}
                          style={{ fontSize: "0.85em", padding: "0.35em 0.65em" }}
                        >
                          {student.fees}
                        </span>
                      </td>
                      <td>
                        <Link to="#" className="text-danger">
                          View
                        </Link>
                      </td>
                      <td>{student.enrollmentDate}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleViewDetails(student.id)}
                          style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}
                        >
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-primary"
                className={currentPage === 1 ? "active" : ""}
                onClick={() => setCurrentPage(1)}
              >
                Previous
              </Button>
              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant="outline-primary"
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button variant="outline-primary" onClick={() => setCurrentPage((prev) => prev + 1)}>
                Next
              </Button>
            </div>
          </div>
        </div>

        <Modal show={filterModalShow} onHide={() => setFilterModalShow(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Filter Options</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleFilterSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Class</Form.Label>
                    <Form.Select
                      value={filters.class}
                      onChange={(e) => setFilters((prev) => ({ ...prev, class: e.target.value }))}
                    >
                      <option value="">Select Class</option>
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                      {/* Add more options */}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Section</Form.Label>
                    <Form.Select
                      value={filters.section}
                      onChange={(e) => setFilters((prev) => ({ ...prev, section: e.target.value }))}
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      {/* Add more options */}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date of birth</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateOfBirth}
                      onChange={(e) => setFilters((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Enrollment Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.enrollmentDate}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          enrollmentDate: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Fees</Form.Label>
                <div className="d-flex gap-4">
                  <Form.Check
                    type="radio"
                    label="Paid"
                    name="fees"
                    value="paid"
                    checked={filters.fees === "paid"}
                    onChange={(e) => setFilters((prev) => ({ ...prev, fees: e.target.value }))}
                  />
                  <Form.Check
                    type="radio"
                    label="Due"
                    name="fees"
                    value="due"
                    checked={filters.fees === "due"}
                    onChange={(e) => setFilters((prev) => ({ ...prev, fees: e.target.value }))}
                  />
                </div>
              </Form.Group>

              <div className="d-flex justify-content-between mt-4">
                <Button variant="primary" type="submit" style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}>
                  Show applied filters
                </Button>
                <Button variant="danger" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </MainContentPage>
  )
}

export default StudentDetails

