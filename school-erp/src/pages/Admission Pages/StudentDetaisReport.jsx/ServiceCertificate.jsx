import React, { useState, useEffect } from "react"
import { Container, Form, Button, Card } from "react-bootstrap"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db, auth } from "../../../Firebase/config"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import jsPDF from "jspdf"

const ServiceCertificate = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const [staffCodes, setStaffCodes] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
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
      fetchStaffCodes()
    }
  }, [administrationId])

  const fetchStaffCodes = async () => {
    try {
      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StaffMaster"
      )
      const snapshot = await getDocs(staffRef)
      const codes = snapshot.docs.map((doc) => doc.data().staffCode)
      setStaffCodes(codes)
    } catch (error) {
      console.error("Error fetching staff codes:", error)
      toast.error("Failed to fetch staff codes")
    }
  }

  const fetchStaffData = async (staffCode) => {
    setLoading(true)
    try {
      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StaffMaster"
      )
      const q = query(staffRef, where("staffCode", "==", staffCode))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        setSelectedStaff(snapshot.docs[0].data())
      } else {
        toast.error("No staff found with this staff code")
      }
    } catch (error) {
      console.error("Error fetching staff data:", error)
      toast.error("Failed to fetch staff data")
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
    doc.text("SERVICE CERTIFICATE", 105, 45, { align: "center" })
    doc.line(80, 47, 130, 47) // Underline

    doc.setFontSize(12)
    doc.text(`Staff Code: ${selectedStaff.staffCode}`, 20, 60)
    doc.text(`This is to certify that ${selectedStaff.candidateName}`, 20, 80)
    doc.text(`holding the position of ${selectedStaff.designation}`, 20, 90)
    doc.text(`has been employed with our institution from`, 20, 100)
    doc.text(`${new Date(selectedStaff.dateOfJoining).toLocaleDateString()} to`, 20, 110)
    doc.text(`${new Date(selectedStaff.dateOfRelieve).toLocaleDateString()}`, 20, 120)
    doc.text("His/Her Conduct and Performance are : _____________", 20, 140)
    doc.text("Signature of Principal", 150, 150)

    doc.save(`${selectedStaff.staffCode}_service_certificate.pdf`)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            {/* <Link to="/certificates">Certificates</Link> */}
            <span>Certificates</span>
            <span className="separator mx-2">&gt;</span>
            <span>Service Certificate</span>
          </nav>
        </div>

        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2 className="mb-0">Service Certificate</h2>
        </div>

        <Card className="border-0">
          <Card.Body className="bg-white p-4">
            <Form className="mb-4 print:hidden">
              <Form.Group className="mb-3">
                <Form.Label>Enter Staff Code</Form.Label>
                <Form.Select
                  onChange={(e) => fetchStaffData(e.target.value)}
                  disabled={loading}
                  className="form-select-lg"
                >
                  <option value="">Select Staff Code</option>
                  {staffCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>

            {selectedStaff && (
              <>
                <div className="certificate-content text-center mt-4">
                  <div className="certificate-border p-4">
                    <h1 className="text-3xl font-bold mb-2">{schoolInfo.name}</h1>
                    <h2 className="text-xl mb-4">{schoolInfo.address}</h2>
                    <h3 className="text-2xl font-bold mb-6 underline">SERVICE CERTIFICATE</h3>

                    <div className="flex justify-between mb-6">
                      <p className="text-lg">
                        <strong>Staff Code:</strong> {selectedStaff.staffCode}
                      </p>
                    </div>

                    <p className="text-lg mb-4">
                      This is to certify that <strong>{selectedStaff.candidateName}</strong>
                    </p>

                    <p className="text-lg mb-4">
                      holding the position of <strong>{selectedStaff.designation}</strong>
                    </p>

                    <p className="text-lg mb-4">
                      has been employed with our institution from{" "}
                      <strong>{new Date(selectedStaff.dateOfJoining).toLocaleDateString()}</strong> to{" "}
                      <strong>{new Date(selectedStaff.dateOfRelieve).toLocaleDateString()}</strong>
                    </p>

                    <p className="text-lg mb-8">His/Her Conduct and Performance are : _____________</p>

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

export default ServiceCertificate