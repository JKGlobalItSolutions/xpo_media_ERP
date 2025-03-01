"use client"

import { useState, useEffect, useCallback } from "react"
import { Container, Row, Col, Card, Form, InputGroup, Dropdown } from "react-bootstrap"
import { Link } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Search, FileText, FileSpreadsheet } from "lucide-react"
import defaultStudentPhoto from "../../../images/StudentProfileIcon/studentProfile.jpeg"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

const FullView = () => {
  const [studentsData, setStudentsData] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [standardFilter, setStandardFilter] = useState("")
  const [sectionFilter, setSectionFilter] = useState("")
  const [standards, setStandards] = useState([])
  const [sections, setSections] = useState([])

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
      fetchStudentsData()
    }
  }, [administrationId])

  const filterStudents = useCallback(() => {
    let filtered = studentsData

    if (searchTerm) {
      filtered = filtered.filter((student) => student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (standardFilter) {
      filtered = filtered.filter((student) => student.standard === standardFilter)
    }

    if (sectionFilter) {
      filtered = filtered.filter((student) => student.section === sectionFilter)
    }

    setFilteredStudents(filtered)
  }, [studentsData, searchTerm, standardFilter, sectionFilter])

  useEffect(() => {
    filterStudents()
  }, [filterStudents])

  const fetchStudentsData = async () => {
    if (!administrationId) return

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
      const snapshot = await getDocs(studentsRef)
      const students = snapshot.docs.map((doc) => doc.data())
      const sortedStudents = students.sort((a, b) => {
        const aNum = Number.parseInt(a.admissionNumber.replace("ADM", ""))
        const bNum = Number.parseInt(b.admissionNumber.replace("ADM", ""))
        return aNum - bNum
      })
      setStudentsData(sortedStudents)
      setFilteredStudents(sortedStudents)

      // Extract unique standards and sections
      const uniqueStandards = [...new Set(sortedStudents.map((student) => student.standard))].sort()
      const uniqueSections = [...new Set(sortedStudents.map((student) => student.section))].sort()
      setStandards(uniqueStandards)
      setSections(uniqueSections)
    } catch (error) {
      console.error("Error fetching students data:", error)
      toast.error("Failed to fetch students data")
    } finally {
      setLoading(false)
    }
  }

  const renderStudentCards = () => {
    const cards = filteredStudents.map((student) => (
      <Col md={6} key={student.admissionNumber} className="mb-4">
        <Card className="student-card h-100">
          <Card.Header style={{ backgroundColor: "#0B3D7B" }} className="text-white py-2">
            <h5 className="mb-0">Student Details - {student.admissionNumber}</h5>
          </Card.Header>
          <Card.Body className="p-3">
            <Row className="g-0">
              <Col md={3} className="text-center mb-3 mb-md-0">
                <div className="photo-container">
                  <img src={student.studentPhoto || defaultStudentPhoto} alt="Student" className="student-photo" />
                </div>
              </Col>
              <Col md={9}>
                <Row className="g-0">
                  <Col md={6}>
                    <div className="details-grid left-column">
                      <div className="detail-item">
                        <strong>Adm.No:</strong> {student.admissionNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Examno:</strong> {student.examNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Student Name:</strong> {student.studentName}
                      </div>
                      <div className="detail-item">
                        <strong>Father Name:</strong> {student.fatherName}
                      </div>
                      <div className="detail-item">
                        <strong>Mother Name:</strong> {student.motherName}
                      </div>
                      <div className="detail-item">
                        <strong>Address:</strong> {student.streetVillage}, {student.placePincode}
                      </div>
                      <div className="detail-item">
                        <strong>District:</strong> {student.district}
                      </div>
                      <div className="detail-item">
                        <strong>State:</strong> {student.state}
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="details-grid right-column">
                      <div className="detail-item">
                        <strong>Sex:</strong> {student.gender}
                      </div>
                      <div className="detail-item">
                        <strong>Birth Date:</strong> {student.dateOfBirth}
                      </div>
                      <div className="detail-item">
                        <strong>Religion:</strong> {student.religion}
                      </div>
                      <div className="detail-item">
                        <strong>Nationality:</strong> {student.nationality}
                      </div>
                      <div className="detail-item">
                        <strong>Community:</strong> {student.community}
                      </div>
                      <div className="detail-item">
                        <strong>Caste:</strong> {student.caste}
                      </div>
                      <div className="detail-item">
                        <strong>Blood Group:</strong> {student.bloodGroup}
                      </div>
                      <div className="detail-item">
                        <strong>Ph/MobileNo:</strong> {student.phoneNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Standard:</strong> {student.standard}
                      </div>
                      <div className="detail-item">
                        <strong>Section:</strong> {student.section}
                      </div>
                      <div className="detail-item">
                        <strong>Parent Occupation:</strong>{" "}
                        {student.fatherOccupation || student.motherOccupation || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Entry Date:</strong> {student.dateOfAdmission}
                      </div>
                      <div className="detail-item">
                        <strong>Year:</strong> {student.year || "N/A"}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    ))

    const rows = []
    for (let i = 0; i < cards.length; i += 2) {
      rows.push(
        <Row key={i}>
          {cards[i]}
          {cards[i + 1]}
        </Row>,
      )
    }

    return rows
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    let yOffset = 10

    filteredStudents.forEach((student, index) => {
      if (index > 0) {
        doc.addPage()
        yOffset = 10
      }

      doc.setFontSize(16)
      doc.setTextColor(11, 61, 123)
      doc.text(`Student Details - ${student.admissionNumber}`, 10, yOffset)
      yOffset += 10

      doc.setFontSize(10)
      doc.setTextColor(0)

      const leftColumnData = [
        ["Adm.No:", student.admissionNumber],
        ["Examno:", student.examNumber],
        ["Student Name:", student.studentName],
        ["Father Name:", student.fatherName],
        ["Mother Name:", student.motherName],
        ["Address:", `${student.streetVillage}, ${student.placePincode}`],
        ["District:", student.district],
        ["State:", student.state],
      ]

      const rightColumnData = [
        ["Sex:", student.gender],
        ["Birth Date:", student.dateOfBirth],
        ["Religion:", student.religion],
        ["Nationality:", student.nationality],
        ["Community:", student.community],
        ["Caste:", student.caste],
        ["Blood Group:", student.bloodGroup],
        ["Ph/MobileNo:", student.phoneNumber],
        ["Standard:", student.standard],
        ["Section:", student.section],
        ["Parent Occupation:", student.fatherOccupation || student.motherOccupation || "N/A"],
        ["Entry Date:", student.dateOfAdmission],
        ["Year:", student.year || "N/A"],
      ]

      doc.autoTable({
        startY: yOffset,
        head: [],
        body: leftColumnData,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: { 0: { fontStyle: "bold" } },
      })

      doc.autoTable({
        startY: yOffset,
        head: [],
        body: rightColumnData,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 1 },
        columnStyles: { 0: { fontStyle: "bold" } },
        margin: { left: 100 },
      })
    })

    doc.save("student_details.pdf")
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStudents)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students")
    XLSX.writeFile(workbook, "student_details.xlsx")
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
            <span>Student Details</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="report-container">
          {/* Header with Search and Filters */}
          <Card className="mb-4">
            <Card.Header style={{ backgroundColor: "#0B3D7B" }} className="text-white py-3">
              <Row className="align-items-center">
                <Col>
                  <h2 className="mb-0">Student Details Report</h2>
                </Col>
                <Col md={8}>
                  <Row>
                    <Col md={3}>
                      <InputGroup>
                        <InputGroup.Text className="bg-white">
                          <Search size={18} />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Search by admission number..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                    </Col>
                    <Col md={3}>
                      <Form.Select value={standardFilter} onChange={(e) => setStandardFilter(e.target.value)}>
                        <option value="">All Standards</option>
                        {standards.map((standard) => (
                          <option key={standard} value={standard}>
                            {standard}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                        <option value="">All Sections</option>
                        {sections.map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-export">
                          Export
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={exportToPDF}>
                            <FileText className="me-2" size={18} />
                            Export to PDF
                          </Dropdown.Item>
                          <Dropdown.Item onClick={exportToExcel}>
                            <FileSpreadsheet className="me-2" size={18} />
                            Export to Excel
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Header>
          </Card>

          {/* Student Cards */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading student data...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-5">
              <p>No students found matching the search criteria.</p>
            </div>
          ) : (
            renderStudentCards()
          )}
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

    .report-container {
      background: white;
      margin-bottom: 2rem;
      border-radius: 8px;
      height: auto;
    }

    .student-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      height: 100%;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }

    .left-column, .right-column {
      padding: 0 0.5rem;
    }

    .detail-item {
      font-size: 0.75rem;
      line-height: 1.2;
      color: #333;
    }

    .detail-item strong {
      color: #0B3D7B;
      font-weight: 600;
      margin-right: 0.25rem;
    }

    .photo-container {
      border: 2px solid #0B3D7B;
      padding: 2px;
      background: #fff;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .student-photo {
      width: 100px;
      height: 100px;
      object-fit: cover;
    }

    @media print {
      .custom-breadcrumb, .search-container {
        display: none !important;
      }

      .report-container {
        margin: 0;
        padding: 0;
        border: none;
      }

      .card {
        border: none !important;
        box-shadow: none !important;
      }

      .student-card:not(:first-child) {
        page-break-before: always;
      }
    }

    @media (max-width: 768px) {
      .left-column, .right-column {
        padding: 0;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .student-photo {
        width: 80px;
        height: 80px;
      }

      .detail-item {
        font-size: 0.7rem;
      }
    }
  `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default FullView

