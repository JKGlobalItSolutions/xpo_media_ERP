"use client"

import { useState, useEffect, useRef } from "react"
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

// Add Tuition Fee Modal Component
const AddTuitionFeeModal = ({ isOpen, onClose, onConfirm, courses, studentCategories, feeHeadings }) => {
  const [standard, setStandard] = useState({ id: "", name: "" })
  const [studentCategory, setStudentCategory] = useState({ id: "", name: "" })
  const [feeHeading, setFeeHeading] = useState({ id: "", name: "" })
  const [feeAmount, setFeeAmount] = useState("")
  const addButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const formRef = useRef(null)

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(
      {
        standardId: standard.id,
        standard: standard.name,
        studentCategoryId: studentCategory.id,
        studentCategory: studentCategory.name,
        feeHeadingId: feeHeading.id,
        feeHeading: feeHeading.name,
        feeAmount,
      },
      false,
    ) // false indicates it's not a final close
    setStandard({ id: "", name: "" })
    setStudentCategory({ id: "", name: "" })
    setFeeHeading({ id: "", name: "" })
    setFeeAmount("")
    formRef.current.focus() // Return focus to form
  }

  const handleClose = () => {
    onClose(true) // true indicates final close
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Tab") {
      if (document.activeElement === addButtonRef.current) {
        e.preventDefault()
        closeButtonRef.current.focus()
      }
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Tuition Fee</h2>
        <Form ref={formRef} onKeyDown={handleKeyDown}>
          <div className="modal-body">
            <Form.Group className="mb-3">
              <Form.Label className="w-100 text-start">Select Standard</Form.Label>
              <Form.Select
                value={standard.id}
                onChange={(e) => {
                  const selectedCourse = courses.find((course) => course.id === e.target.value)
                  setStandard({ id: selectedCourse.id, name: selectedCourse.standard })
                }}
                className="custom-input"
                autoFocus
              >
                <option value="">Select Standard</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.standard}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="w-100 text-start">Select Student Category</Form.Label>
              <Form.Select
                value={studentCategory.id}
                onChange={(e) => {
                  const selectedCategory = studentCategories.find((category) => category.id === e.target.value)
                  setStudentCategory({ id: selectedCategory.id, name: selectedCategory.StudentCategoryName })
                }}
                className="custom-input"
              >
                <option value="">Select Student Category</option>
                {studentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.StudentCategoryName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="w-100 text-start">Select Fee Heading</Form.Label>
              <Form.Select
                value={feeHeading.id}
                onChange={(e) => {
                  const selectedHeading = feeHeadings.find((heading) => heading.id === e.target.value)
                  setFeeHeading({ id: selectedHeading.id, name: selectedHeading.feeHead })
                }}
                className="custom-input"
              >
                <option value="">Select Fee Heading</option>
                {feeHeadings.map((heading) => (
                  <option key={heading.id} value={heading.id}>
                    {heading.feeHead}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="w-100 text-start">Fee Amount</Form.Label>
              <Form.Control
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className="custom-input"
              />
            </Form.Group>
          </div>
          <div className="modal-buttons">
            <Button ref={addButtonRef} className="modal-button confirm" onClick={handleSubmit}>
              Add Fee
            </Button>
            <Button ref={closeButtonRef} className="modal-button cancel" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}

// Edit Tuition Fee Modal Component
const EditTuitionFeeModal = ({ isOpen, onClose, onConfirm, fee, courses, studentCategories, feeHeadings }) => {
  const [standard, setStandard] = useState({ id: fee?.standardId || "", name: fee?.standard || "" })
  const [studentCategory, setStudentCategory] = useState({
    id: fee?.studentCategoryId || "",
    name: fee?.studentCategory || "",
  })
  const [feeHeading, setFeeHeading] = useState({ id: fee?.feeHeadingId || "", name: fee?.feeHeading || "" })
  const [feeAmount, setFeeAmount] = useState(fee?.feeAmount || "")

  useEffect(() => {
    if (fee) {
      setStandard({ id: fee.standardId, name: fee.standard })
      setStudentCategory({ id: fee.studentCategoryId, name: fee.studentCategory })
      setFeeHeading({ id: fee.feeHeadingId, name: fee.feeHeading })
      setFeeAmount(fee.feeAmount)
    }
  }, [fee])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(fee.id, {
      standardId: standard.id,
      standard: standard.name,
      studentCategoryId: studentCategory.id,
      studentCategory: studentCategory.name,
      feeHeadingId: feeHeading.id,
      feeHeading: feeHeading.name,
      feeAmount,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Tuition Fee</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Standard</Form.Label>
            <Form.Select
              value={standard.id}
              onChange={(e) => {
                const selectedCourse = courses.find((course) => course.id === e.target.value)
                setStandard({ id: selectedCourse.id, name: selectedCourse.standard })
              }}
              className="custom-input"
            >
              <option value="">Select Standard</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.standard}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Student Category</Form.Label>
            <Form.Select
              value={studentCategory.id}
              onChange={(e) => {
                const selectedCategory = studentCategories.find((category) => category.id === e.target.value)
                setStudentCategory({ id: selectedCategory.id, name: selectedCategory.StudentCategoryName })
              }}
              className="custom-input"
            >
              <option value="">Select Student Category</option>
              {studentCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.StudentCategoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Fee Heading</Form.Label>
            <Form.Select
              value={feeHeading.id}
              onChange={(e) => {
                const selectedHeading = feeHeadings.find((heading) => heading.id === e.target.value)
                setFeeHeading({ id: selectedHeading.id, name: selectedHeading.feeHead })
              }}
              className="custom-input"
            >
              <option value="">Select Fee Heading</option>
              {feeHeadings.map((heading) => (
                <option key={heading.id} value={heading.id}>
                  {heading.feeHead}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee Amount</Form.Label>
            <Form.Control
              type="number"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update Fee
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Tuition Fee Modal Component
const DeleteTuitionFeeModal = ({ isOpen, onClose, onConfirm, fee }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Tuition Fee</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this tuition fee entry?</p>
          <p className="fw-bold">
            {fee?.standard} - {fee?.studentCategory} - {fee?.feeHeading}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(fee.id)}>
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
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentFee, updatedFee }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this tuition fee? This may affect related data.</p>
          <div className="mb-3">
            <h6>Current Fee Details:</h6>
            <p>Standard: {currentFee?.standard}</p>
            <p>Student Category: {currentFee?.studentCategory}</p>
            <p>Fee Heading: {currentFee?.feeHeading}</p>
            <p>Fee Amount: {currentFee?.feeAmount}</p>
          </div>
          <div>
            <h6>Updated Fee Details:</h6>
            <p>Standard: {updatedFee?.standard}</p>
            <p>Student Category: {updatedFee?.studentCategory}</p>
            <p>Fee Heading: {updatedFee?.feeHeading}</p>
            <p>Fee Amount: {updatedFee?.feeAmount}</p>
          </div>
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

const TutionFeeSetup = () => {
  // Document ID for Administration
  const ADMIN_DOC_ID = "admin_doc"

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [updatedFee, setUpdatedFee] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [feeHeadings, setFeeHeadings] = useState([])
  const [courses, setCourses] = useState([])
  const [studentCategories, setStudentCategories] = useState([])
  const [tuitionFees, setTuitionFees] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedStudentCategory, setSelectedStudentCategory] = useState("")
  const [isLoading, setIsLoading] = useState({
    courses: false,
    studentCategories: false,
    feeHeadings: false,
    tuitionFees: false,
  })
  const { user, currentAcademicYear } = useAuthContext()

  // Reset state and fetch data when user or academic year changes
  useEffect(() => {
    const resetState = () => {
      setFeeHeadings([])
      setCourses([])
      setStudentCategories([])
      setTuitionFees([])
      setSearchTerm("")
      setSelectedCourse("")
      setSelectedStudentCategory("")
      setSelectedFee(null)
      setUpdatedFee(null)
      setIsAddModalOpen(false)
      setIsEditModalOpen(false)
      setIsDeleteModalOpen(false)
      setIsConfirmEditModalOpen(false)
      setIsLoading({
        courses: false,
        studentCategories: false,
        feeHeadings: false,
        tuitionFees: false,
      })
    }

    resetState()

    const checkAuthAndFetchData = async () => {
      if (auth.currentUser && currentAcademicYear) {
        console.log("User is authenticated:", auth.currentUser.uid, "Academic Year:", currentAcademicYear)

        try {
          // Ensure all necessary documents exist
          await ensureDocumentsExist()

          // Fetch all required data
          await fetchCourses()
          await fetchStudentCategories()
          await fetchFeeHeadings()
          await fetchTuitionFees()
        } catch (error) {
          console.error("Error during data fetching:", error)
          toast.error("An error occurred while loading data.")
        }
      } else if (!currentAcademicYear) {
        console.log("No academic year selected")
        toast.error("Please select an academic year to view and manage tuition fees.", {
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
        toast.error("Please log in to view and manage tuition fees.", {
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

  const fetchCourses = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading((prev) => ({ ...prev, courses: true }))
    try {
      // Path to the CourseSetup collection
      const coursesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "CourseSetup",
      )

      const querySnapshot = await getDocs(coursesRef)
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched courses for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        coursesData,
      )
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setCourses([])
    } finally {
      setIsLoading((prev) => ({ ...prev, courses: false }))
    }
  }

  const fetchStudentCategories = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading((prev) => ({ ...prev, studentCategories: true }))
    try {
      // Path to the StudentCategory collection
      const categoriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StudentCategory",
      )

      const querySnapshot = await getDocs(categoriesRef)
      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched student categories for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        categoriesData,
      )
      setStudentCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching student categories:", error)
      toast.error("Failed to fetch student categories. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setStudentCategories([])
    } finally {
      setIsLoading((prev) => ({ ...prev, studentCategories: false }))
    }
  }

  const fetchFeeHeadings = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading((prev) => ({ ...prev, feeHeadings: true }))
    try {
      // Path to the FeeHeadSetup collection
      const feeHeadingsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "FeeHeadSetup",
      )

      const querySnapshot = await getDocs(feeHeadingsRef)
      const feeHeadingsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched fee headings for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        feeHeadingsData,
      )
      setFeeHeadings(feeHeadingsData)
    } catch (error) {
      console.error("Error fetching fee headings:", error)
      toast.error("Failed to fetch fee headings. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setFeeHeadings([])
    } finally {
      setIsLoading((prev) => ({ ...prev, feeHeadings: false }))
    }
  }

  const fetchTuitionFees = async () => {
    if (!auth.currentUser || !currentAcademicYear) return

    setIsLoading((prev) => ({ ...prev, tuitionFees: true }))
    try {
      // Path to the FeeSetup collection
      const feesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "FeeSetup",
      )

      const querySnapshot = await getDocs(feesRef)
      const feesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(
        "Fetched tuition fees for user",
        auth.currentUser.uid,
        "for academic year",
        currentAcademicYear,
        ":",
        feesData,
      )
      setTuitionFees(feesData)
    } catch (error) {
      console.error("Error fetching tuition fees:", error)
      toast.error("Failed to fetch tuition fees. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      setTuitionFees([])
    } finally {
      setIsLoading((prev) => ({ ...prev, tuitionFees: false }))
    }
  }

  const handleAddFee = async (newFee, shouldClose) => {
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

    // Validate form data
    if (!newFee.standardId || !newFee.studentCategoryId || !newFee.feeHeadingId || !newFee.feeAmount) {
      toast.error("Please fill in all fields.", {
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

    // Check for duplicate entry
    const isDuplicate = tuitionFees.some(
      (fee) =>
        fee.standardId === newFee.standardId &&
        fee.studentCategoryId === newFee.studentCategoryId &&
        fee.feeHeadingId === newFee.feeHeadingId,
    )

    if (isDuplicate) {
      toast.error("A fee with the same standard, student category, and fee heading already exists.", {
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

    setIsLoading((prev) => ({ ...prev, tuitionFees: true }))
    try {
      // Ensure all necessary documents exist
      await ensureDocumentsExist()

      // Path to add a new tuition fee
      const feesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "FeeSetup",
      )

      const docRef = await addDoc(feesRef, {
        ...newFee,
        createdAt: new Date(),
      })

      console.log(
        "Tuition fee added with ID:",
        docRef.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      const newFeeWithId = { id: docRef.id, ...newFee }
      setTuitionFees((prevFees) => [...prevFees, newFeeWithId])

      if (shouldClose) {
        setIsAddModalOpen(false)
      }

      toast.success("Tuition fee added successfully!", {
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
      await fetchTuitionFees()
    } catch (error) {
      console.error("Error adding tuition fee:", error)
      toast.error("Failed to add tuition fee. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, tuitionFees: false }))
    }
  }

  const handleEditFee = async (id, updatedFee) => {
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

    // Validate form data
    if (!updatedFee.standardId || !updatedFee.studentCategoryId || !updatedFee.feeHeadingId || !updatedFee.feeAmount) {
      toast.error("Please fill in all fields.", {
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

    // Check for duplicate entry (excluding the current fee being edited)
    const isDuplicate = tuitionFees.some(
      (fee) =>
        fee.id !== id &&
        fee.standardId === updatedFee.standardId &&
        fee.studentCategoryId === updatedFee.studentCategoryId &&
        fee.feeHeadingId === updatedFee.feeHeadingId,
    )

    if (isDuplicate) {
      toast.error("A fee with the same standard, student category, and fee heading already exists.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
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
    setUpdatedFee(updatedFee)
  }

  const confirmEditFee = async () => {
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

    setIsLoading((prev) => ({ ...prev, tuitionFees: true }))
    try {
      // Path to update a tuition fee
      const feeRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "FeeSetup",
        selectedFee.id,
      )

      await updateDoc(feeRef, {
        ...updatedFee,
        updatedAt: new Date(),
      })

      console.log(
        "Tuition fee updated:",
        selectedFee.id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setTuitionFees((prevFees) => prevFees.map((fee) => (fee.id === selectedFee.id ? { ...fee, ...updatedFee } : fee)))

      setIsConfirmEditModalOpen(false)
      setSelectedFee(null)
      setUpdatedFee(null)
      toast.success("Tuition fee updated successfully!", {
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
      await fetchTuitionFees()
    } catch (error) {
      console.error("Error updating tuition fee:", error)
      toast.error("Failed to update tuition fee. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, tuitionFees: false }))
    }
  }

  const handleDeleteFee = async (id) => {
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

    setIsLoading((prev) => ({ ...prev, tuitionFees: true }))
    try {
      // Path to delete a tuition fee
      const feeRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "FeeSetup",
        id,
      )

      await deleteDoc(feeRef)
      console.log(
        "Tuition fee deleted:",
        id,
        "for user:",
        auth.currentUser.uid,
        "in academic year:",
        currentAcademicYear,
      )

      // Immediately update UI
      setTuitionFees((prevFees) => prevFees.filter((fee) => fee.id !== id))

      setIsDeleteModalOpen(false)
      setSelectedFee(null)
      toast.success("Tuition fee deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })

      // Fetch fresh data
      await fetchTuitionFees()
    } catch (error) {
      console.error("Error deleting tuition fee:", error)
      toast.error("Failed to delete tuition fee. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, tuitionFees: false }))
    }
  }

  const openEditModal = (fee) => {
    setSelectedFee(fee)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (fee) => {
    setSelectedFee(fee)
    setIsDeleteModalOpen(true)
  }

  // Custom sorting function for standards
  const sortStandards = (a, b) => {
    const order = ["LKG", "UKG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"]
    const aIndex = order.indexOf(a.standard)
    const bIndex = order.indexOf(b.standard)

    if (aIndex === -1 && bIndex === -1) return a.standard.localeCompare(b.standard)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  }

  const filteredFees = tuitionFees
    .filter(
      (fee) =>
        (selectedCourse === "" || fee.standardId === selectedCourse) &&
        (selectedStudentCategory === "" || fee.studentCategoryId === selectedStudentCategory) &&
        (fee.feeHeading.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
          fee.studentCategory.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort(sortStandards)

  const calculateTotalFee = () => {
    return filteredFees.reduce((total, fee) => total + Number(fee.feeAmount || 0), 0).toFixed(2)
  }

  // Check if any data is loading
  const isAnyLoading = Object.values(isLoading).some((loading) => loading)

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <Row>
          <Col xs={12}>
            <div className="tuition-fee-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span>Administration</span>
                <span className="separator">&gt;</span>
                <span className="current col-12">Tuition Fee Setup</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Tuition Fee Setup</h2>
                    <h6 className="m-0 d-lg-none">Tuition Fee Setup</h6>
                  </div>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn btn-light text-dark"
                    disabled={!currentAcademicYear || isAnyLoading}
                  >
                    + Add Tuition Fee
                  </Button>
                </div>

                <div className="content-wrapper p-4">
                  {!currentAcademicYear ? (
                    <div className="alert alert-warning">Please select an academic year to manage tuition fees.</div>
                  ) : (
                    <>
                      <Row className="mb-3">
                        <Col xs={12} md={6} lg={3}>
                          <Form.Group>
                            <Form.Label>Select Course</Form.Label>
                            <Form.Select
                              value={selectedCourse}
                              onChange={(e) => setSelectedCourse(e.target.value)}
                              disabled={isAnyLoading}
                            >
                              <option value="">All Courses</option>
                              {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                  {course.standard}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={6} lg={3}>
                          <Form.Group>
                            <Form.Label>Select Student Category</Form.Label>
                            <Form.Select
                              value={selectedStudentCategory}
                              onChange={(e) => setSelectedStudentCategory(e.target.value)}
                              disabled={isAnyLoading}
                            >
                              <option value="">All Categories</option>
                              {studentCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.StudentCategoryName}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col xs={12} md={12} lg={6}>
                          <Form.Group>
                            <Form.Label>Search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by Standard, Category, or Fee Heading"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              disabled={isAnyLoading}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* Loading Indicator */}
                      {isAnyLoading && (
                        <div className="text-center my-4">
                          <Spinner animation="border" role="status" variant="primary" className="loader">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                          <p className="mt-2">Loading data...</p>
                        </div>
                      )}

                      {/* Tuition Fees Table */}
                      {!isAnyLoading && (
                        <div className="table-responsive">
                          <Table bordered hover>
                            <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                              <tr>
                                <th>Standard</th>
                                <th>Student Category</th>
                                <th>Fee Heading</th>
                                <th>Fee Amount</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredFees.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="text-center">
                                    No data available
                                  </td>
                                </tr>
                              ) : (
                                filteredFees.map((fee) => (
                                  <tr key={fee.id}>
                                    <td>{fee.standard}</td>
                                    <td>{fee.studentCategory}</td>
                                    <td>{fee.feeHeading}</td>
                                    <td>{fee.feeAmount}</td>
                                    <td>
                                      <Button
                                        variant="link"
                                        className="action-button edit-button me-2"
                                        onClick={() => openEditModal(fee)}
                                      >
                                        <FaEdit />
                                      </Button>
                                      <Button
                                        variant="link"
                                        className="action-button delete-button"
                                        onClick={() => openDeleteModal(fee)}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                            {filteredFees.length > 0 && (
                              <tfoot>
                                <tr>
                                  <td colSpan="3" className="text-end fw-bold">
                                    Total Fee:
                                  </td>
                                  <td colSpan="2" className="fw-bold">
                                    {calculateTotalFee()}
                                  </td>
                                </tr>
                              </tfoot>
                            )}
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
      <AddTuitionFeeModal
        isOpen={isAddModalOpen}
        onClose={(shouldClose) => {
          if (shouldClose) setIsAddModalOpen(false)
        }}
        onConfirm={handleAddFee}
        courses={courses}
        studentCategories={studentCategories}
        feeHeadings={feeHeadings}
      />
      <EditTuitionFeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFee(null)
        }}
        onConfirm={handleEditFee}
        fee={selectedFee}
        courses={courses}
        studentCategories={studentCategories}
        feeHeadings={feeHeadings}
      />
      <DeleteTuitionFeeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedFee(null)
        }}
        onConfirm={handleDeleteFee}
        fee={selectedFee}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedFee(null)
          setUpdatedFee(null)
        }}
        onConfirm={confirmEditFee}
        currentFee={selectedFee}
        updatedFee={updatedFee}
      />

      {/* Toastify Container */}
      <ToastContainer />
    </MainContentPage>
  )
}

export default TutionFeeSetup

