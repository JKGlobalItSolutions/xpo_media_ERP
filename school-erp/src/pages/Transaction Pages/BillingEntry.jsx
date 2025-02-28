"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import "./Styles/BillingWindow.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { db, auth } from "../../Firebase/config"
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const BillingEntry = () => {
  const [formData, setFormData] = useState({
    billNumber: "",
    admissionNumber: "",
    barCodeNumber: "",
    studentName: "",
    fatherName: "",
    course: "",
    section: "",
    pickupPoint: "",
    date: new Date().toISOString().split("T")[0],
    balance: "",
    paidAmount: "",
    balanceAmount: "",
    paymentMode: "Online",
    number: "",
    operatorName: "XpoAdmin",
    concessPercent: "",
    concessHead: "",
    concessAmount: "",
    balanceBefore: "",
    balanceAfter: "",
    transactionNarrat: "",
    transactionDate: new Date().toISOString().split("T")[0],
  })

  const [administrationId, setAdministrationId] = useState(null)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [filteredAdmissionNumbers, setFilteredAdmissionNumbers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [studentFeeDetails, setStudentFeeDetails] = useState([])
  const [previousPayments, setPreviousPayments] = useState([])
  const [feeHeadings, setFeeHeadings] = useState([])
  const [selectedFeeHeadings, setSelectedFeeHeadings] = useState([])
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)
  const [errors, setErrors] = useState({})
  const [currentStudentId, setCurrentStudentId] = useState(null)
  const [billCounter, setBillCounter] = useState(1)
  const [academicYear, setAcademicYear] = useState("")
  const [feeTypes, setFeeTypes] = useState([])
  const [selectedFeeType, setSelectedFeeType] = useState("")
  const [feeHeadsByType, setFeeHeadsByType] = useState([])

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

    fetchAdministrationId()
    generateAcademicYear()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchAdmissionNumbers()
      fetchFeeTypes()
      fetchLastBillNumber()
    }
  }, [administrationId])

  const generateAcademicYear = () => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Academic year typically starts in June/July
    // If current month is before June, academic year is previous year to current year
    // Otherwise, it's current year to next year
    let academicYearStart, academicYearEnd

    if (month < 5) {
      // Before June
      academicYearStart = currentYear - 1
      academicYearEnd = currentYear
    } else {
      academicYearStart = currentYear
      academicYearEnd = currentYear + 1
    }

    const academicYearString = `${academicYearStart}-${academicYearEnd.toString().slice(-2)}`
    setAcademicYear(academicYearString)
  }

  const fetchLastBillNumber = async () => {
    try {
      const billsRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "Payments")

      const querySnapshot = await getDocs(billsRef)

      // Extract bill numbers and find the highest counter
      let highestCounter = 0

      querySnapshot.docs.forEach((doc) => {
        const billNumber = doc.data().billNumber
        if (billNumber && billNumber.includes("/")) {
          const counter = Number.parseInt(billNumber.split("/")[0])
          if (!isNaN(counter) && counter > highestCounter) {
            highestCounter = counter
          }
        }
      })

      // Set the next bill counter
      setBillCounter(highestCounter + 1)

      // Generate the bill number
      const newBillNumber = `${highestCounter + 1}/${academicYear}`
      setFormData((prev) => ({
        ...prev,
        billNumber: newBillNumber,
      }))
    } catch (error) {
      console.error("Error fetching last bill number:", error)
      toast.error("Failed to generate bill number. Using default.")

      // Use default bill number if fetch fails
      const defaultBillNumber = `1/${academicYear}`
      setFormData((prev) => ({
        ...prev,
        billNumber: defaultBillNumber,
      }))
    }
  }

  const fetchAdmissionNumbers = async () => {
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const snapshot = await getDocs(admissionsRef)
      const numbers = snapshot.docs.map((doc) => doc.data().admissionNumber).filter(Boolean)
      setAdmissionNumbers(numbers)
      setFilteredAdmissionNumbers(numbers)
    } catch (error) {
      console.error("Error fetching admission numbers:", error)
      toast.error("Failed to fetch admission numbers. Please try again.")
    }
  }

  const fetchFeeTypes = async () => {
    try {
      const feeTypesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "FeeTypes",
      )
      const snapshot = await getDocs(feeTypesRef)
      const types = snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
      setFeeTypes(types)
    } catch (error) {
      console.error("Error fetching fee types:", error)
      toast.error("Failed to fetch fee types. Please try again.")
    }
  }

  const fetchFeeHeadingsByType = async (typeId) => {
    try {
      const feeHeadingsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "FeeHeadings",
      )
      const q = query(feeHeadingsRef, where("typeId", "==", typeId))
      const snapshot = await getDocs(q)
      const headings = snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
      setFeeHeadsByType(headings)
    } catch (error) {
      console.error("Error fetching fee headings by type:", error)
      toast.error("Failed to fetch fee headings. Please try again.")
    }
  }

  const fetchStudentData = async (admissionNumber) => {
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(admissionsRef, where("admissionNumber", "==", admissionNumber))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs[0].data()
        const studentId = querySnapshot.docs[0].id
        setCurrentStudentId(studentId)

        setFormData((prev) => ({
          ...prev,
          admissionNumber: studentData.admissionNumber,
          studentName: studentData.studentName,
          fatherName: studentData.fatherName,
          course: studentData.standard,
          section: studentData.section,
          pickupPoint: studentData.boardingPoint || "",
          balance: studentData.tutionFees || "0",
          balanceBefore: studentData.tutionFees || "0",
        }))

        // Fetch student fee details
        const studentFeeRef = doc(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "StudentFeeDetails",
          studentId,
        )
        const feeSnapshot = await getDoc(studentFeeRef)

        if (feeSnapshot.exists()) {
          const feeData = feeSnapshot.data()
          setStudentFeeDetails(feeData.feeDetails || [])
        } else {
          setStudentFeeDetails([])
        }

        // Fetch previous payments
        const paymentsRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")
        const paymentsQuery = query(paymentsRef, where("admissionNumber", "==", admissionNumber))
        const paymentsSnapshot = await getDocs(paymentsQuery)

        const payments = paymentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setPreviousPayments(payments)

        // Calculate total paid amount
        const totalPaid = payments.reduce((sum, payment) => sum + (Number.parseFloat(payment.paidAmount) || 0), 0)
        setTotalPaidAmount(totalPaid)

        toast.success("Student data fetched successfully!")
      } else {
        toast.error("No student found with the given admission number.")
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "admissionNumber") {
      const filtered = admissionNumbers.filter((num) => num.toLowerCase().includes(value.toLowerCase()))
      setFilteredAdmissionNumbers(filtered)
      setShowDropdown(filtered.length > 0 && value.length > 0)

      if (admissionNumbers.includes(value)) {
        fetchStudentData(value)
      }
    }

    if (name === "paidAmount") {
      const paid = Number.parseFloat(value) || 0
      const balance = Number.parseFloat(formData.balance) || 0
      const balanceAfter = balance - paid

      setFormData((prev) => ({
        ...prev,
        balanceAmount: balanceAfter.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
      }))
    }

    if (name === "concessPercent") {
      const percent = Number.parseFloat(value) || 0
      const balance = Number.parseFloat(formData.balance) || 0
      const concessAmount = (balance * percent) / 100

      setFormData((prev) => ({
        ...prev,
        concessAmount: concessAmount.toFixed(2),
      }))
    }

    if (name === "concessAmount") {
      const concessAmount = Number.parseFloat(value) || 0
      const balance = Number.parseFloat(formData.balance) || 0
      const percent = (concessAmount / balance) * 100

      if (!isNaN(percent) && isFinite(percent)) {
        setFormData((prev) => ({
          ...prev,
          concessPercent: percent.toFixed(2),
        }))
      }
    }
  }

  const handleFeeTypeChange = (e) => {
    const typeId = e.target.value
    setSelectedFeeType(typeId)
    if (typeId) {
      fetchFeeHeadingsByType(typeId)
    } else {
      setFeeHeadsByType([])
    }
  }

  const handleAdmissionSelect = (admissionNumber) => {
    setFormData((prev) => ({
      ...prev,
      admissionNumber,
    }))
    setShowDropdown(false)
    fetchStudentData(admissionNumber)
  }

  const handleFeeHeadingSelect = (heading) => {
    if (!selectedFeeHeadings.some((h) => h.name === heading.name)) {
      const feeDetail = studentFeeDetails.find((detail) => detail.heading === heading.name)
      const amount = feeDetail ? feeDetail.amount : "0"
      const balance = feeDetail ? feeDetail.amount : "0"
      const feeType = feeTypes.find((type) => type.id === selectedFeeType)?.name || ""

      setSelectedFeeHeadings([
        ...selectedFeeHeadings,
        {
          ...heading,
          amount,
          balance,
          feeType,
        },
      ])
    }
  }

  const handleRemoveFeeHeading = (index) => {
    const updatedHeadings = [...selectedFeeHeadings]
    updatedHeadings.splice(index, 1)
    setSelectedFeeHeadings(updatedHeadings)
  }

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = ["admissionNumber", "studentName", "paidAmount", "paymentMode"]

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() +
          field
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        } is required`
      }
    })

    if (Number.parseFloat(formData.paidAmount) <= 0) {
      newErrors.paidAmount = "Paid amount must be greater than zero"
    }

    if (selectedFeeHeadings.length === 0) {
      newErrors.feeHeadings = "At least one fee heading must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        // Use the generated bill number
        const billNumber = formData.billNumber

        // Calculate total amount from selected fee headings
        const totalAmount = selectedFeeHeadings.reduce(
          (sum, heading) => sum + Number.parseFloat(heading.amount || 0),
          0,
        )

        // Create payment data
        const paymentData = {
          ...formData,
          billNumber,
          feeHeadings: selectedFeeHeadings,
          createdAt: serverTimestamp(),
          totalPaidAmount: formData.paidAmount,
          studentId: currentStudentId,
        }

        // Add to FeeLog collection
        const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")

        await addDoc(feeLogRef, paymentData)

        // Update StudentFeeDetails to reduce fees
        if (currentStudentId) {
          const studentFeeRef = doc(
            db,
            "Schools",
            auth.currentUser.uid,
            "AdmissionMaster",
            administrationId,
            "StudentFeeDetails",
            currentStudentId,
          )

          const feeSnapshot = await getDoc(studentFeeRef)

          if (feeSnapshot.exists()) {
            const feeData = feeSnapshot.data()
            const updatedFeeDetails = feeData.feeDetails.map((detail) => {
              // Find if this fee detail was part of the payment
              const paidDetail = selectedFeeHeadings.find((h) => h.heading === detail.heading)

              if (paidDetail) {
                // Reduce the amount by the paid amount
                const currentAmount = Number.parseFloat(detail.amount) || 0
                const paidAmount = Number.parseFloat(formData.paidAmount) || 0
                const newAmount = Math.max(0, currentAmount - paidAmount).toFixed(2)

                return {
                  ...detail,
                  amount: newAmount,
                }
              }

              return detail
            })

            // Update the student fee details
            await updateDoc(studentFeeRef, {
              feeDetails: updatedFeeDetails,
            })

            // Update the student's total fees in AdmissionSetup
            const studentRef = doc(
              db,
              "Schools",
              auth.currentUser.uid,
              "AdmissionMaster",
              administrationId,
              "AdmissionSetup",
              currentStudentId,
            )

            const newBalance = (Number.parseFloat(formData.balance) - Number.parseFloat(formData.paidAmount)).toFixed(2)

            await updateDoc(studentRef, {
              tutionFees: newBalance,
            })
          }
        }

        toast.success("Payment recorded successfully!")

        // Increment bill counter for next bill
        setBillCounter((prev) => prev + 1)
        const newBillNumber = `${billCounter + 1}/${academicYear}`

        // Reset form
        setFormData({
          billNumber: newBillNumber,
          admissionNumber: "",
          barCodeNumber: "",
          studentName: "",
          fatherName: "",
          course: "",
          section: "",
          pickupPoint: "",
          date: new Date().toISOString().split("T")[0],
          balance: "",
          paidAmount: "",
          balanceAmount: "",
          paymentMode: "Online",
          number: "",
          operatorName: "XpoAdmin",
          concessPercent: "",
          concessHead: "",
          concessAmount: "",
          balanceBefore: "",
          balanceAfter: "",
          transactionNarrat: "",
          transactionDate: new Date().toISOString().split("T")[0],
        })
        setSelectedFeeHeadings([])
        setStudentFeeDetails([])
        setPreviousPayments([])
        setCurrentStudentId(null)
      } catch (error) {
        console.error("Error submitting payment:", error)
        toast.error("Failed to submit payment. Please try again.")
      }
    } else {
      toast.error("Please fill in all required fields correctly.")
    }
  }

  const styles = {
    headerBg: {
      backgroundColor: "#0B3D7B",
      color: "white",
    },
    customBtn: {
      background: "linear-gradient(180deg, #1470E1 0%, #0B3D7B 100%)",
      border: "none",
      color: "white",
    },
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div>Transaction</div>
            <span className="separator mx-2">&gt;</span>
            <span>Billing Entry</span>
          </nav>
        </div>

        <div className="billing-container d-flex flex-column">
          <div className="card flex-grow-1">
            <div className="card-header py-2" style={styles.headerBg}>
              <h6 className="mb-0">Billing Entry</h6>
            </div>
            <div className="card-body p-3">
              <Form className="h-100 d-flex flex-column" onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Bill Number</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="billNumber"
                        value={formData.billNumber}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-2 position-relative">
                      <Form.Label className="form-label small mb-1">Admin Number</Form.Label>
                      <div className="input-group input-group-sm">
                        <Form.Control
                          type="text"
                          className="form-control form-control-sm py-1"
                          name="admissionNumber"
                          value={formData.admissionNumber}
                          onChange={handleInputChange}
                          isInvalid={!!errors.admissionNumber}
                        />
                        <button
                          className="btn btn-outline-secondary dropdown-toggle"
                          type="button"
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          <i className="fas fa-chevron-down"></i>
                        </button>
                      </div>
                      <Form.Control.Feedback type="invalid">{errors.admissionNumber}</Form.Control.Feedback>

                      {showDropdown && (
                        <div className="admission-dropdown">
                          {filteredAdmissionNumbers.slice(0, 5).map((num, index) => (
                            <div
                              key={index}
                              className="admission-dropdown-item"
                              onClick={() => handleAdmissionSelect(num)}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Bar Code Number</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="barCodeNumber"
                        value={formData.barCodeNumber}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Student Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        readOnly
                        isInvalid={!!errors.studentName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.studentName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Father Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Course</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="course"
                        value={formData.course}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Section</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="section"
                        value={formData.section}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Pickup Point</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="pickupPoint"
                        value={formData.pickupPoint}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Date</Form.Label>
                      <Form.Control
                        type="date"
                        className="form-control form-control-sm py-1"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Balance</Form.Label>
                      <Form.Control
                        type="number"
                        className="form-control form-control-sm py-1"
                        name="balance"
                        value={formData.balance}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Paid Amount</Form.Label>
                      <Form.Control
                        type="number"
                        className="form-control form-control-sm py-1"
                        name="paidAmount"
                        value={formData.paidAmount}
                        onChange={handleInputChange}
                        isInvalid={!!errors.paidAmount}
                      />
                      <Form.Control.Feedback type="invalid">{errors.paidAmount}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Balance Amount</Form.Label>
                      <Form.Control
                        type="number"
                        className="form-control form-control-sm py-1"
                        name="balanceAmount"
                        value={formData.balanceAmount}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>

                  <Col md={3}>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Payment Mode</Form.Label>
                      <div>
                        {["Online", "D.D.", "Cash"].map((mode, index) => (
                          <Form.Check
                            key={index}
                            inline
                            type="radio"
                            id={`payment-mode-${index}`}
                            label={mode}
                            name="paymentMode"
                            value={mode}
                            checked={formData.paymentMode === mode}
                            onChange={handleInputChange}
                            className="form-check-inline small"
                          />
                        ))}
                      </div>
                      {errors.paymentMode && <div className="text-danger small">{errors.paymentMode}</div>}
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Number</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        disabled={formData.paymentMode === "Cash"}
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Select Operator Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control form-control-sm py-1"
                        name="operatorName"
                        value={formData.operatorName}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="form-label small mb-1">Fee Type</Form.Label>
                      <Form.Select
                        className="form-select form-select-sm py-1"
                        onChange={handleFeeTypeChange}
                        value={selectedFeeType}
                      >
                        <option value="">Select Fee Type</option>
                        {feeTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mt-1">
                  <Col md={4}>
                    <div className="card">
                      <div className="card-header py-1" style={styles.headerBg}>
                        <h6 className="mb-0 small">Concession</h6>
                      </div>
                      <div className="card-body p-2">
                        <Row className="g-2">
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="form-label small mb-1">Enter concess %</Form.Label>
                              <Form.Control
                                type="number"
                                className="form-control form-control-sm py-1"
                                name="concessPercent"
                                value={formData.concessPercent}
                                onChange={handleInputChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="form-label small mb-1">Concess Head</Form.Label>
                              <Form.Select
                                className="form-select form-select-sm py-1"
                                name="concessHead"
                                value={formData.concessHead}
                                onChange={handleInputChange}
                              >
                                <option value="">Select Head</option>
                                {feeHeadsByType.map((heading) => (
                                  <option key={heading.id} value={heading.name}>
                                    {heading.name}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="form-label small mb-1">Enter Concess</Form.Label>
                              <Form.Control
                                type="number"
                                className="form-control form-control-sm py-1"
                                name="concessAmount"
                                value={formData.concessAmount}
                                onChange={handleInputChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <Row className="g-2">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label small mb-1">Balance Before</Form.Label>
                          <Form.Control
                            type="number"
                            className="form-control form-control-sm py-1"
                            name="balanceBefore"
                            value={formData.balanceBefore}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="form-label small mb-1">Balance After</Form.Label>
                          <Form.Control
                            type="number"
                            className="form-control form-control-sm py-1"
                            name="balanceAfter"
                            value={formData.balanceAfter}
                            onChange={handleInputChange}
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mt-2">
                      <Form.Label className="form-label small mb-1">Entered Amount [ In Rupees ]</Form.Label>
                      <Form.Control
                        type="number"
                        className="form-control form-control-sm py-1"
                        name="paidAmount"
                        value={formData.paidAmount}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Row className="g-2">
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label className="form-label small mb-1">Transaction/Narration</Form.Label>
                          <Form.Control
                            type="text"
                            className="form-control form-control-sm py-1"
                            name="transactionNarrat"
                            value={formData.transactionNarrat}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="form-label small mb-1">Date</Form.Label>
                          <Form.Control
                            type="date"
                            className="form-control form-control-sm py-1"
                            name="transactionDate"
                            value={formData.transactionDate}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <div className="table-responsive">
                      <Table className="table table-bordered table-sm small mb-0">
                        <thead>
                          <tr style={styles.headerBg}>
                            <th>Fee Type</th>
                            <th>Fee Heading</th>
                            <th>Amount in Rs</th>
                            <th>Balance</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedFeeHeadings.length > 0 ? (
                            selectedFeeHeadings.map((heading, index) => (
                              <tr key={index}>
                                <td>{heading.feeType}</td>
                                <td>{heading.name}</td>
                                <td>{heading.amount}</td>
                                <td>{heading.balance}</td>
                                <td>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleRemoveFeeHeading(index)}
                                    className="py-0 px-1"
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center">
                                No fee headings selected
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="table-responsive">
                      <Table className="table table-bordered table-sm small mb-0">
                        <thead>
                          <tr style={styles.headerBg}>
                            <th>Date</th>
                            <th>Bill Number</th>
                            <th>Description</th>
                            <th>Paid Amount</th>
                            <th>Narration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previousPayments.length > 0 ? (
                            previousPayments.map((payment, index) => (
                              <tr key={index}>
                                <td>{payment.date}</td>
                                <td>{payment.billNumber}</td>
                                <td>{payment.transactionNarrat || "-"}</td>
                                <td>{payment.paidAmount}</td>
                                <td>{payment.transactionNarrat || "-"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center">
                                No previous payments
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="5" style={styles.headerBg}>
                              <small>Previous Paid Amount Rs: {totalPaidAmount.toFixed(2)}/-</small>
                            </td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex flex-wrap gap-1 mt-3">
                  <Button type="submit" className="btn btn-sm" style={styles.customBtn}>
                    Confirm Bill Entry
                  </Button>
                  <Button type="button" className="btn btn-sm" style={styles.customBtn}>
                    View
                  </Button>
                  <Button type="button" className="btn btn-sm" style={styles.customBtn}>
                    Bill Cancel
                  </Button>
                  <Button type="button" className="btn btn-sm" style={styles.customBtn}>
                    Row Del
                  </Button>
                  <Button type="button" className="btn btn-sm" style={styles.customBtn}>
                    Bus Bill
                  </Button>
                  <Button type="button" className="btn btn-sm" style={styles.customBtn}>
                    Print
                  </Button>
                  <Button type="button" className="btn btn-sm" style={styles.customBtn}>
                    Due status
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Container>

      <style>
        {`
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

          .form-label {
            font-weight: 500;
            color: #2D3748;
          }

          .admission-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
            background-color: white;
            border: 1px solid #ced4da;
            border-radius: 0.25rem;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
          }

          .admission-dropdown-item {
            padding: 0.5rem;
            cursor: pointer;
          }

          .admission-dropdown-item:hover {
            background-color: #f8f9fa;
          }

          .billing-container {
            min-height: calc(100vh - 150px);
          }

          @media (max-width: 768px) {
            .card-body {
              padding: 0.75rem;
            }
            
            .form-control-sm, .form-select-sm {
              font-size: 0.8rem;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default BillingEntry

