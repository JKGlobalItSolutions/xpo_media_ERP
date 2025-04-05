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
import * as XLSX from "xlsx" // Added for import/export
import "../styles/style.css"

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

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentName, newName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this mother tongue? This may affect the structure of student data.</p>
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

const MotherTongueSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedMotherTongue, setSelectedMotherTongue] = useState(null)
  const [newMotherTongueName, setNewMotherTongueName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [motherTongues, setMotherTongues] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setMotherTongues([])
      setSearchTerm("")
      setSelectedMotherTongue(null)
      setNewMotherTongueName("")
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
          await fetchMotherTongues()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        } finally {
          setIsLoading(false)
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage mother tongues.", {
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
        toast.error("Please log in to view and manage mother tongues.", {
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

  const fetchMotherTongues = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading(true)
    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the MotherTongue collection
      const motherTonguesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "MotherTongue",
      )

      const querySnapshot = await getDocs(motherTonguesRef)
      const motherTonguesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched mother tongues for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        motherTonguesData,
      )
      setMotherTongues(motherTonguesData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching mother tongues:", error)
      toast.error("Failed to fetch mother tongues. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setMotherTongues([]) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMotherTongue = async (motherTongueName) => {
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

    if (!motherTongueName.trim()) {
      toast.error("Mother tongue name cannot be empty.", {
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

    const isDuplicate = motherTongues.some(
      (motherTongue) => motherTongue.MotherTongueName.toLowerCase() === motherTongueName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A mother tongue with this name already exists. Please choose a different name.", {
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

      // Path to add a new mother tongue
      const motherTonguesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "MotherTongue",
      )

      const docRef = await addDoc(motherTonguesRef, {
        MotherTongueName: motherTongueName,
        createdAt: new Date(),
      })

      console.log(
        "Mother tongue added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newMotherTongue = { id: docRef.id, MotherTongueName: motherTongueName }
      setMotherTongues((prevMotherTongues) => [...prevMotherTongues, newMotherTongue])

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

      // Fetch fresh data to ensure consistency
      await fetchMotherTongues()
    } catch (error) {
      console.error("Error adding mother tongue:", error)
      toast.error("Failed to add mother tongue. Please try again.", {
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

  const handleEditMotherTongue = async (motherTongueId, newName) => {
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
      toast.error("Mother tongue name cannot be empty.", {
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

    const isDuplicate = motherTongues.some(
      (motherTongue) =>
        motherTongue.id !== motherTongueId && motherTongue.MotherTongueName.toLowerCase() === newName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A mother tongue with this name already exists. Please choose a different name.", {
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
    setNewMotherTongueName(newName)
  }

  const confirmEditMotherTongue = async () => {
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
      // Path to update a mother tongue
      const motherTongueRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "MotherTongue",
        selectedMotherTongue.id,
      )

      await updateDoc(motherTongueRef, {
        MotherTongueName: newMotherTongueName,
        updatedAt: new Date(),
      })

      console.log(
        "Mother tongue updated:",
        selectedMotherTongue.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setMotherTongues((prevMotherTongues) =>
        prevMotherTongues.map((mt) =>
          mt.id === selectedMotherTongue.id ? { ...mt, MotherTongueName: newMotherTongueName } : mt,
        ),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedMotherTongue(null)
      setNewMotherTongueName("")
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

      // Fetch fresh data
      await fetchMotherTongues()
    } catch (error) {
      console.error("Error updating mother tongue:", error)
      toast.error("Failed to update mother tongue. Please try again.", {
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

  const handleDeleteMotherTongue = async (motherTongueId) => {
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
      // Path to delete a mother tongue
      const motherTongueRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "MotherTongue",
        motherTongueId,
      )

      await deleteDoc(motherTongueRef)
      console.log(
        "Mother tongue deleted:",
        motherTongueId,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setMotherTongues((prevMotherTongues) => prevMotherTongues.filter((mt) => mt.id !== motherTongueId))

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

      // Fetch fresh data
      await fetchMotherTongues()
    } catch (error) {
      console.error("Error deleting mother tongue:", error)
      toast.error("Failed to delete mother tongue. Please try again.", {
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

        // Path to add imported mother tongues
        const motherTonguesRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AcademicYears",
          currentAcademicYear,
          "Administration",
          ADMIN_DOC_ID,
          "MotherTongue",
        )

        const newMotherTongues = []
        for (const row of jsonData) {
          const name = row["Mother Tongue"] || row["MotherTongueName"]
          if (name && name.trim()) {
            const isDuplicate = motherTongues.some((mt) => mt.MotherTongueName.toLowerCase() === name.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(motherTonguesRef, {
                MotherTongueName: name,
                createdAt: new Date(),
              })
              newMotherTongues.push({ id: docRef.id, MotherTongueName: name })
            }
          }
        }

        // Update UI
        setMotherTongues((prevMotherTongues) => [...prevMotherTongues, ...newMotherTongues])

        toast.success("Mother tongues imported successfully!", {
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
        await fetchMotherTongues()
      } catch (error) {
        console.error("Error importing mother tongues:", error)
        toast.error("Failed to import mother tongues. Please try again.")
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

    if (motherTongues.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = motherTongues.map((mt) => ({
      "Mother Tongue": mt.MotherTongueName,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "MotherTongues")
    XLSX.writeFile(workbook, `MotherTongues_Export_${auth.currentUser.uid}_${currentAcademicYear}.xlsx`)
    toast.success("Mother tongues exported successfully!", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: { background: "#0B3D7B", color: "white" },
    })
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
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Create Mother Tongue Setup</h2>
                    <h6 className="m-0 d-lg-none">Create Mother Tongue Setup</h6>
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
                      disabled={!currentAcademicYear || motherTongues.length === 0 || isLoading}
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || isLoading}
                    >
                      + Add Mother Tongue
                    </Button>
                  </div>
                </div>
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year to manage mother tongues.</div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Mother Tongue"
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

                      {/* Mother Tongues Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Mother Tongue</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {motherTongues.length === 0 ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              ) : filteredMotherTongues.length === 0 && searchTerm ? (
                                <tr>
                                  <td colSpan="2" className="text-center">
                                    No matching mother tongues found
                                  </td>
                                </tr>
                              ) : (
                                filteredMotherTongues.map((motherTongue) => (
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
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedMotherTongue(null)
          setNewMotherTongueName("")
        }}
        onConfirm={confirmEditMotherTongue}
        currentName={selectedMotherTongue?.MotherTongueName}
        newName={newMotherTongueName}
      />

      <ToastContainer />
    </MainContentPage>
  )
}

export default MotherTongueSetup

