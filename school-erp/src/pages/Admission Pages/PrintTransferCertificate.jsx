"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button, Container, Form } from "react-bootstrap"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const PrintTransferCertificate = ({ data, onBack, onSave }) => {
  const [editableData, setEditableData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const componentRef = useRef()

  useEffect(() => {
    // Initialize editable fields that are not present in the fetched data
    const initialEditableData = {
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
      feesPaid: "Yes"
    }
    setEditableData(initialEditableData)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditableData(prevData => ({ ...prevData, [name]: value }))
  }

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically send the editableData to your backend
    // For now, we'll just update the local state and show a toast
    onSave(editableData)
    toast.success("Changes saved successfully!")
  }

  const handlePrint = () => {
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
    if (data[fieldName]) {
      return data[fieldName]
    } else if (isEditing) {
      return (
        <Form.Control
          type="text"
          name={fieldName}
          value={editableData[fieldName] || ""}
          onChange={handleInputChange}
          placeholder={`Enter ${fieldName}`}
        />
      )
    } else {
      return editableData[fieldName] || defaultValue
    }
  }

  return (
    <Container fluid className="p-4">
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
          <Button variant="primary" onClick={handlePrint} className="me-2">
            Print
          </Button>
          <Button variant="success" onClick={handleDownloadPDF} className="me-2">
            Download PDF
          </Button>
          <Button variant="secondary" onClick={onBack}>
            Back
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
              <p>Aadhar No.: {data.aadharNumber || "984903618730"}</p>
              <p>Serial No.: {data.serialNumber || "1/2022"}</p>
            </div>
            <div className="right-details">
              <p>EMIS No: {data.emis || "Yes Promoted"}</p>
              <p>Admission No.: {data.admissionNumber || "19/858016"}</p>
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
              <div className="value">: {data.studentName || "RAHUL E"}</div>
            </div>

            <div className="detail-row">
              <div className="label">3. Name of the Father or Mother of the Pupil</div>
              <div className="value">: {data.fatherName || data.motherName || "Elamathi"}</div>
            </div>

            <div className="detail-row">
              <div className="label">4. Nationality - Religion & Caste</div>
              <div className="value">: {`${data.nationality || "Indian"} - ${data.religion || "Hindu"} - ${data.caste || "Vaniyar"}`}</div>
            </div>

            <div className="detail-row">
              <div className="label">5. Community Whether He/She belongs to</div>
              <div className="value">: {data.community || ""}</div>
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
              <div className="value">: {data.gender || "Male"}</div>
            </div>

            <div className="detail-row">
              <div className="label">
                7. Date of Birth as entered in the Admission Register
                <br />
                <span className="sub-text">(in figures and words)</span>
              </div>
              <div className="value">: {data.dateOfBirth || "01/04/2000"}</div>
            </div>

            <div className="detail-row">
              <div className="label">
                8. Date of admission and standard in which admitted
                <br />
                <span className="sub-text">(the year to be entered in words)</span>
              </div>
              <div className="value">: {data.dateOfAdmission || "28/12/2021"}</div>
            </div>

            <div className="detail-row">
              <div className="label">
                9. Standard in which the pupil was studying at the time of
                <br />
                leaving (in words)
              </div>
              <div className="value">: {data.standard || "xi std"}</div>
            </div>

            <div className="detail-row">
              <div className="label">10. Whether Qualified for Promotion</div>
              <div className="value">: {renderField("qualifiedForPromotion", "Yes. Promoted to higher studies")}</div>
            </div>

            <div className="detail-row">
              <div className="label">11. Whether the Pupil has paid all the fees due to the School</div>
              <div className="value">: {renderField("feesPaid", "Yes")}</div>
            </div>
          </div>
        </div>
      </div>

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

        input {
          width: 100%;
          padding: 2px 5px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 4px;
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
    </Container>
  )
}

export default PrintTransferCertificate