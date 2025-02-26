"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Table, Button, Form, Row, Col } from "react-bootstrap"
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

const RouteWiseReport = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState("")
  const [busRoutes, setBusRoutes] = useState([])
  const [transportId, setTransportId] = useState(null)

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const adminSnapshot = await getDocs(adminRef)
        if (!adminSnapshot.empty) {
          setAdministrationId(adminSnapshot.docs[0].id)
        } else {
          console.error("No administration document found")
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
    const fetchTransportId = async () => {
      try {
        const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
        const transportSnapshot = await getDocs(transportRef)
        if (!transportSnapshot.empty) {
          setTransportId(transportSnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching Transport ID:", error)
        toast.error("Failed to fetch transport data")
      }
    }

    if (auth.currentUser) {
      fetchTransportId()
    }
  }, [])

  useEffect(() => {
    if (administrationId && transportId) {
      fetchBusRoutes()
      fetchAllStudents()
    }
  }, [administrationId, transportId])

  const filterStudents = useCallback(() => {
    if (selectedRoute) {
      const filtered = students.filter((student) => student.busRouteNumber === selectedRoute)
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents([])
    }
  }, [selectedRoute, students])

  useEffect(() => {
    filterStudents()
  }, [filterStudents])

  useEffect(() => {
    if (!selectedRoute) {
      toast.info("Please select a route number to view the report", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }, [selectedRoute])

  const fetchBusRoutes = async () => {
    try {
      const routeSetupRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "RouteSetup")
      const snapshot = await getDocs(routeSetupRef)
      const routesData = snapshot.docs.map((doc) => doc.data().route)
      setBusRoutes(routesData)
    } catch (error) {
      console.error("Error fetching bus routes:", error)
      toast.error("Failed to fetch bus routes")
    }
  }

  const fetchAllStudents = async () => {
    setLoading(true)
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
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch student data")
    } finally {
      setLoading(false)
    }
  }

  const handleRouteChange = (e) => {
    const route = e.target.value
    setSelectedRoute(route)
  }

  const getPrimaryAddress = (student) => {
    const addressParts = [student.streetVillage, student.placePincode, student.state, student.district].filter(Boolean)
    return addressParts.join(", ")
  }

  const exportToExcel = () => {
    const exportData = filteredStudents.map((student, index) => ({
      "S.No": index + 1,
      "Reg No": student.admissionNumber || "",
      Name: student.studentName || "",
      Sec: student.section || "",
      Std: student.standard || "",
      "Route No": student.busRouteNumber || "",
      Point: student.boardingPoint || "",
      Add1: getPrimaryAddress(student),
      Add2: student.communicationAddress || "",
      Phone: student.phoneNumber || "",
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Route Wise Report")
    XLSX.writeFile(wb, `Route_${selectedRoute}_Report.xlsx`)
    toast.success("Excel report generated successfully")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 255)
    doc.text("ROUTE WISE REPORT", doc.internal.pageSize.width / 2, 15, { align: "center" })

    // Date and Route
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    doc.text(`Report date on : ${today}`, 15, 25)
    doc.text(`Route Number : ${selectedRoute}`, doc.internal.pageSize.width / 2, 25, { align: "center" })
    doc.text(`Page 1 of ${Math.ceil(filteredStudents.length / 25)}`, doc.internal.pageSize.width - 15, 25, {
      align: "right",
    })

    const tableColumn = ["S.No", "Reg No", "Name", "Sec", "Std", "Route No", "Point", "Add1", "Add2", "Phone"]

    const tableRows = filteredStudents.map((student, index) => [
      index + 1,
      student.admissionNumber || "",
      student.studentName || "",
      student.section || "",
      student.standard || "",
      student.busRouteNumber || "",
      student.boardingPoint || "",
      getPrimaryAddress(student),
      student.communicationAddress || "",
      student.phoneNumber || "",
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
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
        0: { cellWidth: 15 }, // S.No
        1: { cellWidth: 25 }, // Reg No
        2: { cellWidth: 30 }, // Name
        3: { cellWidth: 15 }, // Sec
        4: { cellWidth: 15 }, // Std
        5: { cellWidth: 20 }, // Route No
        6: { cellWidth: 25 }, // Point
        7: { cellWidth: 35 }, // Add1
        8: { cellWidth: 35 }, // Add2
        9: { cellWidth: 25 }, // Phone
      },
    })

    doc.save(`Route_${selectedRoute}_Report.pdf`)
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
            <span>Route Wise Report</span>
          </nav>
        </div>

        {/* Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Route Wise Report</h2>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-light"
              onClick={exportToExcel}
              disabled={!selectedRoute || filteredStudents.length === 0}
            >
              <FileSpreadsheet className="me-2" size={18} />
              Export Excel
            </Button>
            <Button
              variant="outline-light"
              onClick={exportToPDF}
              disabled={!selectedRoute || filteredStudents.length === 0}
            >
              <FilePdf className="me-2" size={18} />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Route Selection */}
        <div className="bg-white p-4 border-bottom">
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Route Number :</Form.Label>
                <Form.Select value={selectedRoute} onChange={handleRouteChange} className="form-select-lg">
                  <option value="">Select Route Number</option>
                  {busRoutes.map((route, index) => (
                    <option key={index} value={route}>
                      {route}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="bg-white p-4 rounded-bottom">
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">S.No</th>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Sec</th>
                  <th>Std</th>
                  <th>Route No</th>
                  <th>Point</th>
                  <th>Add1</th>
                  <th>Add2</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">
                      No students found for selected route
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{student.admissionNumber}</td>
                      <td>{student.studentName}</td>
                      <td>{student.section}</td>
                      <td>{student.standard}</td>
                      <td>{student.busRouteNumber}</td>
                      <td>{student.boardingPoint}</td>
                      <td>{getPrimaryAddress(student)}</td>
                      <td>{student.communicationAddress}</td>
                      <td>{student.phoneNumber}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
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

          .form-select-lg {
            height: 45px;
            font-size: 1rem;
          }

          .table thead th {
            background-color: #0B3D7B;
            color: white;
            font-weight: 500;
            border: 1px solid #dee2e6;
          }

          .table tbody td {
            vertical-align: middle;
            font-size: 0.9rem;
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
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default RouteWiseReport

