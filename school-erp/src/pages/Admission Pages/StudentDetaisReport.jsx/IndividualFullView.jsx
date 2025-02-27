"use client"

import { useState, useEffect } from "react"
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap"
import { Link } from "react-router-dom"
import { collection, getDocs } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import { Printer, Download, FileSpreadsheet } from "lucide-react"
import defaultStudentPhoto from "../../../images/StudentProfileIcon/studentProfile.jpeg"

const IndividualFullView = () => {
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [administrationId, setAdministrationId] = useState(null)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [selectedAdmissionNumber, setSelectedAdmissionNumber] = useState("")
  const [manualAdmissionNumber, setManualAdmissionNumber] = useState("")

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
    const fetchAdmissionNumbers = async () => {
      if (!administrationId) return

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
        const numbers = snapshot.docs.map((doc) => doc.data().admissionNumber)
        setAdmissionNumbers(numbers)
      } catch (error) {
        console.error("Error fetching admission numbers:", error)
        toast.error("Failed to fetch admission numbers")
      }
    }

    fetchAdmissionNumbers()
  }, [administrationId])

  const fetchStudentData = async (admissionNumber) => {
    if (!administrationId || !admissionNumber) return

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
      const studentDoc = snapshot.docs.find((doc) => doc.data().admissionNumber === admissionNumber)

      if (studentDoc) {
        setStudentData(studentDoc.data())
      } else {
        toast.error("Student not found")
        setStudentData(null)
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
      setStudentData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAdmissionNumberChange = (e) => {
    const admissionNumber = e.target.value
    setSelectedAdmissionNumber(admissionNumber)
    if (admissionNumber) {
      fetchStudentData(admissionNumber)
    }
  }

  const handleManualAdmissionNumberChange = (e) => {
    setManualAdmissionNumber(e.target.value)
  }

  const handleManualSearch = () => {
    if (manualAdmissionNumber) {
      fetchStudentData(manualAdmissionNumber)
    }
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleManualSearch()
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image from ${url}`))
      img.src = url
    })
  }

  const handleDownloadPDF = async () => {
    if (!studentData) return

    const doc = new jsPDF()

    // Add header
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 255)
    doc.text(
      `Student Details Admission Number Wise ${studentData.admissionNumber}`,
      doc.internal.pageSize.width / 2,
      15,
      { align: "center" },
    )

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    const today = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    doc.text(`Report as on Date: ${today}`, 15, 25)

    // Add student photo - Match UI logic exactly
    try {
      const photoUrl = studentData.studentPhoto || defaultStudentPhoto
      console.log("PDF Image URL:", photoUrl) // Debug to verify URL
      const img = await loadImage(photoUrl)
      const imgProps = doc.getImageProperties(img)
      const imgWidth = 40
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width
      const xPos = (doc.internal.pageSize.width - imgWidth) / 2
      doc.addImage(img, "JPEG", xPos, 30, imgWidth, imgHeight)
    } catch (error) {
      console.error("Error loading student image for PDF:", error)
      try {
        console.log("Falling back to default image:", defaultStudentPhoto)
        const img = await loadImage(defaultStudentPhoto)
        const imgProps = doc.getImageProperties(img)
        const imgWidth = 40
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width
        const xPos = (doc.internal.pageSize.width - imgWidth) / 2
        doc.addImage(img, "JPEG", xPos, 30, imgWidth, imgHeight)
      } catch (defaultError) {
        console.error("Error loading default image for PDF:", defaultError)
        // Proceed without image if both fail
      }
    }

    // Student details table
    const detailsData = [
      ["Adm.No:", studentData.admissionNumber || "", "Standard:", studentData.standard || ""],
      ["Examno:", studentData.examNumber || "", "Section:", studentData.section || ""],
      ["Student Name:", studentData.studentName || "", "Birth Date:", studentData.dateOfBirth || ""],
      ["Father Name:", studentData.fatherName || "", "Entry Date:", studentData.dateOfAdmission || ""],
      ["Mother Name:", studentData.motherName || "", "Sex:", studentData.gender || ""],
      [
        "Address:",
        `${studentData.streetVillage || ""}, ${studentData.placePincode || ""}`,
        "Religion:",
        studentData.religion || "",
      ],
      ["District:", studentData.district || "", "Nationality:", studentData.nationality || ""],
      ["State:", studentData.state || "", "Community:", studentData.community || ""],
      ["Ph/MobileNo:", studentData.phoneNumber || "", "Caste:", studentData.caste || ""],
      ["Email:", studentData.emailId || "", "Mother Tongue:", studentData.motherTongue || ""],
      ["Blood Group:", studentData.bloodGroup || "", "Father Occupation:", studentData.fatherOccupation || ""],
      ["Bus Route No:", studentData.busRouteNumber || "", "Mother Occupation:", studentData.motherOccupation || ""],
      ["Boarding Point:", studentData.boardingPoint || "", "Bus Fee:", studentData.busFee || ""],
      ["Old School Name:", studentData.nameOfSchool || "", "Old Standard:", studentData.classLastStudied || ""],
      ["Admitted Class:", studentData.classToBeAdmitted || "", "Year:", studentData.studiedYear || ""],
      ["EMIS:", studentData.emis || "", "Lunch/Refresh:", studentData.lunchRefresh || ""],
      ["Student Type:", studentData.studentType || "", "Student Category:", studentData.studentCategory || ""],
      ["Remark I:", studentData.identificationMark1 || "", "Remark II:", studentData.identificationMark2 || ""],
      ["Remarks:", studentData.remarks || "", "", ""],
      ["Aadhar Number:", studentData.aadharNumber || "", "", ""],
    ]

    // Start table after image
    doc.autoTable({
      startY: 80,
      head: [],
      body: detailsData,
      theme: "plain",
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        2: { fontStyle: "bold" },
      },
    })

    doc.save(`Student_Details_${studentData.admissionNumber || "report"}.pdf`)
    toast.success("PDF downloaded successfully")
  }

  const handleDownloadExcel = () => {
    if (!studentData) return

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Admission Number", studentData.admissionNumber],
      ["Exam Number", studentData.examNumber],
      ["Student Name", studentData.studentName],
      ["Father Name", studentData.fatherName],
      ["Mother Name", studentData.motherName],
      ["Address", `${studentData.streetVillage}, ${studentData.placePincode}`],
      ["District", studentData.district],
      ["State", studentData.state],
      ["Phone Number", studentData.phoneNumber],
      ["Email", studentData.emailId],
      ["Standard", studentData.standard],
      ["Section", studentData.section],
      ["Birth Date", studentData.dateOfBirth],
      ["Entry Date", studentData.dateOfAdmission],
      ["Gender", studentData.gender],
      ["Religion", studentData.religion],
      ["Nationality", studentData.nationality],
      ["Community", studentData.community],
      ["Caste", studentData.caste],
      ["Mother Tongue", studentData.motherTongue],
      ["Blood Group", studentData.bloodGroup],
      ["Father Occupation", studentData.fatherOccupation],
      ["Mother Occupation", studentData.motherOccupation],
      ["Bus Route No", studentData.busRouteNumber],
      ["Boarding Point", studentData.boardingPoint],
      ["Bus Fee", studentData.busFee],
      ["Old School Name", studentData.nameOfSchool],
      ["Old Standard", studentData.classLastStudied],
      ["Admitted Class", studentData.classToBeAdmitted],
      ["Year", studentData.studiedYear],
      ["EMIS", studentData.emis],
      ["Lunch/Refresh", studentData.lunchRefresh],
      ["Student Type", studentData.studentType],
      ["Student Category", studentData.studentCategory],
      ["Remark I", studentData.identificationMark1],
      ["Remark II", studentData.identificationMark2],
      ["Remarks", studentData.remarks],
      ["Aadhar Number", studentData.aadharNumber],
    ])

    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Details")
    XLSX.writeFile(workbook, `Student_Details_${studentData.admissionNumber || "report"}.xlsx`)
    toast.success("Excel file downloaded successfully")
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0" style={{ height: "100%", overflow: "hidden" }}>
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

        <div className="report-container">
          {/* Header with Actions */}
          <div
            style={{ backgroundColor: "#0B3D7B" }}
            className="text-white p-3 d-flex justify-content-between align-items-center"
          >
            <div className="d-flex align-items-center">
              <h2 className="mb-0">Student Details Report</h2>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-light" onClick={handlePrint} disabled={!studentData}>
                <Printer className="me-2" size={18} />
                Print
              </Button>
              <Button variant="outline-light" onClick={handleDownloadPDF} disabled={!studentData}>
                <Download className="me-2" size={18} />
                Download PDF
              </Button>
              <Button variant="outline-light" onClick={handleDownloadExcel} disabled={!studentData}>
                <FileSpreadsheet className="me-2" size={18} />
                Download Excel
              </Button>
            </div>
          </div>

          {/* Admission Number Selection */}
          <Card>
            <Card.Body className="p-4">
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  Select Admission Number:
                </Form.Label>
                <Col sm={9}>
                  <Form.Control as="select" value={selectedAdmissionNumber} onChange={handleAdmissionNumberChange}>
                    <option value="">Select an admission number</option>
                    {admissionNumbers.map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </Form.Control>
                </Col>
              </Form.Group>
              <div className="text-center mb-3">
                <p>OR</p>
              </div>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>
                  Enter Admission Number:
                </Form.Label>
                <Col sm={7}>
                  <Form.Control
                    type="text"
                    value={manualAdmissionNumber}
                    onChange={handleManualAdmissionNumberChange}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Enter admission number"
                  />
                </Col>
                <Col sm={2}>
                  <Button onClick={handleManualSearch} variant="primary">
                    Search
                  </Button>
                </Col>
              </Form.Group>
            </Card.Body>
          </Card>

          {loading ? (
            <div className="text-center py-5">
              <div>Loading...</div>
            </div>
          ) : !studentData ? (
            <div className="text-center py-5">
              <div>Please select or enter an admission number to view student details.</div>
            </div>
          ) : (
            /* Report Content */
            <Card className="rounded-bottom" style={{ height: "auto", overflow: "visible" }}>
              <Card.Body className="p-4">
                {/* Report Header */}
                <div className="text-center mb-4">
                  <h3 className="text-primary">Student Details Admission Number Wise {studentData.admissionNumber}</h3>
                  <p className="text-muted">
                    Report as on Date:{" "}
                    {new Date().toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <Row>
                  {/* Left Column */}
                  <Col md={4}>
                    <div className="details-section">
                      <div className="detail-item">
                        <strong>Adm.No:</strong> {studentData.admissionNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Examno:</strong> {studentData.examNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Student Name:</strong> {studentData.studentName}
                      </div>
                      <div className="detail-item">
                        <strong>Father Name:</strong> {studentData.fatherName}
                      </div>
                      <div className="detail-item">
                        <strong>Mother Name:</strong> {studentData.motherName}
                      </div>
                      <div className="detail-item">
                        <strong>Address:</strong> {studentData.streetVillage}, {studentData.placePincode}
                      </div>
                      <div className="detail-item">
                        <strong>District:</strong> {studentData.district}
                      </div>
                      <div className="detail-item">
                        <strong>State:</strong> {studentData.state}
                      </div>
                      <div className="detail-item">
                        <strong>Ph/MobileNo:</strong> {studentData.phoneNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Email:</strong> {studentData.emailId}
                      </div>
                      <div className="detail-item">
                        <strong>Student Type:</strong> {studentData.studentType}
                      </div>
                      <div className="detail-item">
                        <strong>Student Category:</strong> {studentData.studentCategory}
                      </div>
                      <div className="detail-item">
                        <strong>EMIS:</strong> {studentData.emis}
                      </div>
                      <div className="detail-item">
                        <strong>Aadhar Number:</strong> {studentData.aadharNumber}
                      </div>
                    </div>
                  </Col>

                  {/* Middle Column */}
                  <Col md={4}>
                    <div className="details-section">
                      <div className="detail-item">
                        <strong>Standard:</strong> {studentData.standard}
                      </div>
                      <div className="detail-item">
                        <strong>Section:</strong> {studentData.section}
                      </div>
                      <div className="detail-item">
                        <strong>Birth Date:</strong> {studentData.dateOfBirth}
                      </div>
                      <div className="detail-item">
                        <strong>Entry Date:</strong> {studentData.dateOfAdmission}
                      </div>
                      <div className="detail-item">
                        <strong>Sex:</strong> {studentData.gender}
                      </div>
                      <div className="detail-item">
                        <strong>Religion:</strong> {studentData.religion}
                      </div>
                      <div className="detail-item">
                        <strong>Nationality:</strong> {studentData.nationality}
                      </div>
                      <div className="detail-item">
                        <strong>Community:</strong> {studentData.community}
                      </div>
                      <div className="detail-item">
                        <strong>Caste:</strong> {studentData.caste}
                      </div>
                      <div className="detail-item">
                        <strong>Mother Tongue:</strong> {studentData.motherTongue}
                      </div>
                      <div className="detail-item">
                        <strong>Blood Group:</strong> {studentData.bloodGroup}
                      </div>
                      <div className="detail-item">
                        <strong>Lunch/Refresh:</strong> {studentData.lunchRefresh}
                      </div>
                      <div className="detail-item">
                        <strong>Remark I:</strong> {studentData.identificationMark1}
                      </div>
                      <div className="detail-item">
                        <strong>Remark II:</strong> {studentData.identificationMark2}
                      </div>
                    </div>
                  </Col>

                  {/* Right Column */}
                  <Col md={4}>
                    <div className="details-section">
                      {/* Profile Picture Moved to Top */}
                      <div className="text-center mb-4">
                        <img
                          src={studentData.studentPhoto || defaultStudentPhoto}
                          alt="Student"
                          className="student-photo"
                        />
                      </div>
                      <div className="detail-item">
                        <strong>Father Occupation:</strong> {studentData.fatherOccupation}
                      </div>
                      <div className="detail-item">
                        <strong>Mother Occupation:</strong> {studentData.motherOccupation}
                      </div>
                      <div className="detail-item">
                        <strong>Bus Route No:</strong> {studentData.busRouteNumber}
                      </div>
                      <div className="detail-item">
                        <strong>Boarding Point:</strong> {studentData.boardingPoint}
                      </div>
                      <div className="detail-item">
                        <strong>Bus Fee:</strong> {studentData.busFee}
                      </div>
                      <div className="detail-item">
                        <strong>Old School Name:</strong> {studentData.nameOfSchool}
                      </div>
                      <div className="detail-item">
                        <strong>Old Standard:</strong> {studentData.classLastStudied}
                      </div>
                      <div className="detail-item">
                        <strong>Admitted Class:</strong> {studentData.classToBeAdmitted}
                      </div>
                      <div className="detail-item">
                        <strong>Year:</strong> {studentData.studiedYear}
                      </div>
                      <div className="detail-item">
                        <strong>Remarks:</strong> {studentData.remarks}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
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
            border: 2px solid #0B3D7B;
            border-radius: 8px;
            overflow: hidden;
            height: auto;
          }

          .details-section {
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .detail-item {
            font-size: 0.9rem;
            line-height: 1.2;
            word-wrap: break-word;
          }

          .detail-item strong {
            color: #0B3D7B;
            margin-right: 0.5rem;
          }

          .student-photo {
            width: 150px;
            height: 150px;
            object-fit: cover;
            border: 2px solid #0B3D7B;
            border-radius: 4px;
          }

          @media print {
            .btn, .custom-breadcrumb {
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
          }

          @media (max-width: 768px) {
            .detail-item {
              font-size: 0.85rem;
            }

            .student-photo {
              width: 120px;
              height: 120px;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default IndividualFullView

