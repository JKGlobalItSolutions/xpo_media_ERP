"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Form, Button, Row, Col, Container, Table, InputGroup } from "react-bootstrap"
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

const BillEntry = () => {
  const navigate = useNavigate()

  // State for administration and transport IDs
  const [administrationId, setAdministrationId] = useState(null)
  const [transportId, setTransportId] = useState(null)

  // Bill data state
  const [billData, setBillData] = useState({
    billNumber: "",
    admissionNumber: "",
    barCodeNumber: "",
    studentName: "",
    fatherName: "",
    course: "",
    section: "",
    pickupPoint: "",
    date: new Date().toISOString().split("T")[0],
    balance: "0",
    paidAmount: "0",
    balanceAmount: "0",
    paymentMode: "Cash",
    paymentNumber: "",
    operatorName: "XPO ADMIN",
    transactionNarrative: "",
    transactionDate: new Date().toISOString().split("T")[0],
  })

  const [feeDetails, setFeeDetails] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const [studentData, setStudentData] = useState(null)
  const [feeTableData, setFeeTableData] = useState([])
  const [totalBalance, setTotalBalance] = useState(0)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [studentLoaded, setStudentLoaded] = useState(false)

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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBillData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Fetch student data by admission number
  const fetchStudentData = async () => {
    if (!billData.admissionNumber || !administrationId) return

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
      const q = query(admissionRef, where("admissionNumber", "==", billData.admissionNumber))
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

    if (paidAmount > originalAmount) {
      toast.error("Paid amount cannot exceed the original fee amount")
      return
    }

    feeItem.paidAmount = value
    feeItem.remainingBalance = (originalAmount - paidAmount).toFixed(2)
    feeItem.status = Number(feeItem.remainingBalance) === 0 ? "Settled" : "Pending"
    setFeeTableData(updatedFeeTableData)

    // Update total paid amount and balance
    const totalPaid = updatedFeeTableData.reduce((sum, fee) => sum + Number.parseFloat(fee.paidAmount || 0), 0)
    const newBalance = totalBalance - totalPaid

    setBillData((prev) => ({
      ...prev,
      paidAmount: totalPaid.toFixed(2),
      balanceAmount: newBalance.toFixed(2),
    }))
  }

  // Handle payment submission
  const handleSubmit = async (e) => {
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
    if (totalPaidAmount <= 0) {
      toast.error("Total paid amount must be greater than zero")
      return
    }

    try {
      const now = new Date()

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
        transactionDate: billData.date,
        transactionNarrative: billData.transactionNarrative,
        boardingPoint: billData.pickupPoint,
        routeNumber: studentData.busRouteNumber || "",
        totalPaidAmount: totalPaidAmount.toFixed(2),
        timestamp: now.toISOString(),
        feePayments: feeTableData
          .filter((fee) => Number.parseFloat(fee.paidAmount) > 0)
          .map((fee) => ({
            feeHead: fee.heading,
            feeAmount: fee.amount,
            paidAmount: fee.paidAmount,
          })),
      }

      if (feeLogEntry.feePayments.length === 0) {
        toast.error("No fees have been paid")
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
        timestamp: serverTimestamp(),
      })

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

  // Reset form after submission
  const resetForm = () => {
    // Generate new bill number
    const currentBillNumber = billData.billNumber
    const [currentNumber, currentYear] = currentBillNumber.split("/")
    const nextNumber = Number.parseInt(currentNumber, 10) + 1
    const newBillNumber = `${nextNumber}/${currentYear}`

    setBillData({
      billNumber: newBillNumber,
      admissionNumber: "",
      barCodeNumber: "",
      studentName: "",
      fatherName: "",
      course: "",
      section: "",
      pickupPoint: "",
      date: new Date().toISOString().split("T")[0],
      balance: "0",
      paidAmount: "0",
      balanceAmount: "0",
      paymentMode: "Cash",
      paymentNumber: "",
      operatorName: "XPO ADMIN",
      transactionNarrative: "",
      transactionDate: new Date().toISOString().split("T")[0],
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
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2"></span>
            <Link to="/transactions">Transactions</Link>
            <span className="separator mx-2"></span>
            <span>Bill Entry</span>
          </nav>
        </div>

        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Billing Window</h2>
          </div>
          <div style={{ width: "20px" }}></div>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form onSubmit={handleSubmit} className="billing-form">
            <Row>
              {/* Left Column */}
              <Col md={6} className="left-column">
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
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
                  </Col>

                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Admin. No.</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          name="admissionNumber"
                          value={billData.admissionNumber}
                          onChange={handleInputChange}
                          className="form-control-light"
                        />
                        <Button variant="outline-secondary" onClick={fetchStudentData} disabled={isLoading}>
                          {isLoading ? "Loading..." : "Fetch"}
                        </Button>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Bar Code No.</Form.Label>
                  <Form.Control
                    type="text"
                    name="barCodeNumber"
                    value={billData.barCodeNumber}
                    onChange={handleInputChange}
                    className="form-control-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
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

                <div className="fee-table-container mb-3">
                  <Table bordered hover size="sm" className="fee-table">
                    <thead className="table-header">
                      <tr>
                        <th>Description</th>
                        <th>Amount</th>
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
                          <td colSpan="5" className="text-center">
                            No fee details available
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">
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

              {/* Right Column */}
              <Col md={6} className="right-column">
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={billData.date}
                        onChange={handleInputChange}
                        className="form-control-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Balance</Form.Label>
                  <Form.Control
                    type="text"
                    name="balance"
                    value={billData.balance}
                    disabled
                    className="form-control-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Paid amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="paidAmount"
                    value={billData.paidAmount}
                    disabled
                    className="form-control-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Balance amount</Form.Label>
                  <Form.Control
                    type="text"
                    name="balanceAmount"
                    value={billData.balanceAmount}
                    disabled
                    className="form-control-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
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
                      id="dd"
                      label="D.D."
                      name="paymentMode"
                      value="D.D."
                      checked={billData.paymentMode === "D.D."}
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

                <Form.Group className="mb-3">
                  <Form.Label>No.</Form.Label>
                  <Form.Control
                    type="text"
                    name="paymentNumber"
                    value={billData.paymentNumber}
                    onChange={handleInputChange}
                    disabled={billData.paymentMode === "Cash"}
                    className="form-control-light"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Select Operator Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="operatorName"
                    value={billData.operatorName}
                    disabled
                    className="form-control-light"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 mb-3">
                  Submit Bill Entry
                </Button>

                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
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
                    <Form.Group>
                      <Form.Label>Date:</Form.Label>
                      <Form.Control
                        type="date"
                        name="transactionDate"
                        value={billData.transactionDate}
                        onChange={handleInputChange}
                        className="form-control-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
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

          .billing-form {
            max-width: 1200px;
            margin: 0 auto;
          }

          .form-control-light {
            background-color: #F8F9FA !important;
            border: 1px solid #CED4DA;
            border-radius: 4px;
            padding: 0.5rem;
          }

          .form-control-light:focus {
            border-color: #80bdff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }

          .fee-table-container {
            height: calc(100vh - 500px);
            min-height: 300px;
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

          @media print {
            .custom-breadcrumb,
            button[type="submit"] {
              display: none;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default BillEntry

