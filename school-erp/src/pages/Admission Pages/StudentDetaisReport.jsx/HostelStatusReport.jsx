import React, { useState, useEffect } from "react"
import { Container, Table, Button } from "react-bootstrap"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { FileText, FileSpreadsheet } from "lucide-react"

const HostelStatusReport = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const adminSnapshot = await getDocs(adminRef)
        if (!adminSnapshot.empty) {
          setAdministrationId(adminSnapshot.docs[0].id)
        } else {
          toast.error("Failed to fetch administration data")
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
      fetchHostelStudents()
    }
  }, [administrationId])

  const fetchHostelStudents = async () => {
    try {
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const snapshot = await getDocs(studentsRef)
      const hostelStudents = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((student) => student.hostelFee !== undefined && student.hostelFee !== null)

      setStudents(hostelStudents)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching hostel students:", error)
      toast.error("Failed to fetch hostel student data")
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.setTextColor(11, 61, 123)
    doc.text("HOSTEL STATUS REPORT", doc.internal.pageSize.width / 2, 15, { align: "center" })

    let yPos = 35

    // Table headers
    const tableColumn = ["S.No", "Name", "Lunch/Refresh", "Gender", "Standard"]

    // Table rows
    const tableRows = students.map((student, index) => [
      index + 1,
      student.studentName,
      student.lunchRefresh || "N/A",
      student.gender || "N/A",
      student.standard || "N/A",
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
        1: { cellWidth: 30 }, // Name
        2: { cellWidth: 30 }, // Lunch/Refresh
        3: { cellWidth: 20 }, // Gender
        4: { cellWidth: 20 }, // Standard
      },
    })

    doc.save("HostelStatusReport.pdf")
    toast.success("PDF report generated successfully")
  }

  const exportToExcel = () => {
    const exportData = students.map((student, index) => ({
      "S.No": index + 1,
      Name: student.studentName,
      "Lunch/Refresh": student.lunchRefresh || "N/A",
      Gender: student.gender || "N/A",
      Standard: student.standard || "N/A",
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "HostelStatusReport")

    // Set column widths
    const colWidths = [
      { wch: 6 }, // S.No
      { wch: 30 }, // Name
      { wch: 20 }, // Lunch/Refresh
      { wch: 15 }, // Gender
      { wch: 15 }, // Standard
    ]
    ws["!cols"] = colWidths

    XLSX.writeFile(wb, "HostelStatusReport.xlsx")
    toast.success("Excel report generated successfully")
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2"></span>
            <Link to="/reports">Reports</Link>
            <span className="separator mx-2"></span>
            <span>Hostel Status Report</span>
          </nav>
        </div>

        {/* Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Hostel Status Report</h2>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-light" onClick={exportToPDF}>
              <FileText className="me-2" size={18} />
              Export PDF
            </Button>
            <Button variant="outline-light" onClick={exportToExcel}>
              <FileSpreadsheet className="me-2" size={18} />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-bottom">
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-4">No hostel students found</div>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th className="text-center" style={{ width: "60px" }}>
                      S.No
                    </th>
                    <th>Name</th>
                    <th>Lunch/Refresh</th>
                    <th>Gender</th>
                    <th>Standard</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{student.studentName}</td>
                      <td>{student.lunchRefresh || "N/A"}</td>
                      <td>{student.gender || "N/A"}</td>
                      <td>{student.standard || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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

export default HostelStatusReport