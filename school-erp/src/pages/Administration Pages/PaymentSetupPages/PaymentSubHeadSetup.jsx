"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table, Spinner } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { useAuthContext } from "../../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx" // For import/export functionality
import "../styles/style.css"

// Add Payment Sub Head Modal Component
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
        <h2 className="modal-title">Add Payment Sub Head</h2>
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
                    {head.name}
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

// Edit Payment Sub Head Modal Component
const EditSubHeadModal = ({ isOpen, onClose, onConfirm, subHead, mainHeads }) => {
  const [mainHeadId, setMainHeadId] = useState(subHead?.mainHeadId || "")
  const [subHeadName, setSubHeadName] = useState(subHead?.name || "")

  useEffect(() => {
    if (subHead) {
      setMainHeadId(subHead.mainHeadId)
      setSubHeadName(subHead.name)
    }
  }, [subHead])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(subHead.id, mainHeadId, subHeadName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Payment Sub Head</h2>
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
                    {head.name}
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

// Delete Payment Sub Head Modal Component
const DeleteSubHeadModal = ({ isOpen, onClose, onConfirm, subHead }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Payment Sub Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this payment sub head?</p>
          <p className="fw-bold">{subHead?.name}</p>
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
    return mainHead ? mainHead.name : "Unknown"
  }

  const getNewMainHeadName = () => {
    const mainHead = mainHeads.find((head) => head.id === newData.mainHeadId)
    return mainHead ? mainHead.name : "Unknown"
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this payment sub head? This may affect the structure of payment data.</p>
          <p>
            <strong>Current Main Head:</strong> {getCurrentMainHeadName()}
          </p>
          <p>
            <strong>Current Sub Head:</strong> {currentData.name}
          </p>
          <p>
            <strong>New Main Head:</strong> {getNewMainHeadName()}
          </p>
          <p>
            <strong>New Sub Head:</strong> {newData.name}
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

const PaymentSubHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedSubHead, setSelectedSubHead] = useState(null)
  const [newSubHeadData, setNewSubHeadData] = useState({ mainHeadId: "", name: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [mainHeads, setMainHeads] = useState([])
  const [subHeads, setSubHeads] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, currentAcademicYear } = useAuthContext()
  const location = useLocation()

  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setMainHeads([])
      setSubHeads([])
      setSearchTerm("")
      setSelectedSubHead(null)
      setNewSubHeadData({ mainHeadId: "", name: "" })
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
        setIsLoading(false)
        toast.error("Please select an academic year to view and manage payment sub heads.", {
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
        setIsLoading(false)
        toast.error("Please log in to view and manage payment sub heads.", {
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
      // Path to the PaymentHeadSetup collection
      const mainHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "PaymentHeadSetup",
      )

      const querySnapshot = await getDocs(mainHeadsRef)
      const mainHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched main payment heads for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        mainHeadsData,
      )
      setMainHeads(mainHeadsData)
    } catch (error) {
      console.error("Error fetching main payment heads:", error)
      toast.error("Failed to fetch main payment heads. Please try again.", {
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

    setError(null)
    try {
      // Path to the PaymentSubHeadSetup collection
      const subHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "PaymentSubHeadSetup",
      )

      const querySnapshot = await getDocs(subHeadsRef)
      const subHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched payment sub heads for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        subHeadsData,
      )
      setSubHeads(subHeadsData)
    } catch (error) {
      console.error("Error fetching payment sub heads:", error)
      toast.error("Failed to fetch payment sub heads. Please try again.", {
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

  const handleAddSubHead = async (mainHeadId, name) => {
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
      toast.error("Please select a main payment head.", {
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

    // Check for duplicate sub head name under the same main head
    const isDuplicate = subHeads.some(
      (subHead) => subHead.mainHeadId === mainHeadId && subHead.name.toLowerCase() === name.toLowerCase(),
    )

    if (isDuplicate) {
      toast.error(
        "A sub head with this name already exists under the selected main head. Please choose a different name.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        },
      )
      return
    }

    setIsLoading(true)
    try {
      // Ensure all necessary documents exist
      await ensureDocumentsExist()

      // Find the main head name for reference
      const mainHead = mainHeads.find((head) => head.id === mainHeadId)
      const mainHeadName = mainHead ? mainHead.name : "Unknown"

      // Path to add a new payment sub head
      const subHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "PaymentSubHeadSetup",
      )

      const docRef = await addDoc(subHeadsRef, {
        mainHeadId,
        mainHeadName, // Store the main head name for easier reference
        name,
        createdAt: new Date(),
      })

      console.log(
        "Payment sub head added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newSubHead = { id: docRef.id, mainHeadId, mainHeadName, name }
      setSubHeads((prevSubHeads) => [...prevSubHeads, newSubHead])

      setIsAddModalOpen(false)
      toast.success("Payment sub head added successfully!", {
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
      console.error("Error adding payment sub head:", error)
      toast.error("Failed to add payment sub head. Please try again.", {
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

  const handleEditSubHead = async (subHeadId, mainHeadId, name) => {
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
      toast.error("Please select a main payment head.", {
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

    // Check for duplicate sub head name under the same main head (excluding the current one)
    const isDuplicate = subHeads.some(
      (subHead) =>
        subHead.id !== subHeadId &&
        subHead.mainHeadId === mainHeadId &&
        subHead.name.toLowerCase() === name.toLowerCase(),
    )

    if (isDuplicate) {
      toast.error(
        "A sub head with this name already exists under the selected main head. Please choose a different name.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        },
      )
      return
    }

    setIsEditModalOpen(false)
    setNewSubHeadData({ mainHeadId, name })
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
      // Find the main head name for reference
      const mainHead = mainHeads.find((head) => head.id === newSubHeadData.mainHeadId)
      const mainHeadName = mainHead ? mainHead.name : "Unknown"

      // Path to update a payment sub head
      const subHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "PaymentSubHeadSetup",
        selectedSubHead.id,
      )

      await updateDoc(subHeadRef, {
        mainHeadId: newSubHeadData.mainHeadId,
        mainHeadName, // Update the main head name
        name: newSubHeadData.name,
        updatedAt: new Date(),
      })

      console.log(
        "Payment sub head updated:",
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
                mainHeadName,
                name: newSubHeadData.name,
              }
            : subHead,
        ),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedSubHead(null)
      setNewSubHeadData({ mainHeadId: "", name: "" })
      toast.success("Payment sub head updated successfully!", {
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
      console.error("Error updating payment sub head:", error)
      toast.error("Failed to update payment sub head. Please try again.", {
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
      // Path to delete a payment sub head
      const subHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "PaymentSubHeadSetup",
        subHeadId,
      )

      await deleteDoc(subHeadRef)
      console.log(
        "Payment sub head deleted:",
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
      toast.success("Payment sub head deleted successfully!", {
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
      console.error("Error deleting payment sub head:", error)
      toast.error("Failed to delete payment sub head. Please try again.", {
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

  // Import function
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

        // Path to add imported payment sub heads
        const subHeadsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AcademicYears",
          currentAcademicYear,
          "Administration",
          ADMIN_DOC_ID,
          "PaymentSubHeadSetup",
        )

        const newSubHeads = []
        let errorCount = 0

        for (const row of jsonData) {
          const mainHeadName = row["Main Head"] || row["mainHeadName"]
          const subHeadName = row["Sub Head"] || row["name"]

          if (mainHeadName && subHeadName && subHeadName.trim()) {
            // Find the main head ID by name
            const mainHead = mainHeads.find((head) => head.name.toLowerCase() === mainHeadName.toLowerCase())

            if (mainHead) {
              const mainHeadId = mainHead.id

              // Check for duplicate
              const isDuplicate = subHeads.some(
                (subHead) =>
                  subHead.mainHeadId === mainHeadId && subHead.name.toLowerCase() === subHeadName.toLowerCase(),
              )

              if (!isDuplicate) {
                const docRef = await addDoc(subHeadsRef, {
                  mainHeadId,
                  mainHeadName: mainHead.name,
                  name: subHeadName,
                  createdAt: new Date(),
                })

                newSubHeads.push({
                  id: docRef.id,
                  mainHeadId,
                  mainHeadName: mainHead.name,
                  name: subHeadName,
                })

                console.log(
                  "Imported sub head:",
                  subHeadName,
                  "under main head:",
                  mainHead.name,
                  "for user:",
                  auth.currentUser.uid,
                  "in academic year:",
                  currentAcademicYear,
                )
              }
            } else {
              errorCount++
              console.error(`Main head "${mainHeadName}" not found for sub head "${subHeadName}"`)
            }
          }
        }

        // Update UI with imported sub heads
        setSubHeads((prevSubHeads) => [...prevSubHeads, ...newSubHeads])

        if (newSubHeads.length > 0) {
          toast.success(`${newSubHeads.length} payment sub heads imported successfully!`, {
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

        if (errorCount > 0) {
          toast.warning(`${errorCount} entries could not be imported due to missing or invalid main heads.`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        }

        // Fetch fresh data
        await fetchSubHeads()
      } catch (error) {
        console.error("Error importing payment sub heads:", error)
        toast.error("Failed to import payment sub heads. Please try again.", {
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
    reader.readAsArrayBuffer(file)
  }

  // Export function
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

    if (subHeads.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = subHeads.map((subHead) => {
      // Find the main head name
      const mainHead = mainHeads.find((head) => head.id === subHead.mainHeadId)
      const mainHeadName = mainHead ? mainHead.name : subHead.mainHeadName || "Unknown"

      return {
        "Main Head": mainHeadName,
        "Sub Head": subHead.name,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "PaymentSubHeads")
    XLSX.writeFile(workbook, `PaymentSubHeads_Export_${auth.currentUser.uid}_${currentAcademicYear}.xlsx`)

    toast.success("Payment sub heads exported successfully!", {
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

  const openEditModal = (subHead) => {
    setSelectedSubHead(subHead)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (subHead) => {
    setSelectedSubHead(subHead)
    setIsDeleteModalOpen(true)
  }

  const getMainHeadName = (mainHeadId) => {
    const mainHead = mainHeads.find((head) => head.id === mainHeadId)
    return mainHead ? mainHead.name : subHeads.find((sh) => sh.mainHeadId === mainHeadId)?.mainHeadName || "Unknown"
  }

  const filteredSubHeads = subHeads.filter((subHead) => {
    const mainHeadName = getMainHeadName(subHead.mainHeadId)
    return (
      subHead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mainHeadName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <Row>
          <Col xs={12}>
            <div className="payment-sub-head-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span>Administration</span>
                <span className="separator">&gt;</span>
                <Link to="/admin/payment-setup">Payment Setup</Link>
                <span className="separator">&gt;</span>
                <span className="current">Sub Head Setup</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Payment Sub Head Setup</h2>
                    <h6 className="m-0 d-lg-none">Payment Sub Head Setup</h6>
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
                      disabled={!currentAcademicYear || subHeads.length === 0 || isLoading}
                    >
                      Export
                    </Button>
                    <Button
                      onClick={() => {
                        if (mainHeads.length === 0) {
                          toast.error("Please add main payment heads first before adding sub heads.", {
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
                    <div className="alert alert-warning">
                      Please select an academic year to manage payment sub heads.
                    </div>
                  ) : (
                    <>
                      {/* Search Bar */}
                      <Form.Control
                        type="text"
                        placeholder="Search by Main Head or Sub Head Name"
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

                      {/* Payment Sub Heads Table */}
                      {!isLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Main Head</th>
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
                                    No matching payment sub heads found
                                  </td>
                                </tr>
                              ) : (
                                filteredSubHeads.map((subHead) => (
                                  <tr key={subHead.id}>
                                    <td>{getMainHeadName(subHead.mainHeadId)}</td>
                                    <td>{subHead.name}</td>
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
          setNewSubHeadData({ mainHeadId: "", name: "" })
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

export default PaymentSubHeadSetup

