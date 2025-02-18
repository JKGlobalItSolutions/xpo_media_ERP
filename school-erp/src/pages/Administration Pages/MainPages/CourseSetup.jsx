"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore"
import { useAuthContext } from "../../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

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
    </div>
  )
}

// Edit Course Modal Component
const EditCourseModal = ({ isOpen, onClose, onConfirm, course }) => {
  const [className, setClassName] = useState(course?.name || "")

  useEffect(() => {
    if (course) {
      setClassName(course.name)
    }
  }, [course])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(course.id, className)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Course</h2>
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
            Update
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Course Modal Component
const DeleteCourseModal = ({ isOpen, onClose, onConfirm, course }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Course</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this course?</p>
          <p className="fw-bold">{course?.name}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(course.id)}>
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

const CourseSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [administrationId, setAdministrationId] = useState(null)
  const { user } = useAuthContext()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchAdministrationId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage courses.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    }

    checkAuthAndFetchData()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchCourses()
    }
  }, [administrationId])

  const fetchAdministrationId = async () => {
    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
      const q = query(adminRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // If no Administration document exists, create one
        const newAdminRef = await addDoc(adminRef, { createdAt: new Date() })
        setAdministrationId(newAdminRef.id)
      } else {
        // Use the ID of the first (and presumably only) Administration document
        setAdministrationId(querySnapshot.docs[0].id)
      }
    } catch (error) {
      console.error("Error fetching/creating Administration ID:", error)
      toast.error("Failed to initialize. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchCourses = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const coursesRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "Courses")
      const querySnapshot = await getDocs(coursesRef)
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched courses:", coursesData)
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleAddCourse = async (className) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const coursesRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "Courses")
      const docRef = await addDoc(coursesRef, { name: className })
      console.log("Course added with ID:", docRef.id)
      setIsAddModalOpen(false)
      toast.success("Course added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchCourses()
    } catch (error) {
      console.error("Error adding course:", error)
      toast.error("Failed to add course. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleEditCourse = async (courseId, newName) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const courseRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "Courses",
        courseId,
      )
      await updateDoc(courseRef, { name: newName })
      console.log("Course updated:", courseId)
      setIsEditModalOpen(false)
      setSelectedCourse(null)
      toast.success("Course updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchCourses()
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const courseRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "Courses",
        courseId,
      )
      await deleteDoc(courseRef)
      console.log("Course deleted:", courseId)
      setIsDeleteModalOpen(false)
      setSelectedCourse(null)
      toast.error("Course deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchCourses()
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Failed to delete course. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const openEditModal = (course) => {
    setSelectedCourse(course)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (course) => {
    setSelectedCourse(course)
    setIsDeleteModalOpen(true)
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
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
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
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(course)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(course)}
                              >
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

      {/* Modals */}
      <AddCourseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onConfirm={handleAddCourse} />
      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCourse(null)
        }}
        onConfirm={handleEditCourse}
        course={selectedCourse}
      />
      <DeleteCourseModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedCourse(null)
        }}
        onConfirm={handleDeleteCourse}
        course={selectedCourse}
      />

      {/* Toastify Container */}
      <ToastContainer />

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

          /* Modal Styles */
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

          .modal-button.delete {
            background-color: #dc3545;
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

          /* Toastify custom styles */
          .Toastify__toast-container {
            z-index: 9999;
          }

          .Toastify__toast {
            background-color: #0B3D7B;
            color: white;
          }

          .Toastify__toast--success {
            background-color: #28a745;
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

export default CourseSetup

