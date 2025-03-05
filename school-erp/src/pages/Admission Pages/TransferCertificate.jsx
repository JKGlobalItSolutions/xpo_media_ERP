"use client"

import { useState, useEffect, useRef } from "react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Container } from "react-bootstrap"
import { Link } from "react-router-dom"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const TransferCertificate = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    permanentAddress: "",
    placeName: "",
    busRouteNumber: "",
    communicationAdd: "",
    nationality: "",
    religion: "",
    community: "",
    caste: "",
    state: "",
    standard: "",
    section: "",
    gender: "",
    dateOfBirth: "",
    dateOfAdmission: "",
    studiedStandard: "",
    studiedYear: "",
    studiedSchoolName: "",
    parentOccupation: "",
    bloodGroup: "",
    dateOfRelieve: "",
    status: "",
  })

  const [editableData, setEditableData] = useState({
    schoolName: "",
    educationalDistrict: "Tiruvanamalai",
    revenueDistrict: "Tiruvanamalai",
    adiDravidar: "-",
    backwardClass: "-",
    mostBackwardClass: "MBC",
    convertedChristianity: "-",
    denotifiedCommunities: "Independent",
    otherCaste: "-",
    qualifiedForPromotion: "Yes. Promoted to higher studies",
    feesPaid: "Yes",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [administrationId, setAdministrationId] = useState(null)
  const [admissionData, setAdmissionData] = useState([])
  const [filteredAdmissionData, setFilteredAdmissionData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const componentRef = useRef()

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const q = query(adminRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          setAdministrationId(querySnapshot.docs[0].id)
        } else {
          console.error("No Administration document found")
          setError("Error initializing. Please contact administrator.")
        }
      } catch (error) {
        console.error("Error fetching Administration ID:", error)
        setError("Error initializing. Please try again.")
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchAdmissionData()
    }
  }, [administrationId])

  const fetchAdmissionData = async () => {
    try {
      const admissionsRef = collection(
        db,
        `Schools/${auth.currentUser.uid}/AdmissionMaster/${administrationId}/AdmissionSetup`,
      )
      const admissionsSnapshot = await getDocs(admissionsRef)

      const data = admissionsSnapshot.docs
        .map((doc) => {
          const { admissionNumber, studentName } = doc.data()
          return { admissionNumber, studentName }
        })
        .filter((item) => item.admissionNumber && item.studentName)
        .sort((a, b) => a.admissionNumber.localeCompare(b.admissionNumber))

      setAdmissionData(data)
      setFilteredAdmissionData(data)
    } catch (error) {
      console.error("Error fetching admission data:", error)
      setError("Failed to fetch admission data. Please try again.")
    }
  }

  const fetchStudentData = async (admissionNum) => {
    try {
      setLoading(true)
      setError("")

      const admissionSetupRef = collection(
        db,
        `Schools/${auth.currentUser.uid}/AdmissionMaster/${administrationId}/AdmissionSetup`,
      )
      const q = query(admissionSetupRef, where("admissionNumber", "==", admissionNum))
      const admissionSetupSnapshot = await getDocs(q)

      if (!admissionSetupSnapshot.empty) {
        const studentDoc = admissionSetupSnapshot.docs[0]
        const data = studentDoc.data()

        setFormData({
          admissionNumber: data.admissionNumber || "",
          studentName: data.studentName || "",
          fatherName: data.fatherName || "",
          motherName: data.motherName || "",
          permanentAddress: `${data.streetVillage || ""}, ${data.district || ""}, ${data.state || ""} - ${data.placePincode || ""}`,
          placeName: data.boardingPoint || "",
          busRouteNumber: data.busRouteNumber || "",
          communicationAdd: data.communicationAddress || "",
          nationality: data.nationality || "",
          religion: data.religion || "",
          community: data.community || "",
          caste: data.caste || "",
          state: data.state || "",
          standard: data.standard || "",
          section: data.section || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          dateOfAdmission: data.dateOfAdmission || "",
          studiedStandard: data.classLastStudied || "",
          studiedYear: data.studiedYear || "",
          studiedSchoolName: data.nameOfSchool || "",
          parentOccupation: `${data.fatherOccupation || ""} / ${data.motherOccupation || ""}`,
          bloodGroup: data.bloodGroup || "",
          dateOfRelieve: data.dateOfRelieve || "",
          status: data.status || (data.studentType === "New" ? "active" : "inactive"),
        })

        return true
      } else {
        setError("No student found with this admission number")
        resetForm()
        return false
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      setError("Error fetching student data")
      resetForm()
      return false
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      admissionNumber: "",
      studentName: "",
      fatherName: "",
      motherName: "",
      permanentAddress: "",
      placeName: "",
      busRouteNumber: "",
      communicationAdd: "",
      nationality: "",
      religion: "",
      community: "",
      caste: "",
      state: "",
      standard: "",
      section: "",
      gender: "",
      dateOfBirth: "",
      dateOfAdmission: "",
      studiedStandard: "",
      studiedYear: "",
      studiedSchoolName: "",
      parentOccupation: "",
      bloodGroup: "",
      dateOfRelieve: "",
      status: "",
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "admissionNumber") {
      const filtered = admissionData.filter(
        (item) =>
          item.admissionNumber.toLowerCase().includes(value.toLowerCase()) ||
          item.studentName.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredAdmissionData(filtered)
      setShowDropdown(filtered.length > 0)
    }
  }

  const handleEditableInputChange = (e) => {
    const { name, value } = e.target
    setEditableData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleAdmissionSelect = (admissionNum) => {
    setFormData((prev) => ({
      ...prev,
      admissionNumber: admissionNum,
    }))
    setShowDropdown(false)
    fetchStudentData(admissionNum)
  }

  const handleSave = () => {
    setIsEditing(false)
    toast.success("Changes saved successfully!")
  }

  const handlePrintCertificate = () => {
    setIsEditing(false)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleDownloadPDF = async () => {
    setIsEditing(false)
    setTimeout(async () => {
      const input = componentRef.current
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save("transfer_certificate.pdf")
    }, 100)
  }

  const renderField = (fieldName, defaultValue = "") => {
    if (formData[fieldName]) {
      return formData[fieldName]
    } else if (isEditing) {
      return (
        <Form.Control
          type="text"
          name={fieldName}
          value={editableData[fieldName] || ""}
          onChange={handleEditableInputChange}
          placeholder={`Enter ${fieldName}`}
        />
      )
    } else {
      return editableData[fieldName] || defaultValue
    }
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Transfer Certificate</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/home" className="text-decoration-none">
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/admission" className="text-decoration-none">
                    Admission
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Transfer Certificate
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="transfer-form bg-white rounded shadow-sm">
          {/* Header with Admission Number Input */}
          <div className="header p-3 d-flex justify-content-between align-items-center custom-btn-clr">
            <h4 className="m-0 text-white">Transfer Certificate</h4>
            <div className="position-relative">
              <Form.Control
                type="text"
                placeholder="Enter Admission Number"
                value={formData.admissionNumber}
                onChange={handleInputChange}
                name="admissionNumber"
                className="w-auto"
                style={{ maxWidth: "300px" }}
                disabled={loading}
                autoComplete="off"
                onClick={() => setShowDropdown(true)}
              />
              {showDropdown && (
                <div className="admission-dropdown">
                  {filteredAdmissionData.map((item, index) => (
                    <div
                      key={index}
                      className="admission-dropdown-item"
                      onClick={() => handleAdmissionSelect(item.admissionNumber)}
                    >
                      {`${item.admissionNumber}-${item.studentName}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Certificate Content */}
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 no-print">
              <h2 style={{ color: "#0B3D7B" }}>Transfer Certificate</h2>
              <div>
                {isEditing ? (
                  <Button variant="success" onClick={handleSave} className="me-2">
                    Save Changes
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => setIsEditing(true)} className="me-2">
                    Edit
                  </Button>
                )}
                <Button variant="primary" onClick={handlePrintCertificate} className="me-2">
                  Print
                </Button>
                <Button variant="success" onClick={handleDownloadPDF} className="me-2">
                  Download PDF
                </Button>
              </div>
            </div>

            <div className="certificate-container" ref={componentRef}>
              <div className="certificate-content">
                <h1 className="text-center mb-2">TRANSFER CERTIFICATE</h1>
                <h2 className="text-center mb-2">Government of Tamil Nadu</h2>
                <p className="text-center mb-4">(Department of School Education)</p>
                <p className="text-center small-text mb-4">(Recognized by the Director of School Education)</p>

                <div className="header-details">
                  <div className="left-details">
                    <p>Aadhar No.: {formData.aadharNumber || "984903618730"}</p>
                    <p>Serial No.: {formData.serialNumber || "1/2022"}</p>
                  </div>
                  <div className="right-details">
                    <p>EMIS No: {formData.emis || "Yes Promoted"}</p>
                    <p>Admission No.: {formData.admissionNumber || "19/858016"}</p>
                  </div>
                </div>

                <div className="certificate-body">
                  <div className="detail-row">
                    <div className="label">1. (a) Name of the School</div>
                    <div className="value">: {renderField("schoolName")}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">(b) Name of the Educational District</div>
                    <div className="value">: {renderField("educationalDistrict", "Tiruvanamalai")}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">(c) Name of the Revenue District</div>
                    <div className="value">: {renderField("revenueDistrict", "Tiruvanamalai")}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">2. Name of the Pupil (in block letters)</div>
                    <div className="value">: {formData.studentName || "RAHUL E"}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">3. Name of the Father or Mother of the Pupil</div>
                    <div className="value">: {formData.fatherName || formData.motherName || "Elamathi"}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">4. Nationality - Religion & Caste</div>
                    <div className="value">
                      :{" "}
                      {`${formData.nationality || "Indian"} - ${formData.religion || "Hindu"} - ${formData.caste || "Vaniyar"}`}
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="label">5. Community Whether He/She belongs to</div>
                    <div className="value">: {formData.community || ""}</div>
                  </div>

                  <div className="sub-details">
                    <div className="detail-row">
                      <div className="label">(a) Adi Dravidar (S.C.) or (S.T.)</div>
                      <div className="value">: {renderField("adiDravidar", "-")}</div>
                    </div>

                    <div className="detail-row">
                      <div className="label">(b) Backward Class</div>
                      <div className="value">: {renderField("backwardClass", "-")}</div>
                    </div>

                    <div className="detail-row">
                      <div className="label">(c) Most Backward Class</div>
                      <div className="value">: {renderField("mostBackwardClass", "MBC")}</div>
                    </div>

                    <div className="detail-row">
                      <div className="label">(d) Converted to Christianity from Scheduled Caste</div>
                      <div className="value">: {renderField("convertedChristianity", "-")}</div>
                    </div>

                    <div className="detail-row">
                      <div className="label">(e) Denotified Communities</div>
                      <div className="value">: {renderField("denotifiedCommunities", "Independent")}</div>
                    </div>

                    <div className="detail-row">
                      <div className="label">(f) Other Caste</div>
                      <div className="value">: {renderField("otherCaste", "-")}</div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="label">6. Sex</div>
                    <div className="value">: {formData.gender || "Male"}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">
                      7. Date of Birth as entered in the Admission Register
                      <br />
                      <span className="sub-text">(in figures and words)</span>
                    </div>
                    <div className="value">: {formData.dateOfBirth || "01/04/2000"}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">
                      8. Date of admission and standard in which admitted
                      <br />
                      <span className="sub-text">(the year to be entered in words)</span>
                    </div>
                    <div className="value">: {formData.dateOfAdmission || "28/12/2021"}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">
                      9. Standard in which the pupil was studying at the time of
                      <br />
                      leaving (in words)
                    </div>
                    <div className="value">: {formData.standard || "xi std"}</div>
                  </div>

                  <div className="detail-row">
                    <div className="label">10. Whether Qualified for Promotion</div>
                    <div className="value">
                      : {renderField("qualifiedForPromotion", "Yes. Promoted to higher studies")}
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="label">11. Whether the Pupil has paid all the fees due to the School</div>
                    <div className="value">: {renderField("feesPaid", "Yes")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      <ToastContainer position="bottom-right" autoClose={3000} />

      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body * {
            visibility: hidden;
          }
          .certificate-container,
          .certificate-container * {
            visibility: visible;
          }
          .certificate-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0;
            background: white;
          }
          .no-print, input, button {
            display: none !important;
          }
        }

        .admission-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 200px;
          overflow-y: auto;
          background-color: white;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          z-index: 1000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .admission-dropdown-item {
          padding: 8px 12px;
          cursor: pointer;
          color: black;
        }
        .admission-dropdown-item:hover {
          background-color: #f8f9fa;
        }
        .custom-btn-clr {
          background-color: #0B3D7B;
          border-color: #0B3D7B;
        }
        .custom-btn-clr:hover {
          background-color: #072a56;
          border-color: #072a56;
        }

        .certificate-container {
          background: white;
          padding: 40px;
          margin: 0 auto;
          width: 210mm;
          min-height: 297mm;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .certificate-content {
          font-family: "Times New Roman", Times, serif;
          color: black;
          line-height: 1.6;
        }

        h1 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        h2 {
          font-size: 20px;
          font-weight: normal;
        }

        .small-text {
          font-size: 14px;
        }

        .header-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          font-size: 14px;
        }

        .left-details, .right-details {
          flex: 1;
        }

        .right-details {
          text-align: right;
        }

        .certificate-body {
          font-size: 14px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 15px;
          align-items: flex-start;
        }

        .label {
          flex: 0 0 60%;
          padding-right: 10px;
        }

        .value {
          flex: 0 0 40%;
        }

        .sub-details {
          margin-left: 20px;
        }

        .sub-details .detail-row {
          margin-bottom: 8px;
        }

        .sub-text {
          font-size: 12px;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .certificate-container {
            width: 100%;
            padding: 20px;
          }

          .header-details {
            flex-direction: column;
          }

          .right-details {
            text-align: left;
            margin-top: 15px;
          }

          .detail-row {
            flex-direction: column;
          }

          .label, .value {
            width: 100%;
          }
        }
      `}</style>
    </MainContentPage>
  )
}

export default TransferCertificate

