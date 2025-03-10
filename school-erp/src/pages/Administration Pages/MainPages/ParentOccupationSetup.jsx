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
import * as XLSX from "xlsx" // Added for import/export

// Add Parent Occupation Modal Component
const AddParentOccupationModal = ({ isOpen, onClose, onConfirm }) => {
  const [occupationName, setOccupationName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(occupationName)
    setOccupationName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Parent Occupation</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Parent Occupation"
            value={occupationName}
            onChange={(e) => setOccupationName(e.target.value)}
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

// Edit Parent Occupation Modal Component
const EditParentOccupationModal = ({ isOpen, onClose, onConfirm, occupation }) => {
  const [occupationName, setOccupationName] = useState(occupation?.name || "")

  useEffect(() => {
    if (occupation) {
      setOccupationName(occupation.name)
    }
  }, [occupation])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(occupation.id, occupationName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Parent Occupation</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Parent Occupation"
            value={occupationName}
            onChange={(e) => setOccupationName(e.target.value)}
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

// Delete Parent Occupation Modal Component
const DeleteParentOccupationModal = ({ isOpen, onClose, onConfirm, occupation }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Parent Occupation</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this parent occupation?</p>
          <p className="fw-bold">{occupation?.name}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(occupation.id)}>
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
          <p>Are you sure you want to edit this parent occupation? This may affect the structure of student data.</p>
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

const ParentOccupationSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedOccupation, setSelectedOccupation] = useState(null)
  const [newOccupationName, setNewOccupationName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [occupations, setOccupations] = useState([])
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
        toast.error("Please log in to view and manage parent occupations.", {
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
      fetchOccupations()
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

  const fetchOccupations = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const occupationsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ParentOccupation",
      )
      const querySnapshot = await getDocs(occupationsRef)
      const occupationsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched occupations:", occupationsData)
      setOccupations(occupationsData)
    } catch (error) {
      console.error("Error fetching occupations:", error)
      toast.error("Failed to fetch occupations. Please try again.", {
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

  const handleAddOccupation = async (occupationName) => {
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

    if (!occupationName.trim()) {
      toast.error("Parent occupation name cannot be empty.", {
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

    const isDuplicate = occupations.some(
      (occupation) => occupation.name.toLowerCase() === occupationName.toLowerCase()
    )
    if (isDuplicate) {
      toast.error("A parent occupation with this name already exists. Please choose a different name.", {
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
      const occupationsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ParentOccupation",
      )
      const docRef = await addDoc(occupationsRef, { name: occupationName })
      console.log("Parent Occupation added with ID:", docRef.id)

      setOccupations((prev) => [...prev, { id: docRef.id, name: occupationName }])
      setIsAddModalOpen(false)
      toast.success("Parent Occupation added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchOccupations()
    } catch (error) {
      console.error("Error adding parent occupation:", error)
      toast.error("Failed to add parent occupation. Please try again.", {
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

  const handleEditOccupation = async (occupationId, newName) => {
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

    if (!newName.trim()) {
      toast.error("Parent occupation name cannot be empty.", {
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

    const isDuplicate = occupations.some(
      (occupation) => occupation.id !== occupationId && occupation.name.toLowerCase() === newName.toLowerCase()
    )
    if (isDuplicate) {
      toast.error("A parent occupation with this name already exists. Please choose a different name.", {
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
    setNewOccupationName(newName)
  }

  const confirmEditOccupation = async () => {
    try {
      const occupationRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ParentOccupation",
        selectedOccupation.id
      )
      await updateDoc(occupationRef, { name: newOccupationName })
      console.log("Parent Occupation updated:", selectedOccupation.id)

      setOccupations((prev) =>
        prev.map((occ) => (occ.id === selectedOccupation.id ? { ...occ, name: newOccupationName } : occ))
      )
      setIsConfirmEditModalOpen(false)
      setSelectedOccupation(null)
      setNewOccupationName("")
      toast.success("Parent Occupation updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchOccupations()
    } catch (error) {
      console.error("Error updating parent occupation:", error)
      toast.error("Failed to update parent occupation. Please try again.", {
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

  const handleDeleteOccupation = async (occupationId) => {
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
      const occupationRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ParentOccupation",
        occupationId
      )
      await deleteDoc(occupationRef)
      console.log("Parent Occupation deleted:", occupationId)

      setOccupations((prev) => prev.filter((occ) => occ.id !== occupationId))
      setIsDeleteModalOpen(false)
      setSelectedOccupation(null)
      toast.success("Parent Occupation deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchOccupations()
    } catch (error) {
      console.error("Error deleting parent occupation:", error)
      toast.error("Failed to delete parent occupation. Please try again.", {
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

  const handleImport = async (event) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in.", {
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

    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        toast.error("No data found in the imported file.")
        return
      }

      try {
        const occupationsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "ParentOccupation"
        )
        const newOccupations = []
        for (const row of jsonData) {
          const name = row["Parent Occupation"] || row["name"]
          if (name && name.trim()) {
            const isDuplicate = occupations.some(
              (occ) => occ.name.toLowerCase() === name.toLowerCase()
            )
            if (!isDuplicate) {
              const docRef = await addDoc(occupationsRef, { name })
              newOccupations.push({ id: docRef.id, name })
            }
          }
        }

        setOccupations((prev) => [...prev, ...newOccupations])
        toast.success("Parent occupations imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })
        await fetchOccupations()
      } catch (error) {
        console.error("Error importing parent occupations:", error)
        toast.error("Failed to import parent occupations. Please try again.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleExport = () => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in.", {
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

    if (occupations.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = occupations.map((occ) => ({
      "Parent Occupation": occ.name,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "ParentOccupations")
    XLSX.writeFile(workbook, `ParentOccupations_Export_${auth.currentUser.uid}.xlsx`)
    toast.success("Parent occupations exported successfully!", {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openEditModal = (occupation) => {
    setSelectedOccupation(occupation)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (occupation) => {
    setSelectedOccupation(occupation)
    setIsDeleteModalOpen(true)
  }

  const filteredOccupations = occupations.filter((occupation) =>
    occupation.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Parent Occupation Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="occupation-setup-container">
              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Create Parent Occupation Setup</h2>
                    <h6 className="m-0 d-lg-none">Create Parent Occupation Setup</h6>
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
                    >
                      Import
                    </Button>
                    <Button onClick={handleExport} className="btn btn-light text-dark">
                      Export
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                      + Add Parent Occupation
                    </Button>
                  </div>
                </div>
                <div className="content-wrapper p-4">
                  <Form.Control
                    type="text"
                    placeholder="Search by Parent Occupation"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Parent Occupation</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {occupations.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredOccupations.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No matching occupations found
                            </td>
                          </tr>
                        ) : (
                          filteredOccupations.map((occupation) => (
                            <tr key={occupation.id}>
                              <td>{occupation.name}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(occupation)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(occupation)}
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
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <AddParentOccupationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddOccupation}
      />
      <EditParentOccupationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedOccupation(null)
        }}
        onConfirm={handleEditOccupation}
        occupation={selectedOccupation}
      />
      <DeleteParentOccupationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedOccupation(null)
        }}
        onConfirm={handleDeleteOccupation}
        occupation={selectedOccupation}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedOccupation(null)
          setNewOccupationName("")
        }}
        onConfirm={confirmEditOccupation}
        currentName={selectedOccupation?.name}
        newName={newOccupationName}
      />

      <ToastContainer />

      <style>
        {`
          .occupation-setup-container {
            background-color: #fff;
          }
          .custom-breadcrumb { padding: 0.5rem 1rem; }
          .custom-breadcrumb a { color: #0B3D7B; text-decoration: none; }
          .custom-breadcrumb .separator { margin: 0 0.5rem; color: #6c757d; }
          .custom-breadcrumb .current { color: #212529; }
          .form-card { background-color: #fff; border: 1px solid #dee2e6; border-radius: 0.25rem; }
          .header { border-bottom: 1px solid #dee2e6; }
          .custom-search { max-width: 300px; }
          .table-responsive { margin-bottom: 0; }
          .table th { font-weight: 500; }
          .table td { vertical-align: middle; }
          .action-button {
            width: 30px; height: 30px; display: inline-flex; align-items: center;
            justify-content: center; border-radius: 4px; padding: 0; color: white;
          }
          .edit-button { background-color: #0B3D7B; }
          .edit-button:hover { background-color: #092a54; color: white; }
          .delete-button { background-color: #dc3545; }
          .delete-button:hover { background-color: #bb2d3b; color: white; }
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background-color: rgba(0, 0, 0, 0.5); display: flex;
            justify-content: center; align-items: center; z-index: 1100;
          }
          .modal-content {
            background: white; padding: 2rem; border-radius: 8px;
            width: 90%; max-width: 400px;
          }
          .modal-title {
            font-size: 1.5rem; margin-bottom: 1rem; color: #333; text-align: center;
          }
          .modal-body { margin-bottom: 1.5rem; }
          .modal-buttons { display: flex; justify-content: center; gap: 1rem; }
          .modal-button {
            padding: 0.5rem 2rem; border: none; border-radius: 4px;
            cursor: pointer; font-weight: 500; transition: opacity 0.2s;
          }
          .modal-button.confirm { background-color: #0B3D7B; color: white; }
          .modal-button.delete { background-color: #dc3545; color: white; }
          .modal-button.cancel { background-color: #6c757d; color: white; }
          .custom-input {
            width: 100%; padding: 0.5rem; border: 1px solid #ced4da; border-radius: 4px;
          }
          .Toastify__toast-container { z-index: 9999; }
          .Toastify__toast { background-color: #0B3D7B; color: white; }
          .Toastify__toast--success { background-color: #0B3D7B; }
          .Toastify__toast--error { background-color: #dc3545; }
          .Toastify__progress-bar { background-color: rgba(255, 255, 255, 0.7); }
          .gap-2 { gap: 0.5rem; }
        `}
      </style>
    </MainContentPage>
  )
}

export default ParentOccupationSetup