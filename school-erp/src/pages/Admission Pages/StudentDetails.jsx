"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Container, Table, Card, Row, Col, Form, Button, Modal, Pagination } from "react-bootstrap"
import { FaEdit, FaFilter, FaTable, FaTh } from "react-icons/fa"

const StudentDetails = () => {
  const [students] = useState([
    {
      id: 1,
      admission: "AFB1246EDF",
      name: "A.Ramachandhiran",
      class: "10th",
      section: "A",
      rollNumber: "124563",
      dateOfBirth: "09-05-2006",
      gender: "Male",
      parentName: "D.Vijayakumar",
      contact: "8648214697",
      fees: "Paid",
      address: "View",
      enrollmentDate: "14-07-2010",
    },
    {
      id: 2,
      admission: "DFV2356DNT",
      name: "H.Jayakumar",
      class: "8th",
      section: "F",
      rollNumber: "546215",
      dateOfBirth: "11-07-2004",
      gender: "Male",
      parentName: "A.Mathivanan",
      contact: "7732456855",
      fees: "Paid",
      address: "View",
      enrollmentDate: "11-07-2013",
    },
    {
      id: 3,
      admission: "MSF5739VBN",
      name: "D.Ganesh",
      class: "2nd",
      section: "B",
      rollNumber: "458632",
      dateOfBirth: "28-12-2014",
      gender: "Male",
      parentName: "P.Ramanujam",
      contact: "6958147512",
      fees: "Due",
      address: "View",
      enrollmentDate: "18-07-2018",
    },
    {
      id: 4,
      admission: "CNV6806GHM",
      name: "K.Kalim",
      class: "4th",
      section: "C",
      rollNumber: "124567",
      dateOfBirth: "14-09-2016",
      gender: "Male",
      parentName: "V.Ravichandhiran",
      contact: "8801564932",
      fees: "Paid",
      address: "View",
      enrollmentDate: "12-07-2019",
    },
    {
      id: 5,
      admission: "LOD5679DER",
      name: "M.Yuvashri",
      class: "1st",
      section: "G",
      rollNumber: "854125",
      dateOfBirth: "03-10-2021",
      gender: "Female",
      parentName: "K.Balakrishana",
      contact: "9456265612",
      fees: "Due",
      address: "View",
      enrollmentDate: "23-07-2023",
    },
    {
      id: 6,
      admission: "GNC3686GKM",
      name: "E.Ellamaran",
      class: "8th",
      section: "D",
      rollNumber: "456752",
      dateOfBirth: "17-08-2007",
      gender: "Male",
      parentName: "P.Elangovan",
      contact: "9963243125",
      fees: "Paid",
      address: "View",
      enrollmentDate: "10-07-2010",
    },
    {
      id: 7,
      admission: "CVB4675GHU",
      name: "S.Vignesh Kumar",
      class: "12th",
      section: "A",
      rollNumber: "145678",
      dateOfBirth: "21-04-2002",
      gender: "Male",
      parentName: "R.Dhanajayan",
      contact: "8456321504",
      fees: "Paid",
      address: "View",
      enrollmentDate: "12-07-2005",
    },
    {
      id: 8,
      admission: "EDF567THU",
      name: "B.Bharath",
      class: "12th",
      section: "C",
      rollNumber: "657457",
      dateOfBirth: "09-06-2002",
      gender: "Male",
      parentName: "H.Keerthivasan",
      contact: "9548461524",
      fees: "Paid",
      address: "View",
      enrollmentDate: "14-07-2005",
    },
  ])

  const [viewType, setViewType] = useState("table")
  const [showFilter, setShowFilter] = useState(false)
  const [filterData, setFilterData] = useState({
    class: "",
    section: "",
    dateOfBirth: "",
    enrollmentDate: "",
    fees: "",
  })

  const navigate = useNavigate()

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilterData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFilterSubmit = () => {
    // Implement filter logic here
    setShowFilter(false)
  }

  const handleFilterReset = () => {
    setFilterData({
      class: "",
      section: "",
      dateOfBirth: "",
      enrollmentDate: "",
      fees: "",
    })
  }

  return (
    <MainContentPage>
      <Container fluid className="px-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Student Details</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/home" className="text-decoration-none">
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/administration" className="text-decoration-none">
                    Admission
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Student Details
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            {/* Title and Search Section */}
            <div className="mb-4">
              <h5 className="text-primary mb-3">All Student Detail</h5>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="d-flex flex-column flex-md-row gap-2 mb-3 mb-md-0 w-100 w-md-auto">
                  <Form.Control
                    type="text"
                    placeholder="Search by class, Section, Name & Teacher"
                    className="flex-grow-1"
                  />
                  <Button className="custom-btn-clr w-auto w-md-auto">SEARCH</Button>
                </div>
                <div className="d-flex gap-2 justify-content-lg-end justify-content-center w-100 w-md-auto">
                  <Button
                    variant={viewType === "table" ? "primary" : "outline-primary"}
                    onClick={() => setViewType("table")}
                    className="px-3 custom-btn-clr"
                  >
                    <FaTable />
                  </Button>
                  <Button
                    variant={viewType === "card" ? "primary" : "outline-primary"}
                    onClick={() => setViewType("card")}
                    className="px-3 custom-btn-clr"
                  >
                    <FaTh />
                  </Button>
                  <Button variant="primary" onClick={() => setShowFilter(true)} className="px-3 custom-btn-clr">
                    <FaFilter />
                  </Button>
                </div>
              </div>
            </div>

            {/* Student List Views */}
            {viewType === "card" ? (
              <Row className="g-4">
                {students.map((student) => (
                  <Col key={student.id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="h-100 shadow-sm position-relative">
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2"
                        style={{ zIndex: 1 }}
                        onClick={() => navigate(`/admission/EditStudentDetails`)}
                      >
                        <FaEdit />
                      </Button>
                      <div className="text-center pt-4">
                        <div
                          className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: "100px",
                            height: "100px",
                            backgroundColor: "#007bff",
                            color: "white",
                          }}
                        >
                          <i className="fas fa-user fa-3x"></i>
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <div className="mb-3">
                          <div className="text-muted small">Admission</div>
                          <div className="fw-bold text-primary">{student.admission}</div>
                        </div>
                        <div className="mb-3">
                          <div className="text-muted small">Name</div>
                          <div>{student.name}</div>
                        </div>
                        <div className="d-flex justify-content-around">
                          <div>
                            <div className="text-muted small">Class</div>
                            <div>{student.class}</div>
                          </div>
                          <div>
                            <div className="text-muted small">Section</div>
                            <div>{student.section}</div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="table-responsive">
                <Table className="table-bordered">
                  <thead>
                    <tr>
                      <th className="py-2 text-white custom-btn-clr">Student Photo</th>
                      <th className="py-2 text-white custom-btn-clr">Admission</th>
                      <th className="py-2 text-white custom-btn-clr">Name</th>
                      <th className="py-2 text-white custom-btn-clr">Class</th>
                      <th className="py-2 text-white custom-btn-clr">Section</th>
                      <th className="py-2 text-white custom-btn-clr">Roll Number</th>
                      <th className="py-2 text-white custom-btn-clr">Date of Birth</th>
                      <th className="py-2 text-white custom-btn-clr">Gender</th>
                      <th className="py-2 text-white custom-btn-clr">Parent/Guardian Name</th>
                      <th className="py-2 text-white custom-btn-clr">Contact Information</th>
                      <th className="py-2 text-white custom-btn-clr">Fees Detail</th>
                      <th className="py-2 text-white custom-btn-clr">Address</th>
                      <th className="py-2 text-white custom-btn-clr">Enrollment Date</th>
                      <th className="py-2 text-white custom-btn-clr">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <Button variant="link" className="p-0 text-primary text-decoration-none">
                            View
                          </Button>
                        </td>
                        <td>{student.admission}</td>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td>{student.section}</td>
                        <td>{student.rollNumber}</td>
                        <td>{student.dateOfBirth}</td>
                        <td>{student.gender}</td>
                        <td>{student.parentName}</td>
                        <td>{student.contact}</td>
                        <td>
                          <span className={`text-${student.fees === "Paid" ? "success" : "danger"}`}>
                            {student.fees}
                          </span>
                        </td>
                        <td>
                          <Button variant="link" className="p-0 text-primary text-decoration-none">
                            {student.address}
                          </Button>
                        </td>
                        <td>{student.enrollmentDate}</td>
                        <td>
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              style={{ backgroundColor: "#004AAD", marginRight: "5px" }}
                              onClick={() => navigate(`/admission/EditStudentDetails`)}
                            >
                              <FaEdit />
                            </Button>
                          </>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            <div className="d-flex justify-content-end gap-1 mt-4">
              <Button variant="outline-primary" disabled>
                Previous
              </Button>
              <Button className="custom-btn-clr">1</Button>
              <Button variant="outline-primary">2</Button>
              <Button variant="outline-primary">3</Button>
              <Button variant="outline-primary">Next</Button>
            </div>
          </Card.Body>
        </Card>

        {/* Updated Filter Modal */}
        <Modal show={showFilter} onHide={() => setShowFilter(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Filter</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Class</Form.Label>
                    <Form.Select name="class" value={filterData.class} onChange={handleFilterChange}>
                      <option value="">Select Class</option>
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select name="section" value={filterData.section} onChange={handleFilterChange}>
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={filterData.dateOfBirth}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enrollment Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="enrollmentDate"
                      value={filterData.enrollmentDate}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Fees</Form.Label>
                <div className="d-flex gap-2">
                  <Button
                    variant={filterData.fees === "paid" ? "secondary" : "light"}
                    className="flex-grow-1"
                    onClick={() => handleFilterChange({ target: { name: "fees", value: "paid" } })}
                  >
                    Paid
                  </Button>
                  <Button
                    variant={filterData.fees === "due" ? "secondary" : "light"}
                    className="flex-grow-1"
                    onClick={() => handleFilterChange({ target: { name: "fees", value: "due" } })}
                  >
                    Due
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="flex-column flex-md-row justify-content-between">
            <Button
              variant="primary"
              onClick={handleFilterSubmit}
              style={{ backgroundColor: "#004AAD" }}
              className="px-4 w-100 w-md-auto mb-2 mb-md-0"
            >
              Show applied filters
            </Button>
            <Button variant="danger" onClick={handleFilterReset} className="px-4 w-100 w-md-auto">
              Reset
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MainContentPage>
  )
}

export default StudentDetails

