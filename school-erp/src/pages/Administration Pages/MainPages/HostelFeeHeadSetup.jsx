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

// Add Hostel Fee Head Modal Component
const AddHostelFeeHeadModal = ({ isOpen, onClose, onConfirm }) => {
  const [feeHead, setFeeHead] = useState("")
  const [accountHead, setAccountHead] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm({ feeHead, accountHead })
    setFeeHead("")
    setAccountHead("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Hostel Fee Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Enter New Hostel Fee Head</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Room Rent"
              value={feeHead}
              onChange={(e) => setFeeHead(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Enter Account Head</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name of the fee account transfer"
              value={accountHead}
              onChange={(e) => setAccountHead(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Create Hostel Fee Head
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Hostel Fee Head Modal Component
const EditHostelFeeHeadModal = ({ isOpen, onClose, onConfirm, feeHeadData }) => {
  const [feeHead, setFeeHead] = useState(feeHeadData?.feeHead || "")
  const [accountHead, setAccountHead] = useState(feeHeadData?.accountHead || "")

  useEffect(() => {
    if (feeHeadData) {
      setFeeHead(feeHeadData.feeHead)
      setAccountHead(feeHeadData.accountHead)
    }
  }, [feeHeadData])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(feeHeadData.id, { feeHead, accountHead })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Hostel Fee Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Edit Hostel Fee Head</Form.Label>
            <Form.Control
              type="text"
              value={feeHead}
              onChange={(e) => setFeeHead(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Edit Account Head</Form.Label>
            <Form.Control
              type="text"
              value={accountHead}
              onChange={(e) => setAccountHead(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update Hostel Fee Head
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Hostel Fee Head Modal Component
const DeleteHostelFeeHeadModal = ({ isOpen, onClose, onConfirm, feeHeadData }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Hostel Fee Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this hostel fee head?</p>
          <p className="fw-bold">{feeHeadData?.feeHead}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(feeHeadData.id)}>
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
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentFeeHead, newFeeHead }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>
            Are you sure you want to edit this hostel fee head? This may affect the structure of student hostel fee
            data.
          </p>
          <p>
            <strong>Current Hostel Fee Head:</strong> {currentFeeHead?.feeHead}
          </p>
          <p>
            <strong>New Hostel Fee Head:</strong> {newFeeHead?.feeHead}
          </p>
          <p>
            <strong>Current Account Head:</strong> {currentFeeHead?.accountHead}
          </p>
          <p>
            <strong>New Account Head:</strong> {newFeeHead?.accountHead}
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

const HostelFeeHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedFeeHead, setSelectedFeeHead] = useState(null)
  const [newFeeHeadData, setNewFeeHeadData] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [feeHeads, setFeeHeads] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setFeeHeads([])
      setSearchTerm("")
      setSelectedFeeHead(null)
      setNewFeeHeadData(null)
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
          await fetchFeeHeads()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        } finally {
          setIsLoading(false)
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage hostel fee heads.", {
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
        toast.error("Please log in to view and manage hostel fee heads.", {
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

  const fetchFeeHeads = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading(true)
    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the HostelFeeHeadSetup collection
      const feeHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "HostelFeeHeadSetup",
      )

      const querySnapshot = await getDocs(feeHeadsRef)
      const feeHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched hostel fee heads for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        feeHeadsData,
      )
      setFeeHeads(feeHeadsData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching hostel fee heads:", error)
      toast.error("Failed to fetch hostel fee heads. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setFeeHeads([]) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFeeHead = async (newFeeHead) => {
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

    if (!newFeeHead.feeHead.trim() || !newFeeHead.accountHead.trim()) {
      toast.error("Hostel fee head and account head cannot be empty.", {
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

    // Check for duplicate fee head
    const isDuplicate = feeHeads.some(
      (feeHead) =>
        feeHead.feeHead.toLowerCase() === newFeeHead.feeHead.toLowerCase() ||
        feeHead.accountHead.toLowerCase() === newFeeHead.accountHead.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A hostel fee head or account head with this name already exists. Please choose different names.", {
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

      // Path to add a new hostel fee head
      const feeHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "HostelFeeHeadSetup",
      )

      const docRef = await addDoc(feeHeadsRef, {
        ...newFeeHead,
        createdAt: new Date(),
      })

      console.log(
        "Hostel fee head added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newFeeHeadWithId = { id: docRef.id, ...newFeeHead }
      setFeeHeads((prevFeeHeads) => [...prevFeeHeads, newFeeHeadWithId])

      setIsAddModalOpen(false)
      toast.success("Hostel fee head added successfully!", {
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
      await fetchFeeHeads()
    } catch (error) {
      console.error("Error adding hostel fee head:", error)
      toast.error("Failed to add hostel fee head. Please try again.", {
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

  const handleEditFeeHead = async (id, updatedFeeHead) => {
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

    if (!updatedFeeHead.feeHead.trim() || !updatedFeeHead.accountHead.trim()) {
      toast.error("Hostel fee head and account head cannot be empty.", {
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

    // Check for duplicate fee head
    const isDuplicate = feeHeads.some(
      (feeHead) =>
        feeHead.id !== id &&
        (feeHead.feeHead.toLowerCase() === updatedFeeHead.feeHead.toLowerCase() ||
          feeHead.accountHead.toLowerCase() === updatedFeeHead.accountHead.toLowerCase()),
    )
    if (isDuplicate) {
      toast.error("A hostel fee head or account head with this name already exists. Please choose different names.", {
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
    setNewFeeHeadData(updatedFeeHead)
  }

  const confirmEditFeeHead = async () => {
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
      // Path to update a hostel fee head
      const feeHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "HostelFeeHeadSetup",
        selectedFeeHead.id,
      )

      await updateDoc(feeHeadRef, {
        ...newFeeHeadData,
        updatedAt: new Date(),
      })

      console.log(
        "Hostel fee head updated:",
        selectedFeeHead.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setFeeHeads((prevFeeHeads) =>
        prevFeeHeads.map((feeHead) =>
          feeHead.id === selectedFeeHead.id ? { ...feeHead, ...newFeeHeadData } : feeHead,
        ),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedFeeHead(null)
      setNewFeeHeadData(null)
      toast.success("Hostel fee head updated successfully!", {
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
      await fetchFeeHeads()
    } catch (error) {
      console.error("Error updating hostel fee head:", error)
      toast.error("Failed to update hostel fee head. Please try again.", {
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

  const handleDeleteFeeHead = async (id) => {
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
      // Path to delete a hostel fee head
      const feeHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "HostelFeeHeadSetup",
        id,
      )

      await deleteDoc(feeHeadRef)
      console.log(
        "Hostel fee head deleted:",
        id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setFeeHeads((prevFeeHeads) => prevFeeHeads.filter((feeHead) => feeHead.id !== id))

      setIsDeleteModalOpen(false)
      setSelectedFeeHead(null)
      toast.success("Hostel fee head deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchFeeHeads()
    } catch (error) {
      console.error("Error deleting hostel fee head:", error)
      toast.error("Failed to delete hostel fee head. Please try again.", {
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

  const openEditModal = (feeHead) => {
    setSelectedFeeHead(feeHead)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (feeHead) => {
    setSelectedFeeHead(feeHead)
    setIsDeleteModalOpen(true)
  }

  const filteredFeeHeads = feeHeads.filter(
    (feeHead) =>
      feeHead.feeHead.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feeHead.accountHead.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <span className="current col-12">Hostel Fee Head Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="fee-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Hostel Fee Head Setup</h2>
                    <h6 className="m-0 d-lg-none">Hostel Fee Head Setup</h6>
                  </div>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-light text-dark"
                    disabled={!currentAcademicYear || isLoading}
                  >
                    + Add Hostel Fee Head
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">
                      Please select an academic year to manage hostel fee heads.
                    </div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Hostel Fee Head or Account Head"
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

                      {/* Fee Head Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Hostel Fee Head</th>
                                <th>Account Head</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {feeHeads.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              ) : filteredFeeHeads.length === 0 && searchTerm ? (
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    No matching hostel fee heads found
                                  </td>
                                </tr>
                              ) : (
                                filteredFeeHeads.map((feeHead) => (
                                  <tr key={feeHead.id}>
                                    <td>{feeHead.feeHead}</td>
                                    <td>{feeHead.accountHead}</td>
                                    <td>
                                      <Button
                                        variant="link"
                                        className="action-button edit-button me-2"
                                        onClick={() => openEditModal(feeHead)}
                                      >
                                        <FaEdit />
                                      </Button>
                                      <Button
                                        variant="link"
                                        className="action-button delete-button"
                                        onClick={() => openDeleteModal(feeHead)}
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
      <AddHostelFeeHeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddFeeHead}
      />
      <EditHostelFeeHeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFeeHead(null)
        }}
        onConfirm={handleEditFeeHead}
        feeHeadData={selectedFeeHead}
      />
      <DeleteHostelFeeHeadModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedFeeHead(null)
        }}
        onConfirm={handleDeleteFeeHead}
        feeHeadData={selectedFeeHead}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedFeeHead(null)
          setNewFeeHeadData(null)
        }}
        onConfirm={confirmEditFeeHead}
        currentFeeHead={selectedFeeHead}
        newFeeHead={newFeeHeadData}
      />

      {/* Toastify Container */}
      <ToastContainer />
    </MainContentPage>
  )
}

export default HostelFeeHeadSetup

