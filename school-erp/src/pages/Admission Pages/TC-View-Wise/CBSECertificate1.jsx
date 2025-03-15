"use client"

import { useState, useEffect, useRef } from "react"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { db, auth } from "../../../Firebase/config"
import { collection, getDocs, query, limit, where } from "firebase/firestore"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const CBSECertificate1 = () => {
  const certificateRef = useRef(null)
  const page1Ref = useRef(null)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [selectedAdmissionNumber, setSelectedAdmissionNumber] = useState("")
  const [isEditing, setIsEditing] = useState(false) // State to toggle edit mode
  const [formData, setFormData] = useState({
    serialNo: "",
    admissionNo: "",
    schoolName: "",
    schoolAddress: "",
    recognizedBy: "",
    studentName: "",
    fatherOrMotherName: "",
    nationality: "",
    religion: "",
    caste: "",
    sex: "",
    dateOfBirth: "",
    dateOfAdmission: "",
    standardStudied: "",
    qualifiedForPromotion: "",
    feesPaid: "",
    dateLeftSchool: "",
    conductAndCharacter: "",
    applicationDate: "",
    issueDate: "",
  })

  const handlePrint = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const a4Width = 210 // A4 width in mm
      const a4Height = 297 // A4 height in mm

      // Capture Page 1
      if (page1Ref.current) {
        const canvas1 = await html2canvas(page1Ref.current, {
          scale: 2,
          width: a4Width * 3.78,
          height: a4Height * 3.78,
          useCORS: true,
        })
        const imgData1 = canvas1.toDataURL("image/png")
        const imgHeight1 = (canvas1.height * a4Width) / canvas1.width
        pdf.addImage(imgData1, "PNG", 0, 0, a4Width, imgHeight1)
      }

      // Save the PDF
      pdf.save("CBSE_TransferCertificate.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  // Fetch admission numbers from Firestore
  useEffect(() => {
    const fetchAdmissionNumbers = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const q = query(adminRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const administrationId = querySnapshot.docs[0]?.id || ""
          if (administrationId) {
            const admissionsRef = collection(
              db,
              "Schools",
              auth.currentUser.uid,
              "AdmissionMaster",
              administrationId,
              "AdmissionSetup"
            )
            const snapshot = await getDocs(admissionsRef)
            const numbers = snapshot.docs
              .map((doc) => doc.data().admissionNumber)
              .filter((num) => num && num.startsWith("ADM"))
            setAdmissionNumbers(numbers)
          } else {
            console.error("No administration ID found")
          }
        } else {
          console.error("No administration documents found")
        }
      } catch (error) {
        console.error("Error fetching admission numbers:", error)
      }
    }
    fetchAdmissionNumbers()
  }, [])

  // Fetch student data when admission number changes
  useEffect(() => {
    const fetchStudentData = async () => {
      if (selectedAdmissionNumber) {
        try {
          const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
          const q = query(adminRef, limit(1))
          const querySnapshot = await getDocs(q)

          if (!querySnapshot.empty) {
            const administrationId = querySnapshot.docs[0]?.id || ""
            if (administrationId) {
              const admissionsRef = collection(
                db,
                "Schools",
                auth.currentUser.uid,
                "AdmissionMaster",
                administrationId,
                "AdmissionSetup"
              )
              const admissionQuery = query(
                admissionsRef,
                where("admissionNumber", "==", selectedAdmissionNumber)
              )
              const admissionSnapshot = await getDocs(admissionQuery)

              if (!admissionSnapshot.empty) {
                const data = admissionSnapshot.docs[0].data()
                setFormData({
                  serialNo: "1/2022", // Default or dynamic if needed
                  admissionNo: data.admissionNumber || "",
                  schoolName: "XPOMEDIA MATRIC. HR. SEC. SCHOOL",
                  schoolAddress: "TIRUVANNAMALAI - 606601",
                  recognizedBy: "Recognised by the Government of Tamil Nadu K.Dis.No.",
                  studentName: data.studentName || "",
                  fatherOrMotherName: data.fatherName || data.motherName || "",
                  nationality: data.nationality || "",
                  religion: data.religion || "",
                  caste: data.caste || "",
                  sex: data.gender || "",
                  dateOfBirth: data.dateOfBirth || "",
                  dateOfAdmission: data.dateOfAdmission || "",
                  standardStudied: data.classLastStudied || "XI STD",
                  qualifiedForPromotion: data.qualifiedForPromotion || "Yes. Promoted to higher studies",
                  feesPaid: data.feesPaid || "Yes",
                  dateLeftSchool: "19/03/2022", // Default or dynamic if needed
                  conductAndCharacter: "",
                  applicationDate: "19/03/2022", // Default or dynamic if needed
                  issueDate: "19/03/2022", // Default or dynamic if needed
                })
              } else {
                console.error("No admission document found for admission number:", selectedAdmissionNumber)
              }
            } else {
              console.error("No administration ID found")
            }
          } else {
            console.error("No administration documents found")
          }
        } catch (error) {
          console.error("Error fetching student data:", error)
        }
      }
    }
    fetchStudentData()
  }, [selectedAdmissionNumber])

  const handleAdmissionNumberChange = (e) => {
    setSelectedAdmissionNumber(e.target.value)
    setIsEditing(false) // Reset edit mode when changing admission number
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const toggleEditMode = () => {
    setIsEditing(!isEditing)
  }

  return (
    <MainContentPage>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <select
                  value={selectedAdmissionNumber}
                  onChange={handleAdmissionNumberChange}
                  className="form-select custom-select me-2"
                >
                  <option value="">Select Admission Number</option>
                  {admissionNumbers.map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
                <button onClick={toggleEditMode} className="btn btn-warning custom-btn me-2">
                  {isEditing ? "Cancel" : "Edit"}
                </button>
                {isEditing && (
                  <button onClick={toggleEditMode} className="btn btn-success custom-btn me-2">
                    Save
                  </button>
                )}
                <button onClick={handlePrint} className="btn btn-primary custom-btn">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden div for PDF generation, positioned off-screen */}
        <div style={{ position: "absolute", left: "-9999px" }}>
          {/* Page 1 */}
          <div ref={page1Ref} className="page">
            <div className="p-4">
              <div className="text-center mb-4">
                <h1 className="fw-bold fs-1">{formData.schoolName}</h1>
                <p className="fs-4 mt-1">{formData.schoolAddress}</p>
                <p className="mt-1">{formData.recognizedBy}</p>
              </div>

              <div className="text-center mb-4">
                <h2 className="fw-bold fs-2">TRANSFER CERTIFICATE</h2>
              </div>

              <div className="row mt-4">
                <div className="col-6">
                  <p>Serial No: {formData.serialNo}</p>
                </div>
                <div className="col-6 text-end">
                  <p>Admission No: {formData.admissionNo}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="row mb-2">
                  <div className="col-8">1. Name of the Pupil (in block letters)</div>
                  <div className="col-4">: {formData.studentName}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">2. Name of the Father or Mother of the Pupil</div>
                  <div className="col-4">: {formData.fatherOrMotherName}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">3. Nationality, Religion</div>
                  <div className="col-4">: {formData.nationality} - {formData.religion}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">4. Community and Caste</div>
                  <div className="col-4">: {formData.caste}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">5. Sex</div>
                  <div className="col-4">: {formData.sex}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">6. Date of Birth as entered in the Admission Register (in figures and words)</div>
                  <div className="col-4">: {formData.dateOfBirth}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">7. Date of admission and standard in which admitted (the year to be entered in words)</div>
                  <div className="col-4">: {formData.dateOfAdmission}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">8. Standard in which the pupil was studying at the time of leaving (in words)</div>
                  <div className="col-4">: {formData.standardStudied}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">9. Whether Qualified for Promotion to the Higher Standard</div>
                  <div className="col-4">: {formData.qualifiedForPromotion}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">10. Whether the Pupil has paid all the fees due to the School?</div>
                  <div className="col-4">: {formData.feesPaid}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">11. Date on which the pupil actually left the School</div>
                  <div className="col-4">: {formData.dateLeftSchool}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">12. The pupil's Conduct and Character</div>
                  <div className="col-4">: {formData.conductAndCharacter}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">13. Date on which application for Transfer Certificate was made on behalf of the pupil by the parent/guardian</div>
                  <div className="col-4">: {formData.applicationDate}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">14. Date of the Transfer Certificate</div>
                  <div className="col-4">: {formData.issueDate}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">15. Signature of the Parent/Guardian</div>
                  <div className="col-4">: </div>
                </div>

                <div className="row mt-5">
                  <div className="col-12 text-end">
                    <p>Signature of the Principal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visible content for UI */}
        <div
          id="certificate-content"
          ref={certificateRef}
          className="border bg-white shadow-sm"
          style={{ width: "210mm", height: "297mm", overflow: "hidden" }}
        >
          <div className="p-4">
            <div className="text-center mb-4">
              <h1 className="fw-bold fs-1">{formData.schoolName}</h1>
              <p className="fs-4 mt-1">{formData.schoolAddress}</p>
              <p className="mt-1">{formData.recognizedBy}</p>
            </div>

            <div className="text-center mb-4">
              <h2 className="fw-bold fs-2">TRANSFER CERTIFICATE</h2>
            </div>

            <div className="row mt-4">
              <div className="col-6">
                {isEditing ? (
                  <>
                    Serial No: <input
                      type="text"
                      name="serialNo"
                      value={formData.serialNo}
                      onChange={handleInputChange}
                      className="form-control d-inline-block"
                      style={{ width: "150px" }}
                    />
                  </>
                ) : (
                  <p>Serial No: {formData.serialNo}</p>
                )}
              </div>
              <div className="col-6 text-end">
                {isEditing ? (
                  <>
                    Admission No: <input
                      type="text"
                      name="admissionNo"
                      value={formData.admissionNo}
                      onChange={handleInputChange}
                      className="form-control d-inline-block"
                      style={{ width: "150px" }}
                    />
                  </>
                ) : (
                  <p>Admission No: {formData.admissionNo}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="row mb-2">
                <div className="col-8">1. Name of the Pupil (in block letters)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.studentName}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">2. Name of the Father or Mother of the Pupil</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherOrMotherName"
                      value={formData.fatherOrMotherName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.fatherOrMotherName}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">3. Nationality, Religion</div>
                <div className="col-4">
                  {isEditing ? (
                    <div className="d-flex flex-column">
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="form-control mb-1"
                        placeholder="Nationality"
                      />
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="Religion"
                      />
                    </div>
                  ) : (
                    `: ${formData.nationality} - ${formData.religion}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">4. Community and Caste</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="caste"
                      value={formData.caste}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.caste}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">5. Sex</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.sex}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">6. Date of Birth as entered in the Admission Register (in figures and words)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.dateOfBirth}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">7. Date of admission and standard in which admitted (the year to be entered in words)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="dateOfAdmission"
                      value={formData.dateOfAdmission}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.dateOfAdmission}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">8. Standard in which the pupil was studying at the time of leaving (in words)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="standardStudied"
                      value={formData.standardStudied}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.standardStudied}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">9. Whether Qualified for Promotion to the Higher Standard</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="qualifiedForPromotion"
                      value={formData.qualifiedForPromotion}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.qualifiedForPromotion}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">10. Whether the Pupil has paid all the fees due to the School?</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="feesPaid"
                      value={formData.feesPaid}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.feesPaid}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">11. Date on which the pupil actually left the School</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="dateLeftSchool"
                      value={formData.dateLeftSchool}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.dateLeftSchool}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">12. The pupil's Conduct and Character</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="conductAndCharacter"
                      value={formData.conductAndCharacter}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.conductAndCharacter}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">13. Date on which application for Transfer Certificate was made on behalf of the pupil by the parent/guardian</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="applicationDate"
                      value={formData.applicationDate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.applicationDate}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">14. Date of the Transfer Certificate</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="issueDate"
                      value={formData.issueDate}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.issueDate}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">15. Signature of the Parent/Guardian</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="parentGuardianSignature"
                      value=""
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Enter signature"
                    />
                  ) : (
                    `: `
                  )}
                </div>
              </div>

              <div className="row mt-5">
                <div className="col-12 text-end">
                  <p>Signature of the Principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .custom-btn {
            padding: 5px 10px;
            font-size: 14px;
            color:white;
          }
          .custom-select {
            width: 200px;
            padding: 5px;
            font-size: 14px;
          }
          .page {
            width: 210mm;
            height: 297mm;
            box-sizing: border-box;
          }
          .row {
            display: flex;
            margin-bottom: 10px;
          }
          p {
            margin: 0;
          }
          .text-center {
            text-align: center;
          }
          .text-end {
            text-align: right;
          }
          .fw-bold {
            font-weight: bold;
          }
          .fs-1 {
            font-size: 24px;
          }
          .fs-2 {
            font-size: 20px;
          }
          .fs-4 {
            font-size: 18px;
          }
          .mt-1 {
            margin-top: 4px;
          }
          .mt-4 {
            margin-top: 16px;
          }
          .mt-5 {
            margin-top: 20px;
          }
          .mb-2 {
            margin-bottom: 8px;
          }
          .mb-4 {
            margin-bottom: 16px;
          }
          .col-6 {
            width: 50%;
          }
          .col-8 {
            width: 66.67%;
          }
          .col-4 {
            width: 33.33%;
          }
          .form-control {
            font-size: 14px;
            padding: 2px 5px;
          }
          .mb-1 {
            margin-bottom: 4px;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default CBSECertificate1