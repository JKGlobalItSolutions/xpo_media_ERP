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
  serverTimestamp,
  runTransaction,
} from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaChevronDown, FaCalendarAlt, FaCreditCard, FaMoneyBillWave } from "react-icons/fa"

const BillingEntry = () => {
  const [formData, setFormData] = useState({
    billNumber: "",
    admissionNumber: "",
    studentName: "",
    fatherName: "",
    course: "",
    section: "",
    date: new Date().toISOString().split("T")[0],
    totalBalance: "0",
    totalPaidAmount: "0",
    paymentMode: "Online",
    number: "",
    operatorName: "XPO admin",
    transactionNarrat: "",
  })

  const [administrationId, setAdministrationId] = useState(null)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [filteredAdmissionNumbers, setFilteredAdmissionNumbers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [studentFeeDetails, setStudentFeeDetails] = useState([])
  const [previousPayments, setPreviousPayments] = useState([])
  const [selectedFeeHeadings, setSelectedFeeHeadings] = useState([])
  const [totalPaidAmount, setTotalPaidAmount] = useState(0)
  const [errors, setErrors] = useState({})
  const [currentStudentId, setCurrentStudentId] = useState(null)
  const [billCounter, setBillCounter] = useState(1)
  const [academicYear, setAcademicYear] = useState("")
  const [feeTypes, setFeeTypes] = useState([])
  const [selectedFeeType, setSelectedFeeType] = useState("")
  const [feeHeadsByType, setFeeHeadsByType] = useState([])
  const [splitPayments, setSplitPayments] = useState({})
  const [selectedFeeHeads, setSelectedFeeHeads] = useState([])
  const [paymentAllocation, setPaymentAllocation] = useState({})
  const [totalFeesByType, setTotalFeesByType] = useState({})
  const [overallFeeBalance, setOverallFeeBalance] = useState(0)

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

    let academicYearStart, academicYearEnd

    if (month < 5) {
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
      const billsRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")

      const querySnapshot = await getDocs(billsRef)
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

      setBillCounter(highestCounter + 1)
      const newBillNumber = `${highestCounter + 1}/${academicYear}`
      setFormData((prev) => ({
        ...prev,
        billNumber: newBillNumber,
      }))
    } catch (error) {
      console.error("Error fetching last bill number:", error)
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
      toast.error("Failed to fetch admission numbers.")
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
      toast.error("Failed to fetch fee types.")
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
          const feeDetails = feeData.feeDetails || []

          // Ensure all fee details have proper numeric values for balance and amount
          const processedFeeDetails = feeDetails.map((fee) => ({
            ...fee,
            balance: fee.balance ? Number.parseFloat(fee.balance).toString() : "0",
            amount: fee.amount ? Number.parseFloat(fee.amount).toString() : "0",
          }))

          setStudentFeeDetails(processedFeeDetails)

          // Calculate totals by fee type
          const totals = processedFeeDetails.reduce((acc, fee) => {
            const type = fee.type || "Other"
            acc[type] = (acc[type] || 0) + Number.parseFloat(fee.balance || 0)
            return acc
          }, {})

          setTotalFeesByType(totals)

          // Calculate total balance
          const totalBalance = Object.values(totals).reduce((sum, val) => sum + val, 0)

          setFormData((prev) => ({
            ...prev,
            totalBalance: totalBalance.toFixed(2),
          }))

          setOverallFeeBalance(totalBalance)
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

        const totalPaid = payments.reduce((sum, payment) => sum + (Number.parseFloat(payment.totalPaidAmount) || 0), 0)
        setTotalPaidAmount(totalPaid)

        toast.success("Student data fetched successfully!")
      } else {
        toast.error("No student found with the given admission number.")
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data.")
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
  }

  const handlePaymentAllocation = (headId, value) => {
    // Allow empty string for better user experience while typing
    if (value === "") {
      setPaymentAllocation((prev) => ({
        ...prev,
        [headId]: {
          ...prev[headId],
          amount: "",
        },
      }))

      // Recalculate total without this empty value
      const totalPaid = Object.entries(paymentAllocation)
        .filter(([id, _]) => id !== headId)
        .reduce((sum, [_, data]) => sum + (Number.parseFloat(data.amount) || 0), 0)

      setFormData((prev) => ({
        ...prev,
        totalPaidAmount: totalPaid.toFixed(2),
      }))

      return
    }

    // Parse input value and validate
    const amount = Number.parseFloat(value) || 0
    const feeHead = studentFeeDetails.find((fee) => fee.id === headId)

    // Ensure maxAmount is a valid number
    const maxAmount = Number.parseFloat(feeHead?.balance) || 0

    if (amount > maxAmount) {
      // Only show error if the balance is actually greater than 0
      if (maxAmount > 0) {
        toast.error(`Payment amount cannot exceed balance of ${maxAmount}`)
      } else {
        toast.error(`Cannot make payment for a fee with zero balance`)
      }
      return
    }

    setPaymentAllocation((prev) => ({
      ...prev,
      [headId]: {
        ...prev[headId],
        amount: amount.toString(),
      },
    }))

    // Calculate total paid amount from all allocations
    const totalPaid = Object.entries({
      ...paymentAllocation,
      [headId]: { amount: amount.toString() },
    }).reduce((sum, [_, data]) => sum + (Number.parseFloat(data.amount) || 0), 0)

    setFormData((prev) => ({
      ...prev,
      totalPaidAmount: totalPaid.toFixed(2),
    }))

    // Update the overall fee balance
    setOverallFeeBalance((prev) => prev - amount)

    // Update the balance for the specific fee head
    setStudentFeeDetails((prev) =>
      prev.map((fee) =>
        fee.id === headId ? { ...fee, balance: (Number.parseFloat(fee.balance) - amount).toFixed(2) } : fee,
      ),
    )
  }

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = ["admissionNumber", "studentName", "paymentMode", "operatorName"]

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

    const totalPaid = Number.parseFloat(formData.totalPaidAmount) || 0
    if (totalPaid <= 0) {
      newErrors.totalPaidAmount = "Total paid amount must be greater than zero"
      return false
    }

    // Validate each payment allocation
    let isValid = true
    studentFeeDetails.forEach((fee) => {
      const allocation = paymentAllocation[fee.id]
      if (allocation) {
        const paidAmount = Number.parseFloat(allocation.amount) || 0
        const feeBalance = Number.parseFloat(fee.balance) || 0

        if (paidAmount <= 0) {
          newErrors[`payment_${fee.id}`] = "Payment amount must be greater than zero"
          isValid = false
        } else if (paidAmount > feeBalance) {
          newErrors[`payment_${fee.id}`] = "Payment cannot exceed balance"
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid && Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        await runTransaction(db, async (transaction) => {
          // Create payment data
          const paymentData = {
            ...formData,
            createdAt: serverTimestamp(),
            studentId: currentStudentId,
            paymentAllocation,
            feeHeadPayments: Object.entries(paymentAllocation).map(([headId, allocation]) => {
              const feeHead = studentFeeDetails.find((fee) => fee.id === headId)
              const paidAmount = Number.parseFloat(allocation.amount)
              return {
                headId,
                heading: feeHead.heading,
                type: feeHead.type,
                paidAmount,
                balanceBefore: feeHead.balance,
                balanceAfter: (Number.parseFloat(feeHead.balance) - paidAmount).toFixed(2),
              }
            }),
          }

          // Add to FeeLog collection
          const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")

          await addDoc(feeLogRef, paymentData)

          // Update StudentFeeDetails
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

            const updatedFeeDetails = studentFeeDetails.map((fee) => {
              const paidAmount = Number.parseFloat(paymentAllocation[fee.id]?.amount || "0")
              return {
                ...fee,
                balance: (Number.parseFloat(fee.balance) - paidAmount).toFixed(2),
              }
            })

            transaction.update(studentFeeRef, {
              feeDetails: updatedFeeDetails,
            })
          }
        })

        toast.success("Payment recorded successfully!")

        // Reset form
        setBillCounter((prev) => prev + 1)
        const newBillNumber = `${billCounter + 1}/${academicYear}`

        setFormData({
          billNumber: newBillNumber,
          admissionNumber: "",
          studentName: "",
          fatherName: "",
          course: "",
          section: "",
          date: new Date().toISOString().split("T")[0],
          totalBalance: "0",
          totalPaidAmount: "0",
          paymentMode: "Online",
          number: "",
          operatorName: "XPO admin",
          transactionNarrat: "",
        })

        setPaymentAllocation({})
        setStudentFeeDetails([])
        setPreviousPayments([])
        setCurrentStudentId(null)
        setTotalFeesByType({})
        setOverallFeeBalance(0)
      } catch (error) {
        console.error("Error submitting payment:", error)
        toast.error("Failed to submit payment.")
      }
    } else {
      toast.error("Please fill in all required fields correctly.")
    }
  }

  const handleAdmissionSelect = (admissionNumber) => {
    setFormData((prev) => ({
      ...prev,
      admissionNumber: admissionNumber,
    }))
    fetchStudentData(admissionNumber)
    setShowDropdown(false)
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
          <div className="card flex-grow-1 shadow-sm">
            <div className="card-header py-3" style={styles.headerBg}>
              <h5 className="mb-0 fw-bold">Billing Entry</h5>
            </div>
            <div className="card-body p-4">
              <Form className="d-flex flex-column h-100" onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="form-label fw-bold mb-2">Bill Number</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        name="billNumber"
                        value={formData.billNumber}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mt-3 position-relative">
                      <Form.Label className="form-label fw-bold mb-2">Admin Number</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          className="form-control py-2"
                          name="admissionNumber"
                          value={formData.admissionNumber}
                          onChange={handleInputChange}
                          isInvalid={!!errors.admissionNumber}
                        />
                        <Button variant="outline-secondary" onClick={() => setShowDropdown(!showDropdown)}>
                          <FaChevronDown />
                        </Button>
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

                    <Form.Group className="mt-3">
                      <Form.Label className="form-label fw-bold mb-2">Student Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        name="studentName"
                        value={formData.studentName}
                        readOnly
                        isInvalid={!!errors.studentName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.studentName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="form-label fw-bold mb-2">Father Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        name="fatherName"
                        value={formData.fatherName}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label className="form-label fw-bold mb-2">Course</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        name="course"
                        value={formData.course}
                        readOnly
                      />
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label className="form-label fw-bold mb-2">Section</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        name="section"
                        value={formData.section}
                        readOnly
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="form-label fw-bold mb-2">Date</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="date"
                          className="form-control py-2"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                        />
                        <Button variant="outline-secondary">
                          <FaCalendarAlt />
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label className="form-label fw-bold mb-2">Payment Mode</Form.Label>
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
                            className="form-check-inline"
                          />
                        ))}
                      </div>
                      {errors.paymentMode && <div className="text-danger small">{errors.paymentMode}</div>}
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label className="form-label fw-bold mb-2">Transaction Number</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          className="form-control py-2"
                          name="number"
                          value={formData.number}
                          onChange={handleInputChange}
                          disabled={formData.paymentMode === "Cash"}
                        />
                        <Button variant="outline-secondary">
                          {formData.paymentMode === "Online" ? <FaCreditCard /> : <FaMoneyBillWave />}
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label fw-bold mb-2">Operator Name</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        name="operatorName"
                        value={formData.operatorName}
                        onChange={handleInputChange}
                        isInvalid={!!errors.operatorName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.operatorName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label fw-bold mb-2">Overall Fee Balance</Form.Label>
                      <Form.Control
                        type="text"
                        className="form-control py-2"
                        value={overallFeeBalance.toFixed(2)}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={12}>
                    <div className="table-responsive">
                      <Table className="table table-bordered table-hover mb-0">
                        <thead>
                          <tr style={styles.headerBg}>
                            <th>Fee Type</th>
                            <th>Fee Head</th>
                            <th>Total Amount</th>
                            <th>Paid Amount</th>
                            <th>Balance</th>
                            <th>Payment Amount</th>
                            <th>Balance After Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentFeeDetails.map((fee, index) => {
                            const balance = Number.parseFloat(fee.balance) || 0
                            const paymentAmount = Number.parseFloat(paymentAllocation[fee.id]?.amount || 0)
                            const balanceAfterPayment = balance - paymentAmount
                            return (
                              <tr key={index}>
                                <td>{fee.type}</td>
                                <td>{fee.heading}</td>
                                <td>{Number.parseFloat(fee.amount || 0).toFixed(2)}</td>
                                <td>{(Number.parseFloat(fee.amount || 0) - balance).toFixed(2)}</td>
                                <td>{balance.toFixed(2)}</td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    size="sm"
                                    value={paymentAllocation[fee.id]?.amount || ""}
                                    onChange={(e) => handlePaymentAllocation(fee.id, e.target.value)}
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    isInvalid={!!errors[`payment_${fee.id}`]}
                                    disabled={balance <= 0}
                                  />
                                  {errors[`payment_${fee.id}`] && (
                                    <Form.Control.Feedback type="invalid">
                                      {errors[`payment_${fee.id}`]}
                                    </Form.Control.Feedback>
                                  )}
                                </td>
                                <td>{balanceAfterPayment.toFixed(2)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="4" className="text-end fw-bold">
                              Total:
                            </td>
                            <td className="fw-bold">{Number.parseFloat(formData.totalBalance).toFixed(2)}</td>
                            <td className="fw-bold">{Number.parseFloat(formData.totalPaidAmount).toFixed(2)}</td>
                            <td className="fw-bold">{overallFeeBalance.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={12}>
                    <div className="table-responsive">
                      <Table className="table table-bordered table-hover mb-0">
                        <thead>
                          <tr style={styles.headerBg}>
                            <th>Date</th>
                            <th>Bill Number</th>
                            <th>Fee Head</th>
                            <th>Paid Amount</th>
                            <th>Balance After Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previousPayments.length > 0 ? (
                            previousPayments.map((payment, index) =>
                              payment.feeHeadPayments?.map((feeHead, subIndex) => (
                                <tr key={`${index}-${subIndex}`}>
                                  <td>{payment.date}</td>
                                  <td>{payment.billNumber}</td>
                                  <td>{feeHead.heading}</td>
                                  <td>{feeHead.paidAmount}</td>
                                  <td>{feeHead.balanceAfter}</td>
                                </tr>
                              )),
                            )
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
                              <small>Total Previous Paid Amount: Rs. {totalPaidAmount.toFixed(2)}/-</small>
                            </td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button
                    type="submit"
                    className="btn btn-lg"
                    style={{
                      ...styles.customBtn,
                      padding: "0.75rem 2.5rem",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    disabled={Number.parseFloat(formData.totalPaidAmount) <= 0}
                  >
                    Confirm Bill Entry
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Container>

      <style>
        {`
          .form-control:disabled {
            background-color: #f8f9fa;
            cursor: not-allowed;
          }

          .btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }

          .table td {
            vertical-align: middle;
          }

          .form-control {
            font-size: 0.9rem;
          }

          .invalid-feedback {
            display: block;
            margin-top: 0.25rem;
          }

          .btn-outline-primary:hover,
          .btn-outline-danger:hover {
            color: white;
          }

          .table tfoot tr td {
            background-color: #f8f9fa;
          }

          @media (max-width: 768px) {
            .btn {
              padding: 0.375rem 1rem !important;
              font-size: 0.875rem !important;
            }
          }

          .custom-breadcrumb {
            padding: 0.5rem 1rem;
            background-color: #f8f9fa;
            border-radius: 0.25rem;
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
            font-weight: 600;
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
            transition: background-color 0.2s ease;
          }

          .admission-dropdown-item:hover {
            background-color: #f8f9fa;
          }

          .billing-container {
            min-height: calc(100vh - 150px);
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .billing-container .card {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
          }

          .billing-container .card-body {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
          }

          @media (max-width: 768px) {
            .card-body {
              padding: 1rem;
            }
            
            .form-control, .form-select {
              font-size: 0.9rem;
            }
          }

          .table-responsive {
            max-height: 400px;
            overflow-y: auto;
          }

          /* For Firefox */
          .table-responsive {
            scrollbar-width: thin;
            scrollbar-color: #0B3D7B #f1f1f1;
          }

          /* For Chrome, Edge, and Safari */
          .table-responsive::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .table-responsive::-webkit-scrollbar-thumb {
            background: #0B3D7B;
            border-radius: 4px;
          }

          .table-responsive::-webkit-scrollbar-thumb:hover {
            background: #1470E1;
          }

          /* Card body scrolling */
          .card-body::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          .card-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .card-body::-webkit-scrollbar-thumb {
            background: #0B3D7B;
            border-radius: 4px;
          }

          .card-body::-webkit-scrollbar-thumb:hover {
            background: #1470E1;
          }

          /* For Firefox */
          .card-body {
            scrollbar-width: thin;
            scrollbar-color: #0B3D7B #f1f1f1;
          }

          /* Fix table header */
          .table-responsive thead tr th {
            position: sticky;
            top: 0;
            z-index: 1;
            background-color: #0B3D7B;
          }

          .card {
            border: none;
            transition: box-shadow 0.3s ease;
          }

          .card:hover {
            box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
          }

          .form-control:focus,
          .form-select:focus {
            border-color: #1470E1;
            box-shadow: 0 0 0 0.2rem rgba(20, 112, 225, 0.25);
          }

          .btn-outline-secondary {
            color: #6c757d;
            border-color: #6c757d;
          }

          .btn-outline-secondary:hover {
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default BillingEntry

