"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Card } from "react-bootstrap"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"

const StudyCertificate = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [schoolInfo, setSchoolInfo] = useState({ name: "", address: "" })

  useEffect(() => {
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
        } else {
          toast.error("Failed to fetch school information")
        }
      } catch (error) {
        console.error("Error fetching school information:", error)
        toast.error("Failed to fetch school information")
      }
    }

    fetchSchoolInfo()
  }, [])

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
      fetchAdmissionNumbers()
    }
  }, [administrationId])

  const fetchAdmissionNumbers = async () => {
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const snapshot = await getDocs(admissionsRef)
      const numbers = snapshot.docs.map((doc) => doc.data().admissionNumber)
      setAdmissionNumbers(numbers)
    } catch (error) {
      console.error("Error fetching admission numbers:", error)
      toast.error("Failed to fetch admission numbers")
    }
  }

  const fetchStudentData = async (admissionNumber) => {
    setLoading(true)
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(admissionsRef, where("admissionNumber", "==", admissionNumber))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        setSelectedStudent(snapshot.docs[0].data())
      } else {
        toast.error("No student found with this admission number")
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      toast.error("Failed to fetch student data")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(schoolInfo.name, 105, 20, { align: "center" })
    doc.setFontSize(14)
    doc.text(schoolInfo.address, 105, 30, { align: "center" })
    doc.setFontSize(16)
    doc.text("BONAFIDE CERTIFICATE", 105, 45, { align: "center" })
    doc.line(80, 47, 130, 47) // Underline

    doc.setFontSize(12)
    doc.text(`Ad. No.: ${selectedStudent.admissionNumber}`, 20, 60)
    doc.text(`EMIS No.: ${selectedStudent.emis}`, 150, 60)

    doc.text(`This is to certify that Selvan/Selvi ${selectedStudent.studentName}`, 20, 80)
    doc.text(`S/O/D/O ${selectedStudent.fatherName} is a bonafide student of our school`, 20, 90)
    doc.text(`studying in ${selectedStudent.standard}`, 20, 100)
    doc.text(`during the academic year 2024-2025. His/her date of Birth is`, 20, 110)
    doc.text(`${new Date(selectedStudent.dateOfBirth).toLocaleDateString()} as per school records`, 20, 120)
    doc.text("His/Her Conduct and Character are : _____________", 20, 140)
    doc.text("Signature of Principal", 150, 150)

    doc.save(`${selectedStudent.admissionNumber}_certificate.pdf`)
  }

  const downloadXLSX = () => {
    const data = [
      {
        "Admission Number": selectedStudent.admissionNumber,
        "EMIS Number": selectedStudent.emis,
        "Student Name": selectedStudent.studentName,
        "Father Name": selectedStudent.fatherName,
        Standard: selectedStudent.standard,
        "Academic Year": "2024-2025",
        "Date of Birth": new Date(selectedStudent.dateOfBirth).toLocaleDateString(),
        "Certificate Type": "Bonafide Certificate",
      },
    ]

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Certificate")
    XLSX.writeFile(wb, `${selectedStudent.admissionNumber}_certificate.xlsx`)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2"></span>
            <Link to="/certificates">Certificates</Link>
            <span className="separator mx-2"></span>
            <span>Study Certificate</span>
          </nav>
        </div>

        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2 className="mb-0">Study Certificate</h2>
        </div>

        <Card className="border-0">
          <Card.Body className="bg-white p-4">
            <Form className="mb-4 print:hidden">
              <Form.Group className="mb-3">
                <Form.Label>Enter Admission No.</Form.Label>
                <Form.Select
                  onChange={(e) => fetchStudentData(e.target.value)}
                  disabled={loading}
                  className="form-select-lg"
                >
                  <option value="">Select Admission Number</option>
                  {admissionNumbers.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>

            {selectedStudent && (
              <>
                <div className="certificate-content text-center mt-4">
                  <div className="certificate-border p-4">
                    <h1 className="text-3xl font-bold mb-2">{schoolInfo.name}</h1>
                    <h2 className="text-xl mb-4">{schoolInfo.address}</h2>
                    <h3 className="text-2xl font-bold mb-6 underline">BONAFIDE CERTIFICATE</h3>

                    <div className="flex justify-between mb-6">
                      <p className="text-lg">
                        <strong>Ad. No.:</strong> {selectedStudent.admissionNumber}
                      </p>
                      <p className="text-lg">
                        <strong>EMIS No.:</strong> {selectedStudent.emis}
                      </p>
                    </div>

                    <p className="text-lg mb-4">
                      This is to certify that <strong>{selectedStudent.studentName}</strong> (Selvan/Selvi)
                    </p>

                    <p className="text-lg mb-4">
                      S/O/D/O <strong>{selectedStudent.fatherName}</strong> is a bonafide student of our school studying
                      in <strong>{selectedStudent.standard}</strong>
                    </p>

                    <p className="text-lg mb-4">
                      during the academic year <strong>2024-2025</strong>. His/her date of Birth is{" "}
                      <strong>{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</strong> as per school
                      records
                    </p>

                    <p className="text-lg mb-8">His/Her Conduct and Character are : _____________</p>

                    <div className="text-right mt-12">
                      <p className="text-lg">Signature of Principal</p>
                    </div>
                  </div>
                </div>

                <div className="button-container mt-4 print:hidden">
                  <Button
                    style={{ backgroundColor: "#0B3D7B" }}
                    onClick={handlePrint}
                    disabled={loading}
                    className="me-2 mb-2 mb-md-0"
                  >
                    Print Certificate
                  </Button>
                  <Button
                    style={{ backgroundColor: "#28A745" }}
                    onClick={downloadPDF}
                    disabled={loading}
                    className="me-2 mb-2 mb-md-0"
                  >
                    Download PDF
                  </Button>
                  <Button style={{ backgroundColor: "#17A2B8" }} onClick={downloadXLSX} disabled={loading}>
                    Download XLSX
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
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

          .certificate-content {
            font-family: Arial, sans-serif;
          }

          .certificate-border {
            border: 2px solid #000;
            border-radius: 15px;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }

          .button-container {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
          }

          @media print {
            .print\\:hidden {
              display: none !important;
            }
            .certificate-content {
              border: none !important;
            }
            .certificate-border {
              border: 2px solid #000 !important;
              border-radius: 15px !important;
            }
          }

          @media (max-width: 767px) {
            .button-container {
              flex-direction: column;
            }
            .button-container .btn {
              margin-right: 0 !important;
              margin-bottom: 0.5rem;
              width: 100%;
            }
            .button-container .btn:last-child {
              margin-bottom: 0;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default StudyCertificate

