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

// Add Mother Tongue Modal Component
const AddMotherTongueModal = ({ isOpen, onClose, onConfirm }) => {
  const [motherTongueName, setMotherTongueName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(motherTongueName)
    setMotherTongueName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Mother Tongue</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Mother Tongue"
            value={motherTongueName}
            onChange={(e) => setMotherTongueName(e.target.value)}
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

// Edit Mother Tongue Modal Component
const EditMotherTongueModal = ({ isOpen, onClose, onConfirm, motherTongue }) => {
  const [motherTongueName, setMotherTongueName] = useState(motherTongue?.MotherTongueName || "")

  useEffect(() => {
    if (motherTongue) {
      setMotherTongueName(motherTongue.MotherTongueName)
    }
  }, [motherTongue])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(motherTongue.id, motherTongueName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Mother Tongue</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Mother Tongue"
            value={motherTongueName}
            onChange={(e) => setMotherTongueName(e.target.value)}
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

// Delete Mother Tongue Modal Component
const DeleteMotherTongueModal = ({ isOpen, onClose, onConfirm, motherTongue }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Mother Tongue</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this mother tongue?</p>
          <p className="fw-bold">{motherTongue?.MotherTongueName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(motherTongue.id)}>
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

const MotherTongueSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMotherTongue, setSelectedMotherTongue] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [motherTongues, setMotherTongues] = useState([])
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
        toast.error("Please log in to view and manage mother tongues.", {
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
      fetchMotherTongues()
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

  const fetchMotherTongues = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const motherTonguesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "MotherTongue",
      )
      const querySnapshot = await getDocs(motherTonguesRef)
      const motherTonguesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched mother tongues:", motherTonguesData)
      setMotherTongues(motherTonguesData)
    } catch (error) {
      console.error("Error fetching mother tongues:", error)
      toast.error("Failed to fetch mother tongues. Please try again.", {
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

  const handleAddMotherTongue = async (motherTongueName) => {
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
      const motherTonguesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "MotherTongue",
      )
      const docRef = await addDoc(motherTonguesRef, { MotherTongueName: motherTongueName })
      console.log("Mother tongue added with ID:", docRef.id)
      setIsAddModalOpen(false)
      toast.success("Mother tongue added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchMotherTongues()
    } catch (error) {
      console.error("Error adding mother tongue:", error)
      toast.error("Failed to add mother tongue. Please try again.", {
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

  const handleEditMotherTongue = async (motherTongueId, newName) => {
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
      const motherTongueRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "MotherTongue",
        motherTongueId,
      )
      await updateDoc(motherTongueRef, { MotherTongueName: newName })
      console.log("Mother tongue updated:", motherTongueId)
      setIsEditModalOpen(false)
      setSelectedMotherTongue(null)
      toast.success("Mother tongue updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchMotherTongues()
    } catch (error) {
      console.error("Error updating mother tongue:", error)
      toast.error("Failed to update mother tongue. Please try again.", {
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

  const handleDeleteMotherTongue = async (motherTongueId) => {
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
      const motherTongueRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "MotherTongue",
        motherTongueId,
      )
      await deleteDoc(motherTongueRef)
      console.log("Mother tongue deleted:", motherTongueId)
      setIsDeleteModalOpen(false)
      setSelectedMotherTongue(null)
      toast.success("Mother tongue deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchMotherTongues()
    } catch (error) {
      console.error("Error deleting mother tongue:", error)
      toast.error("Failed to delete mother tongue. Please try again.", {
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

  const openEditModal = (motherTongue) => {
    setSelectedMotherTongue(motherTongue)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (motherTongue) => {
    setSelectedMotherTongue(motherTongue)
    setIsDeleteModalOpen(true)
  }

  const filteredMotherTongues = motherTongues.filter((motherTongue) =>
    motherTongue.MotherTongueName.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <span className="current col-12">Mother Tongue Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="mother-tongue-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Create Mother Tongue Setup</h2>
                  <h6 className="m-0 d-lg-none">Create Mother Tongue Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Mother Tongue
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Mother Tongue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Mother Tongue Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Mother Tongue</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMotherTongues.map((motherTongue) => (
                          <tr key={motherTongue.id}>
                            <td>{motherTongue.MotherTongueName}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(motherTongue)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(motherTongue)}
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
      <AddMotherTongueModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddMotherTongue}
      />
      <EditMotherTongueModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMotherTongue(null)
        }}
        onConfirm={handleEditMotherTongue}
        motherTongue={selectedMotherTongue}
      />
      <DeleteMotherTongueModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedMotherTongue(null)
        }}
        onConfirm={handleDeleteMotherTongue}
        motherTongue={selectedMotherTongue}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .mother-tongue-setup-container {
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

export default MotherTongueSetup

