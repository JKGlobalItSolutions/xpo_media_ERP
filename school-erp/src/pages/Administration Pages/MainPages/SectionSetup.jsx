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
import * as XLSX from "xlsx" // Added for import/export functionality

// Add Section Modal Component
const AddSectionModal = ({ isOpen, onClose, onConfirm }) => {
  const [sectionName, setSectionName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(sectionName)
    setSectionName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Section</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Section Name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
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

// Edit Section Modal Component
const EditSectionModal = ({ isOpen, onClose, onConfirm, section }) => {
  const [sectionName, setSectionName] = useState(section?.name || "")

  useEffect(() => {
    if (section) {
      setSectionName(section.name)
    }
  }, [section])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(section.id, sectionName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Section</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Section Name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
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

// Delete Section Modal Component
const DeleteSectionModal = ({ isOpen, onClose, onConfirm, section }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Section</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this section?</p>
          <p className="fw-bold">{section?.name}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(section.id)}>
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
          <p>Are you sure you want to edit this section? This may affect the structure of student data.</p>
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

const SectionSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [newSectionName, setNewSectionName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sections, setSections] = useState([])
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
        toast.error("Please log in to view and manage sections.", {
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
      fetchSections()
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

  const fetchSections = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const sectionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "SectionSetup",
      )
      const querySnapshot = await getDocs(sectionsRef)
      const sectionsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched sections:", sectionsData)
      setSections(sectionsData)
    } catch (error) {
      console.error("Error fetching sections:", error)
      toast.error("Failed to fetch sections. Please try again.", {
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

  const handleAddSection = async (name) => {
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

    if (!name.trim()) {
      toast.error("Section name cannot be empty.", {
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

    const isDuplicate = sections.some((section) => section.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      toast.error("A section with this name already exists. Please choose a different name.", {
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
      const sectionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "SectionSetup",
      )
      const docRef = await addDoc(sectionsRef, { name })
      console.log("Section added with ID:", docRef.id)

      // Immediately update UI
      const newSection = { id: docRef.id, name }
      setSections((prevSections) => [...prevSections, newSection])

      setIsAddModalOpen(false)
      toast.success("Section added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchSections()
    } catch (error) {
      console.error("Error adding section:", error)
      toast.error("Failed to add section. Please try again.", {
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

  const handleEditSection = async (sectionId, newName) => {
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
      toast.error("Section name cannot be empty.", {
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

    const isDuplicate = sections.some(
      (section) => section.id !== sectionId && section.name.toLowerCase() === newName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A section with this name already exists. Please choose a different name.", {
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
    setNewSectionName(newName)
  }

  const confirmEditSection = async () => {
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
      const sectionRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "SectionSetup",
        selectedSection.id,
      )
      await updateDoc(sectionRef, { name: newSectionName })
      console.log("Section updated:", selectedSection.id)

      // Immediately update UI
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === selectedSection.id ? { ...section, name: newSectionName } : section
        )
      )

      setIsConfirmEditModalOpen(false)
      setSelectedSection(null)
      setNewSectionName("")
      toast.success("Section updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchSections()
    } catch (error) {
      console.error("Error updating section:", error)
      toast.error("Failed to update section. Please try again.", {
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

  const handleDeleteSection = async (sectionId) => {
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
      const sectionRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "SectionSetup",
        sectionId,
      )
      await deleteDoc(sectionRef)
      console.log("Section deleted:", sectionId)

      // Immediately update UI
      setSections((prevSections) => prevSections.filter((section) => section.id !== sectionId))

      setIsDeleteModalOpen(false)
      setSelectedSection(null)
      toast.success("Section deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchSections()
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to delete section. Please try again.", {
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

  // Import function (mirrors CourseSetup.jsx)
  const handleImport = async (event) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
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
        const sectionsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "SectionSetup",
        )
        const newSections = []
        for (const row of jsonData) {
          const name = row["Section Name"] || row["name"]
          if (name && name.trim()) {
            const isDuplicate = sections.some((section) => section.name.toLowerCase() === name.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(sectionsRef, { name })
              newSections.push({ id: docRef.id, name })
              console.log("Imported section:", name, "for user:", auth.currentUser.uid)
            }
          }
        }

        // Update UI with imported sections
        setSections((prevSections) => [...prevSections, ...newSections])

        toast.success("Sections imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })
        await fetchSections()
      } catch (error) {
        console.error("Error importing sections:", error)
        toast.error("Failed to import sections. Please try again.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Export function (mirrors CourseSetup.jsx)
  const handleExport = () => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
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

    if (sections.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = sections.map((section) => ({
      "Section Name": section.name,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sections")
    XLSX.writeFile(workbook, `Sections_Export_${auth.currentUser.uid}.xlsx`)
    toast.success("Sections exported successfully!", {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openEditModal = (section) => {
    setSelectedSection(section)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (section) => {
    setSelectedSection(section)
    setIsDeleteModalOpen(true)
  }

  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <span className="current col-12">Section Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="section-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Section Setup</h2>
                    <h6 className="m-0 d-lg-none">Section Setup</h6>
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
                      + Add Section
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Section Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Section Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Section Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sections.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredSections.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No matching sections found
                            </td>
                          </tr>
                        ) : (
                          filteredSections.map((section) => (
                            <tr key={section.id}>
                              <td>{section.name}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(section)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(section)}
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

      {/* Modals */}
      <AddSectionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onConfirm={handleAddSection} />
      <EditSectionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSection(null)
        }}
        onConfirm={handleEditSection}
        section={selectedSection}
      />
      <DeleteSectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedSection(null)
        }}
        onConfirm={handleDeleteSection}
        section={selectedSection}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedSection(null)
          setNewSectionName("")
        }}
        onConfirm={confirmEditSection}
        currentName={selectedSection?.name}
        newName={newSectionName}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .section-setup-container {
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

          .gap-2 {
            gap: 0.5rem;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default SectionSetup