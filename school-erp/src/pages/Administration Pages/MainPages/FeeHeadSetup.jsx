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

// Add Fee Head Modal Component
const AddFeeHeadModal = ({ isOpen, onClose, onConfirm }) => {
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
        <h2 className="modal-title">Add Fee Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Enter New Fee Head</Form.Label>
            <Form.Control
              type="text"
              placeholder="1 term"
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
            Create Fee Head
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Fee Head Modal Component
const EditFeeHeadModal = ({ isOpen, onClose, onConfirm, feeHeadData }) => {
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
        <h2 className="modal-title">Edit Fee Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Edit Fee Head</Form.Label>
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
            Update Fee Head
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Fee Head Modal Component
const DeleteFeeHeadModal = ({ isOpen, onClose, onConfirm, feeHeadData }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Fee Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this fee head?</p>
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
          <p>Are you sure you want to edit this fee head? This may affect the structure of student fee data.</p>
          <p>
            <strong>Current Fee Head:</strong> {currentFeeHead.feeHead}
          </p>
          <p>
            <strong>New Fee Head:</strong> {newFeeHead.feeHead}
          </p>
          <p>
            <strong>Current Account Head:</strong> {currentFeeHead.accountHead}
          </p>
          <p>
            <strong>New Account Head:</strong> {newFeeHead.accountHead}
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

const FeeHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedFeeHead, setSelectedFeeHead] = useState(null)
  const [newFeeHeadData, setNewFeeHeadData] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [feeHeads, setFeeHeads] = useState([])
  const [error, setError] = useState(null)
  const [administrationId, setAdministrationId] = useState(null)
  const { user } = useAuthContext()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchAdministrationId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage fee heads.", {
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
      fetchFeeHeads()
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

  const fetchFeeHeads = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const feeHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "FeeHeadSetup",
      )
      const querySnapshot = await getDocs(feeHeadsRef)
      const feeHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched fee heads:", feeHeadsData)
      setFeeHeads(feeHeadsData)
    } catch (error) {
      console.error("Error fetching fee heads:", error)
      toast.error("Failed to fetch fee heads. Please try again.", {
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

  const handleAddFeeHead = async (newFeeHead) => {
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

    // Check for duplicate fee head
    const isDuplicate = feeHeads.some(
      (feeHead) =>
        feeHead.feeHead.toLowerCase() === newFeeHead.feeHead.toLowerCase() ||
        feeHead.accountHead.toLowerCase() === newFeeHead.accountHead.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A fee head or account head with this name already exists. Please choose different names.", {
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

    try {
      const feeHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "FeeHeadSetup",
      )
      const docRef = await addDoc(feeHeadsRef, newFeeHead)
      console.log("Fee head added with ID:", docRef.id)
      setIsAddModalOpen(false)
      toast.success("Fee head added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchFeeHeads()
    } catch (error) {
      console.error("Error adding fee head:", error)
      toast.error("Failed to add fee head. Please try again.", {
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

  const handleEditFeeHead = async (id, updatedFeeHead) => {
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

    // Check for duplicate fee head
    const isDuplicate = feeHeads.some(
      (feeHead) =>
        feeHead.id !== id &&
        (feeHead.feeHead.toLowerCase() === updatedFeeHead.feeHead.toLowerCase() ||
          feeHead.accountHead.toLowerCase() === updatedFeeHead.accountHead.toLowerCase()),
    )
    if (isDuplicate) {
      toast.error("A fee head or account head with this name already exists. Please choose different names.", {
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
    try {
      const feeHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "FeeHeadSetup",
        selectedFeeHead.id,
      )
      await updateDoc(feeHeadRef, newFeeHeadData)
      console.log("Fee head updated:", selectedFeeHead.id)
      setIsConfirmEditModalOpen(false)
      setSelectedFeeHead(null)
      setNewFeeHeadData(null)
      toast.success("Fee head updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchFeeHeads()
    } catch (error) {
      console.error("Error updating fee head:", error)
      toast.error("Failed to update fee head. Please try again.", {
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

  const handleDeleteFeeHead = async (id) => {
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
      const feeHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "FeeHeadSetup",
        id,
      )
      await deleteDoc(feeHeadRef)
      console.log("Fee head deleted:", id)
      setIsDeleteModalOpen(false)
      setSelectedFeeHead(null)
      toast.error("Fee head deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchFeeHeads()
    } catch (error) {
      console.error("Error deleting fee head:", error)
      toast.error("Failed to delete fee head. Please try again.", {
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
          <span className="current col-12">Fee Head Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="fee-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Fee Head Setup</h2>
                  <h6 className="m-0 d-lg-none">Fee Head Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Fee Head
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Fee Head or Account Head"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Fee Head Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Fee Head</th>
                          <th>Account Head</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeeHeads.map((feeHead) => (
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
      <AddFeeHeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onConfirm={handleAddFeeHead} />
      <EditFeeHeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFeeHead(null)
        }}
        onConfirm={handleEditFeeHead}
        feeHeadData={selectedFeeHead}
      />
      <DeleteFeeHeadModal
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

      <style>
        {`
          .fee-setup-container {
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

export default FeeHeadSetup

