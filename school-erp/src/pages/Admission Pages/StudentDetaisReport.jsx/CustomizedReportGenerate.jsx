"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Table, Row, Col } from "react-bootstrap"
import { collection, getDocs } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { FileSpreadsheet, FileIcon as FilePdf, Printer } from "lucide-react"

const CustomizedReportGenerate = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)
  const [selectedCriteria, setSelectedCriteria] = useState("community")
  const [criteriaValue, setCriteriaValue] = useState("")
  const [generatedReport, setGeneratedReport] = useState(null)
  const [availableCriteria, setAvailableCriteria] = useState([])
  const [criteriaOptions, setCriteriaOptions] = useState({})
  const [selectedFields, setSelectedFields] = useState([])
  const [step, setStep] = useState(1)

  const allFields = [
    "admissionNumber",
    "studentName",
    "fatherName",
    "motherName",
    "dateOfBirth",
    "gender",
    "phoneNumber",
    "emailId",
    "streetVillage",
    "placePincode",
    "district",
    "state",
    "nationality",
    "religion",
    "community",
    "caste",
    "motherTongue",
    "bloodGroup",
    "studentType",
    "studentCategory",
    "standard",
    "section",
    "dateOfAdmission",
    "examNumber",
    "emis",
    "aadharNumber",
    "busRouteNumber",
    "boardingPoint",
    "busFee",
    "fatherOccupation",
    "motherOccupation",
    "classLastStudied",
    "classToBeAdmitted",
    "nameOfSchool",
    "studiedYear",
    "identificationMark1",
    "identificationMark2",
    "remarks",
    "communicationAddress",
    "lunchRefresh",
    "hostelFee",
    "tutionFees",
  ]

  const fieldNameMapping = {
    admissionNumber: "Admission Number",
    studentName: "Student Name",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    dateOfBirth: "Date of Birth",
    gender: "Gender",
    phoneNumber: "Phone Number",
    emailId: "Email ID",
    streetVillage: "Street/Village",
    placePincode: "Place/Pincode",
    district: "District",
    state: "State",
    nationality: "Nationality",
    religion: "Religion",
    community: "Community",
    caste: "Caste",
    motherTongue: "Mother Tongue",
    bloodGroup: "Blood Group",
    studentType: "Student Type",
    studentCategory: "Student Category",
    standard: "Standard",
    section: "Section",
    dateOfAdmission: "Date of Admission",
    examNumber: "Exam Number",
    emis: "EMIS",
    aadharNumber: "Aadhar Number",
    busRouteNumber: "Bus Route Number",
    boardingPoint: "Boarding Point",
    busFee: "Bus Fee",
    fatherOccupation: "Father's Occupation",
    motherOccupation: "Mother's Occupation",
    classLastStudied: "Class Last Studied",
    classToBeAdmitted: "Class to be Admitted",
    nameOfSchool: "Name of School",
    studiedYear: "Studied Year",
    identificationMark1: "Identification Mark 1",
    identificationMark2: "Identification Mark 2",
    remarks: "Remarks",
    communicationAddress: "Communication Address",
    lunchRefresh: "Lunch/Refresh",
    hostelFee: "Hostel Fee",
    tutionFees: "Tuition Fees",
  }

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
      const snapshot = await getDocs(studentsRef)
      const studentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setStudents(studentsData)
      setLoading(false)

      // Extract available criteria and their unique values
      const criteria = {}
      allFields.forEach((field) => {
        criteria[field] = new Set()
      })

      studentsData.forEach((student) => {
        allFields.forEach((field) => {
          if (student[field]) criteria[field].add(student[field])
        })
      })

      setAvailableCriteria(allFields)
      setCriteriaOptions(
        Object.fromEntries(Object.entries(criteria).map(([key, value]) => [key, Array.from(value).sort()])),
      )
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to fetch student data")
      setLoading(false)
    }
  }

  const handleCriteriaChange = (e) => {
    setSelectedCriteria(e.target.value)
    setCriteriaValue("")
    setGeneratedReport(null)
  }

  const handleCriteriaValueChange = (e) => {
    setCriteriaValue(e.target.value)
    setGeneratedReport(null)
  }

  const handleFieldSelection = (field) => {
    setSelectedFields((prevFields) =>
      prevFields.includes(field) ? prevFields.filter((f) => f !== field) : [...prevFields, field],
    )
  }

  const generateReport = () => {
    if (!criteriaValue) {
      toast.error(`Please select a ${fieldNameMapping[selectedCriteria]}`)
      return
    }

    if (selectedFields.length === 0) {
      toast.error("Please select at least one field for the report")
      return
    }

    const filteredStudents = students.filter((student) => student[selectedCriteria] === criteriaValue)

    if (filteredStudents.length === 0) {
      toast.error(`No students found for the selected ${fieldNameMapping[selectedCriteria]}`)
      setGeneratedReport(null)
      return
    }

    const report = filteredStudents.map((student) => {
      const reportItem = {}
      selectedFields.forEach((field) => {
        reportItem[fieldNameMapping[field]] = student[field] || "N/A"
      })
      return reportItem
    })

    setGeneratedReport(report)
    toast.success("Report generated successfully")
    setStep(3)
  }

  const exportToExcel = () => {
    if (!generatedReport) {
      toast.error("Please generate a report first")
      return
    }

    const ws = XLSX.utils.json_to_sheet(generatedReport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Customized Report")
    XLSX.writeFile(wb, `CustomizedReport_${fieldNameMapping[selectedCriteria]}_${criteriaValue}.xlsx`)
  }

  const exportToPDF = () => {
    if (!generatedReport) {
      toast.error("Please generate a report first")
      return
    }

    if (selectedFields.length > 12) {
      toast.error("PDF generation is not available for more than 12 fields. Please use Excel export instead.")
      return
    }

    const orientation = selectedFields.length > 6 ? "landscape" : "portrait"
    const doc = new jsPDF(orientation, "mm", "a4")

    doc.setFontSize(18)
    doc.text(`Customized Report for ${fieldNameMapping[selectedCriteria]}: ${criteriaValue}`, 14, 22)

    doc.autoTable({
      startY: 30,
      head: [Object.keys(generatedReport[0])],
      body: generatedReport.map(Object.values),
      theme: "grid",
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [11, 61, 123], textColor: 255 },
    })

    doc.save(`CustomizedReport_${fieldNameMapping[selectedCriteria]}_${criteriaValue}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  const renderStep1 = () => (
    <Row className="mb-4">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Select Criteria</Form.Label>
          <Form.Select value={selectedCriteria} onChange={handleCriteriaChange} className="form-control-blue">
            {availableCriteria.map((criteria) => (
              <option key={criteria} value={criteria}>
                {fieldNameMapping[criteria]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Select {fieldNameMapping[selectedCriteria]}</Form.Label>
          <Form.Select value={criteriaValue} onChange={handleCriteriaValueChange} className="form-control-blue">
            <option value="">Select a {fieldNameMapping[selectedCriteria]}</option>
            {criteriaOptions[selectedCriteria]?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>
  )

  const renderStep2 = () => (
    <div>
      <h4>Select Fields for the Report</h4>
      <Row className="mb-4">
        {allFields.map((field) => (
          <Col md={4} key={field}>
            <Form.Check
              type="checkbox"
              id={`field-${field}`}
              label={fieldNameMapping[field]}
              checked={selectedFields.includes(field)}
              onChange={() => handleFieldSelection(field)}
            />
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderStep3 = () => (
    <div className="mt-4">
      <h3>Generated Report</h3>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              {Object.keys(generatedReport[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {generatedReport.map((student, index) => (
              <tr key={index}>
                {Object.values(student).map((value, idx) => (
                  <td key={idx}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )

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
            <span>Customized Report Generator</span>
          </nav>
        </div>

        {/* Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">Customized Report Generator</h2>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="bg-white p-4 rounded-bottom">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-center mt-4">
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} className="me-2">
                Previous
              </Button>
            )}
            {step < 3 && (
              <Button onClick={() => setStep(step + 1)} className="me-2" disabled={step === 1 && !criteriaValue}>
                Next
              </Button>
            )}
            {step === 2 && (
              <Button onClick={generateReport} className="generate-btn me-2">
                Generate Report
              </Button>
            )}
            {step === 3 && (
              <>
                <Button variant="outline-primary" onClick={exportToExcel} className="me-2">
                  <FileSpreadsheet className="me-2" size={18} />
                  Export Excel
                </Button>
                <Button variant="outline-primary" onClick={exportToPDF} className="me-2">
                  <FilePdf className="me-2" size={18} />
                  Export PDF
                </Button>
                <Button variant="outline-primary" onClick={handlePrint}>
                  <Printer className="me-2" size={18} />
                  Print
                </Button>
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

          .generate-btn {
            background: linear-gradient(to bottom, #1565C0, #0B3D7B);
            border: none;
            padding: 0.75rem 2rem;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .generate-btn:hover {
            background: linear-gradient(to bottom, #1976D2, #1565C0);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

          @media print {
            .d-print-none {
              display: none !important;
            }
            
            .table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
            
            .table th, .table td {
              border: 1px solid #dee2e6 !important;
            }
          }

          @media (max-width: 768px) {
            .table-responsive {
              max-height: 500px;
            }
          }
        `}
      </style>
      <ToastContainer limit={1} />
    </MainContentPage>
  )
}

export default CustomizedReportGenerate

