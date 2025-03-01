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

const ReligionWiseReport = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)
  const [selectedReligion, setSelectedReligion] = useState("")
  const [religions, setReligions] = useState([])

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
    if (administrationId) {
      fetchReligions()
      fetchAllStudents()
    }
  }, [administrationId])

  const filterStudents = useCallback(() => {
    if (selectedReligion) {
      const filtered = students.filter((student) => student.religion === selectedReligion)
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents([])
    }
  }, [selectedReligion, students])

  useEffect(() => {
    filterStudents()
  }, [filterStudents])

  useEffect(() => {
    if (!selectedReligion) {
      toast.info("Please select a religion to view the report", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }, [selectedReligion])

  const fetchReligions = async () => {
    try {
      const religionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ReligionSetup",
      )
      const snapshot = await getDocs(religionsRef)
      const religionsData = snapshot.docs.map((doc) => doc.data().religion)
      setReligions(religionsData)
    } catch (error) {
      console.error("Error fetching religions:", error)
      toast.error("Failed to fetch religions")
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

  const handleReligionChange = (e) => {
    const religion = e.target.value
    setSelectedReligion(religion)
  }

  const getFormattedAddress = (student) => {
    return `${student.streetVillage || ""}, ${student.placePincode || ""}`
  }

  const exportToExcel = () => {
    const exportData = filteredStudents.map((student, index) => ({
      "S.No": index + 1,
      Name: student.studentName || "",
      "Admi.No.": student.admissionNumber || "",
      "Comm.Address": getFormattedAddress(student),
      Cmty: `${student.community || ""} ${selectedReligion}`,
      Std: student.standard || "",
      Sec: student.section || "",
      Gender: student.gender || "",
      Caste: student.caste || "Nil",
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Religion Wise Report")
    XLSX.writeFile(wb, `${selectedReligion}_Wise_Report.xlsx`)
    toast.success("Excel report generated successfully")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 255)
    doc.text("RELIGION WISE REPORT", doc.internal.pageSize.width / 2, 15, { align: "center" })

    // Date and Religion
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })
    doc.text(today, 15, 25)
    doc.text(`Religion : ${selectedReligion}`, doc.internal.pageSize.width / 2, 25, { align: "center" })
    doc.text(`Page 1 of ${Math.ceil(filteredStudents.length / 25)}`, doc.internal.pageSize.width - 15, 25, {
      align: "right",
    })

    const tableColumn = ["Name", "Admi.No.", "Comm.Address", "Cmty", "Std", "Sec", "Gender", "Caste"]

    const tableRows = filteredStudents.map((student, index) => [
      student.studentName || "",
      student.admissionNumber || "",
      getFormattedAddress(student),
      `${student.community || ""} ${selectedReligion}`,
      student.standard || "",
      student.section || "",
      student.gender || "",
      student.caste || "Nil",
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
    })

    doc.save(`${selectedReligion}_Wise_Report.pdf`)
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
            {/* <Link to="/reports">Reports</Link> */}
            <span>Reports</span>
            <span className="separator mx-2">&gt;</span>
            <span>Religion Wise Report</span>
          </nav>
        </div>

        {/* Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Religion Wise Report</h2>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-light"
              onClick={exportToExcel}
              disabled={!selectedReligion || filteredStudents.length === 0}
            >
              <FileSpreadsheet className="me-2" size={18} />
              Export Excel
            </Button>
            <Button
              variant="outline-light"
              onClick={exportToPDF}
              disabled={!selectedReligion || filteredStudents.length === 0}
            >
              <FilePdf className="me-2" size={18} />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Religion Selection */}
        <div className="bg-white p-4 border-bottom">
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Religion :</Form.Label>
                <Form.Select value={selectedReligion} onChange={handleReligionChange} className="form-select-lg">
                  <option value="">Select Religion</option>
                  {religions.map((religion, index) => (
                    <option key={index} value={religion}>
                      {religion}
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
                  <th>Name</th>
                  <th>Admi.No.</th>
                  <th>Comm.Address</th>
                  <th>Cmty</th>
                  <th>Std</th>
                  <th>Sec</th>
                  <th>Gender</th>
                  <th>Caste</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No students found for selected religion
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={student.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{student.studentName}</td>
                      <td>{student.admissionNumber}</td>
                      <td>{getFormattedAddress(student)}</td>
                      <td>{`${student.community} ${selectedReligion}`}</td>
                      <td>{student.standard}</td>
                      <td>{student.section}</td>
                      <td>{student.gender}</td>
                      <td>{student.caste || "Nil"}</td>
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

export default ReligionWiseReport

