"use client"

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Container, Spinner, Table, Card, Row, Col } from "react-bootstrap"
import { db, auth } from "../../../Firebase/config"
import { collection, getDocs, query, where, doc, getDoc, limit } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import "jspdf-autotable"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FaPrint, FaFilePdf, FaUndo, FaSearch } from "react-icons/fa"

const PeriodicalCollectionReport = () => {
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
        await fetchPeriodicalCollection(adminId)
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
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    }, {})

    const processedData = []
    let grandTotal = 0

    Object.entries(groupedData).forEach(([date, items]) => {
      processedData.push({ type: "date", date })

      const admissionGroups = items.reduce((acc, item) => {
        const admissionNumber = item.admissionNumber
        if (!acc[admissionNumber]) {
          acc[admissionNumber] = []
        }
        acc[admissionNumber].push(item)
        return acc
      }, {})

      Object.entries(admissionGroups).forEach(([admissionNumber, admissionItems]) => {
        let studentTotal = 0

        admissionItems.forEach((item, index) => {
          processedData.push({
            ...item,
            isFirstInGroup: index === 0,
            isLastInGroup: index === admissionItems.length - 1,
            rowSpan: admissionItems.length,
          })
          studentTotal += Number(item.amount) || 0
        })

        processedData.push({
          type: "subtotal",
          admissionNumber,
          amount: studentTotal,
        })

        grandTotal += studentTotal
      })
    })

    return { processedData, grandTotal }
  }

  const fetchPeriodicalCollection = async (adminId = administrationId) => {
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
          billNumber: data.billNumber,
          admissionNumber: data.admissionNumber,
          studentName: data.studentName,
          standard: data.standard,
          section: data.section,
          description: data.feePayments?.map((fee) => fee.feeHead).join(", ") || "",
          amount: Number.parseFloat(data.totalPaidAmount) || 0,
          concession: Number.parseFloat(data.totalConcessionAmount) || 0,
          billDate: data.billDate,
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

    doc.setFontSize(16)
    doc.text(schoolInfo.name, 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(schoolInfo.address, 105, 30, { align: "center" })
    doc.setFontSize(14)
    doc.text("PERIODICAL FEES COLLECTION REPORT", 105, 45, { align: "center" })
    doc.setFontSize(10)
    doc.text(`Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 55)
    doc.text(`Page 1 of 1`, 180, 55)

    const columns = [
      { header: "Date", dataKey: "date" },
      { header: "Bill No", dataKey: "billNumber" },
      { header: "Adm No", dataKey: "admissionNumber" },
      { header: "Name of the Student", dataKey: "studentName" },
      { header: "Std", dataKey: "standard" },
      { header: "Sec", dataKey: "section" },
      { header: "Description", dataKey: "description" },
      { header: "Amount", dataKey: "amount" },
    ]

    const tableData = []
    let currentDate = null

    collectionData.forEach((item) => {
      if (item.type === "date") {
        currentDate = item.date
        tableData.push({
          date: { content: item.date, colSpan: 8, styles: { fontStyle: "bold", fillColor: [220, 220, 220] } },
        })
      } else if (item.type === "subtotal") {
        tableData.push({
          date: "",
          billNumber: "",
          admissionNumber: "",
          studentName: "",
          standard: "",
          section: "",
          description: "",
          amount: { content: item.amount.toFixed(2), styles: { fontStyle: "bold", textColor: [0, 0, 0] } },
        })
      } else {
        const row = {
          date: "",
          billNumber: item.billNumber,
          admissionNumber: item.isFirstInGroup ? { content: item.admissionNumber, rowSpan: item.rowSpan } : "",
          studentName: item.isFirstInGroup ? { content: item.studentName, rowSpan: item.rowSpan } : "",
          standard: item.isFirstInGroup ? { content: item.standard, rowSpan: item.rowSpan } : "",
          section: item.isFirstInGroup ? { content: item.section, rowSpan: item.rowSpan } : "",
          description: item.description,
          amount: item.amount.toFixed(2),
        }
        tableData.push(row)

        if (item.concession > 0) {
          tableData.push({
            date: "",
            billNumber: "",
            admissionNumber: "",
            studentName: "",
            standard: "",
            section: "",
            description: "Concession",
            amount: { content: `-${item.concession.toFixed(2)}`, styles: { textColor: [220, 53, 69] } },
          })
        }
      }
    })

    doc.autoTable({
      columns: columns,
      body: tableData,
      startY: 65,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        admissionNumber: { halign: "center", valign: "middle" },
        studentName: { halign: "center", valign: "middle" },
        standard: { halign: "center", valign: "middle" },
        section: { halign: "center", valign: "middle" },
        amount: { halign: "right" },
      },
      headStyles: { fillColor: [11, 61, 123], textColor: [255, 255, 255] },
      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.column.dataKey === "amount" &&
          data.cell.raw &&
          typeof data.cell.raw === "object"
        ) {
          data.cell.styles.fontStyle = data.cell.raw.styles.fontStyle || "normal"
          data.cell.styles.textColor = data.cell.raw.styles.textColor || [0, 0, 0]
          data.cell.text = data.cell.raw.content
        }
      },
    })

    const finalY = doc.lastAutoTable.finalY || 65
    doc.setFontSize(10)
    doc.setFont(undefined, "bold")
    doc.text(`Total Fee: ${totalCollection.toFixed(2)}`, 170, finalY + 10, { align: "right" })

    return doc
  }

  const downloadPDF = () => {
    const doc = generatePDF()
    doc.save("periodical_collection_report.pdf")
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
          <td colSpan="8" className="text-center">
            No collection data available for the selected date range.
          </td>
        </tr>
      )
    }

    return collectionData.map((item, index) => {
      if (item.type === "date") {
        return (
          <tr key={`date-${index}`} className="date-row">
            <td colSpan="8" className="fw-bold bg-light">
              {item.date}
            </td>
          </tr>
        )
      }

      if (item.type === "subtotal") {
        return (
          <tr key={`subtotal-${item.admissionNumber}`} className="subtotal-row">
            <td colSpan="7"></td>
            <td className="text-end fw-bold dotted-underline">{item.amount.toFixed(2)}</td>
          </tr>
        )
      }

      return (
        <tr key={index}>
          <td></td>
          <td>{item.billNumber}</td>
          {item.isFirstInGroup ? (
            <>
              <td rowSpan={item.rowSpan} className="align-middle text-center">
                {item.admissionNumber}
              </td>
              <td rowSpan={item.rowSpan} className="align-middle text-center">
                {item.studentName}
              </td>
              <td rowSpan={item.rowSpan} className="align-middle text-center">
                {item.standard}
              </td>
              <td rowSpan={item.rowSpan} className="align-middle text-center">
                {item.section}
              </td>
            </>
          ) : null}
          <td>{item.description}</td>
          <td className="text-end">
            {item.amount.toFixed(2)}
            {item.concession > 0 && (
              <>
                <br />
                <span className="text-danger">-{item.concession.toFixed(2)}</span>
              </>
            )}
          </td>
        </tr>
      )
    })
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
            <span>Periodical Collection Report</span>
          </nav>
        </div>

        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white py-3">
            <h2 className="mb-0">Periodical Collection Report</h2>
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
                  <Button
                    className="custom-btn-clr w-100"
                    onClick={() => fetchPeriodicalCollection()}
                    disabled={loading}
                  >
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
                <h4 className="report-title">PERIODICAL FEES COLLECTION REPORT</h4>
                <div className="d-flex justify-content-between mt-3">
                  <p>
                    Report Period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </p>
                  <p>Page 1 of 1</p>
                </div>
              </div>

              <div className="table-responsive">
                <Table bordered hover className="report-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Bill No</th>
                      <th>Adm No</th>
                      <th>Name of the Student</th>
                      <th>Std</th>
                      <th>Sec</th>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>{renderTableBody()}</tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="7" className="text-end fw-bold">
                        Total Fee
                      </td>
                      <td className="text-end fw-bold double-underline">{totalCollection.toFixed(2)}</td>
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
        
        .concession-row td {
          background-color: #f8f9fa;
        }
        
        .subtotal-row td {
          border-top: 1px dashed #dee2e6;
        }
        
        .total-row td {
          border-top: 2px solid #000;
        }

        .dotted-underline {
          border-bottom: 1px dotted #000;
          padding-bottom: 4px;
        }

        .double-underline {
          border-bottom: 3px double #000;
          padding-bottom: 4px;
        }

        .text-danger {
          color: #dc3545;
        }

        /* Group spacing */
        tr + tr:not(.subtotal-row) td:empty {
          border-top: none;
        }

        .subtotal-row td {
          border-top: none;
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

export default PeriodicalCollectionReport

