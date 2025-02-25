"use client"

import { useState, useEffect } from "react"
import { Container, Table, Button } from "react-bootstrap"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { FileSpreadsheet, FileIcon as FilePdf } from "lucide-react"

const StageWiseReport = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)
  const [groupedStudents, setGroupedStudents] = useState({})

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const adminSnapshot = await getDocs(adminRef)
        if (!adminSnapshot.empty) {
          setAdministrationId(adminSnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching Administration ID:", error)
        toast.error("Failed to fetch administration data")
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchStudents()
    }
  }, [administrationId])

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(studentsRef, orderBy("admissionNumber"))
      const snapshot = await getDocs(q)
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStudents(studentsData)
      groupStudentsByPoint(studentsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch student data")
      setLoading(false)
    }
  }

  const groupStudentsByPoint = (studentsData) => {
    const grouped = studentsData.reduce((acc, student) => {
      const point = student.boardingPoint || "Unassigned"
      if (!acc[point]) {
        acc[point] = []
      }
      acc[point].push(student)
      return acc
    }, {})
    setGroupedStudents(grouped)
  }

  const getFormattedAddress = (student) => {
    const parts = [student.streetVillage, student.placePincode, student.state, student.district].filter(Boolean)
    return parts.join(", ")
  }

  const exportToExcel = () => {
    const exportData = []
    let overallSerialNumber = 1

    Object.entries(groupedStudents).forEach(([point, students]) => {
      // Add a row for the point name
      exportData.push({
        "S.No": "",
        RegNo: "",
        Name: point.toUpperCase(),
        Sec: "",
        Std: "",
        Point: "",
        Add1: "",
        Phone: "",
      })

      // Add student rows
      students.forEach((student, index) => {
        exportData.push({
          "S.No": overallSerialNumber++,
          RegNo: student.admissionNumber,
          Name: student.studentName,
          Sec: student.section,
          Std: student.standard,
          Point: student.boardingPoint,
          Add1: getFormattedAddress(student),
          Phone: student.phoneNumber,
        })
      })

      // Add an empty row after each group
      exportData.push({
        "S.No": "",
        RegNo: "",
        Name: "",
        Sec: "",
        Std: "",
        Point: "",
        Add1: "",
        Phone: "",
      })
    })

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Place Wise Report")

    // Set column widths
    const colWidths = [
      { wch: 6 }, // S.No
      { wch: 10 }, // RegNo
      { wch: 25 }, // Name
      { wch: 8 }, // Sec
      { wch: 8 }, // Std
      { wch: 15 }, // Point
      { wch: 40 }, // Add1
      { wch: 15 }, // Phone
    ]
    ws["!cols"] = colWidths

    XLSX.writeFile(wb, "PlaceWiseReport.xlsx")
    toast.success("Excel report generated successfully")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.setTextColor(11, 61, 123)
    doc.text("PLACE WISE REPORT", doc.internal.pageSize.width / 2, 15, { align: "center" })

    let yPos = 35
    let pageNumber = 1
    let overallSerialNumber = 1

    Object.entries(groupedStudents).forEach(([point, students]) => {
      // Add header for new page if needed
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage()
        yPos = 35
        pageNumber++
      }

      // Point name
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text(point.toUpperCase(), 15, yPos)
      yPos += 10

      const tableColumn = ["S.No", "RegNo", "Name", "Sec", "Std", "Point", "Add1", "Phone"]

      const tableRows = students.map((student) => [
        overallSerialNumber++,
        student.admissionNumber,
        student.studentName,
        student.section,
        student.standard,
        student.boardingPoint,
        getFormattedAddress(student),
        student.phoneNumber,
      ])

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 1,
          overflow: "linebreak",
          halign: "left",
        },
        headStyles: {
          fillColor: [11, 61, 123],
          textColor: 255,
          fontSize: 8,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 }, // S.No
          1: { cellWidth: 20 }, // RegNo
          2: { cellWidth: 30 }, // Name
          3: { cellWidth: 15 }, // Sec
          4: { cellWidth: 15 }, // Std
          5: { cellWidth: 25 }, // Point
          6: { cellWidth: 50 }, // Add1
          7: { cellWidth: 25 }, // Phone
        },
      })

      yPos = doc.lastAutoTable.finalY + 15
    })

    doc.save("PlaceWiseReport.pdf")
    toast.success("PDF report generated successfully")
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/reports">Reports</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Place Wise Report</span>
          </nav>
        </div>

        {/* Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Place Wise Report</h2>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-light" onClick={exportToExcel}>
              <FileSpreadsheet className="me-2" size={18} />
              Export Excel
            </Button>
            <Button variant="outline-light" onClick={exportToPDF}>
              <FilePdf className="me-2" size={18} />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-bottom">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : Object.entries(groupedStudents).length === 0 ? (
              <div className="text-center py-4">No students found</div>
            ) : (
              <>
                {Object.entries(groupedStudents).map(([point, students], groupIndex) => (
                  <div key={point} className="mb-4">
                    <h3 className="border-bottom pb-2 text-primary">{point}</h3>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th className="text-center" style={{ width: "60px" }}>
                            S.No
                          </th>
                          <th>RegNo</th>
                          <th>Name</th>
                          <th>Sec</th>
                          <th>Std</th>
                          <th>Point</th>
                          <th>Add1</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={student.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>{student.admissionNumber}</td>
                            <td>{student.studentName}</td>
                            <td>{student.section}</td>
                            <td>{student.standard}</td>
                            <td>{student.boardingPoint}</td>
                            <td>{getFormattedAddress(student)}</td>
                            <td>{student.phoneNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </>
            )}
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

          .table thead th {
            background-color: #0B3D7B;
            color: white;
            font-weight: 500;
            border: 1px solid #dee2e6;
            vertical-align: middle;
          }

          .table tbody td {
            vertical-align: middle;
          }

          .table-responsive {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          @media (max-width: 768px) {
            .table-responsive {
              max-height: 500px;
            }
          }

          .text-primary {
            color: #0B3D7B !important;
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default StageWiseReport

