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

// Add Blood Group Modal Component
const AddBloodGroupModal = ({ isOpen, onClose, onConfirm }) => {
  const [bloodGroupName, setBloodGroupName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(bloodGroupName)
    setBloodGroupName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Blood Group</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Blood Group"
            value={bloodGroupName}
            onChange={(e) => setBloodGroupName(e.target.value)}
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

// Edit Blood Group Modal Component
const EditBloodGroupModal = ({ isOpen, onClose, onConfirm, bloodGroup }) => {
  const [bloodGroupName, setBloodGroupName] = useState(bloodGroup?.BloodGroupName || "")

  useEffect(() => {
    if (bloodGroup) {
      setBloodGroupName(bloodGroup.BloodGroupName)
    }
  }, [bloodGroup])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(bloodGroup.id, bloodGroupName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Blood Group</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Blood Group"
            value={bloodGroupName}
            onChange={(e) => setBloodGroupName(e.target.value)}
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

// Delete Blood Group Modal Component
const DeleteBloodGroupModal = ({ isOpen, onClose, onConfirm, bloodGroup }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Blood Group</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this blood group?</p>
          <p className="fw-bold">{bloodGroup?.BloodGroupName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(bloodGroup.id)}>
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
          <p>Are you sure you want to edit this blood group? This may affect the structure of student data.</p>
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

const BloodGroupSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedBloodGroup, setSelectedBloodGroup] = useState(null)
  const [newBloodGroupName, setNewBloodGroupName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [bloodGroups, setBloodGroups] = useState([])
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
        toast.error("Please log in to view and manage blood groups.", {
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
      fetchBloodGroups()
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

  const fetchBloodGroups = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const bloodGroupsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "BloodGroup",
      )
      const querySnapshot = await getDocs(bloodGroupsRef)
      const bloodGroupsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched blood groups:", bloodGroupsData)
      setBloodGroups(bloodGroupsData)
    } catch (error) {
      console.error("Error fetching blood groups:", error)
      toast.error("Failed to fetch blood groups. Please try again.", {
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

  const handleAddBloodGroup = async (bloodGroupName) => {
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

    if (!bloodGroupName.trim()) {
      toast.error("Blood group name cannot be empty.", {
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

    const isDuplicate = bloodGroups.some(
      (bloodGroup) => bloodGroup.BloodGroupName.toLowerCase() === bloodGroupName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A blood group with this name already exists. Please choose a different name.", {
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
      const bloodGroupsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "BloodGroup",
      )
      const docRef = await addDoc(bloodGroupsRef, { BloodGroupName: bloodGroupName })
      console.log("Blood group added with ID:", docRef.id)

      setBloodGroups((prev) => [...prev, { id: docRef.id, BloodGroupName: bloodGroupName }])
      setIsAddModalOpen(false)
      toast.success("Blood group added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchBloodGroups()
    } catch (error) {
      console.error("Error adding blood group:", error)
      toast.error("Failed to add blood group. Please try again.", {
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

  const handleEditBloodGroup = async (bloodGroupId, newName) => {
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
      toast.error("Blood group name cannot be empty.", {
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

    const isDuplicate = bloodGroups.some(
      (bloodGroup) =>
        bloodGroup.id !== bloodGroupId && bloodGroup.BloodGroupName.toLowerCase() === newName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A blood group with this name already exists. Please choose a different name.", {
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
    setNewBloodGroupName(newName)
  }

  const confirmEditBloodGroup = async () => {
    try {
      const bloodGroupRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "BloodGroup",
        selectedBloodGroup.id,
      )
      await updateDoc(bloodGroupRef, { BloodGroupName: newBloodGroupName })
      console.log("Blood group updated:", selectedBloodGroup.id)

      setBloodGroups((prev) =>
        prev.map((bg) =>
          bg.id === selectedBloodGroup.id ? { ...bg, BloodGroupName: newBloodGroupName } : bg
        )
      )
      setIsConfirmEditModalOpen(false)
      setSelectedBloodGroup(null)
      setNewBloodGroupName("")
      toast.success("Blood group updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchBloodGroups()
    } catch (error) {
      console.error("Error updating blood group:", error)
      toast.error("Failed to update blood group. Please try again.", {
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

  const handleDeleteBloodGroup = async (bloodGroupId) => {
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
      const bloodGroupRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "BloodGroup",
        bloodGroupId,
      )
      await deleteDoc(bloodGroupRef)
      console.log("Blood group deleted:", bloodGroupId)

      setBloodGroups((prev) => prev.filter((bg) => bg.id !== bloodGroupId))
      setIsDeleteModalOpen(false)
      setSelectedBloodGroup(null)
      toast.success("Blood group deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchBloodGroups()
    } catch (error) {
      console.error("Error deleting blood group:", error)
      toast.error("Failed to delete blood group. Please try again.", {
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
        const bloodGroupsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "BloodGroup",
        )
        const newBloodGroups = []
        for (const row of jsonData) {
          const name = row["Blood Group"] || row["BloodGroupName"]
          if (name && name.trim()) {
            const isDuplicate = bloodGroups.some(
              (bg) => bg.BloodGroupName.toLowerCase() === name.toLowerCase()
            )
            if (!isDuplicate) {
              const docRef = await addDoc(bloodGroupsRef, { BloodGroupName: name })
              newBloodGroups.push({ id: docRef.id, BloodGroupName: name })
            }
          }
        }

        setBloodGroups((prev) => [...prev, ...newBloodGroups])
        toast.success("Blood groups imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })
        await fetchBloodGroups()
      } catch (error) {
        console.error("Error importing blood groups:", error)
        toast.error("Failed to import blood groups. Please try again.")
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

    if (bloodGroups.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = bloodGroups.map((bg) => ({
      "Blood Group": bg.BloodGroupName,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "BloodGroups")
    XLSX.writeFile(workbook, `BloodGroups_Export_${auth.currentUser.uid}.xlsx`)
    toast.success("Blood groups exported successfully!", {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openEditModal = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup)
    setIsDeleteModalOpen(true)
  }

  const filteredBloodGroups = bloodGroups.filter((bloodGroup) =>
    bloodGroup.BloodGroupName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator"></span>
          <span>Administration</span>
          <span className="separator"></span>
          <span className="current col-12">Blood Group Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="blood-group-setup-container">
              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Create Blood Group Setup</h2>
                    <h6 className="m-0 d-lg-none">Create Blood Group Setup</h6>
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
                      + Add Blood Group
                    </Button>
                  </div>
                </div>
                <div className="content-wrapper p-4">
                  <Form.Control
                    type="text"
                    placeholder="Search by Blood Group"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Blood Group</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bloodGroups.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredBloodGroups.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No matching blood groups found
                            </td>
                          </tr>
                        ) : (
                          filteredBloodGroups.map((bloodGroup) => (
                            <tr key={bloodGroup.id}>
                              <td>{bloodGroup.BloodGroupName}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(bloodGroup)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(bloodGroup)}
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

      <AddBloodGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddBloodGroup}
      />
      <EditBloodGroupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedBloodGroup(null)
        }}
        onConfirm={handleEditBloodGroup}
        bloodGroup={selectedBloodGroup}
      />
      <DeleteBloodGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedBloodGroup(null)
        }}
        onConfirm={handleDeleteBloodGroup}
        bloodGroup={selectedBloodGroup}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedBloodGroup(null)
          setNewBloodGroupName("")
        }}
        onConfirm={confirmEditBloodGroup}
        currentName={selectedBloodGroup?.BloodGroupName}
        newName={newBloodGroupName}
      />

      <ToastContainer />

      <style>
        {`
          .blood-group-setup-container {
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

export default BloodGroupSetup