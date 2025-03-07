"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Container, Spinner, Table, Card, Row, Col } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, where, doc, getDoc, limit, Timestamp } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import "jspdf-autotable"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FaPrint, FaFilePdf, FaUndo, FaSearch } from "react-icons/fa"

const ConcessionAC = () => {
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [administrationId, setAdministrationId] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState({ name: "", address: "" })
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [concessionData, setConcessionData] = useState([])
  const [totalConcession, setTotalConcession] = useState(0)
  const componentRef = useRef(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSchoolInfo()
      const adminId = await fetchAdministrationId()
      if (adminId) {
        setAdministrationId(adminId)
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
        return querySnapshot.docs[0].id
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

  const fetchConcessionDetails = async () => {
    if (!administrationId) {
      toast.error("Administration ID not available")
      return
    }

    setLoading(true)
    try {
      const billEntriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transactions",
        administrationId,
        "BillEntries",
      )

      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      const q = query(
        billEntriesRef,
        where("billDate", ">=", Timestamp.fromDate(start)),
        where("billDate", "<=", Timestamp.fromDate(end)),
      )

      const snapshot = await getDocs(q)
      const concessions = []
      let total = 0

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const concessionAmount = Number(data.totalConcessionAmount) || 0
        if (concessionAmount > 0) {
          concessions.push({
            billNumber: data.billNumber,
            billDate: data.billDate instanceof Timestamp ? data.billDate.toDate() : new Date(data.billDate),
            admissionNumber: data.admissionNumber,
            studentName: data.studentName,
            standard: data.course || data.standard,
            section: data.section,
            description: "Concession",
            concessionAmount: concessionAmount,
          })
          total += concessionAmount
        }
      })

      setConcessionData(concessions)
      setTotalConcession(total)

      if (concessions.length === 0) {
        toast.info("No concession data found for the selected date range")
      } else {
        toast.success(`Successfully loaded ${concessions.length} concession records`)
      }
    } catch (error) {
      console.error("Error fetching concession data:", error)
      toast.error("Failed to fetch concession data")
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
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 10
    const contentWidth = pageWidth - 2 * margin

    // Header
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(schoolInfo.name, pageWidth / 2, margin + 10, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(schoolInfo.address, pageWidth / 2, margin + 20, { align: "center" })

    // Report Title
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("CONCESSION LIST", pageWidth / 2, margin + 35, { align: "center" })
    doc.line(margin + 30, margin + 37, pageWidth - margin - 30, margin + 37)

    // Date Range and Page Number
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Report as on: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, margin, margin + 45)
    doc.text(`Page 1 of 1`, pageWidth - margin, margin + 45, { align: "right" })

    const columns = [
      { header: "Bill No", dataKey: "billNumber" },
      { header: "Bill Date", dataKey: "billDate" },
      { header: "Admin.No", dataKey: "admissionNumber" },
      { header: "Student Name", dataKey: "studentName" },
      { header: "Std", dataKey: "standard" },
      { header: "Sec", dataKey: "section" },
      { header: "Description", dataKey: "description" },
      { header: "Conce. Amount", dataKey: "concessionAmount" },
    ]

    const tableData = concessionData.map((item) => [
      item.billNumber,
      item.billDate.toLocaleDateString(),
      item.admissionNumber,
      item.studentName,
      item.standard,
      item.section,
      item.description,
      { content: item.concessionAmount.toFixed(2), styles: { halign: "right" } },
    ])

    // Add total row
    tableData.push([
      { content: "Total Amount:", colSpan: 7, styles: { halign: "right", fontStyle: "bold" } },
      { content: totalConcession.toFixed(2), styles: { halign: "right", fontStyle: "bold", textColor: [255, 0, 0] } },
    ])

    doc.autoTable({
      head: [columns.map((col) => col.header)],
      body: tableData,
      startY: margin + 50,
      margin: { top: margin, right: margin, bottom: margin, left: margin },
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 }, // Bill No
        1: { cellWidth: 20 }, // Bill Date
        2: { cellWidth: 20 }, // Admin.No
        3: { cellWidth: 40 }, // Student Name
        4: { cellWidth: 15 }, // Std
        5: { cellWidth: 15 }, // Sec
        6: { cellWidth: 25 }, // Description
        7: { cellWidth: 25, halign: "right" }, // Conce. Amount
      },
      headStyles: {
        fillColor: [11, 61, 123],
        textColor: [255, 255, 255],
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
      },
      didDrawCell: (data) => {
        // Add black border to cells
        if (data.section === "head" || data.section === "body") {
          doc.setDrawColor(0, 0, 0)
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "S")
        }
      },
    })

    return doc
  }

  const downloadPDF = () => {
    const doc = generatePDF()
    doc.save("concession_list.pdf")
  }

  const handleReset = () => {
    setStartDate(new Date())
    setEndDate(new Date())
    setConcessionData([])
    setTotalConcession(0)
  }

  const renderTableBody = () => {
    if (concessionData.length === 0) {
      return (
        <tr>
          <td colSpan="8" className="text-center">
            No concession data available for the selected date range.
          </td>
        </tr>
      )
    }

    return concessionData.map((item, index) => (
      <tr key={index}>
        <td>{item.billNumber}</td>
        <td>{item.billDate.toLocaleDateString()}</td>
        <td>{item.admissionNumber}</td>
        <td>{item.studentName}</td>
        <td className="text-center">{item.standard}</td>
        <td className="text-center">{item.section}</td>
        <td>{item.description}</td>
        <td className="text-end">{item.concessionAmount.toFixed(2)}</td>
      </tr>
    ))
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div>Collection Report</div>
            <span className="separator mx-2">&gt;</span>
            <span>Concession List</span>
          </nav>
        </div>

        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white py-3">
            <h2 className="mb-0">Concession List</h2>
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
                  <Button className="custom-btn-clr w-100" onClick={fetchConcessionDetails} disabled={loading}>
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
                <h4 className="report-title">CONCESSION LIST</h4>
                <div className="d-flex justify-content-between mt-3">
                  <p>
                    Report as on: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </p>
                  <p>Page 1 of 1</p>
                </div>
              </div>

              <div className="table-responsive">
                <Table bordered hover className="report-table">
                  <thead>
                    <tr>
                      <th>Bill No</th>
                      <th>Bill Date</th>
                      <th>Admin.No</th>
                      <th>Student Name</th>
                      <th>Std</th>
                      <th>Sec</th>
                      <th>Description</th>
                      <th className="text-end">Conce. Amount</th>
                    </tr>
                  </thead>
                  <tbody>{renderTableBody()}</tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="7" className="text-end fw-bold">
                        Total Amount:
                      </td>
                      <td className="text-end fw-bold text-danger">{totalConcession.toFixed(2)}</td>
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
          position: relative;
          display: inline-block;
        }

        .report-title:after {
          content: '';
          position: absolute;
          left: -20px;
          right: -20px;
          bottom: -2px;
          height: 1px;
          background-color: #000;
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
        
        .total-row td {
          border-top: 2px solid #000;
        }

        .text-danger {
          color: #ff0000 !important;
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

export default ConcessionAC

