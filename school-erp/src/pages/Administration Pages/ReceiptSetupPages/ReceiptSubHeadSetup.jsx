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

// Add SubHead Modal Component
const AddSubHeadModal = ({ isOpen, onClose, onConfirm, mainHeads }) => {
  const [mainHeadId, setMainHeadId] = useState("")
  const [subHeadName, setSubHeadName] = useState("")

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setMainHeadId("")
      setSubHeadName("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(mainHeadId, subHeadName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Sub Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Select Main Head</Form.Label>
            <Form.Control
              as="select"
              value={mainHeadId}
              onChange={(e) => setMainHeadId(e.target.value)}
              className="custom-input mb-3"
            >
              <option value="">-- Select Main Head --</option>
              {mainHeads && mainHeads.length > 0 ? (
                mainHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.headName}
                  </option>
                ))
              ) : (
                <option disabled>No main heads available</option>
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Sub Head Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Sub Head Name"
              value={subHeadName}
              onChange={(e) => setSubHeadName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
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

// Edit SubHead Modal Component
const EditSubHeadModal = ({ isOpen, onClose, onConfirm, subHead, mainHeads }) => {
  const [mainHeadId, setMainHeadId] = useState(subHead?.mainHeadId || "")
  const [subHeadName, setSubHeadName] = useState(subHead?.subHeadName || "")

  useEffect(() => {
    if (subHead) {
      setMainHeadId(subHead.mainHeadId)
      setSubHeadName(subHead.subHeadName)
    }
  }, [subHead])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(subHead.id, mainHeadId, subHeadName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Sub Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Select Main Head</Form.Label>
            <Form.Control
              as="select"
              value={mainHeadId}
              onChange={(e) => setMainHeadId(e.target.value)}
              className="custom-input mb-3"
            >
              <option value="">-- Select Main Head --</option>
              {mainHeads && mainHeads.length > 0 ? (
                mainHeads.map((head) => (
                  <option key={head.id} value={head.id}>
                    {head.headName}
                  </option>
                ))
              ) : (
                <option disabled>No main heads available</option>
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Sub Head Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Sub Head Name"
              value={subHeadName}
              onChange={(e) => setSubHeadName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
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

// Delete SubHead Modal Component
const DeleteSubHeadModal = ({ isOpen, onClose, onConfirm, subHead }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Sub Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this sub head?</p>
          <p className="fw-bold">{subHead?.subHeadName}</p>
          <p>Main Head: {subHead?.mainHeadName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(subHead.id)}>
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
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentData, newData, mainHeads }) => {
  if (!isOpen) return null

  // Find main head names for display
  const getCurrentMainHeadName = () => {
    const mainHead = mainHeads.find((head) => head.id === currentData.mainHeadId)
    return mainHead ? mainHead.headName : "Unknown"
  }

  const getNewMainHeadName = () => {
    const mainHead = mainHeads.find((head) => head.id === newData.mainHeadId)
    return mainHead ? mainHead.headName : "Unknown"
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this receipt sub head? This may affect the structure of receipt data.</p>
          <p>
            <strong>Current Main Head:</strong> {getCurrentMainHeadName()}
          </p>
          <p>
            <strong>Current Sub Head:</strong> {currentData.subHeadName}
          </p>
          <p>
            <strong>New Main Head:</strong> {getNewMainHeadName()}
          </p>
          <p>
            <strong>New Sub Head:</strong> {newData.subHeadName}
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

const ReceiptSubHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedSubHead, setSelectedSubHead] = useState(null)
  const [newSubHeadData, setNewSubHeadData] = useState({ mainHeadId: "", subHeadName: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [subHeads, setSubHeads] = useState([])
  const [mainHeads, setMainHeads] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, currentAcademicYear } = useAuthContext()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setSubHeads([])
      setMainHeads([])
      setSearchTerm("")
      setSelectedSubHead(null)
      setNewSubHeadData({ mainHeadId: "", subHeadName: "" })
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
          await fetchMainHeads()
          await fetchSubHeads()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        } finally {
          setIsLoading(false)
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage receipt sub heads.", {
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
        toast.error("Please log in to view and manage receipt sub heads.", {
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

  const fetchMainHeads = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    try {
      // Path to the ReceiptHeadSetup collection
      const headsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "ReceiptHeadSetup",
      )

      const querySnapshot = await getDocs(headsRef)
      const headsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched main receipt heads for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        headsData,
      )
      setMainHeads(headsData)
    } catch (error) {
      console.error("Error fetching main receipt heads:", error)
      toast.error("Failed to fetch main receipt heads. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setMainHeads([])
    }
  }

  const fetchSubHeads = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    try {
      // Path to the ReceiptSubHeadSetup collection
      const subHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "ReceiptSubHeadSetup",
      )

      const querySnapshot = await getDocs(subHeadsRef)
      const subHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched receipt sub heads for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        subHeadsData,
      )
      setSubHeads(subHeadsData)
    } catch (error) {
      console.error("Error fetching receipt sub heads:", error)
      toast.error("Failed to fetch receipt sub heads. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setSubHeads([])
    }
  }

  const handleAddSubHead = async (mainHeadId, subHeadName) => {
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

    if (!mainHeadId) {
      toast.error("Please select a main head.", {
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

    if (!subHeadName.trim()) {
      toast.error("Sub head name cannot be empty.", {
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

    const isDuplicate = subHeads.some(
      (subHead) =>
        subHead.mainHeadId === mainHeadId && subHead.subHeadName.toLowerCase() === subHeadName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A sub head with this name already exists under the selected main head.", {
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

      const mainHead = mainHeads.find((head) => head.id === mainHeadId)
      if (!mainHead) {
        toast.error("Selected main head not found.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
        setIsLoading(false)
        return
      }

      // Path to add a new sub head
      const subHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "ReceiptSubHeadSetup",
      )

      const docRef = await addDoc(subHeadsRef, {
        mainHeadId,
        mainHeadName: mainHead.headName,
        subHeadName: subHeadName.trim(),
        createdAt: new Date(),
      })

      console.log(
        "Receipt sub head added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newSubHead = {
        id: docRef.id,
        mainHeadId,
        mainHeadName: mainHead.headName,
        subHeadName: subHeadName.trim(),
        createdAt: new Date(),
      }
      setSubHeads((prevSubHeads) => [...prevSubHeads, newSubHead])

      setIsAddModalOpen(false)
      toast.success("Receipt sub head added successfully!", {
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
      await fetchSubHeads()
    } catch (error) {
      console.error("Error adding receipt sub head:", error)
      toast.error("Failed to add receipt sub head. Please try again.", {
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

  const handleEditSubHead = async (subHeadId, mainHeadId, newSubHeadName) => {
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

    if (!mainHeadId) {
      toast.error("Please select a main head.", {
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

    if (!newSubHeadName.trim()) {
      toast.error("Sub head name cannot be empty.", {
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

    const isDuplicate = subHeads.some(
      (subHead) =>
        subHead.id !== subHeadId &&
        subHead.mainHeadId === mainHeadId &&
        subHead.subHeadName.toLowerCase() === newSubHeadName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A sub head with this name already exists under the selected main head.", {
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
    setNewSubHeadData({ mainHeadId, subHeadName: newSubHeadName })
    setIsConfirmEditModalOpen(true)
  }

  const confirmEditSubHead = async () => {
    if (!auth.currentUser || !currentAcademicYear || !selectedSubHead) {
      toast.error("User not logged in, no academic year selected, or no sub head selected. Please try again.", {
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
      const mainHead = mainHeads.find((head) => head.id === newSubHeadData.mainHeadId)
      if (!mainHead) {
        toast.error("Selected main head not found.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
        setIsLoading(false)
        return
      }

      // Path to update a sub head
      const subHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "ReceiptSubHeadSetup",
        selectedSubHead.id,
      )

      await updateDoc(subHeadRef, {
        mainHeadId: newSubHeadData.mainHeadId,
        mainHeadName: mainHead.headName,
        subHeadName: newSubHeadData.subHeadName.trim(),
        updatedAt: new Date(),
      })

      console.log(
        "Receipt sub head updated:",
        selectedSubHead.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setSubHeads((prevSubHeads) =>
        prevSubHeads.map((subHead) =>
          subHead.id === selectedSubHead.id
            ? {
                ...subHead,
                mainHeadId: newSubHeadData.mainHeadId,
                mainHeadName: mainHead.headName,
                subHeadName: newSubHeadData.subHeadName.trim(),
                updatedAt: new Date(),
              }
            : subHead,
        ),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedSubHead(null)
      setNewSubHeadData({ mainHeadId: "", subHeadName: "" })
      toast.success("Receipt sub head updated successfully!", {
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
      await fetchSubHeads()
    } catch (error) {
      console.error("Error updating receipt sub head:", error)
      toast.error("Failed to update receipt sub head. Please try again.", {
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

  const handleDeleteSubHead = async (subHeadId) => {
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
      // Path to delete a sub head
      const subHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "ReceiptSubHeadSetup",
        subHeadId,
      )

      await deleteDoc(subHeadRef)
      console.log(
        "Receipt sub head deleted:",
        subHeadId,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setSubHeads((prevSubHeads) => prevSubHeads.filter((subHead) => subHead.id !== subHeadId))

      setIsDeleteModalOpen(false)
      setSelectedSubHead(null)
      toast.success("Receipt sub head deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchSubHeads()
    } catch (error) {
      console.error("Error deleting receipt sub head:", error)
      toast.error("Failed to delete receipt sub head. Please try again.", {
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

  const openEditModal = (subHead) => {
    setSelectedSubHead(subHead)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (subHead) => {
    setSelectedSubHead(subHead)
    setIsDeleteModalOpen(true)
  }

  const filteredSubHeads = subHeads.filter(
    (subHead) =>
      (subHead.subHeadName && subHead.subHeadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subHead.mainHeadName && subHead.mainHeadName.toLowerCase().includes(searchTerm.toLowerCase())),
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
          <Link to="/admin/receipt-setup">Receipt Setup</Link>
          <span className="separator">&gt;</span>
          <span className="current">Receipt Sub Head Setup</span>
        </nav>

        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Sub Head Of Account</h2>
                    <h6 className="m-0 d-lg-none">Sub Head Of Account</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      onClick={() => {
                        if (mainHeads.length === 0) {
                          toast.error("Please add main receipt heads first before adding sub heads.", {
                            position: "top-right",
                            autoClose: 3000,
                          })
                        } else {
                          setIsAddModalOpen(true)
                        }
                      }}
                      className="btn btn-light text-dark"
                      disabled={!currentAcademicYear || isLoading}
                    >
                      + Add Sub Head
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year to manage receipt sub heads.</div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Sub Head or Main Head Name"
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

                      {/* Sub Heads Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Main Head Name</th>
                                <th>Sub Head Name</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subHeads.length === 0 ? (
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              ) : filteredSubHeads.length === 0 && searchTerm ? (
                                <tr>
                                  <td colSpan="3" className="text-center">
                                    No matching sub heads found
                                  </td>
                                </tr>
                              ) : (
                                filteredSubHeads.map((subHead) => (
                                  <tr key={subHead.id}>
                                    <td>{subHead.mainHeadName}</td>
                                    <td>{subHead.subHeadName}</td>
                                    <td>
                                      <Button
                                        variant="link"
                                        className="action-button edit-button me-2"
                                        onClick={() => openEditModal(subHead)}
                                      >
                                        <FaEdit />
                                      </Button>
                                      <Button
                                        variant="link"
                                        className="action-button delete-button"
                                        onClick={() => openDeleteModal(subHead)}
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
      <AddSubHeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddSubHead}
        mainHeads={mainHeads}
      />
      <EditSubHeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSubHead(null)
        }}
        onConfirm={handleEditSubHead}
        subHead={selectedSubHead}
        mainHeads={mainHeads}
      />
      <DeleteSubHeadModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedSubHead(null)
        }}
        onConfirm={handleDeleteSubHead}
        subHead={selectedSubHead}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedSubHead(null)
          setNewSubHeadData({ mainHeadId: "", subHeadName: "" })
        }}
        onConfirm={confirmEditSubHead}
        currentData={selectedSubHead || {}}
        newData={newSubHeadData}
        mainHeads={mainHeads}
      />

      {/* Toastify Container */}
      <ToastContainer />
    </MainContentPage>
  )
}

export default ReceiptSubHeadSetup
