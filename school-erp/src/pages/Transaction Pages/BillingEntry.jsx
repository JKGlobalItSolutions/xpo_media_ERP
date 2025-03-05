"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Form, Button, Row, Col, Container, Table, ListGroup, Modal, Card } from "react-bootstrap"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { db, auth } from "../../Firebase/config"
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
} from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import PaymentHistoryModal from "./PaymentHistoryModal"

const BillEntry = () => {
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const confirmYesButtonRef = useRef(null)

  // State for administration and transport IDs
  const [administrationId, setAdministrationId] = useState(null)
  const [transportId, setTransportId] = useState(null)

  // Bill data state
  const [billData, setBillData] = useState({
    billNumber: "",
    admissionNumber: "ADM",
    studentName: "",
    fatherName: "",
    course: "",
    section: "",
    pickupPoint: "",
    date: new Date(),
    balance: "0",
    paidAmount: "0",
    balanceAmount: "0",
    paymentMode: "Cash",
    paymentNumber: "",
    operatorName: "XPO ADMIN",
    transactionNarrative: "",
    transactionDate: new Date(),
  })

  const [feeDetails, setFeeDetails] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const [studentData, setStudentData] = useState(null)
  const [feeTableData, setFeeTableData] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)

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

  // Helper function to format date as YYYY-MM-DD
  const formatDateForFirestore = (date) => {
    return date.toISOString().split("T")[0]
  }

  // Helper function to parse date string from Firestore
  const parseDateFromFirestore = (dateString) => {
    return new Date(dateString)
  }

  // Generate bill number
  useEffect(() => {
    const generateBillNumber = async () => {
      if (!administrationId) return

      try {
        const billsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Transactions",
          administrationId,
          "BillEntries",
        )
        const querySnapshot = await getDocs(billsRef)

        const existingNumbers = querySnapshot.docs
          .map((doc) => doc.data().billNumber)
          .filter((num) => num && num.includes("/"))
          .map((num) => Number.parseInt(num.split("/")[0], 10))
          .sort((a, b) => a - b)

        let nextNumber = 1
        if (existingNumbers.length > 0) {
          nextNumber = existingNumbers[existingNumbers.length - 1] + 1
        }

        const currentDate = new Date()
        const financialYear = `${currentDate.getFullYear()}-${(currentDate.getFullYear() + 1).toString().slice(-2)}`
        const newBillNumber = `${nextNumber}/${financialYear}`
        setBillData((prev) => ({ ...prev, billNumber: newBillNumber }))
      } catch (error) {
        console.error("Error generating bill number:", error)
        toast.error("Failed to generate bill number")
      }
    }

    generateBillNumber()
  }, [administrationId])

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
        const feeHeadData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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

  // Fetch student data by admission number (reusable function)
  const fetchStudentDataByAdmissionNumber = async (admissionNumber) => {
    if (!admissionNumber || !administrationId) return

    setIsLoading(true)
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
      const feeDetails = feeData.feeDetails || []

      // Calculate total balance
      let totalBalance = 0
      feeDetails.forEach((fee) => {
        totalBalance += Number.parseFloat(fee.amount) || 0
      })

      // Update states with fetched data
      setStudentData({
        id: studentDoc.id,
        ...student,
      })

      setFeeDetails(feeDetails)
      setFeeTableData(
        feeDetails.map((fee) => ({
          ...fee,
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
      toast.success("Student data loaded successfully")
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
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

    if (concessionAmount + paidAmount > originalAmount) {
      toast.error("Sum of concession and paid amount cannot exceed the original fee amount")
      return
    }

    feeItem.concessionAmount = value
    feeItem.remainingBalance = (originalAmount - paidAmount - concessionAmount).toFixed(2)
    feeItem.status = Number(feeItem.remainingBalance) === 0 ? "Settled" : "Pending"
    setFeeTableData(updatedFeeTableData)

    // Update total paid amount and balance
    updateTotals(updatedFeeTableData)
  }

  // Update totals based on fee table data
  const updateTotals = (feeTableData) => {
    const totalPaid = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)
    const totalConcession = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.concessionAmount || 0), 0)
    const newBalance = totalBalance - totalPaid - totalConcession

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

  // Process payment after confirmation
  const processPayment = async () => {
    try {
      setShowConfirmModal(false)
      const now = new Date()
      const totalPaidAmount = feeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)
      const totalConcessionAmount = feeTableData.reduce(
        (sum, fee) => sum + Number.parseFloat(fee.concessionAmount || 0),
        0,
      )

      // Create a single fee log entry for all paid fees
      const feeLogEntry = {
        billNumber: billData.billNumber,
        admissionNumber: billData.admissionNumber,
        studentName: billData.studentName,
        fatherName: billData.fatherName,
        standard: billData.course,
        section: billData.section,
        paymentMode: billData.paymentMode,
        paymentNumber: billData.paymentNumber,
        operatorName: billData.operatorName,
        transactionDate: formatDateForFirestore(billData.date), // Store as YYYY-MM-DD
        transactionNarrative: billData.transactionNarrative,
        boardingPoint: billData.pickupPoint,
        routeNumber: studentData.busRouteNumber || "",
        totalPaidAmount: totalPaidAmount.toFixed(2),
        totalConcessionAmount: totalConcessionAmount.toFixed(2),
        timestamp: formatDateForFirestore(now), // Store as YYYY-MM-DD
        feePayments: feeTableData
          .filter((fee) => Number.parseFloat(fee.paidAmount) > 0 || Number.parseFloat(fee.concessionAmount) > 0)
          .map((fee) => ({
            feeHead: fee.heading,
            feeAmount: fee.amount,
            paidAmount: fee.paidAmount,
            concessionAmount: fee.concessionAmount || "0",
          })),
      }

      if (feeLogEntry.feePayments.length === 0) {
        toast.error("No fees have been paid or concessions applied")
        return
      }

      // Add to FeeLog collection
      const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")
      await addDoc(feeLogRef, feeLogEntry)

      // Add to BillEntries collection
      const billEntryRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transactions",
        administrationId,
        "BillEntries",
      )
      await addDoc(billEntryRef, {
        ...billData,
        feeDetails: feeLogEntry.feePayments,
        totalPaidAmount: feeLogEntry.totalPaidAmount,
        totalConcessionAmount: feeLogEntry.totalConcessionAmount,
        timestamp: serverTimestamp(),
      })

      // Update student fee details
      const updatedFeeDetails = feeDetails.map((fee) => {
        const paidFee = feeTableData.find((f) => f.heading === fee.heading)
        if (paidFee) {
          const originalAmount = Number.parseFloat(fee.amount) || 0
          const paidAmount = Number.parseFloat(paidFee.paidAmount) || 0
          const concessionAmount = Number.parseFloat(paidFee.concessionAmount) || 0
          const newAmount = Math.max(0, originalAmount - paidAmount - concessionAmount).toFixed(2)

          return {
            ...fee,
            amount: newAmount,
            status: newAmount === "0.00" ? "Settled" : "Pending",
          }
        }
        return fee
      })

      // Update StudentFeeDetails document
      const studentFeeRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "StudentFeeDetails",
        studentData.id,
      )

      await updateDoc(studentFeeRef, {
        feeDetails: updatedFeeDetails,
      })

      toast.success("Payment processed successfully!")

      // Reset form for next entry
      resetForm()
    } catch (error) {
      console.error("Error processing payment:", error)
      toast.error(`Failed to process payment: ${error.message}`)
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
      const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")
      const q = query(feeLogRef, where("admissionNumber", "==", billData.admissionNumber))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.info("No payment history found for this student")
        setPaymentHistory([])
      } else {
        const history = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            transactionDate: parseDateFromFirestore(data.transactionDate),
            timestamp: parseDateFromFirestore(data.timestamp),
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
    // Generate new bill number
    const currentBillNumber = billData.billNumber
    const [currentNumber, currentYear] = currentBillNumber.split("/")
    const nextNumber = Number.parseInt(currentNumber, 10) + 1
    const newBillNumber = `${nextNumber}/${currentYear}`

    setBillData({
      billNumber: newBillNumber,
      admissionNumber: "ADM",
      studentName: "",
      fatherName: "",
      course: "",
      section: "",
      pickupPoint: "",
      date: new Date(),
      balance: "0",
      paidAmount: "0",
      balanceAmount: "0",
      paymentMode: "Cash",
      paymentNumber: "",
      operatorName: "XPO ADMIN",
      transactionNarrative: "",
      transactionDate: new Date(),
    })

    setFeeDetails([])
    setFeeTableData([])
    setTotalBalance(0)
    setStudentData(null)
    setStudentLoaded(false)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <Card className="shadow-sm">
          <Card.Header
            style={{ backgroundColor: "#0B3D7B" }}
            className="text-white py-3 d-flex justify-content-between align-items-center"
          >
            <h2 className="mb-0 h4">Billing Dashboard</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <Form onSubmit={handleSubmit} className="billing-form">
              <Row className="mb-4">
                {/* First Column */}
                <Col md={4}>
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
                </Col>

                {/* Second Column */}
                <Col md={4}>
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

                  <Form.Group className="my-1">
                    <Form.Label>Date</Form.Label>
                    <br />
                    <DatePicker
                      selected={billData.date}
                      onChange={(date) => handleDateChange(date, "date")}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                      customInput={<Form.Control type="text" name="date" className="form-control-light" />}
                    />
                  </Form.Group>
                </Col>

                {/* Third Column */}
                <Col md={4}>
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
                    <div className="d-flex">
                      <Form.Check
                        type="radio"
                        id="online"
                        label="Online"
                        name="paymentMode"
                        value="Online"
                        checked={billData.paymentMode === "Online"}
                        onChange={handleInputChange}
                        className="me-3"
                      />
                      <Form.Check
                        type="radio"
                        id="cash"
                        label="Cash"
                        name="paymentMode"
                        value="Cash"
                        checked={billData.paymentMode === "Cash"}
                        onChange={handleInputChange}
                      />
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
                            <td colSpan="6" className="text-center">
                              No fee details available
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-end fw-bold">
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
                  <Button variant="primary" type="submit" className="px-4 my-4">
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

export default BillEntry

