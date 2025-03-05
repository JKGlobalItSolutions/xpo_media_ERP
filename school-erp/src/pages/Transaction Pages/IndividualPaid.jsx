"use client"

import { useState, useRef, useEffect } from "react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { Button } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"

const IndividualPaid = () => {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [administrationId, setAdministrationId] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState({ name: "", address: "" })
  const [studentData, setStudentData] = useState({
    admissionNumber: "",
    studentName: "",
    standard: "",
    section: "",
    fixedAmount: "0",
    balanceAmount: "0",
    totalPaidAmount: "0",
    concessAmount: "0",
  })
  const [paymentHistory, setPaymentHistory] = useState([])
  const componentRef = useRef(null)

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const schoolDoc = doc(db, "Schools", auth.currentUser.uid)
        const schoolSnapshot = await getDoc(schoolDoc)
        if (schoolSnapshot.exists()) {
          const data = schoolSnapshot.data()
          setSchoolInfo({
            name: data.SchoolName || "",
            address: data.SchoolAddres || "",
          })
        }
      } catch (error) {
        console.error("Error fetching school information:", error)
      }
    }

    fetchSchoolInfo()
    fetchAdministrationId()
  }, [])

  const fetchAdministrationId = async () => {
    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
      const q = query(adminRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setAdministrationId(querySnapshot.docs[0].id)
      }
    } catch (error) {
      console.error("Error fetching Administration ID:", error)
      toast.error("Failed to initialize. Please try again.")
    }
  }

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    setStudentData((prev) => ({ ...prev, [name]: value }))

    if (name === "admissionNumber" && value.length >= 3) {
      await fetchStudentData(value)
    }
  }

  const fetchStudentData = async (admissionNumber) => {
    if (!administrationId) return

    setLoading(true)
    try {
      const studentRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const studentQuery = query(studentRef, where("admissionNumber", "==", admissionNumber))
      const studentSnapshot = await getDocs(studentQuery)

      if (!studentSnapshot.empty) {
        const studentDoc = studentSnapshot.docs[0].data()

        const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", administrationId, "FeeLog")
        const paymentQuery = query(feeLogRef, where("admissionNumber", "==", admissionNumber))
        const paymentSnapshot = await getDocs(paymentQuery)

        const payments = paymentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().transactionDate,
        }))

        const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.totalPaidAmount), 0)
        const totalConcession = payments.reduce((sum, payment) => sum + Number(payment.totalConcessionAmount || 0), 0)
        const fixedAmount = Number(studentDoc.totalFees || 0)
        const balanceAmount = Math.max(0, fixedAmount - totalPaid - totalConcession)

        setStudentData({
          admissionNumber,
          studentName: studentDoc.studentName || "",
          standard: studentDoc.standard || "",
          section: studentDoc.section || "",
          fixedAmount: fixedAmount.toString(),
          balanceAmount: balanceAmount.toString(),
          totalPaidAmount: totalPaid.toString(),
          concessAmount: totalConcession.toString(),
        })

        setPaymentHistory(payments)
        toast.success("Student data loaded successfully")
      } else {
        toast.error("No student found with this admission number")
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const downloadPDF = () => {
    const doc = new jsPDF()

    // Set font size and style for header
    doc.setFontSize(16)
    doc.text(schoolInfo.name, 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(schoolInfo.address, 105, 30, { align: "center" })

    // Title
    doc.setFontSize(14)
    doc.text("Due Status", 105, 40, { align: "center" })
    doc.line(80, 42, 130, 42)

    // Student Details
    doc.setFontSize(12)
    doc.text(`Name: ${studentData.studentName}`, 20, 55)
    doc.text(`Reg No: ${studentData.admissionNumber}`, 20, 65)
    doc.text(`Std: ${studentData.standard}`, 140, 55)
    doc.text(`Sec: ${studentData.section}`, 140, 65)

    // Table Header
    const tableHeaders = ["SI No", "Bill No", "Date", "Desc", "Fixed Amt", "Paid Amt"]
    let yPos = 80
    let xPos = 20

    // Draw table headers
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos, yPos)
      xPos += 30
    })

    // Draw horizontal line under headers
    doc.line(20, yPos + 2, 190, yPos + 2)
    yPos += 10

    // Table Data
    paymentHistory.forEach((payment, index) => {
      xPos = 20
      doc.text((index + 1).toString(), xPos, yPos)
      doc.text(payment.billNumber || "", xPos + 30, yPos)
      doc.text(new Date(payment.date).toLocaleDateString("en-GB"), xPos + 60, yPos)
      doc.text(payment.description || "", xPos + 90, yPos)
      doc.text(payment.fixedAmount?.toString() || "", xPos + 120, yPos)
      doc.text(payment.totalPaidAmount?.toString() || "", xPos + 150, yPos)
      yPos += 10
    })

    // Summary
    yPos += 10
    doc.text(`Concession Amount: ${studentData.concessAmount}`, 20, yPos)
    doc.text(`Paid Amount: ${studentData.totalPaidAmount}`, 120, yPos)
    yPos += 10
    doc.text(`Balance Amount: ${studentData.balanceAmount}`, 120, yPos)

    doc.save("individual_paid_details.pdf")
  }

  const handleReset = () => {
    setStudentData({
      admissionNumber: "",
      studentName: "",
      standard: "",
      section: "",
      fixedAmount: "0",
      balanceAmount: "0",
      totalPaidAmount: "0",
      concessAmount: "0",
    })
    setPaymentHistory([])
  }

  return (
    <MainContentPage>
      <div className="mb-4">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator mx-2">&gt;</span>
          <div>Transaction</div>
          <span className="separator mx-2">&gt;</span>
          <span>Individual Paid</span>
        </nav>
      </div>

      <div className="billing-container container-fluid p-0 bg-white rounded shadow">
        {/* Header */}
        <div className="bg-primary text-white p-3 mb-4">
          <h2>Individual Paid Amount</h2>
        </div>

        <div ref={componentRef}>
          {/* Top Row */}
          <div className="row mb-2 px-3">
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Admission Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="admissionNumber"
                  value={studentData.admissionNumber}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Fixed Amount</label>
                <input type="text" className="form-control" value={studentData.fixedAmount} readOnly />
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-group">
                <label className="form-label">Balance Amount</label>
                <input type="text" className="form-control" value={studentData.balanceAmount} readOnly />
              </div>
            </div>
          </div>

          {/* Student Details Section */}
          <div className="p-3 mb-2">
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-control" value={studentData.studentName} readOnly />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Standard</label>
                  <input type="text" className="form-control" value={studentData.standard} readOnly />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input type="text" className="form-control" value={studentData.section} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="row mb-2 px-3">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Total Amount Paid Rs</label>
                <input type="text" className="form-control" value={studentData.totalPaidAmount} readOnly />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Concess Amount</label>
                <input type="text" className="form-control" value={studentData.concessAmount} readOnly />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mb-4">
            <div className="table-responsive custom-table-container">
              <table className="table table-bordered">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="sno-column">S.No</th>
                    <th className="date-column">Paid Date</th>
                    <th className="amount-column">Paid Amount</th>
                    <th className="bill-column">Bill Number</th>
                    <th className="desc-column">Fee Head Description</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr key={payment.id}>
                      <td className="sno-column">{index + 1}</td>
                      <td className="date-column">{new Date(payment.date).toLocaleDateString("en-GB")}</td>
                      <td className="amount-column">{payment.totalPaidAmount}</td>
                      <td className="bill-column">{payment.billNumber}</td>
                      <td className="desc-column">{payment.feePayments?.map((fee) => fee.feeHead).join(", ")}</td>
                    </tr>
                  ))}
                  {paymentHistory.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No payment history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Printable content */}
        <div className="printable-content">
          <div className="school-header text-center mb-4">
            <h3 className="school-name">{schoolInfo.name}</h3>
            <p className="school-address">{schoolInfo.address}</p>
            <h4 className="mt-4 mb-3">Due Status</h4>
          </div>

          <div className="student-details mb-4">
            <div className="row">
              <div className="col-6">
                <p>
                  <strong>Name:</strong> {studentData.studentName}
                </p>
                <p>
                  <strong>Reg No:</strong> {studentData.admissionNumber}
                </p>
              </div>
              <div className="col-6 text-right">
                <p>
                  <strong>Std:</strong> {studentData.standard}
                </p>
                <p>
                  <strong>Sec:</strong> {studentData.section}
                </p>
              </div>
            </div>
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>SI No</th>
                <th>Bill No</th>
                <th>Date</th>
                <th>Desc</th>
                <th>Fixed Amt</th>
                <th>Paid Amt</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{index + 1}</td>
                  <td>{payment.billNumber}</td>
                  <td>{new Date(payment.date).toLocaleDateString("en-GB")}</td>
                  <td>{payment.description}</td>
                  <td>{payment.fixedAmount}</td>
                  <td>{payment.totalPaidAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary mt-4">
            <p>
              <strong>Concession Amount:</strong> {studentData.concessAmount}
            </p>
            <p>
              <strong>Paid Amount:</strong> {studentData.totalPaidAmount}
            </p>
            <p>
              <strong>Balance Amount:</strong> {studentData.balanceAmount}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-3 p-3 mt-3">
          <Button
            className="btn custom-btn-clr w-20 w-md-auto"
            onClick={handlePrint}
            disabled={processing || !studentData.admissionNumber}
          >
            Print
          </Button>
          <Button
            className="btn custom-btn-clr w-20 w-md-auto"
            onClick={downloadPDF}
            disabled={processing || !studentData.admissionNumber}
          >
            Download PDF
          </Button>
          <Button className="btn btn-secondary w-20 w-md-auto" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />

      <style jsx>{`
        .bg-primary {
          background-color: #0B3D7B !important;
        }
        .text-primary {
          color: #0B3D7B !important;
        }
        .form-control {
          border-radius: 4px;
          border: 1px solid #ced4da;
        }
        .form-label {
          margin-bottom: 0.5rem;
        }
        .gap-3 {
          gap: 1rem;
        }
        .table th {
          background-color: #0B3D7B;
          color: white;
        }
        .btn {
          padding: 0.5rem 2rem;
        }

        .custom-table-container {
          overflow-x: auto;
          margin: 0 15px;
        }

        .table {
          margin-bottom: 0;
        }

        /* Column specific widths */
        .sno-column {
          min-width: 80px;
          width: 80px;
        }
        .date-column {
          min-width: 150px;
          width: 150px;
        }
        .amount-column {
          min-width: 130px;
          width: 130px;
        }
        .bill-column {
          min-width: 120px;
          width: 120px;
        }
        .desc-column {
          min-width: 200px;
          width: 200px;
        }

        /* Table cell styles */
        .table th,
        .table td {
          padding: 12px;
          vertical-align: middle;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        .custom-btn-clr {
          background-color: #0B3D7B;
          border-color: #0B3D7B;
          color: white;
        }

        .custom-btn-clr:hover {
          background-color: #092c5a;
          border-color: #092c5a;
        }

        /* Printable content styles */
        .printable-content {
          display: none;
        }

        /* Print styles */
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-content, .printable-content * {
            visibility: visible;
          }
          .printable-content {
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .school-address {
            font-size: 16px;
            margin-bottom: 16px;
          }
          .btn, .custom-breadcrumb {
            display: none !important;
          }
          .billing-container {
            box-shadow: none !important;
          }
          .bg-primary {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }

        @media (max-width: 768px) {
          .billing-container {
            padding: 0 10px;
          }
          .billing-container .row {
            margin: 0;
          }
          .billing-container .col-md-4, 
          .billing-container .col-md-3, 
          .billing-container .col-md-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }
          .btn {
            width: 100%;
            margin-bottom: 10px;
          }
          .custom-table-container {
            margin: 0;
          }
          .table {
            min-width: 680px; /* Sum of all column widths */
          }
        }
      `}</style>
    </MainContentPage>
  )
}

export default IndividualPaid

