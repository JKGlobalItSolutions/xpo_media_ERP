"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import TenthCertificate from "./TC-View-Wise/TenthCertificate"
import TwelfthCertificate from "./TC-View-Wise/TwelfthCertificate"
import CBSECertificate1 from "./TC-View-Wise/CBSECertificate1"
import CBSECertificate2 from "./TC-View-Wise/CBSECertificate2"

const TransferCertificate = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    religion: "",
    caste: "",
    nationality: "",
    monthAndYearOfAdmission: "",
    classOfAdmission: "",
    classStudying: "",
    mediumOfInstruction: "",
    scholarshipParticulars: "",
    dateOfLeaving: "",
    classAtTimeOfLeaving: "",
    reasonForLeaving: "",
    noOfSchoolDays: "",
    noOfSchoolDaysAttended: "",
    characterAndConduct: "",
    dateOfTransferCertificateIssue: "",
    gender: "",
    identificationMarks: "",
    qualifiedForPromotion: "",
    feesPaid: "",
    medicalInspection: "",
    feesPaidUpto: "",
    dateOfTCApplication: "",
    subjects: "",
    result: "",
    lastAttendanceDate: "",
    schoolName: "XPOMEDIA MATRIC. HR. SEC. SCHOOL",
    schoolAddress: "TIRUVANAMALAI 606601",
    districtName: "TIRUVANAMALAI",
    affiliationNo: "",
    schoolCode: "",
    bookNo: "",
    slNo: "",
  })

  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [administrationId, setAdministrationId] = useState(null)
  const [admissionData, setAdmissionData] = useState([])
  const [filteredAdmissionData, setFilteredAdmissionData] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [certificateType, setCertificateType] = useState("")
  const [showCertificate, setShowCertificate] = useState(false)

  const componentRef = useRef(null)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        if (!auth.currentUser) {
          console.warn("No authenticated user. Using mock data for development.")
          setAdministrationId("mock-admin-id")
          return
        }

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchAdmissionData = async () => {
    try {
      if (!auth.currentUser) {
        // Mock data for development
        const mockData = [
          { admissionNumber: "19/858016", studentName: "RAHUL E" },
          { admissionNumber: "19/858017", studentName: "PRIYA S" },
          { admissionNumber: "19/858018", studentName: "KUMAR M" },
          { admissionNumber: "19/858019", studentName: "DIVYA P" },
          { admissionNumber: "19/858020", studentName: "SURESH K" },
        ]
        setAdmissionData(mockData)
        setFilteredAdmissionData(mockData)
        return
      }

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

      if (!auth.currentUser) {
        // Mock data for development
        setTimeout(() => {
          setFormData({
            ...formData,
            admissionNumber: admissionNum,
            studentName: "RAHUL E",
            fatherName: "Elamathi",
            motherName: "Saranya",
            dateOfBirth: "01/04/2000",
            religion: "Hindu",
            caste: "Vaniyar",
            nationality: "Indian",
            monthAndYearOfAdmission: "June 2010",
            classOfAdmission: "LKG",
            classStudying: "X",
            mediumOfInstruction: "English",
            scholarshipParticulars: "NIL",
            dateOfLeaving: "31/03/2024",
            classAtTimeOfLeaving: "X",
            reasonForLeaving: "Completed Studies",
            noOfSchoolDays: "220",
            noOfSchoolDaysAttended: "210",
            characterAndConduct: "Good",
            dateOfTransferCertificateIssue: "01/04/2024",
            gender: "Male",
            identificationMarks: "Mole on right cheek",
            qualifiedForPromotion: "Yes",
            feesPaid: "Yes",
            medicalInspection: "Done",
            feesPaidUpto: "March 2024",
            dateOfTCApplication: "25/03/2024",
            subjects: "English, Tamil, Mathematics, Science, Social Science",
            result: "Pass",
            lastAttendanceDate: "31/03/2024",
          })
          setLoading(false)
          setShowCertificate(true)
        }, 500)
        return true
      }

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
          ...formData,
          ...data,
        })
        setShowCertificate(true)
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
      ...formData,
      admissionNumber: "",
      studentName: "",
      fatherName: "",
      motherName: "",
      dateOfBirth: "",
      religion: "",
      caste: "",
      nationality: "",
      monthAndYearOfAdmission: "",
      classOfAdmission: "",
      classStudying: "",
      mediumOfInstruction: "",
      scholarshipParticulars: "",
      dateOfLeaving: "",
      classAtTimeOfLeaving: "",
      reasonForLeaving: "",
      noOfSchoolDays: "",
      noOfSchoolDaysAttended: "",
      characterAndConduct: "",
      dateOfTransferCertificateIssue: "",
      gender: "",
      identificationMarks: "",
      qualifiedForPromotion: "",
      feesPaid: "",
      medicalInspection: "",
      feesPaidUpto: "",
      dateOfTCApplication: "",
      subjects: "",
      result: "",
      lastAttendanceDate: "",
    })
    setShowCertificate(false)
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
      setShowDropdown(true)
    }
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

  const handlePrintCertificate = async () => {
    setIsEditing(false)
    setProcessing(true)

    setTimeout(async () => {
      const input = componentRef.current

      try {
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        const printFrame = document.createElement("iframe")
        printFrame.style.position = "fixed"
        printFrame.style.right = "0"
        printFrame.style.bottom = "0"
        printFrame.style.width = "0"
        printFrame.style.height = "0"
        printFrame.style.border = "0"
        document.body.appendChild(printFrame)

        const frameDoc = printFrame.contentWindow.document
        frameDoc.open()
        frameDoc.write(`
          <html>
            <head>
              <title>Transfer Certificate</title>
              <style>
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  img {
                    width: 100%;
                    height: auto;
                  }
                  @page {
                    size: A4;
                    margin: 0;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${canvas.toDataURL("image/png")}" />
            </body>
          </html>
        `)
        frameDoc.close()

        printFrame.onload = () => {
          setTimeout(() => {
            printFrame.contentWindow.focus()
            printFrame.contentWindow.print()

            setTimeout(() => {
              document.body.removeChild(printFrame)
              setProcessing(false)
            }, 1000)
          }, 500)
        }

        const img = frameDoc.body.querySelector("img")
        if (img.complete) {
          printFrame.onload()
        } else {
          img.onload = printFrame.onload
        }
      } catch (error) {
        console.error("Error during print preparation:", error)
        toast.error("Failed to prepare document for printing")
        window.print()
        setProcessing(false)
      }
    }, 100)
  }

  const handleDownloadPDF = async () => {
    setIsEditing(false)
    setProcessing(true)

    setTimeout(async () => {
      try {
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
        toast.success("PDF downloaded successfully!")
      } catch (error) {
        console.error("Error generating PDF:", error)
        toast.error("Failed to generate PDF")
      } finally {
        setProcessing(false)
      }
    }, 100)
  }

  const renderField = (fieldName, label, defaultValue = "") => {
    return (
      <div className="detail-row">
        <div className="label">{label}</div>
        <div className="value">
          :{" "}
          {isEditing ? (
            <input
              type="text"
              name={fieldName}
              value={formData[fieldName] || ""}
              onChange={handleInputChange}
              className="form-control form-control-sm"
            />
          ) : (
            formData[fieldName] || defaultValue
          )}
        </div>
      </div>
    )
  }

  const handleCertificateSelect = (type) => {
    setCertificateType(type)
    setShowCertificate(true)
  }

  const handleBack = () => {
    setCertificateType("")
    setShowCertificate(false)
    resetForm()
  }

  const renderCertificateContent = () => {
    switch (certificateType) {
      case "10th":
        return <TenthCertificate formData={formData} renderField={renderField} />
      case "12th":
        return <TwelfthCertificate formData={formData} renderField={renderField} />
      case "CBSE1":
        return <CBSECertificate1 formData={formData} renderField={renderField} />
      case "CBSE2":
        return <CBSECertificate2 formData={formData} renderField={renderField} />
      default:
        return null
    }
  }

  return (
    <MainContentPage className="container-fluid px-0">
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="fw-bold">Transfer Certificate</h4>
        </div>
      </div>

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

      {!showCertificate && (
        <div className="row mb-4">
          <div className="col-12">
            <h5 className="mb-3">Choose the View for the Transfer Certificate:</h5>
            <div className="row g-4">
              <div className="col-12 col-md-6 col-lg-3">
                <div className="card fee-setup-card h-100" onClick={() => handleCertificateSelect("10th")}>
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <h5 className="card-title text-white m-0">10th Standard</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="card fee-setup-card h-100" onClick={() => handleCertificateSelect("12th")}>
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <h5 className="card-title text-white m-0">12th Standard</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="card fee-setup-card h-100" onClick={() => handleCertificateSelect("CBSE1")}>
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <h5 className="card-title text-white m-0">CBSE (Format 1)</h5>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <div className="card fee-setup-card h-100" onClick={() => handleCertificateSelect("CBSE2")}>
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <h5 className="card-title text-white m-0">CBSE (Format 2)</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCertificate && (
        <div className="transfer-form bg-white rounded shadow-sm">
          <div className="header p-3 d-flex justify-content-between align-items-center custom-btn-clr">
            <h4 className="m-0 text-white">Transfer Certificate - {certificateType}</h4>
            <div className="d-flex align-items-center">
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Enter Admission Number"
                  value={formData.admissionNumber}
                  onChange={handleInputChange}
                  name="admissionNumber"
                  className="form-control w-auto"
                  style={{ maxWidth: "300px" }}
                  disabled={loading}
                  autoComplete="off"
                  onFocus={() => setShowDropdown(true)}
                  ref={inputRef}
                />
                {showDropdown && (
                  <div className="admission-dropdown" ref={dropdownRef}>
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
          </div>

          <div className="p-4">
            {showCertificate && (
              <div className="d-flex justify-content-between align-items-center mb-4 no-print">
                <h2 style={{ color: "#0B3D7B" }}>Transfer Certificate</h2>
                <div>
                  <button className="btn btn-secondary me-2" onClick={handleBack}>
                    Back
                  </button>
                  {isEditing ? (
                    <button className="btn btn-success me-2" onClick={handleSave}>
                      Save Changes
                    </button>
                  ) : (
                    <button className="btn btn-primary me-2" onClick={() => setIsEditing(true)}>
                      Edit
                    </button>
                  )}
                  <button className="btn btn-primary me-2" onClick={handlePrintCertificate} disabled={processing}>
                    {processing ? "Processing..." : "Print"}
                  </button>
                  <button className="btn btn-success" onClick={handleDownloadPDF} disabled={processing}>
                    {processing ? "Processing..." : "Download PDF"}
                  </button>
                </div>
              </div>
            )}

            {processing && (
              <div className="processing-overlay">
                <div className="processing-content">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2">Processing document...</p>
                </div>
              </div>
            )}

            {showCertificate && (
              <div className="certificate-container" ref={componentRef}>
                {renderCertificateContent()}
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />

      <style jsx>{`
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

        .processing-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          background-color: rgba(255, 255, 255, 0.8);
        }

        .processing-content {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          text-align: center;
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
        .fee-setup-card {
          background-color: #0B3D7B;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .fee-setup-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </MainContentPage>
  )
}

export default TransferCertificate

