"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table, Spinner } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { useAuthContext } from "../../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"
import "../styles/style.css"

// Add Course Modal Component
const AddCourseModal = ({ isOpen, onClose, onConfirm }) => {
  const [standard, setStandard] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(standard)
    setStandard("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Course</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Standard/Course Name"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
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
  const [standard, setStandard] = useState(course?.standard || "")

  useEffect(() => {
    if (course) {
      setStandard(course.standard)
    }
  }, [course])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(course.id, standard)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Course</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Standard/Course Name"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
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
          <p className="fw-bold">{course?.standard}</p>
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

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentName, newName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this course? This may affect the structure of student data.</p>
          <p>
            <strong>Current Name:</strong> {currentName}
          </p>
          <p>
            <strong>New Name:</strong> {newName}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={onConfirm}>
            Confirm Edit
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
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [newStandard, setNewStandard] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setCourses([])
      setSearchTerm("")
      setSelectedCourse(null)
      setNewStandard("")
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setIsDeleteModalOpen(false)
      setIsConfirmEditModalOpen(false)
    }

    resetState()

    const checkAuthAndFetchData = async () => {
      if (auth.currentUser && currentAcademicYear) {
        console.log("User is authenticated:", auth.currentUser.uid, "Academic Year:", currentAcademicYear)

        setIsLoading(true)
        try {
          // Ensure all necessary documents exist
          await ensureDocumentsExist()
          await fetchCourses()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        } finally {
          setIsLoading(false)
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage courses.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage courses.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    }

    checkAuthAndFetchData()

    return () => resetState()
  }, [auth.currentUser?.uid, currentAcademicYear]) // Re-run on user or academic year change

  // Ensure all necessary documents exist in the path
  const ensureDocumentsExist = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    try {
      // Ensure Schools/{uid} document exists
      const schoolDocRef = doc(db, "Schools", auth.currentUser.uid)
      await setDoc(
        schoolDocRef,
        {
          updatedAt: new Date(),
          type: "school",
        },
        { merge: true },
      )

      // Ensure AcademicYears/{academicYear} document exists
      const academicYearDocRef = doc(db, "Schools", auth.currentUser.uid, "AcademicYears", currentAcademicYear)
      await setDoc(
        academicYearDocRef,
        {
          year: currentAcademicYear,
          updatedAt: new Date(),
        },
        { merge: true },
      )

      // Ensure Administration/{adminDocId} document exists
      const adminDocRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
      )
      await setDoc(
        adminDocRef,
        {
          createdAt: new Date(),
          type: "administration",
        },
        { merge: true },
      )

      console.log(
        "All necessary documents ensured for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )
    } catch (error) {
      console.error("Error ensuring necessary documents:", error)
    }
  }

  const fetchCourses = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading(true)
    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the CourseSetup collection - now directly accessing CourseSetup without CourseItems subcollection
      const coursesCollectionRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "CourseSetup",
      )

      const querySnapshot = await getDocs(coursesCollectionRef)
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched courses for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        coursesData,
      )
      setCourses(coursesData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setCourses([]) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCourse = async (standard) => {
    if (!auth.currentUser || !currentAcademicYear) {
      toast.error("User not logged in or no academic year selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (!standard.trim()) {
      toast.error("Course name cannot be empty.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const isDuplicate = courses.some((course) => course.standard.toLowerCase() === standard.toLowerCase())
    if (isDuplicate) {
      toast.error("A course with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsLoading(true)
    try {
      // Ensure all necessary documents exist
      await ensureDocumentsExist()

      // Path to add a new course - now directly to CourseSetup collection
      const coursesCollectionRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "CourseSetup",
      )

      const docRef = await addDoc(coursesCollectionRef, {
        standard,
        createdAt: new Date(),
      })

      console.log(
        "Course added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newCourse = { id: docRef.id, standard }
      setCourses((prevCourses) => [...prevCourses, newCourse])

      setIsAddModalOpen(false)
      toast.success("Course added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })

      // Fetch fresh data to ensure consistency
      await fetchCourses()
    } catch (error) {
      console.error("Error adding course:", error)
      toast.error("Failed to add course. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCourse = async (courseId, newStandard) => {
    if (!auth.currentUser || !currentAcademicYear) {
      toast.error("User not logged in or no academic year selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (!newStandard.trim()) {
      toast.error("Course name cannot be empty.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const isDuplicate = courses.some(
      (course) => course.id !== courseId && course.standard.toLowerCase() === newStandard.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A course with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsEditModalOpen(false)
    setIsConfirmEditModalOpen(true)
    setNewStandard(newStandard)
  }

  const confirmEditCourse = async () => {
    if (!auth.currentUser || !currentAcademicYear) {
      toast.error("User not logged in or no academic year selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsLoading(true)
    try {
      // Path to update a course - now directly in CourseSetup collection
      const courseDocRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "CourseSetup",
        selectedCourse.id,
      )

      await updateDoc(courseDocRef, {
        standard: newStandard,
        updatedAt: new Date(),
      })

      console.log(
        "Course updated:",
        selectedCourse.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setCourses((prevCourses) =>
        prevCourses.map((course) => (course.id === selectedCourse.id ? { ...course, standard: newStandard } : course)),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedCourse(null)
      setNewStandard("")
      toast.success("Course updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })

      // Fetch fresh data
      await fetchCourses()
    } catch (error) {
      console.error("Error updating course:", error)
      toast.error("Failed to update course. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!auth.currentUser || !currentAcademicYear) {
      toast.error("User not logged in or no academic year selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsLoading(true)
    try {
      // Path to delete a course - now directly in CourseSetup collection
      const courseDocRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "CourseSetup",
        courseId,
      )

      await deleteDoc(courseDocRef)
      console.log(
        "Course deleted:",
        courseId,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId))

      setIsDeleteModalOpen(false)
      setSelectedCourse(null)
      toast.success("Course deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchCourses()
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Failed to delete course. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (event) => {
    if (!auth.currentUser || !currentAcademicYear) {
      toast.error("User not logged in or no academic year selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        toast.error("No data found in the imported file.")
        setIsLoading(false)
        return
      }

      try {
        // Ensure all necessary documents exist
        await ensureDocumentsExist()

        // Path to add imported courses - now directly to CourseSetup collection
        const coursesCollectionRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AcademicYears",
          currentAcademicYear,
          "Administration",
          ADMIN_DOC_ID,
          "CourseSetup",
        )

        const newCourses = []
        for (const row of jsonData) {
          const standard = row["Course Name"] || row["standard"]
          if (standard && standard.trim()) {
            const isDuplicate = courses.some((course) => course.standard.toLowerCase() === standard.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(coursesCollectionRef, {
                standard,
                createdAt: new Date(),
              })
              newCourses.push({ id: docRef.id, standard })
              console.log(
                "Imported course:",
                standard,
                "for user:",
                auth.currentUser.uid,
                "in academic year:",
                currentAcademicYear,
              )
            }
          }
        }

        // Update UI
        setCourses((prevCourses) => [...prevCourses, ...newCourses])

        toast.success("Courses imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })

        // Fetch fresh data
        await fetchCourses()
      } catch (error) {
        console.error("Error importing courses:", error)
        toast.error("Failed to import courses. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleExport = () => {
    if (!auth.currentUser || !currentAcademicYear) {
      toast.error("User not logged in or no academic year selected. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    if (courses.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = courses.map((course) => ({
      "Course Name": course.standard,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courses")
    XLSX.writeFile(workbook, `Courses_Export_${auth.currentUser.uid}_${currentAcademicYear}.xlsx`)
    toast.success("Courses exported successfully!", {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openEditModal = (course) => {
    setSelectedCourse(course)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (course) => {
    setSelectedCourse(course)
    setIsDeleteModalOpen(true)
  }

  const filteredCourses = courses.filter(
    (course) => course.standard && course.standard.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Create Standard/Course Name Setup</h2>
                    <h6 className="m-0 d-lg-none">Create Standard/Course Name Setup</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleImport}
                      style={{ display: "none" }}
                      id="import-file"
                    />
                    <Button
                      onClick={() => document.getElementById("import-file").click()}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || isLoading}
                    >
                      Import
                    </Button>
                    <Button
                      onClick={handleExport}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || courses.length === 0 || isLoading}
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || isLoading}
                    >
                      + Add Course
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year to manage courses.</div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Course Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="custom-search mb-3"
                        disabled={isLoading}
                      />

                      {/* Loading Indicator */}
                      {isLoading && (
                        <div className="text-center my-4">
                          <Spinner animation="border" role="status" variant="primary" className="loader">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading data...</p>
                        </div>
                      )}

                      {/* Course Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Course Name</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {courses.length === 0 ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              ) : filteredCourses.length === 0 && searchTerm ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No matching courses found
                                  </td>
                                </tr>
                              ) : (
                                filteredCourses.map((course) => (
                                  <tr key={course.id}>
                                    <td>{course.standard}</td>
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
                                ))
                              )}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </>
                  )}
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
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedCourse(null)
          setNewStandard("")
        }}
        onConfirm={confirmEditCourse}
        currentName={selectedCourse?.standard}
        newName={newStandard}
      />

      {/* Toastify Container */}
      <ToastContainer />
    </MainContentPage>
  )
}

export default CourseSetup

