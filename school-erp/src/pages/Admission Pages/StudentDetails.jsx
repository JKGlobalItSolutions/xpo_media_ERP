"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Button, Container, Table, Form, OverlayTrigger, Tooltip, Row, Col, Card } from "react-bootstrap"
import { FaEdit, FaTrash, FaEye, FaCopy, FaTable, FaTh } from "react-icons/fa"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, limit, addDoc, deleteDoc, doc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import defaultStudentPhoto from "../../images/StudentProfileIcon/studentProfile.jpeg"

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
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const querySnapshot = await getDocs(studentsRef)
      const fetchedStudents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStudents(fetchedStudents)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch students. Please try again.")
    }
  }

  const handleEdit = (e, studentId) => {
    e.stopPropagation()
    navigate(`/admission/AdmissionForm/${studentId}`)
  }

  const handleDeleteClick = (e, student) => {
    e.stopPropagation()
    setStudentToDelete(student)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        const studentRef = doc(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "AdmissionSetup",
          studentToDelete.id,
        )
        await deleteDoc(studentRef)
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
    navigate(`/admission/AdmissionForm/${studentId}?view=true`)
  }

  const handleCopyAdmissionNumber = (admissionNumber) => {
    navigator.clipboard
      .writeText(admissionNumber)
      .then(() => toast.success("Admission Number copied to clipboard!"))
      .catch((error) => toast.error("Failed to copy Admission Number"))
  }

  const filteredStudents = students.filter(
    (student) =>
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.standard?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleViewType = (type) => {
    setViewType(type)
  }

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
          <Button onClick={() => navigate("/admission/AdmissionForm")} className="btn btn-light text-dark">
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
              <Button className="search-btn w-auto w-md-auto">SEARCH</Button>
            </div>
            <div className="d-flex gap-2 justify-content-lg-end justify-content-center w-100 w-md-auto">
              <Button
                variant={viewType === "table" ? "primary" : "outline-primary"}
                onClick={() => toggleViewType("table")}
                className={`view-toggle-btn d-flex align-items-center gap-2 ${viewType === "table" ? "active" : ""}`}
              >
                <FaTable /> <span className="d-none d-sm-inline">Table View</span>
              </Button>
              <Button
                variant={viewType === "grid" ? "primary" : "outline-primary"}
                onClick={() => toggleViewType("grid")}
                className={`view-toggle-btn d-flex align-items-center gap-2 ${viewType === "grid" ? "active" : ""}`}
              >
                <FaTh /> <span className="d-none d-sm-inline">Card View</span>
              </Button>
            </div>
          </div>

          {viewType === "grid" ? (
            <Row className="g-4">
              {filteredStudents.map((student) => (
                <Col key={student.id} xs={12} sm={6} md={4} lg={3}>
                  <Card className="student-card h-100" onClick={() => handleView(student.id)}>
                    <div className="position-relative">
                      <div className="edit-button-wrapper">
                        <Button
                          variant="danger"
                          size="sm"
                          className="edit-icon-button"
                          onClick={(e) => handleEdit(e, student.id)}
                        >
                          <FaEdit />
                        </Button>
                      </div>
                      <div className="student-image-container">
                        <img
                          src={student.studentPhoto || defaultStudentPhoto}
                          alt={student.studentName}
                          className="student-profile-image"
                        />
                      </div>
                    </div>
                    <Card.Body className="text-center">
                      <div className="student-info">
                        <div className="info-row">
                          <span className="info-label">Admission</span>
                          <span className="info-value">{student.admissionNumber}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Name</span>
                          <span className="info-value">{student.studentName}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Class</span>
                          <span className="info-value">{student.standard}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Section</span>
                          <span className="info-value">{student.section}</span>
                        </div>
                      </div>
                      <div className="mt-3 d-flex justify-content-center gap-2">
                        <Button
                          variant="primary"
                          className="d-flex align-items-center gap-2 custom-view-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleView(student.id)
                          }}
                        >
                          <FaEye /> View
                        </Button>
                        <Button
                          variant="danger"
                          className="d-flex align-items-center gap-2 custom-delete-btn"
                          onClick={(e) => handleDeleteClick(e, student)}
                        >
                          <FaTrash /> Delete
                        </Button>
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
                      <td>{student.studentName}</td>
                      <td>{student.standard}</td>
                      <td>{student.section}</td>
                      <td>{student.dateOfBirth}</td>
                      <td>{student.gender}</td>
                      <td>{student.fatherName}</td>
                      <td>{student.phoneNumber}</td>
                      <td>
                        <Button variant="secondary" className="me-2" onClick={() => handleView(student.id)}>
                          <FaEye />
                        </Button>
                        <Button variant="primary" className="me-2" onClick={(e) => handleEdit(e, student.id)}>
                          <FaEdit />
                        </Button>
                        <Button variant="danger" onClick={(e) => handleDeleteClick(e, student)}>
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
        itemName={studentToDelete?.studentName}
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

          .view-toggle-btn {
            padding: 0.5rem 1rem;
            font-weight: 500;
            border-radius: 6px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }

          .view-toggle-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }

          .view-toggle-btn.active {
            background-color: #0B3D7B;
            color: white;
            border-color: #0B3D7B;
          }

          .student-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            background: white;
            cursor: pointer;
          }

          .student-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          .edit-button-wrapper {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 2;
          }

          .edit-icon-button {
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.3s ease;
          }

          .edit-icon-button:hover {
            transform: scale(1.1);
          }

          .student-image-container {
            width: 100%;
            height: 150px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px 0;
          }

          .student-profile-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #0B3D7B;
          }

          .student-info {
            margin-top: 1rem;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            padding: 0.25rem 0;
            border-bottom: 1px solid #f0f0f0;
          }

          .info-label {
            color: #666;
            font-weight: 500;
          }

          .info-value {
            color: #0B3D7B;
            font-weight: 600;
          }

          .custom-view-btn {
            background-color: #0B3D7B;
            border-color: #0B3D7B;
          }

          .custom-view-btn:hover {
            background-color: #092C5C;
            border-color: #092C5C;
          }

          .custom-delete-btn {
            background-color: #dc3545;
            border-color: #dc3545;
          }

          .custom-delete-btn:hover {
            background-color: #c82333;
            border-color: #bd2130;
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

          .search-btn {
            background-color: #0B3D7B;
            border-color: #0B3D7B;
            color: white;
          }

          .search-btn:hover {
            background-color: #092C5C;
            border-color: #092C5C;
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

          /* Mobile responsiveness */
          @media (max-width: 575.98px) {
            .d-flex.flex-column.flex-md-row {
              flex-direction: column !important;
            }

            .w-100.w-md-auto {
              width: 100% !important;
            }

            .view-toggle-btn {
              width: 100%;
              margin-bottom: 0.5rem;
            }

            .search-btn {
              width: 100%;
              margin-top: 0.5rem;
            }
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default StudentDetails

