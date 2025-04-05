"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Card, Spinner } from "react-bootstrap"
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { useAuthContext } from "../../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../styles/style.css"

// Generic Modal Component
const GenericModal = ({ isOpen, onClose, onConfirm, title, fields, data }) => {
  const [formData, setFormData] = useState(data || {})

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(formData)
    setFormData({})
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">
          {fields.map((field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{`Enter ${field}`}</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Enter ${field.toLowerCase()}`}
                value={formData[field.toLowerCase()] || ""}
                onChange={(e) => setFormData({ ...formData, [field.toLowerCase()]: e.target.value })}
                className="custom-input"
              />
            </Form.Group>
          ))}
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            {data ? "Update" : "Add"}
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, title, itemName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete {title}</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this entry?</p>
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

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, category, currentName, newName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this {category.toLowerCase()} entry? This may affect related data.</p>
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

const StaffDesignationandCategory = () => {
  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  const { user, currentAcademicYear } = useAuthContext()

  // State for each category
  const [staffDesignation, setStaffDesignation] = useState({ items: [], searchTerm: "", isLoading: false })
  const [staffCategory, setStaffCategory] = useState({ items: [], searchTerm: "", isLoading: false })

  // Modal states
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
    action: "",
    data: null,
  })

  // Confirm Edit Modal state
  const [confirmEditModalState, setConfirmEditModalState] = useState({
    isOpen: false,
    category: "",
    currentName: "",
    newName: "",
    id: "",
  })

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setStaffDesignation({ items: [], searchTerm: "", isLoading: false })
      setStaffCategory({ items: [], searchTerm: "", isLoading: false })
      setModalState({ isOpen: false, type: "", action: "", data: null })
      setConfirmEditModalState({ isOpen: false, category: "", currentName: "", newName: "", id: "" })
    }

    resetState()

    const checkAuthAndFetchData = async () => {
      if (auth.currentUser && currentAcademicYear) {
        console.log("User is authenticated:", auth.currentUser.uid, "Academic Year:", currentAcademicYear)

        try {
          // Ensure all necessary documents exist
          await ensureDocumentsExist()

          // Fetch all categories
          await fetchItems("StaffDesignation")
          await fetchItems("StaffCategory")
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage entries.", {
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
        toast.error("Please log in to view and manage entries.", {
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

  const fetchItems = async (category) => {
    if (!auth.currentUser || !currentAcademicYear) return

    // Set loading state for the specific category
    switch (category) {
      case "StaffDesignation":
        setStaffDesignation((prev) => ({ ...prev, isLoading: true }))
        break
      case "StaffCategory":
        setStaffCategory((prev) => ({ ...prev, isLoading: true }))
        break
    }

    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the category collection
      const itemsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        `${category}Setup`,
      )

      const querySnapshot = await getDocs(itemsRef)
      const itemsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        `Fetched ${category} for user`,
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        itemsData,
      )

      // Update state with fetched data
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({ ...prev, items: itemsData, isLoading: false }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({ ...prev, items: itemsData, isLoading: false }))
          break
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error)
      toast.error(`Failed to fetch ${category} entries. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Reset loading state and items on error
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({ ...prev, items: [], isLoading: false }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({ ...prev, items: [], isLoading: false }))
          break
      }
    }
  }

  const handleAdd = async (category, newItem) => {
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

    if (!newItem[category.toLowerCase()].trim()) {
      toast.error(`${category} name cannot be empty.`, {
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

    // Check for duplicate entry
    const isDuplicate = checkDuplicate(category, newItem[category.toLowerCase()])
    if (isDuplicate) {
      toast.error(`A ${category.toLowerCase()} with this name already exists. Please choose a different name.`, {
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

    // Set loading state for the specific category
    switch (category) {
      case "StaffDesignation":
        setStaffDesignation((prev) => ({ ...prev, isLoading: true }))
        break
      case "StaffCategory":
        setStaffCategory((prev) => ({ ...prev, isLoading: true }))
        break
    }

    try {
      // Ensure all necessary documents exist
      await ensureDocumentsExist()

      // Path to add a new item
      const itemsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        `${category}Setup`,
      )

      const docRef = await addDoc(itemsRef, {
        ...newItem,
        createdAt: new Date(),
      })

      console.log(
        `${category} added with ID:`,
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newItemData = { id: docRef.id, ...newItem }
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({ ...prev, items: [...prev.items, newItemData], isLoading: false }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({ ...prev, items: [...prev.items, newItemData], isLoading: false }))
          break
      }

      setModalState({ isOpen: false, type: "", action: "", data: null })
      toast.success(`${category} entry added successfully!`, {
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
      await fetchItems(category)
    } catch (error) {
      console.error(`Error adding ${category}:`, error)
      toast.error(`Failed to add ${category} entry. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Reset loading state on error
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({ ...prev, isLoading: false }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({ ...prev, isLoading: false }))
          break
      }
    }
  }

  const handleEdit = async (category, id, updatedItem) => {
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

    if (!updatedItem[category.toLowerCase()].trim()) {
      toast.error(`${category} name cannot be empty.`, {
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

    // Check for duplicate entry
    const isDuplicate = checkDuplicate(category, updatedItem[category.toLowerCase()], id)
    if (isDuplicate) {
      toast.error(`A ${category.toLowerCase()} with this name already exists. Please choose a different name.`, {
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

    setModalState({ isOpen: false, type: "", action: "", data: null })
    setConfirmEditModalState({
      isOpen: true,
      category,
      currentName: modalState.data[category.toLowerCase()],
      newName: updatedItem[category.toLowerCase()],
      id,
    })
  }

  const confirmEdit = async () => {
    const { category, id, newName } = confirmEditModalState

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

    // Set loading state for the specific category
    switch (category) {
      case "StaffDesignation":
        setStaffDesignation((prev) => ({ ...prev, isLoading: true }))
        break
      case "StaffCategory":
        setStaffCategory((prev) => ({ ...prev, isLoading: true }))
        break
    }

    try {
      // Path to update an item
      const itemRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        `${category}Setup`,
        id,
      )

      await updateDoc(itemRef, {
        [category.toLowerCase()]: newName,
        updatedAt: new Date(),
      })

      console.log(
        `${category} updated:`,
        id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({
            ...prev,
            items: prev.items.map((item) => (item.id === id ? { ...item, [category.toLowerCase()]: newName } : item)),
            isLoading: false,
          }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({
            ...prev,
            items: prev.items.map((item) => (item.id === id ? { ...item, [category.toLowerCase()]: newName } : item)),
            isLoading: false,
          }))
          break
      }

      setConfirmEditModalState({ isOpen: false, category: "", currentName: "", newName: "", id: "" })
      toast.success(`${category} entry updated successfully!`, {
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
      await fetchItems(category)
    } catch (error) {
      console.error(`Error updating ${category}:`, error)
      toast.error(`Failed to update ${category} entry. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Reset loading state on error
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({ ...prev, isLoading: false }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({ ...prev, isLoading: false }))
          break
      }
    }
  }

  const handleDelete = async (category, id) => {
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

    // Set loading state for the specific category
    switch (category) {
      case "StaffDesignation":
        setStaffDesignation((prev) => ({ ...prev, isLoading: true }))
        break
      case "StaffCategory":
        setStaffCategory((prev) => ({ ...prev, isLoading: true }))
        break
    }

    try {
      // Path to delete an item
      const itemRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        `${category}Setup`,
        id,
      )

      await deleteDoc(itemRef)
      console.log(
        `${category} deleted:`,
        id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
            isLoading: false,
          }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({
            ...prev,
            items: prev.items.filter((item) => item.id !== id),
            isLoading: false,
          }))
          break
      }

      setModalState({ isOpen: false, type: "", action: "", data: null })
      toast.success(`${category} entry deleted successfully!`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchItems(category)
    } catch (error) {
      console.error(`Error deleting ${category}:`, error)
      toast.error(`Failed to delete ${category} entry. Please try again.`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Reset loading state on error
      switch (category) {
        case "StaffDesignation":
          setStaffDesignation((prev) => ({ ...prev, isLoading: false }))
          break
        case "StaffCategory":
          setStaffCategory((prev) => ({ ...prev, isLoading: false }))
          break
      }
    }
  }

  const openModal = (type, action, data = null) => {
    setModalState({ isOpen: true, type, action, data })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: "", action: "", data: null })
  }

  const handleConfirm = (formData) => {
    const { type, action, data } = modalState
    if (action === "add") {
      handleAdd(type, formData)
    } else if (action === "edit") {
      handleEdit(type, data.id, formData)
    }
  }

  const handleConfirmDelete = () => {
    const { type, data } = modalState
    handleDelete(type, data.id)
  }

  const checkDuplicate = (category, name, id = null) => {
    let items
    switch (category) {
      case "StaffDesignation":
        items = staffDesignation.items
        break
      case "StaffCategory":
        items = staffCategory.items
        break
      default:
        return false
    }

    return items.some((item) => item.id !== id && item[category.toLowerCase()].toLowerCase() === name.toLowerCase())
  }

  const renderCard = (category, items, searchTerm, isLoading) => {
    const filteredItems = items.filter((item) =>
      Object.values(item).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )

    return (
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center header">
          <h5 className="m-0">{category} Setup</h5>
          <Button
            onClick={() => openModal(category, "add")}
            variant="light"
            size="sm"
            disabled={!currentAcademicYear || isLoading}
          >
            + Add {category}
          </Button>
        </Card.Header>
        <Card.Body>
          {!currentAcademicYear ? (
            <div className="alert alert-warning">
              Please select an academic year to manage {category.toLowerCase()} entries.
            </div>
          ) : (
            <>
              <Form className="mb-3">
                <Form.Group className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder={`Search ${category}`}
                    value={searchTerm}
                    onChange={(e) => {
                      switch (category) {
                        case "StaffDesignation":
                          setStaffDesignation((prev) => ({ ...prev, searchTerm: e.target.value }))
                          break
                        case "StaffCategory":
                          setStaffCategory((prev) => ({ ...prev, searchTerm: e.target.value }))
                          break
                      }
                    }}
                    className="me-2"
                    disabled={isLoading}
                  />
                  <Button variant="outline-secondary" disabled={isLoading}>
                    <FaSearch />
                  </Button>
                </Form.Group>
              </Form>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status" variant="primary" className="loader">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading {category.toLowerCase()} data...</p>
                </div>
              )}

              {/* Items List */}
              {!isLoading && (
                <>
                  {filteredItems.length === 0 && items.length === 0 ? (
                    <p className="text-center">No data available</p>
                  ) : filteredItems.length === 0 && searchTerm ? (
                    <p className="text-center">No matching {category.toLowerCase()} found</p>
                  ) : (
                    filteredItems.map((item) => (
                      <Card key={item.id} className="mb-2">
                        <Card.Body className="d-flex justify-content-between align-items-center">
                          <span>{item[category.toLowerCase()] || item.name || "N/A"}</span>
                          <div>
                            <Button
                              variant="link"
                              className="p-0 me-2"
                              onClick={() => openModal(category, "edit", item)}
                            >
                              <FaEdit color="#0B3D7B" />
                            </Button>
                            <Button variant="link" className="p-0" onClick={() => openModal(category, "delete", item)}>
                              <FaTrash color="#dc3545" />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    )
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Staff Designation and Category</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="setup-container">
              <Row>
                <Col xs={12} md={6} className="mb-3">
                  {renderCard(
                    "StaffDesignation",
                    staffDesignation.items,
                    staffDesignation.searchTerm,
                    staffDesignation.isLoading,
                  )}
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  {renderCard("StaffCategory", staffCategory.items, staffCategory.searchTerm, staffCategory.isLoading)}
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      {modalState.isOpen && modalState.action !== "delete" && (
        <GenericModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          title={`${modalState.action === "add" ? "Add" : "Edit"} ${modalState.type}`}
          fields={[modalState.type]}
          data={modalState.data}
        />
      )}
      {modalState.isOpen && modalState.action === "delete" && (
        <DeleteModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          title={modalState.type}
          itemName={modalState.data[modalState.type.toLowerCase()] || modalState.data.name || "N/A"}
        />
      )}
      <ConfirmEditModal
        isOpen={confirmEditModalState.isOpen}
        onClose={() => setConfirmEditModalState({ isOpen: false, category: "", currentName: "", newName: "", id: "" })}
        onConfirm={confirmEdit}
        category={confirmEditModalState.category}
        currentName={confirmEditModalState.currentName}
        newName={confirmEditModalState.newName}
      />

      {/* Toastify Container */}
      <ToastContainer />
    </MainContentPage>
  )
}

export default StaffDesignationandCategory

