"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { db, auth } from "../../../Firebase/config"
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  addDoc,
} from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { FileText, FileSpreadsheet } from 'lucide-react'

const TypeWise = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const [studentType, setStudentType] = useState("New")
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const today = new Date()
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`
    setCurrentDate(formattedDate)
    
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
  }, [])

  const fetchStudents = useCallback(async () => {
    if (!administrationId) return

    setLoading(true)
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup"
      )
      
      const q = query(admissionsRef, where("studentType", "==", studentType))
      const querySnapshot = await getDocs(q)
      
      const studentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setStudents(studentData)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch student data. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [administrationId, studentType])

  useEffect(() => {
    if (administrationId) {
      fetchStudents()
    }
  }, [administrationId, fetchStudents])

  const handleTypeChange = (e) => {
    setStudentType(e.target.value)
    fetchStudents()
  }

  const formatAddress = (student) => {
    const addressParts = []
    
    if (student.streetVillage) addressParts.push(student.streetVillage)
    if (student.placePincode) addressParts.push(student.placePincode)
    if (student.district) addressParts.push(student.district)
    if (student.state) addressParts.push(student.state)
    if (student.communicationAddress) addressParts.push(student.communicationAddress)
    
    return addressParts.join(", ")
  }

  const handlePrint = () => {
    window.print()
  }

  const handlePDFDownload = () => {
    const doc = new jsPDF()
    doc.text(`${studentType} Students Report`, 14, 15)
    doc.text(`Date: ${currentDate}`, 14, 25)

    const tableColumn = ["S.No", "Stud Name", "Address", "Phone"]
    const tableRows = students.map((student, index) => [
      index + 1,
      student.studentName || "-",
      formatAddress(student) || "-",
      student.phoneNumber || "-"
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
    })

    doc.text(`Total ${studentType} Students: ${students.length}`, 14, doc.lastAutoTable.finalY + 10)
    doc.save(`${studentType}_students_report.pdf`)
  }

  const handleExcelDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(students.map((student, index) => ({
      "S.No": index + 1,
      "Stud Name": student.studentName || "-",
      "Address": formatAddress(student) || "-",
      "Phone": student.phoneNumber || "-"
    })))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students")
    XLSX.writeFile(workbook, `${studentType}_students_report.xlsx`)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2"></span>
            <Link to="/admission">Admission</Link>
            <span className="separator mx-2"></span>
            <span>Type Wise Report</span>
          </nav>
        </div>

        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center"
        >
          <div className="d-flex align-items-center mb-3 mb-md-0">
            <h2 className="mb-0">Student Type Wise Report</h2>
          </div>
          <div className="d-flex flex-column flex-md-row">
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handlePDFDownload}
              className="d-print-none me-md-2 mb-2 mb-md-0"
            >
              <FileText size={18} className="me-1" />
             Download PDF
            </Button>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handleExcelDownload}
              className="d-print-none me-md-2 mb-2 mb-md-0"
            >
              <FileSpreadsheet size={18} className="me-1" />
             Download Excel
            </Button>
            <Button 
              variant="outline-light" 
              size="sm" 
              onClick={handlePrint}
              className="d-print-none"
            >
              Print Report
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <div className="d-print-none mb-4">
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Select Student Type</Form.Label>
                  <Form.Select
                    value={studentType}
                    onChange={handleTypeChange}
                    className="form-control-blue"
                  >
                    <option value="New">New</option>
                    <option value="Existing">Existing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="report-header d-flex justify-content-between align-items-center mb-3">
            <h3 className="report-title">Type: {studentType}</h3>
            <div className="report-date">{currentDate}</div>
          </div>

          <div className="table-responsive">
            <Table bordered hover className="student-table">
              <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                <tr>
                  <th width="5%">S.No</th>
                  <th width="25%">Stud Name</th>
                  <th width="50%">Address</th>
                  <th width="20%">Phone</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">Loading...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">No {studentType} students found</td>
                  </tr>
                ) : (
                  students.map((student, index) => (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>{student.studentName || "-"}</td>
                      <td>{formatAddress(student) || "-"}</td>
                      <td>{student.phoneNumber || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="report-footer mt-4 text-center">
            <p>Total {studentType} Students: {students.length}</p>
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

          .form-control-blue {
            background-color: #F0F4FF !important;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            padding: 0.5rem;
          }

          .form-control-blue:focus {
            border-color: #0B3D7B;
            box-shadow: 0 0 0 0.2rem rgba(11, 61, 123, 0.25);
          }

          .report-title {
            color: #0B3D7B;
            font-size: 1.2rem;
            font-weight: 600;
          }

          .report-date {
            font-weight: 500;
            color: #555;
          }

          .student-table th {
            vertical-align: middle;
            font-weight: 600;
          }

          .student-table td {
            vertical-align: middle;
          }

          .report-footer {
            font-weight: 500;
            color: #0B3D7B;
          }

          @media (max-width: 767px) {
            .d-flex.flex-column.flex-md-row {
              width: 100%;
            }
          }

          @media print {
            .d-print-none {
              display: none !important;
            }
            
            body {
              font-size: 12pt;
            }
            
            .container-fluid {
              width: 100%;
              padding: 0;
            }
            
            .student-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .student-table th {
              background-color: #0B3D7B !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default TypeWise
