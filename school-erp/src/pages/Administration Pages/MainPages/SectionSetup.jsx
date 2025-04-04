"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { useAuthContext } from "../../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"

// Add Section Modal Component
const AddSectionModal = ({ isOpen, onClose, onConfirm }) => {
  const [standard, setStandard] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(standard)
    setStandard("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Section</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Section Name"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
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
  const [standard, setStandard] = useState(section?.standard || "")

  useEffect(() => {
    if (section) {
      setStandard(section.standard)
    }
  }, [section])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(section.id, standard)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Section</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Section Name"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
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
          <p className="fw-bold">{section?.standard}</p>
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
  const [newStandard, setNewStandard] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sections, setSections] = useState([])
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setSections([])
      setSearchTerm("")
      setSelectedSection(null)
      setNewStandard("")
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setIsDeleteModalOpen(false)
      setIsConfirmEditModalOpen(false)
    }

    resetState()

    const checkAuthAndFetchData = async () => {
      if (auth.currentUser && currentAcademicYear) {
        console.log("User is authenticated:", auth.currentUser.uid, "Academic Year:", currentAcademicYear)

        // Ensure all necessary documents exist
        await ensureDocumentsExist()
        await fetchSections()
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage sections.", {
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
        toast.error("Please log in to view and manage sections.", {
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

  const fetchSections = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    try {
      // First ensure all documents exist
      await ensureDocumentsExist()

      // Path to the SectionSetup collection - now directly accessing SectionSetup without CourseItems subcollection
      const sectionsCollectionRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "SectionSetup",
      )

      const querySnapshot = await getDocs(sectionsCollectionRef)
      const sectionsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched sections for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        sectionsData,
      )
      setSections(sectionsData) // Update state with fetched data
    } catch (error) {
      console.error("Error fetching sections:", error)
      toast.error("Failed to fetch sections. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setSections([]) // Reset on error
    }
  }

  const handleAddSection = async (standard) => {
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

    if (!standard.trim()) {
      toast.error("Section name cannot be empty.", {
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

    const isDuplicate = sections.some((section) => section.standard.toLowerCase() === standard.toLowerCase())
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
      // Ensure all necessary documents exist
      await ensureDocumentsExist()

      // Path to add a new section - now directly to SectionSetup collection
      const sectionsCollectionRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "SectionSetup",
      )

      const docRef = await addDoc(sectionsCollectionRef, {
        standard,
        createdAt: new Date(),
      })

      console.log(
        "Section added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newSection = { id: docRef.id, standard }
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

      // Fetch fresh data to ensure consistency
      await fetchSections()
    } catch (error) {
      console.error("Error adding section:", error)
      toast.error("Failed to add section. Please try again.", {
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

  const handleEditSection = async (sectionId, newStandard) => {
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

    if (!newStandard.trim()) {
      toast.error("Section name cannot be empty.", {
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

    const isDuplicate = sections.some(
      (section) => section.id !== sectionId && section.standard.toLowerCase() === newStandard.toLowerCase(),
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
    setNewStandard(newStandard)
  }

  const confirmEditSection = async () => {
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

    try {
      // Path to update a section - now directly in SectionSetup collection
      const sectionDocRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "SectionSetup",
        selectedSection.id,
      )

      await updateDoc(sectionDocRef, {
        standard: newStandard,
        updatedAt: new Date(),
      })

      console.log(
        "Section updated:",
        selectedSection.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === selectedSection.id ? { ...section, standard: newStandard } : section,
        ),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedSection(null)
      setNewStandard("")
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

      // Fetch fresh data
      await fetchSections()
    } catch (error) {
      console.error("Error updating section:", error)
      toast.error("Failed to update section. Please try again.", {
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

  const handleDeleteSection = async (sectionId) => {
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

    try {
      // Path to delete a section - now directly in SectionSetup collection
      const sectionDocRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "SectionSetup",
        sectionId,
      )

      await deleteDoc(sectionDocRef)
      console.log(
        "Section deleted:",
        sectionId,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

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

      // Fetch fresh data
      await fetchSections()
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to delete section. Please try again.", {
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
        // Ensure all necessary documents exist
        await ensureDocumentsExist()

        // Path to add imported sections - now directly to SectionSetup collection
        const sectionsCollectionRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AcademicYears",
          currentAcademicYear,
          "Administration",
          ADMIN_DOC_ID,
          "SectionSetup",
        )

        const newSections = []
        for (const row of jsonData) {
          const standard = row["Section Name"] || row["standard"]
          if (standard && standard.trim()) {
            const isDuplicate = sections.some((section) => section.standard.toLowerCase() === standard.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(sectionsCollectionRef, {
                standard,
                createdAt: new Date(),
              })
              newSections.push({ id: docRef.id, standard })
              console.log(
                "Imported section:",
                standard,
                "for user:",
                auth.currentUser.uid,
                "in academic year:",
                currentAcademicYear,
              )
            }
          }
        }

        // Update UI
        setSections((prevSections) => [...prevSections, ...newSections])

        toast.success("Sections imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })

        // Fetch fresh data
        await fetchSections()
      } catch (error) {
        console.error("Error importing sections:", error)
        toast.error("Failed to import sections. Please try again.")
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

    if (sections.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = sections.map((section) => ({
      "Section Name": section.standard,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sections")
    XLSX.writeFile(workbook, `Sections_Export_${auth.currentUser.uid}_${currentAcademicYear}.xlsx`)
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

  const filteredSections = sections.filter(
    (section) => section.standard && section.standard.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator"></span>
          <span>Administration</span>
          <span className="separator"></span>
          <span className="current col-12">Section Setup</span>
        </nav>

        {/* Current Academic Year Display */}
        {currentAcademicYear && (
          <div className="academic-year-display mb-3">
            <h5 className="m-0">
              Academic Year: <span className="academic-year-value">{currentAcademicYear}</span>
            </h5>
          </div>
        )}

        <Row>
          <Col xs={12}>
            <div className="section-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Create Section Setup</h2>
                    <h6 className="m-0 d-lg-none">Create Section Setup</h6>
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
                      disabled={!currentAcademicYear}
                    >
                      Import
                    </Button>
                    <Button
                      onClick={handleExport}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || sections.length === 0}
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => setIsAddModalOpen(true)}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear}
                    >
                      + Add Section
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year to manage sections.</div>
                  ) : (
                    <>
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
                                  <td>{section.standard}</td>
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
                    </>
                  )}
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
          setNewStandard("")
        }}
        onConfirm={confirmEditSection}
        currentName={selectedSection?.standard}
        newName={newStandard}
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

          /* Academic Year Display */
          .academic-year-display {
            background-color: #f8f9fa;
            padding: 10px 15px;
            border-radius: 5px;
            border-left: 4px solid #0B3D7B;
          }

          .academic-year-value {
            font-weight: bold;
            color: #0B3D7B;
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

