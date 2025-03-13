"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Container, Spinner, Table, Card, Row, Col } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, where, doc, getDoc, limit } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import "jspdf-autotable"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FaPrint, FaFilePdf, FaUndo, FaSearch } from "react-icons/fa"

const BillWiseDetails = () => {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [administrationId, setAdministrationId] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState({ name: "", address: "" })
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [collectionData, setCollectionData] = useState([])
  const [totalCollection, setTotalCollection] = useState(0)
  const componentRef = useRef(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSchoolInfo()
      const adminId = await fetchAdministrationId()
      if (adminId) {
        await fetchBillWiseDetails(adminId)
      }
    }

    fetchInitialData()
  }, [])

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
      toast.error("Failed to fetch school information")
    }
  }

  const fetchAdministrationId = async () => {
    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
      const q = query(adminRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const adminId = querySnapshot.docs[0].id
        setAdministrationId(adminId)
        return adminId
      } else {
        toast.error("No administration found")
        return null
      }
    } catch (error) {
      console.error("Error fetching Administration ID:", error)
      toast.error("Failed to initialize. Please try again.")
      return null
    }
  }

  const processCollectionData = (rawData) => {
    const groupedData = rawData.reduce((acc, item) => {
      const date = item.billDate.toDate().toLocaleDateString()
      const paymentMode = item.paymentMode || "Cash"
      const operatorName = item.operatorName || "XPO ADMN"

      if (!acc[date]) {
        acc[date] = {
          paymentMode,
          operatorName,
          entries: [],
        }
      }
      acc[date].entries.push(item)
      return acc
    }, {})

    const processedData = []
    let grandTotal = 0

    Object.entries(groupedData).forEach(([date, { paymentMode, operatorName, entries }]) => {
      // Add date header
      processedData.push({
        type: "date",
        date,
        paymentMode,
        operatorName,
      })

      let dayTotal = 0

      // Add entries
      entries.forEach((entry) => {
        processedData.push({
          type: "entry",
          ...entry,
        })
        dayTotal += Number(entry.amount) || 0
      })

      // Add day total
      processedData.push({
        type: "dayTotal",
        amount: dayTotal,
      })

      grandTotal += dayTotal
    })

    return { processedData, grandTotal }
  }

  const fetchBillWiseDetails = async (adminId = administrationId) => {
    if (!adminId) return

    setLoading(true)
    try {
      const feeLogRef = collection(db, "Schools", auth.currentUser.uid, "Transactions", adminId, "FeeLog")

      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      const q = query(feeLogRef, where("billDate", ">=", start), where("billDate", "<=", end))

      const snapshot = await getDocs(q)
      const rawCollections = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        rawCollections.push({
          billDate: data.billDate,
          billNumber: data.billNumber,
          admissionNumber: data.admissionNumber,
          studentName: data.studentName,
          standard: data.standard,
          section: data.section,
          amount: Number.parseFloat(data.totalPaidAmount) || 0,
          paymentMode: data.paymentMode,
          operatorName: data.operatorName,
          chequeNumber: data.paymentNumber || "-",
        })
      })

      const { processedData, grandTotal } = processCollectionData(rawCollections)
      setCollectionData(processedData)
      setTotalCollection(grandTotal)

      if (processedData.length === 0) {
        toast.info("No collection data found for the selected date range")
      } else {
        toast.success(`Successfully loaded collection records`)
      }
    } catch (error) {
      console.error("Error fetching collection data:", error)
      toast.error("Failed to fetch collection data")
    } finally {
      setLoading(false)
    }
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
  }

  const handlePrint = () => {
    const doc = generatePDF()
    doc.autoPrint()
    window.open(doc.output("bloburl"), "_blank")
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(16)
    doc.text(schoolInfo.name, 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(schoolInfo.address, 105, 30, { align: "center" })
    doc.setFontSize(14)
    doc.text("Paid Details", 105, 45, { align: "center" })

    // Report date and page number
    doc.setFontSize(10)
    doc.text(`Report As Date: ${startDate.toLocaleDateString()}`, 20, 55)
    doc.text(`Page 1 of 1`, 180, 55)

    const columns = [
      { header: "Bill Date\nAdmin.No", dataKey: "billDate" },
      { header: "Bill No.", dataKey: "billNumber" },
      { header: "Name", dataKey: "name" },
      { header: "Grade", dataKey: "grade" },
      { header: "Sec", dataKey: "section" },
      { header: "Amt", dataKey: "amount" },
      { header: "DD/Che.No", dataKey: "chequeNumber" },
    ]

    const tableData = []
    let currentDate = null

    collectionData.forEach((item) => {
      if (item.type === "date") {
        if (currentDate !== item.date) {
          tableData.push([
            { content: item.date, colSpan: 7, styles: { fontStyle: "bold", fillColor: [240, 240, 240] } },
          ])
          currentDate = item.date
        }
        tableData.push([{ content: item.paymentMode, colSpan: 7, styles: { fontStyle: "normal" } }])
        tableData.push([{ content: item.operatorName, colSpan: 7, styles: { fontStyle: "normal" } }])
      } else if (item.type === "entry") {
        tableData.push([
          item.admissionNumber,
          item.billNumber,
          item.studentName,
          item.standard,
          item.section,
          { content: item.amount.toFixed(2), styles: { halign: "right" } },
          item.chequeNumber,
        ])
      } else if (item.type === "dayTotal") {
        tableData.push([
          { content: "Total:", colSpan: 5, styles: { halign: "right", fontStyle: "bold" } },
          { content: item.amount.toFixed(2), styles: { halign: "right", fontStyle: "bold" } },
          "",
        ])
      }
    })

    // Add grand total
    tableData.push([
      { content: "Grand Total:", colSpan: 5, styles: { halign: "right", fontStyle: "bold" } },
      { content: totalCollection.toFixed(2), styles: { halign: "right", fontStyle: "bold" } },
      "",
    ])

    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: tableData,
      startY: 65,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25, halign: "right" },
        6: { cellWidth: 25 },
      },
      headStyles: { fillColor: [11, 61, 123], textColor: [255, 255, 255] },
    })

    return doc
  }

  const downloadPDF = () => {
    const doc = generatePDF()
    doc.save("bill_wise_details.pdf")
  }

  const handleReset = () => {
    setStartDate(new Date())
    setEndDate(new Date())
    setCollectionData([])
    setTotalCollection(0)
  }

  const renderTableBody = () => {
    if (collectionData.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center">
            No collection data available for the selected date range.
          </td>
        </tr>
      )
    }

    return collectionData.map((item, index) => {
      if (item.type === "date") {
        return (
          <>
            <tr key={`date-${index}`} className="date-row">
              <td colSpan="7" className="fw-bold">
                {item.date}
              </td>
            </tr>
            <tr key={`mode-${index}`} className="mode-row">
              <td colSpan="7">{item.paymentMode}</td>
            </tr>
            <tr key={`operator-${index}`} className="operator-row">
              <td colSpan="7">{item.operatorName}</td>
            </tr>
          </>
        )
      }

      if (item.type === "entry") {
        return (
          <tr key={`entry-${index}`}>
            <td>{item.admissionNumber}</td>
            <td>{item.billNumber}</td>
            <td>{item.studentName}</td>
            <td className="text-center">{item.standard}</td>
            <td className="text-center">{item.section}</td>
            <td className="text-end">{item.amount.toFixed(2)}</td>
            <td>{item.chequeNumber}</td>
          </tr>
        )
      }

      if (item.type === "dayTotal") {
        return (
          <tr key={`total-${index}`} className="day-total-row">
            <td colSpan="5" className="text-end fw-bold">
              Total:
            </td>
            <td className="text-end fw-bold">{item.amount.toFixed(2)}</td>
            <td></td>
          </tr>
        )
      }

      return null
    })
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div>Collection Report</div>
            <span className="separator mx-2">&gt;</span>
            <span>Bill Wise Details</span>
          </nav>
        </div>

        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white py-3">
            <h2 className="mb-0">Bill Wise Details</h2>
          </Card.Header>
          <Card.Body className="p-4">
            <Form className="mb-4">
              <Row className="align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Start Date</Form.Label>
                    <DatePicker
                      selected={startDate}
                      onChange={handleStartDateChange}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>End Date</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={handleEndDateChange}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button className="custom-btn-clr w-100" onClick={() => fetchBillWiseDetails()} disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FaSearch className="me-2" /> Fetch Report
                      </>
                    )}
                  </Button>
                </Col>
                <Col md={4}>
                  <div className="d-flex justify-content-end">
                    <Button className="btn custom-btn-clr me-2" onClick={handlePrint} disabled={processing}>
                      <FaPrint className="me-2" /> Print
                    </Button>
                    <Button className="btn custom-btn-clr me-2" onClick={downloadPDF} disabled={processing}>
                      <FaFilePdf className="me-2" /> Download PDF
                    </Button>
                    <Button className="btn btn-secondary" onClick={handleReset}>
                      <FaUndo className="me-2" /> Reset
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>

            <div ref={componentRef} className="report-preview">
              <div className="text-center mb-4">
                <h3 className="school-name">{schoolInfo.name}</h3>
                <p className="school-address">{schoolInfo.address}</p>
                <h4 className="report-title">Paid Details</h4>
                <div className="d-flex justify-content-between mt-3">
                  <p>Report As Date: {startDate.toLocaleDateString()}</p>
                  <p>Page 1 of 1</p>
                </div>
              </div>

              <div className="table-responsive">
                <Table bordered hover className="report-table">
                  <thead>
                    <tr>
                      <th>
                        Bill Date
                        <br />
                        Admin.No
                      </th>
                      <th>Bill No.</th>
                      <th>Name</th>
                      <th>Grade</th>
                      <th>Sec</th>
                      <th className="text-end">Amt</th>
                      <th>DD/Che.No</th>
                    </tr>
                  </thead>
                  <tbody>{renderTableBody()}</tbody>
                  <tfoot>
                    <tr className="grand-total-row">
                      <td colSpan="5" className="text-end fw-bold">
                        Grand Total:
                      </td>
                      <td className="text-end fw-bold double-underline">{totalCollection.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        .bg-primary {
          background-color: #0B3D7B !important;
        }
        .text-primary {
          color: #0B3D7B !important;
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
        
        .report-preview {
          border: 1px solid #dee2e6;
          padding: 20px;
          margin-bottom: 20px;
          background-color: white;
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

        .report-title {
          font-size: 20px;
          font-weight: bold;
          margin: 16px 0;
          text-decoration: underline;
        }

        .report-table {
          font-size: 14px;
          width: 100%;
          border-collapse: collapse;
        }

        .report-table th, .report-table td {
          border: 1px solid #dee2e6;
          padding: 8px;
          text-align: left;
        }

        .report-table th {
          background-color: #0B3D7B;
          color: white;
          vertical-align: middle;
        }
        
        .report-table td {
          vertical-align: middle;
        }
        
        .date-row td {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        .mode-row td,
        .operator-row td {
          background-color: #ffffff;
          padding: 4px 8px;
        }
        
        .day-total-row td {
          border-top: 1px solid #dee2e6;
        }
        
        .grand-total-row td {
          border-top: 2px solid #000;
        }

        .double-underline {
          border-bottom: 3px double #000;
          padding-bottom: 4px;
        }

        @media (max-width: 768px) {
          .btn {
            width: 100%;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </MainContentPage>
  )
}

export default BillWiseDetails

