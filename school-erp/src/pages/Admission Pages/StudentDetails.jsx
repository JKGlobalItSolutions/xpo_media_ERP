"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Button, Container, Table, Form, OverlayTrigger, Tooltip, Row, Col, Card } from "react-bootstrap"
import { FaEdit, FaTrash, FaEye, FaCopy, FaTable, FaTh } from "react-icons/fa"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, limit, addDoc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Student</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this student?</p>
          <p className="fw-bold">{itemName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={onConfirm}>
            Delete
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const StudentDetails = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const [students, setStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [viewType, setViewType] = useState("table")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const q = query(adminRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          const newAdminRef = await addDoc(adminRef, { createdAt: new Date() })
          setAdministrationId(newAdminRef.id)
        } else {
          setAdministrationId(querySnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching/creating Administration ID:", error)
        toast.error("Failed to initialize. Please try again.")
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchStudents()
    }
  }, [administrationId])

  const fetchStudents = async () => {
    try {
      // For this example, we'll use dummy data instead of fetching from Firestore
      const dummyStudents = [
        {
          id: "1",
          admissionNumber: "ADM001",
          name: "John Doe",
          class: "10th",
          section: "A",
          dateOfBirth: "2005-05-15",
          gender: "Male",
          parentName: "Jane Doe",
          contact: "1234567890",
          fees: "Paid",
          enrollmentDate: "2020-06-01",
        },
        {
          id: "2",
          admissionNumber: "ADM002",
          name: "Alice Smith",
          class: "9th",
          section: "B",
          dateOfBirth: "2006-08-22",
          gender: "Female",
          parentName: "Bob Smith",
          contact: "9876543210",
          fees: "Due",
          enrollmentDate: "2021-06-01",
        },
        {
          id: "3",
          admissionNumber: "ADM003",
          name: "Charlie Brown",
          class: "11th",
          section: "C",
          dateOfBirth: "2004-12-10",
          gender: "Male",
          parentName: "Lucy Brown",
          contact: "5555555555",
          fees: "Paid",
          enrollmentDate: "2019-06-01",
        },
      ]
      setStudents(dummyStudents)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch students. Please try again.")
    }
  }

  const handleEdit = (studentId) => {
    navigate(`/admission/student-form/${studentId}`)
  }

  const handleDeleteClick = (student) => {
    setStudentToDelete(student)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        // In a real application, you would delete the student from Firestore here
        // For this example, we'll just remove the student from the local state
        setStudents(students.filter((student) => student.id !== studentToDelete.id))
        toast.success("Student deleted successfully!")
      } catch (error) {
        console.error("Error deleting student:", error)
        toast.error(`Failed to delete student: ${error.message}`)
      }
    }
    setIsDeleteModalOpen(false)
    setStudentToDelete(null)
  }

  const handleView = (studentId) => {
    navigate(`/admission/student-form/${studentId}?view=true`)
  }

  const handleCopyAdmissionNumber = (admissionNumber) => {
    navigator.clipboard
      .writeText(admissionNumber)
      .then(() => toast.success("Admission Number copied to clipboard!"))
      .catch((error) => toast.error("Failed to copy Admission Number"))
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Admission</span>
            <span className="separator mx-2">&gt;</span>
            <span>Student Details</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2 className="mb-0">Student Details</h2>
          <Button onClick={() => navigate("/admission/student-form")} className="btn btn-light text-dark">
            + Add Student
          </Button>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
            <div className="d-flex flex-column flex-md-row gap-2 mb-3 mb-md-0 w-100 w-md-auto">
              <Form.Control
                type="text"
                placeholder="Search by name, class, section, or admission number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                variant={viewType === "grid" ? "primary" : "outline-primary"}
                onClick={() => setViewType("grid")}
                className="px-3 custom-btn-clr"
              >
                <FaTh />
              </Button>
            </div>
          </div>

          {viewType === "grid" ? (
            <Row className="g-4">
              {filteredStudents.map((student) => (
                <Col key={student.id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="h-100 shadow-sm position-relative">
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      style={{ zIndex: 1 }}
                      onClick={() => handleEdit(student.id)}
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
                        <div className="fw-bold text-primary">{student.admissionNumber}</div>
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
              <Table bordered hover>
                <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                  <tr>
                    <th>Admission Number</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Date of Birth</th>
                    <th>Gender</th>
                    <th>Parent Name</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <span className="me-2">{student.admissionNumber}</span>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-${student.id}`}>Copy Admission Number</Tooltip>}
                          >
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="copy-button"
                              onClick={() => handleCopyAdmissionNumber(student.admissionNumber)}
                            >
                              <FaCopy />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </td>
                      <td>{student.name}</td>
                      <td>{student.class}</td>
                      <td>{student.section}</td>
                      <td>{student.dateOfBirth}</td>
                      <td>{student.gender}</td>
                      <td>{student.parentName}</td>
                      <td>{student.contact}</td>
                      <td>
                        <Button
                          variant="secondary"
                          className="action-button view-button me-2"
                          onClick={() => handleView(student.id)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="link"
                          className="action-button edit-button me-2"
                          onClick={() => handleEdit(student.id)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="link"
                          className="action-button delete-button"
                          onClick={() => handleDeleteClick(student)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Container>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setStudentToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        itemName={studentToDelete?.name}
      />

      <ToastContainer />

      <style>
        {`
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

          .action-button {
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            padding: 0;
            color: white;
          }

          .view-button {
            background-color: #6c757d;
          }

          .view-button:hover {
            background-color: #5a6268;
            color: white;
          }

          .edit-button {
            background-color: #0B3D7B;
          }

          .edit-button:hover {
            background-color: #092a54;
            color: white;
          }

          .delete-button {
            background-color: #dc3545;
          }

          .delete-button:hover {
            background-color: #bb2d3b;
            color: white;
          }

          .copy-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            line-height: 1.5;
            border-radius: 0.2rem;
            transition: all 0.15s ease-in-out;
          }

          .copy-button:hover {
            background-color: #0B3D7B;
            border-color: #0B3D7B;
            color: white;
          }

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

          .modal-button.delete {
            background-color: #dc3545;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }

          /* Toastify custom styles */
          .Toastify__toast-container {
            z-index: 9999;
          }

          .Toastify__toast {
            background-color: #0B3D7B;
            color: white;
          }

          .Toastify__toast--success {
            background-color: #0B3D7B;
          }

          .Toastify__toast--error {
            background-color: #dc3545;
          }

          .Toastify__progress-bar {
            background-color: rgba(255, 255, 255, 0.7);
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default StudentDetails

