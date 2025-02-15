"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa" // Make sure to install react-icons

// Add Course Modal Component
const AddCourseModal = ({ isOpen, onClose, onConfirm }) => {
  const [className, setClassName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(className)
    setClassName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Course</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Standard/Course Name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="custom-input"
          />
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1100;
          }

          .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
          }

          .modal-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
            text-align: center;
          }

          .modal-body {
            margin-bottom: 1.5rem;
          }

          .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }

          .modal-button {
            padding: 0.5rem 2rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
          }

          .modal-button.confirm {
            background-color: #0B3D7B;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }

          .custom-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
          }
        `}
      </style>
    </div>
  )
}

const CourseSetup = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState([
    { id: "CSE101", name: "Computer Science" },
    { id: "MAT201", name: "Mathematics" },
    { id: "PHY301", name: "Physics" },
    { id: "CHE401", name: "Chemistry" },
  ])

  const handleAddCourse = (className) => {
    const newCourse = {
      id: `CRS${Math.floor(Math.random() * 1000)}`,
      name: className,
    }
    setCourses([...courses, newCourse])
    setIsModalOpen(false)
  }

  const filteredCourses = courses.filter((course) => course.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Standard/Course Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Create Standard/Course Name Setup</h2>
                  <h6 className="m-0 d-lg-none">Create Standard/Course Name Setup</h6>
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    style={{ backgroundColor: "#0B3D7B", borderColor: "#0B3D7B" }}
                  >
                    + Add Course
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Course Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Course Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Course Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCourses.map((course) => (
                          <tr key={course.id}>
                            <td>{course.name}</td>
                            <td>
                              <Button variant="link" className="p-0 text-primary me-2">
                                <FaEdit />
                              </Button>
                              <Button variant="link" className="p-0 text-danger">
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Add Course Modal */}
      <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleAddCourse} />

      <style>
        {`
          .course-setup-container {
            background-color: #fff;
          }

          .custom-breadcrumb {
            padding: 0.5rem 1rem;
          }

          .custom-breadcrumb a {
            color: #0B3D7B;
            text-decoration: none;
          }

          .custom-breadcrumb .separator {
            margin: 0 0.5rem;
            color: #6c757d;
          }

          .custom-breadcrumb .current {
            color: #212529;
          }

          .form-card {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
          }

          .header {
            border-bottom: 1px solid #dee2e6;
          }

          .custom-search {
            max-width: 300px;
          }

          .table-responsive {
            margin-bottom: 0;
          }

          .table th {
            font-weight: 500;
          }

          .table td {
            vertical-align: middle;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default CourseSetup

