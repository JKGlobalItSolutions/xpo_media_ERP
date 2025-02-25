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
import 'jspdf-autotable'
import { FileSpreadsheet, FileIcon as FilePdf } from 'lucide-react'

const StudentRegisterReport = () => {
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
        "AdmissionSetup"
      )
      const q = query(studentsRef, orderBy("admissionNumber"))
      const snapshot = await getDocs(q)
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setStudents(studentsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch student data")
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    const exportData = students.map((student, index) => ({
      'S.No': index + 1,
      'Admn. No.': student.admissionNumber,
      'DOA': student.dateOfAdmission,
      'Student Name': student.studentName,
      'Sex': student.gender,
      'Father name': student.fatherName,
      'Add1': student.placePincode,
      'Place Name': student.streetVillage,
      'Phone No.': student.phoneNumber,
      'Bus. No.': student.busRouteNumber || 'Nil',
      'DOB': student.dateOfBirth
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Student Register")
    XLSX.writeFile(wb, "StudentRegister.xlsx")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    const tableColumn = [
      "S.No", "Admn. No.", "DOA", "Student Name", "Sex", 
      "Father name", "Add1", "Place Name", "Phone No.", "Bus. No.", "DOB"
    ]
    
    const tableRows = students.map((student, index) => [
      index + 1,
      student.admissionNumber,
      student.dateOfAdmission,
      student.studentName,
      student.gender,
      student.fatherName,
      student.placePincode,
      student.streetVillage,
      student.phoneNumber,
      student.busRouteNumber || 'Nil',
      student.dateOfBirth
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 1,
        overflow: 'linebreak',
        halign: 'center'
      },
      headStyles: {
        fillColor: [11, 61, 123],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      }
    })

    doc.save('StudentRegister.pdf')
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
            <span>Student Register Report</span>
          </nav>
        </div>

        {/* Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Student Register Report</h2>
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
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th className="text-center">S.No</th>
                  <th>Admn. No.</th>
                  <th>DOA</th>
                  <th>Student Name</th>
                  <th>Sex</th>
                  <th>Father name</th>
                  <th>Add1</th>
                  <th>Place Name</th>
                  <th>Phone No.</th>
                  <th>Bus. No.</th>
                  <th>DOB</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="text-center">{index + 1}</td>
                    <td>{student.admissionNumber}</td>
                    <td>{student.dateOfAdmission}</td>
                    <td>{student.studentName}</td>
                    <td>{student.gender}</td>
                    <td>{student.fatherName}</td>
                    <td>{student.placePincode}</td>
                    <td>{student.streetVillage}</td>
                    <td>{student.phoneNumber}</td>
                    <td>{student.busRouteNumber || 'Nil'}</td>
                    <td>{student.dateOfBirth}</td>
                  </tr>
                ))}
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

export default StudentRegisterReport