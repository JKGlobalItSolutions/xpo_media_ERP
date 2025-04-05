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
import "../styles/style.css"

// Add Student Category Modal Component
const AddStudentCategoryModal = ({ isOpen, onClose, onConfirm }) => {
  const [categoryName, setCategoryName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(categoryName)
    setCategoryName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Students Category</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Students Category"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
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

// Edit Student Category Modal Component
const EditStudentCategoryModal = ({ isOpen, onClose, onConfirm, category }) => {
  const [categoryName, setCategoryName] = useState(category?.StudentCategoryName || "")

  useEffect(() => {
    if (category) {
      setCategoryName(category.StudentCategoryName)
    }
  }, [category])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(category.id, categoryName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Students Category</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Students Category"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
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

// Delete Student Category Modal Component
const DeleteStudentCategoryModal = ({ isOpen, onClose, onConfirm, category }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Students Category</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this student category?</p>
          <p className="fw-bold">{category?.StudentCategoryName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(category.id)}>
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
          <p>Are you sure you want to edit this student category? This may affect the structure of student data.</p>
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

const StudentsCategory = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setCategories([])
      setSearchTerm("")
      setSelectedCategory(null)
      setNewCategoryName("")
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
          await fetchCategories()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        } finally {
          setIsLoading(false)
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage student categories.", {
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
        toast.error("Please log in to view and manage student categories.", {
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

  const fetchCategories = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading(true)
    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the StudentCategory collection
      const categoriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StudentCategory",
      )

      const querySnapshot = await getDocs(categoriesRef)
      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched student categories for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        categoriesData,
      )
      setCategories(categoriesData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching student categories:", error)
      toast.error("Failed to fetch student categories. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setCategories([]) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (categoryName) => {
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

    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty.", {
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

    // Check for duplicate category name
    const isDuplicate = categories.some(
      (category) => category.StudentCategoryName.toLowerCase() === categoryName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A category with this name already exists. Please choose a different name.", {
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

      // Path to add a new student category
      const categoriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StudentCategory",
      )

      const docRef = await addDoc(categoriesRef, {
        StudentCategoryName: categoryName,
        createdAt: new Date(),
      })

      console.log(
        "Student category added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newCategory = { id: docRef.id, StudentCategoryName: categoryName }
      setCategories((prevCategories) => [...prevCategories, newCategory])

      setIsAddModalOpen(false)
      toast.success("Student category added successfully!", {
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
      await fetchCategories()
    } catch (error) {
      console.error("Error adding student category:", error)
      toast.error("Failed to add student category. Please try again.", {
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

  const handleEditCategory = async (categoryId, newName) => {
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

    if (!newName.trim()) {
      toast.error("Category name cannot be empty.", {
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

    // Check for duplicate category name
    const isDuplicate = categories.some(
      (category) => category.id !== categoryId && category.StudentCategoryName.toLowerCase() === newName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A category with this name already exists. Please choose a different name.", {
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
    setNewCategoryName(newName)
  }

  const confirmEditCategory = async () => {
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
      // Path to update a student category
      const categoryRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StudentCategory",
        selectedCategory.id,
      )

      await updateDoc(categoryRef, {
        StudentCategoryName: newCategoryName,
        updatedAt: new Date(),
      })

      console.log(
        "Student category updated:",
        selectedCategory.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === selectedCategory.id ? { ...category, StudentCategoryName: newCategoryName } : category,
        ),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedCategory(null)
      setNewCategoryName("")
      toast.success("Student category updated successfully!", {
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
      await fetchCategories()
    } catch (error) {
      console.error("Error updating student category:", error)
      toast.error("Failed to update student category. Please try again.", {
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

  const handleDeleteCategory = async (categoryId) => {
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
      // Path to delete a student category
      const categoryRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StudentCategory",
        categoryId,
      )

      await deleteDoc(categoryRef)
      console.log(
        "Student category deleted:",
        categoryId,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setCategories((prevCategories) => prevCategories.filter((category) => category.id !== categoryId))

      setIsDeleteModalOpen(false)
      setSelectedCategory(null)
      toast.success("Student category deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting student category:", error)
      toast.error("Failed to delete student category. Please try again.", {
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

  const openEditModal = (category) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (category) => {
    setSelectedCategory(category)
    setIsDeleteModalOpen(true)
  }

  const filteredCategories = categories.filter((category) =>
    category.StudentCategoryName.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <span className="current col-12">Create Students Category</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="category-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Create Students Category</h2>
                    <h6 className="m-0 d-lg-none">Create Students Category</h6>
                  </div>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-light text-dark"
                    disabled={!currentAcademicYear || isLoading}
                  >
                    + Add Students Category
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">
                      Please select an academic year to manage student categories.
                    </div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Students Category"
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

                      {/* Category Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Category Name</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories.length === 0 ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              ) : filteredCategories.length === 0 && searchTerm ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No matching categories found
                                  </td>
                                </tr>
                              ) : (
                                filteredCategories.map((category) => (
                                  <tr key={category.id}>
                                    <td>{category.StudentCategoryName}</td>
                                    <td>
                                      <Button
                                        variant="link"
                                        className="action-button edit-button me-2"
                                        onClick={() => openEditModal(category)}
                                      >
                                        <FaEdit />
                                      </Button>
                                      <Button
                                        variant="link"
                                        className="action-button delete-button"
                                        onClick={() => openDeleteModal(category)}
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
      <AddStudentCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddCategory}
      />
      <EditStudentCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCategory(null)
        }}
        onConfirm={handleEditCategory}
        category={selectedCategory}
      />
      <DeleteStudentCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedCategory(null)
        }}
        onConfirm={handleDeleteCategory}
        category={selectedCategory}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedCategory(null)
          setNewCategoryName("")
        }}
        onConfirm={confirmEditCategory}
        currentName={selectedCategory?.StudentCategoryName}
        newName={newCategoryName}
      />

      {/* Toastify Container */}
      <ToastContainer />
    </MainContentPage>
  )
}

export default StudentsCategory

