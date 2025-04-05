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
            placeholder="Enter Blood Group Name"
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
  const [bloodGroupName, setBloodGroupName] = useState(bloodGroup?.name || "")

  useEffect(() => {
    if (bloodGroup) {
      setBloodGroupName(bloodGroup.name)
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
            placeholder="Enter Blood Group Name"
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
          <p className="fw-bold">{bloodGroup?.name}</p>
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
  const [isLoading, setIsLoading] = useState(false)
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setBloodGroups([])
      setSearchTerm("")
      setSelectedBloodGroup(null)
      setNewBloodGroupName("")
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
          await fetchBloodGroups()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        } finally {
          setIsLoading(false)
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage blood groups.", {
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
        toast.error("Please log in to view and manage blood groups.", {
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

  const fetchBloodGroups = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading(true)
    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the BloodGroupSetup collection
      const bloodGroupsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "BloodGroupSetup",
      )

      const querySnapshot = await getDocs(bloodGroupsRef)
      const bloodGroupsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched blood groups for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        bloodGroupsData,
      )
      setBloodGroups(bloodGroupsData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching blood groups:", error)
      toast.error("Failed to fetch blood groups. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setBloodGroups([]) // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBloodGroup = async (name) => {
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

    if (!name.trim()) {
      toast.error("Blood group name cannot be empty.", {
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

    const isDuplicate = bloodGroups.some((bloodGroup) => bloodGroup.name.toLowerCase() === name.toLowerCase())
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

    setIsLoading(true)
    try {
      // Ensure all necessary documents exist
      await ensureDocumentsExist()

      // Path to add a new blood group
      const bloodGroupsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "BloodGroupSetup",
      )

      const docRef = await addDoc(bloodGroupsRef, {
        name,
        createdAt: new Date(),
      })

      console.log(
        "Blood group added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newBloodGroup = { id: docRef.id, name }
      setBloodGroups((prevBloodGroups) => [...prevBloodGroups, newBloodGroup])

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

      // Fetch fresh data to ensure consistency
      await fetchBloodGroups()
    } catch (error) {
      console.error("Error adding blood group:", error)
      toast.error("Failed to add blood group. Please try again.", {
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

  const handleEditBloodGroup = async (bloodGroupId, newName) => {
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
      toast.error("Blood group name cannot be empty.", {
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

    const isDuplicate = bloodGroups.some(
      (bloodGroup) => bloodGroup.id !== bloodGroupId && bloodGroup.name.toLowerCase() === newName.toLowerCase(),
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
      // Path to update a blood group
      const bloodGroupRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "BloodGroupSetup",
        selectedBloodGroup.id,
      )

      await updateDoc(bloodGroupRef, {
        name: newBloodGroupName,
        updatedAt: new Date(),
      })

      console.log(
        "Blood group updated:",
        selectedBloodGroup.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setBloodGroups((prevBloodGroups) =>
        prevBloodGroups.map((bg) => (bg.id === selectedBloodGroup.id ? { ...bg, name: newBloodGroupName } : bg)),
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

      // Fetch fresh data
      await fetchBloodGroups()
    } catch (error) {
      console.error("Error updating blood group:", error)
      toast.error("Failed to update blood group. Please try again.", {
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

  const handleDeleteBloodGroup = async (bloodGroupId) => {
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
      // Path to delete a blood group
      const bloodGroupRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "BloodGroupSetup",
        bloodGroupId,
      )

      await deleteDoc(bloodGroupRef)
      console.log(
        "Blood group deleted:",
        bloodGroupId,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setBloodGroups((prevBloodGroups) => prevBloodGroups.filter((bg) => bg.id !== bloodGroupId))

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

      // Fetch fresh data
      await fetchBloodGroups()
    } catch (error) {
      console.error("Error deleting blood group:", error)
      toast.error("Failed to delete blood group. Please try again.", {
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

        // Path to add imported blood groups
        const bloodGroupsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AcademicYears",
          currentAcademicYear,
          "Administration",
          ADMIN_DOC_ID,
          "BloodGroupSetup",
        )

        const newBloodGroups = []
        for (const row of jsonData) {
          const name = row["Blood Group Name"] || row["name"]
          if (name && name.trim()) {
            const isDuplicate = bloodGroups.some((bg) => bg.name.toLowerCase() === name.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(bloodGroupsRef, {
                name,
                createdAt: new Date(),
              })
              newBloodGroups.push({ id: docRef.id, name })
            }
          }
        }

        // Update UI
        setBloodGroups((prevBloodGroups) => [...prevBloodGroups, ...newBloodGroups])

        toast.success("Blood groups imported successfully!", {
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
        await fetchBloodGroups()
      } catch (error) {
        console.error("Error importing blood groups:", error)
        toast.error("Failed to import blood groups. Please try again.")
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

    if (bloodGroups.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = bloodGroups.map((bg) => ({
      "Blood Group Name": bg.name,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "BloodGroups")
    XLSX.writeFile(workbook, `BloodGroups_Export_${auth.currentUser.uid}_${currentAcademicYear}.xlsx`)
    toast.success("Blood groups exported successfully!", {
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

  const openEditModal = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (bloodGroup) => {
    setSelectedBloodGroup(bloodGroup)
    setIsDeleteModalOpen(true)
  }

  const filteredBloodGroups = bloodGroups.filter((bloodGroup) =>
    bloodGroup.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Blood Group Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="blood-group-setup-container">
              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Blood Group Setup</h2>
                    <h6 className="m-0 d-lg-none">Blood Group Setup</h6>
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
                      disabled={!currentAcademicYear || bloodGroups.length === 0 || isLoading}
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || isLoading}
                    >
                      + Add Blood Group
                    </Button>
                  </div>
                </div>
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year to manage blood groups.</div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Blood Group Name"
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

                      {/* Blood Groups Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Blood Group Name</th>
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
                                    <td>{bloodGroup.name}</td>
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
                      )}
                    </>
                  )}
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
        currentName={selectedBloodGroup?.name}
        newName={newBloodGroupName}
      />

      <ToastContainer />
    </MainContentPage>
  )
}

export default BloodGroupSetup

