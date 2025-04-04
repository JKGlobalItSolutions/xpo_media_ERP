"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Button, Row, Col, Container, Table, ListGroup, Modal, Card, Image } from "react-bootstrap"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { db, auth, storage } from "../../Firebase/config"
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  limit,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
} from "firebase/firestore"
import { ref, getDownloadURL } from "firebase/storage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import PaymentHistoryModal from "./PaymentHistoryModal"
import BillPreviewModal from "./BillPreviewModal"

// Import the static profile image
import defaultProfileImage from "../../images/StudentProfileIcon/studentProfile.jpeg"

const BusBill = () => {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const confirmYesButtonRef = useRef(null)

  // State for administration and transport IDs
  const [administrationId, setAdministrationId] = useState(null)
  const [transportId, setTransportId] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState({ name: "", address: "" })

  // Bill data state
  const [billData, setBillData] = useState({
    billNumber: "",
    admissionNumber: "ADM",
    studentName: "",
    fatherName: "",
    course: "",
    section: "",
    pickupPoint: "",
    billDate: new Date(),
    balance: "0",
    paidAmount: "0",
    balanceAmount: "0",
    paymentMode: "Cash",
    paymentNumber: "",
    operatorName: "XPO ADMIN",
    transactionNarrative: "",
    transactionDate: null,
  })

  const [feeDetails, setFeeDetails] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const [studentData, setStudentData] = useState(null)
  const [feeTableData, setFeeTableData] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)
  const [studentImageUrl, setStudentImageUrl] = useState(null)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [studentLoaded, setStudentLoaded] = useState(false)

  // State for history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState([])

  // State for student search dropdown
  const [studentsList, setStudentsList] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState(null)

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // State for bill preview modal
  const [showBillPreviewModal, setShowBillPreviewModal] = useState(false)

  // State to track if bill number is locked
  const [billNumberLocked, setBillNumberLocked] = useState(false)

  // Fetch school info
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const schoolDoc = doc(db, "Schools", auth.currentUser.uid)
        const schoolSnapshot = await getDoc(schoolDoc)
        if (schoolSnapshot.exists()) {
          const data = schoolSnapshot.data()
          setSchoolInfo({
            name: data.SchoolName || "XPOMEDIA MATRIC. HR. SEC. SCHOOL",
            address: data.SchoolAddres || "TIRUVANNAMALAIA 606601",
          })
        }
      } catch (error) {
        console.error("Error fetching school information:", error)
      }
    }

    fetchSchoolInfo()
  }, [])

  // Generate bill number based on last bill entry
  useEffect(() => {
    const generateBillNumber = async () => {
      if (!administrationId) return

      try {
        // Get the current date for financial year calculation
        const currentDate = new Date()
        const financialYear = `${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().slice(-2)}`

        // Query the BusBillEntries collection to get the last bill
        const billEntriesRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Transactions",
          administrationId,
          "BusBillEntries",
        )

        // Order by timestamp in descending order and limit to 1 to get the most recent bill
        const q = query(billEntriesRef, orderBy("timestamp", "desc"), limit(1))
        const querySnapshot = await getDocs(q)

        let nextNumber = 1 // Default to 1 if no previous bills exist

        if (!querySnapshot.empty) {
          const lastBill = querySnapshot.docs[0].data()

          // Extract the bill number from the last bill
          if (lastBill.billNumber) {
            // Parse the bill number format (e.g., "123/2023-24")
            const parts = lastBill.billNumber.split("/")
            if (parts.length > 0) {
              const lastBillNumber = Number.parseInt(parts[0])

              // Check if the financial year is the same
              if (parts[1] === financialYear) {
                nextNumber = lastBillNumber + 1
              } else {
                // If it's a new financial year, start from 1
                nextNumber = 1
              }
            }
          }
        }

        // Set the new bill number
        const newBillNumber = `${nextNumber}/${financialYear}`
        setBillData((prev) => ({ ...prev, billNumber: newBillNumber }))
        setBillNumberLocked(true)
      } catch (error) {
        console.error("Error generating bill number:", error)
        toast.error("Failed to generate bill number")
      }
    }

    if (administrationId && !billNumberLocked) {
      generateBillNumber()
    }
  }, [administrationId, billNumberLocked])

  // Helper function to generate a new bill number
  const getNextBillNumber = async () => {
    if (!administrationId) return null

    try {
      // Get the current date for financial year calculation
      const currentDate = new Date()
      const financialYear = `${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().slice(-2)}`

      // Query the BusBillEntries collection to get the last bill
      const billEntriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transactions",
        administrationId,
        "BusBillEntries",
      )

      // Order by timestamp in descending order and limit to 1 to get the most recent bill
      const q = query(billEntriesRef, orderBy("timestamp", "desc"), limit(1))
      const querySnapshot = await getDocs(q)

      let nextNumber = 1 // Default to 1 if no previous bills exist

      if (!querySnapshot.empty) {
        const lastBill = querySnapshot.docs[0].data()

        // Extract the bill number from the last bill
        if (lastBill.billNumber) {
          // Parse the bill number format (e.g., "123/2023-24")
          const parts = lastBill.billNumber.split("/")
          if (parts.length > 0) {
            const lastBillNumber = Number.parseInt(parts[0])

            // Check if the financial year is the same
            if (parts[1] === financialYear) {
              nextNumber = lastBillNumber + 1
            } else {
              // If it's a new financial year, start from 1
              nextNumber = 1
            }
          }
        }
      }

      // Return the new bill number
      return `${nextNumber}/${financialYear}`
    } catch (error) {
      console.error("Error generating next bill number:", error)
      return null
    }
  }

  // Check if a bill number already exists
  const checkBillNumberExists = async (billNumber) => {
    if (!administrationId || !billNumber) return false

    try {
      const billEntriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transactions",
        administrationId,
        "BusBillEntries",
      )

      const q = query(billEntriesRef, where("billNumber", "==", billNumber))
      const querySnapshot = await getDocs(q)

      return !querySnapshot.empty
    } catch (error) {
      console.error("Error checking bill number existence:", error)
      return false
    }
  }

  // Fetch administration and transport IDs
  useEffect(() => {
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
        toast.error("Failed to initialize. Please try again.")
      }
    }

    const fetchTransportId = async () => {
      try {
        const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
        const q = query(transportRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          const newTransportRef = await addDoc(transportRef, { createdAt: new Date() })
          setTransportId(newTransportRef.id)
        } else {
          setTransportId(querySnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching/creating Transport ID:", error)
        toast.error("Failed to initialize transport. Please try again.")
      }
    }

    fetchAdministrationId()
    fetchTransportId()
  }, [])

  // Fetch fee heads
  useEffect(() => {
    if (!administrationId) return

    const fetchFeeHeads = async () => {
      try {
        const feeHeadRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "FeeHeadSetup",
        )
        const snapshot = await getDocs(feeHeadRef)

        // Filter fee heads to only include Bus Fee types
        const feeHeadData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (head) =>
              head.type === "Bus Fee" || head.category === "Bus Fee" || head.heading?.toLowerCase().includes("bus"),
          )

        setFeeHeads(feeHeadData)
      } catch (error) {
        console.error("Error fetching fee heads:", error)
        toast.error("Failed to fetch fee heads")
      }
    }

    fetchFeeHeads()
  }, [administrationId])

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle Enter key press for confirmation modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && showConfirmModal) {
        e.preventDefault()
        confirmYesButtonRef.current?.click()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showConfirmModal])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBillData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-search functionality for admission number
    if (name === "admissionNumber") {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      if (value.trim() === "") {
        setShowDropdown(false)
        return
      }

      const timeoutId = setTimeout(() => {
        searchStudents(value)
      }, 300)

      setSearchTimeout(timeoutId)
    }
  }

  // Handle date changes
  const handleDateChange = (date, name) => {
    setBillData((prev) => ({
      ...prev,
      [name]: date,
    }))
  }

  // Search students by admission number
  const searchStudents = async (searchTerm) => {
    if (!administrationId || searchTerm.trim() === "") return

    try {
      const admissionRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )

      // Query for students whose admission number starts with the search term
      const q = query(
        admissionRef,
        where("admissionNumber", ">=", searchTerm),
        where("admissionNumber", "<=", searchTerm + "\uf8ff"),
        limit(10),
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setStudentsList([])
        setShowDropdown(false)
        return
      }

      const students = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        admissionNumber: doc.data().admissionNumber,
        studentName: doc.data().studentName,
      }))

      setStudentsList(students)
      setShowDropdown(true)
    } catch (error) {
      console.error("Error searching students:", error)
      toast.error("Failed to search students")
    }
  }

  // Handle student selection from dropdown
  const handleStudentSelect = (admissionNumber) => {
    setBillData((prev) => ({
      ...prev,
      admissionNumber,
    }))
    setShowDropdown(false)
    fetchStudentDataByAdmissionNumber(admissionNumber)
  }

  // Fetch student data by admission number
  const fetchStudentData = async () => {
    if (!billData.admissionNumber || !administrationId) return
    fetchStudentDataByAdmissionNumber(billData.admissionNumber)
  }

  // Helper function to check if a fee is a bus fee
  const isBusFee = (fee) => {
    return (
      fee.type === "Bus Fee" ||
      fee.category === "Bus Fee" ||
      (fee.heading && fee.heading.toLowerCase().includes("bus")) ||
      (fee.heading && fee.heading.toLowerCase().includes("transport"))
    )
  }

  // Fetch student data by admission number (reusable function)
  const fetchStudentDataByAdmissionNumber = async (admissionNumber) => {
    if (!admissionNumber || !administrationId) return

    setIsLoading(true)
    setStudentImageUrl(null) // Reset image URL

    try {
      // Query for student in AdmissionSetup
      const admissionRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(admissionRef, where("admissionNumber", "==", admissionNumber))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.error("No student found with this admission number")
        setIsLoading(false)
        return
      }

      const studentDoc = querySnapshot.docs[0]
      const student = studentDoc.data()

      // Fetch student fee details
      const studentFeeRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "StudentFeeDetails",
        studentDoc.id,
      )
      const feeSnapshot = await getDoc(studentFeeRef)

      if (!feeSnapshot.exists()) {
        toast.error("No fee details found for this student")
        setIsLoading(false)
        return
      }

      const feeData = feeSnapshot.data()
      // Filter to only include Bus Fee types
      const allFeeDetails = feeData.feeDetails || []
      const busFeeDetails = allFeeDetails.filter((fee) => isBusFee(fee))

      if (busFeeDetails.length === 0) {
        toast.error("No bus fee details found for this student")
        setIsLoading(false)
        return
      }

      // Calculate total balance for bus fees only
      let totalBalance = 0
      busFeeDetails.forEach((fee) => {
        totalBalance += Number.parseFloat(fee.amount) || 0
      })

      // Load student image
      if (student.studentPhoto) {
        try {
          console.log("Student photo data:", student.studentPhoto)
          let photoUrl = student.studentPhoto

          // Check if the studentPhoto is a path or a URL
          if (!photoUrl.startsWith("http") && !photoUrl.startsWith("blob")) {
            // If it's a path, get the download URL
            const imageRef = ref(storage, photoUrl)
            photoUrl = await getDownloadURL(imageRef)
          }

          console.log("Student photo URL:", photoUrl)
          setStudentImageUrl(photoUrl)
        } catch (error) {
          console.error("Error fetching student image:", error)
          // Set the default image if there's an error
          setStudentImageUrl(defaultProfileImage)
        }
      } else {
        console.log("No student photo found, using default image")
        setStudentImageUrl(defaultProfileImage)
      }

      // Update states with fetched data
      setStudentData({
        id: studentDoc.id,
        ...student,
      })

      setFeeDetails(busFeeDetails)
      setFeeTableData(
        busFeeDetails.map((fee) => ({
          ...fee,
          type: "Bus Fee", // Ensure type is set to Bus Fee
          paidAmount: "0",
          concessionAmount: "0", // Initialize concession amount
          remainingBalance: fee.amount,
          status: "Pending",
        })),
      )
      setTotalBalance(totalBalance)

      setBillData((prev) => ({
        ...prev,
        studentName: student.studentName || "",
        fatherName: student.fatherName || "",
        course: student.standard || "",
        section: student.section || "",
        pickupPoint: student.boardingPoint || "",
        balance: totalBalance.toFixed(2),
        balanceAmount: totalBalance.toFixed(2),
      }))

      setStudentLoaded(true)
      toast.success("Student bus fee data loaded successfully")
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
      // Set the default image if there's an error
      setStudentImageUrl(defaultProfileImage)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle fee amount change
  const handleFeeAmountChange = (index, value) => {
    const updatedFeeTableData = [...feeTableData]
    const feeItem = updatedFeeTableData[index]
    const paidAmount = Number.parseFloat(value) || 0
    const originalAmount = Number.parseFloat(feeItem.amount) || 0
    const concessionAmount = Number.parseFloat(feeItem.concessionAmount) || 0

    if (paidAmount > originalAmount - concessionAmount) {
      toast.error("Paid amount cannot exceed the original fee amount minus concession")
      return
    }

    feeItem.paidAmount = value
    feeItem.remainingBalance = (originalAmount - paidAmount - concessionAmount).toFixed(2)
    feeItem.status = Number(feeItem.remainingBalance) === 0 ? "Settled" : "Pending"
    setFeeTableData(updatedFeeTableData)

    // Update total paid amount and balance
    updateTotals(updatedFeeTableData)
  }

  // Handle concession amount change
  const handleConcessionChange = (index, value) => {
    const updatedFeeTableData = [...feeTableData]
    const feeItem = updatedFeeTableData[index]
    const concessionAmount = Number.parseFloat(value) || 0
    const originalAmount = Number.parseFloat(feeItem.amount) || 0
    const paidAmount = Number.parseFloat(feeItem.paidAmount) || 0

    if (concessionAmount > originalAmount) {
      toast.error("Concession amount cannot exceed the original fee amount")
      return
    }

    if (concessionAmount > paidAmount) {
      toast.error("Concession amount cannot exceed the paid amount")
      return
    }

    feeItem.concessionAmount = value
    feeItem.remainingBalance = (originalAmount - paidAmount).toFixed(2)
    feeItem.status = Number(feeItem.remainingBalance) === 0 ? "Settled" : "Pending"
    setFeeTableData(updatedFeeTableData)

    // Update total paid amount and balance
    updateTotals(updatedFeeTableData)
  }

  // Update totals based on fee table data
  const updateTotals = (feeTableData) => {
    const totalPaid = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)
    const totalConcession = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.concessionAmount || 0), 0)
    const newBalance = totalBalance - totalPaid

    setBillData((prev) => ({
      ...prev,
      paidAmount: totalPaid.toFixed(2),
      balanceAmount: newBalance.toFixed(2),
    }))
  }

  // Handle form submission - show confirmation modal
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!administrationId) {
      toast.error("Administration ID is not available. Please try again.")
      return
    }

    if (!studentData || !billData.admissionNumber) {
      toast.error("Please select a student first")
      return
    }

    const totalPaidAmount = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)
    const totalConcessionAmount = feeTableData.reduce(
      (sum, fee) => sum + Number.parseFloat(fee.concessionAmount || 0),
      0,
    )

    if (totalPaidAmount <= 0 && totalConcessionAmount <= 0) {
      toast.error("Total paid amount or concession amount must be greater than zero")
      return
    }

    // Show confirmation modal
    setShowConfirmModal(true)
  }

  const formatDateForFirestore = (date) => {
    return Timestamp.fromDate(date)
  }

  // Process payment after confirmation
  const processPayment = async () => {
    try {
      setShowConfirmModal(false)
      setIsLoading(true)

      // Check if the current bill number already exists
      const billNumberExists = await checkBillNumberExists(billData.billNumber)

      // If bill number exists, get a new one
      let currentBillNumber = billData.billNumber
      if (billNumberExists) {
        const newBillNumber = await getNextBillNumber()
        if (newBillNumber) {
          currentBillNumber = newBillNumber
          // Update the bill data with the new bill number
          setBillData((prev) => ({
            ...prev,
            billNumber: newBillNumber,
          }))
        } else {
          toast.error("Failed to generate a new bill number. Please try again.")
          setIsLoading(false)
          return
        }
      }

      const now = new Date()
      const totalPaidAmount = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)
      const totalConcessionAmount = feeTableData.reduce(
        (sum, fee) => sum + Number.parseFloat(fee.concessionAmount || 0),
        0,
      )

      // Create the main fee log entry for the full amount
      const mainFeeLogEntry = {
        billNumber: currentBillNumber,
        admissionNumber: billData.admissionNumber,
        studentName: billData.studentName,
        fatherName: billData.fatherName,
        standard: billData.course,
        section: billData.section,
        paymentMode: billData.paymentMode,
        paymentNumber: billData.paymentNumber,
        operatorName: billData.operatorName,
        billDate: formatDateForFirestore(billData.billDate),
        transactionDate: billData.transactionDate ? formatDateForFirestore(billData.transactionDate) : null,
        transactionNarrative: billData.transactionNarrative,
        boardingPoint: billData.pickupPoint,
        routeNumber: studentData.busRouteNumber || "",
        totalPaidAmount: totalPaidAmount.toFixed(2),
        totalConcessionAmount: "0", // Set to 0 for main entry
        timestamp: Timestamp.fromDate(now),
        feePayments: feeTableData
          .filter((fee) => Number.parseFloat(fee.paidAmount) > 0)
          .map((fee) => ({
            feeHead: fee.heading,
            feeAmount: fee.amount,
            paidAmount: fee.paidAmount,
            concessionAmount: "0", // Set to 0 for main entry
            type: "Bus Fee", // Always set to Bus Fee
          })),
      }

      // Create a separate concession entry if there are concessions
      const concessionFeeLogEntry =
        totalConcessionAmount > 0
          ? {
              ...mainFeeLogEntry,
              totalPaidAmount: (-totalConcessionAmount).toFixed(2), // Negative amount for concession
              totalConcessionAmount: totalConcessionAmount.toFixed(2),
              transactionNarrative: "Concession",
              feePayments: feeTableData
                .filter((fee) => Number.parseFloat(fee.concessionAmount) > 0)
                .map((fee) => ({
                  feeHead: fee.heading,
                  feeAmount: fee.amount,
                  paidAmount: (-Number.parseFloat(fee.concessionAmount)).toFixed(2), // Negative amount
                  concessionAmount: fee.concessionAmount,
                  type: "Bus Fee", // Always set to Bus Fee
                })),
            }
          : null

      if (mainFeeLogEntry.feePayments.length === 0 && !concessionFeeLogEntry) {
        toast.error("No fees have been paid or concessions applied")
        setIsLoading(false)
        return
      }

      // Add entries to FeeLog collection (changed from BusFeeLog)
      const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")

      // Add main entry
      await addDoc(feeLogRef, mainFeeLogEntry)

      // Add concession entry if exists
      if (concessionFeeLogEntry && concessionFeeLogEntry.feePayments.length > 0) {
        await addDoc(feeLogRef, concessionFeeLogEntry)
      }

      // Prepare all fee details including both paid and concession amounts
      const allFeeDetails = [...mainFeeLogEntry.feePayments]

      // Add concession details to feeDetails for BusBillEntries
      if (totalConcessionAmount > 0) {
        const concessionDetails = feeTableData
          .filter((fee) => Number.parseFloat(fee.concessionAmount) > 0)
          .map((fee) => ({
            feeHead: fee.heading + " (Concession)",
            feeAmount: fee.amount,
            paidAmount: (-Number.parseFloat(fee.concessionAmount)).toFixed(2), // Negative amount for concession
            concessionAmount: fee.concessionAmount,
            type: "Bus Fee",
            isConcesssion: true,
          }))

        allFeeDetails.push(...concessionDetails)
      }

      // Add to BusBillEntries collection with both payment and concession details
      const billEntryRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transactions",
        administrationId,
        "BusBillEntries",
      )

      // Add main payment entry
      await addDoc(billEntryRef, {
        ...billData,
        billNumber: currentBillNumber,
        feeDetails: mainFeeLogEntry.feePayments,
        totalPaidAmount: totalPaidAmount.toFixed(2),
        totalConcessionAmount: "0", // Set to 0 for main entry
        timestamp: serverTimestamp(),
        billDate: formatDateForFirestore(billData.billDate),
      })

      // Add separate concession entry if exists
      if (concessionFeeLogEntry && concessionFeeLogEntry.feePayments.length > 0) {
        await addDoc(billEntryRef, {
          ...billData,
          billNumber: currentBillNumber, // Use the same bill number (no suffix)
          feeDetails: concessionFeeLogEntry.feePayments,
          totalPaidAmount: (-totalConcessionAmount).toFixed(2), // Negative amount for concession
          totalConcessionAmount: totalConcessionAmount.toFixed(2),
          timestamp: serverTimestamp(),
          billDate: formatDateForFirestore(billData.billDate),
          transactionNarrative: "Concession", // Mark as concession
          isConcession: true, // Flag to identify concession entries
        })
      }

      // Update student fee details
      const updatedFeeDetails = feeDetails.map((fee) => {
        const paidFee = feeTableData.find((f) => f.heading === fee.heading)
        if (paidFee) {
          const originalAmount = Number.parseFloat(fee.amount) || 0
          const paidAmount = Number.parseFloat(paidFee.paidAmount) || 0
          const newAmount = Math.max(0, originalAmount - paidAmount).toFixed(2)

          return {
            ...fee,
            amount: newAmount,
            status: newAmount === "0.00" ? "Settled" : "Pending",
          }
        }
        return fee
      })

      // Get all existing fee details to update only the bus fees
      const studentFeeRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "StudentFeeDetails",
        studentData.id,
      )

      const currentFeeSnapshot = await getDoc(studentFeeRef)
      const currentFeeData = currentFeeSnapshot.data()
      const allCurrentFees = currentFeeData.feeDetails || []

      // Replace only the bus fees, keep other fees unchanged
      const updatedAllFees = allCurrentFees.map((fee) => {
        if (isBusFee(fee)) {
          // Find the updated version of this fee
          const updatedFee = updatedFeeDetails.find((updated) => updated.heading === fee.heading)
          return updatedFee || fee
        }
        return fee
      })

      // Update StudentFeeDetails document
      await updateDoc(studentFeeRef, {
        feeDetails: updatedAllFees,
      })

      toast.success("Bus fee payment processed successfully!")
      setIsLoading(false)

      // Show bill preview modal
      setShowBillPreviewModal(true)
    } catch (error) {
      console.error("Error processing payment:", error)
      toast.error(`Failed to process payment: ${error.message}`)
      setIsLoading(false)
    }
  }

  // Fetch payment history for a student
  const fetchPaymentHistory = async () => {
    if (!administrationId || !billData.admissionNumber) {
      toast.error("Please select a student first")
      return
    }

    setIsLoading(true)
    try {
      // Changed from BusFeeLog to FeeLog
      const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")
      const q = query(
        feeLogRef,
        where("admissionNumber", "==", billData.admissionNumber),
        where("feePayments.type", "==", "Bus Fee"), // Add filter for Bus Fee type
      )
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.info("No bus fee payment history found for this student")
        setPaymentHistory([])
      } else {
        const history = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            billDate: data.billDate instanceof Timestamp ? data.billDate.toDate() : new Date(data.billDate),
            transactionDate:
              data.transactionDate instanceof Timestamp
                ? data.transactionDate.toDate()
                : new Date(data.transactionDate),
            timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp),
          }
        })
        setPaymentHistory(history)
      }
      setShowHistoryModal(true)
    } catch (error) {
      console.error("Error fetching payment history:", error)
      toast.error("Failed to fetch payment history")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset form after submission
  const resetForm = () => {
    // Release the bill number lock
    setBillNumberLocked(false)

    // Reset all form fields
    setBillData({
      billNumber: "", // Will be regenerated when billNumberLocked is set to false
      admissionNumber: "ADM",
      studentName: "",
      fatherName: "",
      course: "",
      section: "",
      pickupPoint: "",
      billDate: new Date(),
      balance: "0",
      paidAmount: "0",
      balanceAmount: "0",
      paymentMode: "Cash",
      paymentNumber: "",
      operatorName: "XPO ADMIN",
      transactionNarrative: "",
      transactionDate: null,
    })

    setFeeDetails([])
    setFeeTableData([])
    setTotalBalance(0)
    setStudentData(null)
    setStudentLoaded(false)
    setStudentImageUrl(null)
  }

  // Handle bill preview modal close
  const handleBillPreviewClose = () => {
    setShowBillPreviewModal(false)
    resetForm()
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <Card className="shadow-sm">
          <Card.Header
            style={{ backgroundColor: "#0B3D7B" }}
            className="text-white py-3 d-flex justify-content-between align-items-center"
          >
            <h2 className="mb-0 h4">Bus Fee / Transportation Fee</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit} className="billing-form">
              <Row className="mb-4">
                {/* First Column */}
                <Col md={4}>
                  <div className="d-flex justify-content-center mb-3">
                    <Image
                      src={studentImageUrl || defaultProfileImage}
                      alt="Student"
                      roundedCircle
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />
                  </div>
                  <Form.Group className="my-1">
                    <Form.Label>Bill No.</Form.Label>
                    <Form.Control
                      type="text"
                      name="billNumber"
                      value={billData.billNumber}
                      onChange={handleInputChange}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Admin. No.</Form.Label>
                    <div className="d-flex position-relative" ref={dropdownRef}>
                      <Form.Control
                        type="text"
                        name="admissionNumber"
                        value={billData.admissionNumber}
                        onChange={handleInputChange}
                        className="form-control-light"
                        autoComplete="off"
                      />
                      <Button
                        variant="outline-primary"
                        onClick={fetchPaymentHistory}
                        disabled={!studentLoaded}
                        className="ms-2"
                      >
                        History
                      </Button>
                      {showDropdown && studentsList.length > 0 && (
                        <ListGroup
                          className="position-absolute dropdown-menu show w-100"
                          style={{ top: "100%", zIndex: 1000 }}
                        >
                          {studentsList.map((student) => (
                            <ListGroup.Item
                              key={student.id}
                              action
                              onClick={() => handleStudentSelect(student.admissionNumber)}
                              className="dropdown-item"
                            >
                              {student.admissionNumber} - {student.studentName}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Student Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="studentName"
                      value={billData.studentName}
                      onChange={handleInputChange}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>
                </Col>

                {/* Second Column */}
                <Col md={4}>
                  <Form.Group className="my-1">
                    <Form.Label>Father Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fatherName"
                      value={billData.fatherName}
                      onChange={handleInputChange}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>
                  <Form.Group className="my-1">
                    <Form.Label>Course</Form.Label>
                    <Form.Control
                      type="text"
                      name="course"
                      value={billData.course}
                      onChange={handleInputChange}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>
                  <Form.Group className="my-1">
                    <Form.Label>Section</Form.Label>
                    <Form.Control
                      type="text"
                      name="section"
                      value={billData.section}
                      onChange={handleInputChange}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Pickup Point</Form.Label>
                    <Form.Control
                      type="text"
                      name="pickupPoint"
                      value={billData.pickupPoint}
                      onChange={handleInputChange}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>
                </Col>

                {/* Third Column */}
                <Col md={4}>
                  <Form.Group className="my-1">
                    <Form.Label>Bill Date</Form.Label>
                    <br />
                    <DatePicker
                      selected={billData.billDate}
                      onChange={(date) => handleDateChange(date, "billDate")}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                      customInput={<Form.Control type="text" name="billDate" className="form-control-light" />}
                    />
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Balance</Form.Label>
                    <Form.Control
                      type="text"
                      name="balance"
                      value={billData.balance}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Paid amount</Form.Label>
                    <Form.Control
                      type="text"
                      name="paidAmount"
                      value={billData.paidAmount}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Balance amount</Form.Label>
                    <Form.Control
                      type="text"
                      name="balanceAmount"
                      value={billData.balanceAmount}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>

                  <Form.Group className="my-1">
                    <Form.Label>Pay Mode</Form.Label>
                    <div className="d-flex align-items-center">
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="online"
                          name="paymentMode"
                          value="Online"
                          checked={billData.paymentMode === "Online"}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="online">
                          Online
                        </label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="radio"
                          id="cash"
                          name="paymentMode"
                          value="Cash"
                          checked={billData.paymentMode === "Cash"}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="cash">
                          Cash
                        </label>
                      </div>
                    </div>
                  </Form.Group>

                  {billData.paymentMode === "Online" && (
                    <Form.Group className="my-1">
                      <Form.Label>No.</Form.Label>
                      <Form.Control
                        type="text"
                        name="paymentNumber"
                        value={billData.paymentNumber}
                        onChange={handleInputChange}
                        className="form-control-light"
                      />
                    </Form.Group>
                  )}
                </Col>
              </Row>

              {/* Fee Table Row */}
              <Row className="mb-4">
                <Col>
                  <div className="fee-table-container">
                    <Table bordered hover size="sm" className="fee-table">
                      <thead className="table-header">
                        <tr>
                          <th>Description</th>
                          <th>Fee Type</th>
                          <th>Amount</th>
                          <th>Concession</th>
                          <th>Pay Amount</th>
                          <th>Remaining</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeTableData.length > 0 ? (
                          feeTableData.map((fee, index) => (
                            <tr key={index}>
                              <td>{fee.heading}</td>
                              <td>Bus Fee</td>
                              <td>{fee.amount}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  value={fee.concessionAmount}
                                  onChange={(e) => handleConcessionChange(index, e.target.value)}
                                  className="form-control-light"
                                />
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  value={fee.paidAmount}
                                  onChange={(e) => handleFeeAmountChange(index, e.target.value)}
                                  className="form-control-light"
                                />
                              </td>
                              <td>{fee.remainingBalance}</td>
                              <td>{Number(fee.remainingBalance) === 0 ? "Settled" : "Pending"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
                              No bus fee details available
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" className="text-end fw-bold">
                            Overall Total:
                          </td>
                          <td className="fw-bold">{billData.paidAmount}</td>
                          <td className="fw-bold">{billData.balanceAmount}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </Col>
              </Row>

              {/* Transaction/Narrat and Transaction Date fields */}
              <Row className="mb-4 align-items-center">
                <Col md={4}>
                  <Form.Group className="my-1">
                    <Form.Label>Transaction/Narrat:</Form.Label>
                    <Form.Control
                      type="text"
                      name="transactionNarrative"
                      value={billData.transactionNarrative}
                      onChange={handleInputChange}
                      className="form-control-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="my-1">
                    <Form.Label>Transaction Date:</Form.Label>
                    <br />
                    <DatePicker
                      selected={billData.transactionDate}
                      onChange={(date) => handleDateChange(date, "transactionDate")}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                      isClearable
                      placeholderText="Select a date (optional)"
                      customInput={<Form.Control type="text" name="transactionDate" className="form-control-light" />}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="my-1">
                    <Form.Label>Select Operator Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="operatorName"
                      value={billData.operatorName}
                      disabled
                      className="form-control-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={12} className="d-flex align-items-end justify-content-end">
                  <Button variant="primary" type="submit" className="px-4 py-2">
                    Submit Bill Entry
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Payment History Modal */}
      <PaymentHistoryModal
        show={showHistoryModal}
        onHide={() => setShowHistoryModal(false)}
        paymentHistory={paymentHistory}
      />

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered size="md">
        <Modal.Header className="border-0 pb-0">
          <Modal.Title className="w-100 text-center">Confirm Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <p>Are you sure you want to confirm this bill?</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pt-0">
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)} style={{ width: "120px" }}>
            No
          </Button>
          <Button
            variant="primary"
            onClick={processPayment}
            ref={confirmYesButtonRef}
            autoFocus
            style={{
              width: "120px",
              backgroundColor: "#0B3D7B",
            }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bill Preview Modal */}
      <BillPreviewModal
        show={showBillPreviewModal}
        onHide={() => setShowBillPreviewModal(false)}
        billData={billData}
        feeTableData={feeTableData}
        schoolInfo={schoolInfo}
        onClose={handleBillPreviewClose}
      />

      <style jsx>{`
        .billing-form {
          max-width: 1200px;
          margin: 0 auto;
        }

        .form-control-light {
          background-color: #F8F9FA !important;
          border: 1px solid #CED4DA;
          border-radius: 4px;
          padding: 0.375rem 0.75rem;
        }

        .form-control-light:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .fee-table-container {
          max-height: auto;
          overflow-y: auto;
          border: 1px solid #ddd;
        }

        .fee-table {
          margin-bottom: 0;
        }

        .table-header {
          background-color: #E3F2FD;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .dropdown-menu {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #ced4da;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .dropdown-item {
          padding: 8px 12px;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .form-check-inline {
          margin-right: 1rem;
        }

        .form-check-input {
          width: 1rem;
          height: 1rem;
          margin-top: 0.25rem;
          vertical-align: top;
          border-radius: 50%;
        }

        .form-check-label {
          margin-left: 0.5rem;
        }

        @media print {
          button[type="submit"] {
            display: none;
          }
        }

        .modal-content {
          border-radius: 8px;
          border: none;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 500;
        }

        .modal-body p {
          font-size: 1.1rem;
          margin-bottom: 0;
          color: #333;
        }

        .modal-footer .btn {
          padding: 0.5rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
        }

        .modal-footer .btn-secondary {
          background-color: #6c757d;
          border: none;
        }

        .modal-footer .btn-secondary:hover {
          background-color: #5a6268;
        }

        .modal-footer .btn-primary:hover {
          background-color: #092c5a;
        }
      `}</style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default BusBill

