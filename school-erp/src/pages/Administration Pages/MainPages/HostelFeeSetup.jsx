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

// Add Hostel Fee Modal Component
const AddHostelFeeModal = ({ isOpen, onClose, onConfirm, courses, studentCategories, feeHeadings }) => {
  const [standard, setStandard] = useState({ id: "", name: "" })
  const [studentCategory, setStudentCategory] = useState({ id: "", name: "" })
  const [feeHeading, setFeeHeading] = useState({ id: "", name: "" })
  const [feeAmount, setFeeAmount] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm({
      standardId: standard.id,
      standard: standard.name,
      studentCategoryId: studentCategory.id,
      studentCategory: studentCategory.name,
      feeHeadingId: feeHeading.id,
      feeHeading: feeHeading.name,
      feeAmount,
    })
    setStandard({ id: "", name: "" })
    setStudentCategory({ id: "", name: "" })
    setFeeHeading({ id: "", name: "" })
    setFeeAmount("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Hostel Fee</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Standard</Form.Label>
            <Form.Select
              value={standard.id}
              onChange={(e) => {
                const selectedCourse = courses.find((course) => course.id === e.target.value)
                setStandard({ id: selectedCourse.id, name: selectedCourse.standard })
              }}
              className="custom-input"
            >
              <option value="">Select Standard</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.standard}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Student Category</Form.Label>
            <Form.Select
              value={studentCategory.id}
              onChange={(e) => {
                const selectedCategory = studentCategories.find((category) => category.id === e.target.value)
                setStudentCategory({ id: selectedCategory.id, name: selectedCategory.StudentCategoryName })
              }}
              className="custom-input"
            >
              <option value="">Select Student Category</option>
              {studentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.StudentCategoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Fee Heading</Form.Label>
            <Form.Select
              value={feeHeading.id}
              onChange={(e) => {
                const selectedHeading = feeHeadings.find((heading) => heading.id === e.target.value)
                setFeeHeading({ id: selectedHeading.id, name: selectedHeading.feeHead })
              }}
              className="custom-input"
            >
              <option value="">Select Fee Heading</option>
              {feeHeadings.map((heading) => (
                <option key={heading.id} value={heading.id}>
                  {heading.feeHead}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee Amount</Form.Label>
            <Form.Control
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add Fee
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Hostel Fee Modal Component
const EditHostelFeeModal = ({ isOpen, onClose, onConfirm, fee, courses, studentCategories, feeHeadings }) => {
  const [standard, setStandard] = useState({ id: fee?.standardId || "", name: fee?.standard || "" })
  const [studentCategory, setStudentCategory] = useState({
    id: fee?.studentCategoryId || "",
    name: fee?.studentCategory || "",
  })
  const [feeHeading, setFeeHeading] = useState({ id: fee?.feeHeadingId || "", name: fee?.feeHeading || "" })
  const [feeAmount, setFeeAmount] = useState(fee?.feeAmount || "")

  useEffect(() => {
    if (fee) {
      setStandard({ id: fee.standardId, name: fee.standard })
      setStudentCategory({ id: fee.studentCategoryId, name: fee.studentCategory })
      setFeeHeading({ id: fee.feeHeadingId, name: fee.feeHeading })
      setFeeAmount(fee.feeAmount)
    }
  }, [fee])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(fee.id, {
      standardId: standard.id,
      standard: standard.name,
      studentCategoryId: studentCategory.id,
      studentCategory: studentCategory.name,
      feeHeadingId: feeHeading.id,
      feeHeading: feeHeading.name,
      feeAmount,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Hostel Fee</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Standard</Form.Label>
            <Form.Select
              value={standard.id}
              onChange={(e) => {
                const selectedCourse = courses.find((course) => course.id === e.target.value)
                setStandard({ id: selectedCourse.id, name: selectedCourse.standard })
              }}
              className="custom-input"
            >
              <option value="">Select Standard</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.standard}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Student Category</Form.Label>
            <Form.Select
              value={studentCategory.id}
              onChange={(e) => {
                const selectedCategory = studentCategories.find((category) => category.id === e.target.value)
                setStudentCategory({ id: selectedCategory.id, name: selectedCategory.StudentCategoryName })
              }}
              className="custom-input"
            >
              <option value="">Select Student Category</option>
              {studentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.StudentCategoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Fee Heading</Form.Label>
            <Form.Select
              value={feeHeading.id}
              onChange={(e) => {
                const selectedHeading = feeHeadings.find((heading) => heading.id === e.target.value)
                setFeeHeading({ id: selectedHeading.id, name: selectedHeading.feeHead })
              }}
              className="custom-input"
            >
              <option value="">Select Fee Heading</option>
              {feeHeadings.map((heading) => (
                <option key={heading.id} value={heading.id}>
                  {heading.feeHead}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee Amount</Form.Label>
            <Form.Control
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update Fee
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Hostel Fee Modal Component
const DeleteHostelFeeModal = ({ isOpen, onClose, onConfirm, fee }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Hostel Fee</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this hostel fee entry?</p>
          <p className="fw-bold">
            {fee?.standard} - {fee?.studentCategory} - {fee?.feeHeading}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(fee.id)}>
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
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentFee, updatedFee }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this hostel fee? This may affect related data.</p>
          <div className="mb-3">
            <h6>Current Fee Details:</h6>
            <p>Standard: {currentFee.standard}</p>
            <p>Student Category: {currentFee.studentCategory}</p>
            <p>Fee Heading: {currentFee.feeHeading}</p>
            <p>Fee Amount: {currentFee.feeAmount}</p>
          </div>
          <div>
            <h6>Updated Fee Details:</h6>
            <p>Standard: {updatedFee.standard}</p>
            <p>Student Category: {updatedFee.studentCategory}</p>
            <p>Fee Heading: {updatedFee.feeHeading}</p>
            <p>Fee Amount: {updatedFee.feeAmount}</p>
          </div>
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

const HostelFeeSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [updatedFee, setUpdatedFee] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [feeHeadings, setFeeHeadings] = useState([])
  const [courses, setCourses] = useState([])
  const [studentCategories, setStudentCategories] = useState([])
  const [hostelFees, setHostelFees] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedStudentCategory, setSelectedStudentCategory] = useState("")
  const [administrationId, setAdministrationId] = useState(null)
  const { user } = useAuthContext()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchAdministrationId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage hostel fees.", {
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
      fetchStudentCategories()
      fetchFeeHeadings()
      fetchHostelFees()
    }
  }, [administrationId])

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
    try {
      const coursesRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "Courses")
      const querySnapshot = await getDocs(coursesRef)
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses. Please try again.")
    }
  }

  const fetchStudentCategories = async () => {
    try {
      const categoriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StudentCategory",
      )
      const querySnapshot = await getDocs(categoriesRef)
      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStudentCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching student categories:", error)
      toast.error("Failed to fetch student categories. Please try again.")
    }
  }

  const fetchFeeHeadings = async () => {
    try {
      const feeHeadingsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "HostelFeeHeadSetup",
      )
      const querySnapshot = await getDocs(feeHeadingsRef)
      const feeHeadingsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setFeeHeadings(feeHeadingsData)
    } catch (error) {
      console.error("Error fetching hostel fee headings:", error)
      toast.error("Failed to fetch hostel fee headings. Please try again.")
    }
  }

  const fetchHostelFees = async () => {
    try {
      const feesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "HostelFeeSetup",
      )
      const querySnapshot = await getDocs(feesRef)
      const feesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setHostelFees(feesData)
    } catch (error) {
      console.error("Error fetching hostel fees:", error)
      toast.error("Failed to fetch hostel fees. Please try again.")
    }
  }

  const handleAddFee = async (newFee) => {
    try {
      // Check for duplicate fee
      const isDuplicate = hostelFees.some(
        (fee) =>
          fee.standardId === newFee.standardId &&
          fee.studentCategoryId === newFee.studentCategoryId &&
          fee.feeHeadingId === newFee.feeHeadingId,
      )

      if (isDuplicate) {
        toast.error("A fee with the same standard, student category, and fee heading already exists.")
        return
      }

      const feesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "HostelFeeSetup",
      )
      await addDoc(feesRef, newFee)
      setIsAddModalOpen(false)
      toast.success("Hostel fee added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchHostelFees()
    } catch (error) {
      console.error("Error adding hostel fee:", error)
      toast.error("Failed to add hostel fee. Please try again.", {
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

  const handleEditFee = async (id, updatedFee) => {
    setIsEditModalOpen(false)
    setIsConfirmEditModalOpen(true)
    setUpdatedFee(updatedFee)
  }

  const confirmEditFee = async () => {
    try {
      const feeRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "HostelFeeSetup",
        selectedFee.id,
      )
      await updateDoc(feeRef, updatedFee)
      setIsConfirmEditModalOpen(false)
      setSelectedFee(null)
      setUpdatedFee(null)
      toast.success("Hostel fee updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchHostelFees()
    } catch (error) {
      console.error("Error updating hostel fee:", error)
      toast.error("Failed to update hostel fee. Please try again.", {
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

  const handleDeleteFee = async (id) => {
    try {
      const feeRef = doc(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "HostelFeeSetup", id)
      await deleteDoc(feeRef)
      setIsDeleteModalOpen(false)
      setSelectedFee(null)
      toast.success("Hostel fee deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchHostelFees()
    } catch (error) {
      console.error("Error deleting hostel fee:", error)
      toast.error("Failed to delete hostel fee. Please try again.", {
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

  const openEditModal = (fee) => {
    setSelectedFee(fee)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (fee) => {
    setSelectedFee(fee)
    setIsDeleteModalOpen(true)
  }

  const filteredFees = hostelFees.filter(
    (fee) =>
      (selectedCourse === "" || fee.standardId === selectedCourse) &&
      (selectedStudentCategory === "" || fee.studentCategoryId === selectedStudentCategory) &&
      (fee.feeHeading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.studentCategory.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <Row>
          <Col xs={12}>
            <div className="hostel-fee-setup-container">
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span to="">Administration</span>
                <span className="separator">&gt;</span>
                <Link to="/admin/hostel-fee-setup">Hostel Fee Setup</Link>
              </nav>

              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Hostel Fee Setup</h2>
                  <h6 className="m-0 d-lg-none">Hostel Fee Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Hostel Fee
                  </Button>
                </div>

                <div className="content-wrapper p-4">
                  <Row className="mb-3">
                    <Col xs={12} md={6} lg={3}>
                      <Form.Group>
                        <Form.Label>Select Course</Form.Label>
                        <Form.Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                          <option value="">All Courses</option>
                          {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.standard}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={3}>
                      <Form.Group>
                        <Form.Label>Select Student Category</Form.Label>
                        <Form.Select
                          value={selectedStudentCategory}
                          onChange={(e) => setSelectedStudentCategory(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          {studentCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.StudentCategoryName}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={12} lg={6}>
                      <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by Standard, Category, or Fee Heading"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Standard</th>
                          <th>Student Category</th>
                          <th>Fee Heading</th>
                          <th>Fee Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFees.map((fee) => (
                          <tr key={fee.id}>
                            <td>{fee.standard}</td>
                            <td>{fee.studentCategory}</td>
                            <td>{fee.feeHeading}</td>
                            <td>{fee.feeAmount}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(fee)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(fee)}
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
      <AddHostelFeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddFee}
        courses={courses}
        studentCategories={studentCategories}
        feeHeadings={feeHeadings}
      />
      <EditHostelFeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFee(null)
        }}
        onConfirm={handleEditFee}
        fee={selectedFee}
        courses={courses}
        studentCategories={studentCategories}
        feeHeadings={feeHeadings}
      />
      <DeleteHostelFeeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedFee(null)
        }}
        onConfirm={handleDeleteFee}
        fee={selectedFee}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedFee(null)
          setUpdatedFee(null)
        }}
        onConfirm={confirmEditFee}
        currentFee={selectedFee}
        updatedFee={updatedFee}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .hostel-fee-setup-container {
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
            background-color: #0B3D7B;
            color: white;
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

          /* Form Label Styles */
          .form-label {
            text-align: left !important;
            display: block;
            width: 100%;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default HostelFeeSetup

