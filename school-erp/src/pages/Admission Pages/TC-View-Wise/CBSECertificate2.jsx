"use client"

import { useState, useEffect, useRef } from "react"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { db, auth } from "../../../Firebase/config"
import { collection, getDocs, query, limit, where } from "firebase/firestore"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

const CBSECertificate2 = () => {
  const certificateRef = useRef(null)
  const page1Ref = useRef(null)
  const [admissionNumbers, setAdmissionNumbers] = useState([])
  const [selectedAdmissionNumber, setSelectedAdmissionNumber] = useState("")
  const [isEditing, setIsEditing] = useState(false) // State to toggle edit mode
  const [formData, setFormData] = useState({
    tcNo: "",
    schoolCode: "",
    schoolName: "",
    schoolAddress: "",
    studentName: "",
    admissionNo: "",
    motherName: "",
    fatherOrGuardianName: "",
    nationality: "",
    casteOrScheduleTribe: "",
    dateOfFirstAdmission: "",
    dateOfBirth: "",
    classLastStudied: "",
    schoolBoardExam: "",
    subjectsStudied: "",
    qualifiedForPromotion: "",
    higherClass: "",
    feesCleared: "",
    feeConcession: "",
    totalWorkingDays: "",
    daysPresent: "",
    endOfYearResult: "",
    coCurricularActivities: "",
    generalConduct: "",
    dateOfApplication: "",
    dateOfIssue: "",
    reasonForLeaving: "",
    aadharNumber: "",
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
      pdf.save("CBSE_TransferCertificate2.pdf")
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
                  tcNo: "1/2022", // Default or dynamic if needed
                  schoolCode: "56216",
                  schoolName: "XPOMEDIA MATRIC. HR. SEC. SCHOOL",
                  schoolAddress: "TIRUVANNAMALAI 606601",
                  studentName: data.studentName || "",
                  admissionNo: data.admissionNumber || "",
                  motherName: data.motherName || "",
                  fatherOrGuardianName: data.fatherName || "",
                  nationality: data.nationality || "",
                  casteOrScheduleTribe: data.caste || "",
                  dateOfFirstAdmission: data.dateOfAdmission || "",
                  dateOfBirth: data.dateOfBirth || "",
                  classLastStudied: data.classLastStudied || "XI STD",
                  schoolBoardExam: "Yes. Promoted",
                  subjectsStudied: "1.English, 2.Tamil/Hindi/French, 3.Maths, 4. Science, 5.Social Science, 6.Computer Science",
                  qualifiedForPromotion: "Yes. Promoted to higher studies",
                  higherClass: "Yes",
                  feesCleared: data.feesPaid || "Yes",
                  feeConcession: "",
                  totalWorkingDays: "",
                  daysPresent: "",
                  endOfYearResult: "",
                  coCurricularActivities: "Karate",
                  generalConduct: "",
                  dateOfApplication: "19/03/2022", // Default or dynamic if needed
                  dateOfIssue: "19/03/2022", // Default or dynamic if needed
                  reasonForLeaving: "go to SINGAPORE",
                  aadharNumber: data.aadharNumber || "No remarks",
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
              </div>

              <div className="row mt-4">
                <div className="col-6">
                  <p>T.C. No: {formData.tcNo}</p>
                </div>
                <div className="col-6 text-end">
                  <p>School Code: {formData.schoolCode}</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <h2 className="fw-bold fs-2">TRANSFER CERTIFICATE</h2>
              </div>

              <div className="mt-4">
                <div className="row mb-2">
                  <div className="col-8">1. Name of the Pupil</div>
                  <div className="col-4">: {formData.studentName}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">2. Admission No</div>
                  <div className="col-4">: {formData.admissionNo}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">3. Mother’s Name</div>
                  <div className="col-4">: {formData.motherName}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">4. Father’s / Guardian’s Name</div>
                  <div className="col-4">: {formData.fatherOrGuardianName}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">5. Nationality</div>
                  <div className="col-4">: {formData.nationality}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">6. Whether the Candidate belongs to Schedule Caste or Schedule Tribe or OBC or Others</div>
                  <div className="col-4">: {formData.casteOrScheduleTribe}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">7. Date of first admission in the School with class (the year to be entered in words)</div>
                  <div className="col-4">: {formData.dateOfFirstAdmission}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">8. Date of Birth as entered in the Admission Register (in figures and words)</div>
                  <div className="col-4">: {formData.dateOfBirth}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">9. Class in which the pupil last studied (in figure & words)</div>
                  <div className="col-4">: {formData.classLastStudied}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">10. School / Board Annual Exam Last Taken with result</div>
                  <div className="col-4">: {formData.schoolBoardExam}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">11. Subject Studied</div>
                  <div className="col-4">: {formData.subjectsStudied}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">12. Whether Qualified for Promotion to Higher Standard If So, to which class (in figure)</div>
                  <div className="col-4">: {formData.qualifiedForPromotion}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8"></div>
                  <div className="col-4">: {formData.higherClass}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">13. Whether all dues cleared?</div>
                  <div className="col-4">: {formData.feesCleared}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">14. Any fee concession availed? If so, the nature of the Such Concession</div>
                  <div className="col-4">: {formData.feeConcession}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">15. Total No. of working days in the Academic Session</div>
                  <div className="col-4">: {formData.totalWorkingDays}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">16. Total No. of working days pupil present in the School</div>
                  <div className="col-4">: {formData.daysPresent}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">17. End of Year Result (Pass/Fail/InComplete)</div>
                  <div className="col-4">: {formData.endOfYearResult}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">18. Co-curricular activities participated (Mention Achievement Level therein)</div>
                  <div className="col-4">: {formData.coCurricularActivities}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">19. General Conduct</div>
                  <div className="col-4">: {formData.generalConduct}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">20. Date of application for TC</div>
                  <div className="col-4">: {formData.dateOfApplication}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">21. Date of issue of the Transfer Certificate</div>
                  <div className="col-4">: {formData.dateOfIssue}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">22. Reason for leaving the School</div>
                  <div className="col-4">: {formData.reasonForLeaving}</div>
                </div>

                <div className="row mb-2">
                  <div className="col-8">23. Aadhaar Number</div>
                  <div className="col-4">: {formData.aadharNumber}</div>
                </div>

                <div className="row mt-5">
                  <div className="col-6">
                    <p>Signature of the Parent/Guardian</p>
                  </div>
                  <div className="col-6 text-end">
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
            </div>

            <div className="row mt-4">
              <div className="col-6">
                {isEditing ? (
                  <>
                    T.C. No: <input
                      type="text"
                      name="tcNo"
                      value={formData.tcNo}
                      onChange={handleInputChange}
                      className="form-control d-inline-block"
                      style={{ width: "150px" }}
                    />
                  </>
                ) : (
                  <p>T.C. No: {formData.tcNo}</p>
                )}
              </div>
              <div className="col-6 text-end">
                {isEditing ? (
                  <>
                    School Code: <input
                      type="text"
                      name="schoolCode"
                      value={formData.schoolCode}
                      onChange={handleInputChange}
                      className="form-control d-inline-block"
                      style={{ width: "150px" }}
                    />
                  </>
                ) : (
                  <p>School Code: {formData.schoolCode}</p>
                )}
              </div>
            </div>

            <div className="text-center mb-4">
              <h2 className="fw-bold fs-2">TRANSFER CERTIFICATE</h2>
            </div>

            <div className="mt-4">
              <div className="row mb-2">
                <div className="col-8">1. Name of the Pupil</div>
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
                <div className="col-8">2. Admission No</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="admissionNo"
                      value={formData.admissionNo}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.admissionNo}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">3. Mother’s Name</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.motherName}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">4. Father’s / Guardian’s Name</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="fatherOrGuardianName"
                      value={formData.fatherOrGuardianName}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.fatherOrGuardianName}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">5. Nationality</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.nationality}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">6. Whether the Candidate belongs to Schedule Caste or Schedule Tribe or OBC or Others</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="casteOrScheduleTribe"
                      value={formData.casteOrScheduleTribe}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.casteOrScheduleTribe}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">7. Date of first admission in the School with class (the year to be entered in words)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="dateOfFirstAdmission"
                      value={formData.dateOfFirstAdmission}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.dateOfFirstAdmission}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">8. Date of Birth as entered in the Admission Register (in figures and words)</div>
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
                <div className="col-8">9. Class in which the pupil last studied (in figure & words)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="classLastStudied"
                      value={formData.classLastStudied}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.classLastStudied}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">10. School / Board Annual Exam Last Taken with result</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="schoolBoardExam"
                      value={formData.schoolBoardExam}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.schoolBoardExam}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">11. Subject Studied</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="subjectsStudied"
                      value={formData.subjectsStudied}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.subjectsStudied}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">12. Whether Qualified for Promotion to Higher Standard If So, to which class (in figure)</div>
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
                <div className="col-8"></div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="higherClass"
                      value={formData.higherClass}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.higherClass}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">13. Whether all dues cleared?</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="feesCleared"
                      value={formData.feesCleared}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.feesCleared}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">14. Any fee concession availed? If so, the nature of the Such Concession</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="feeConcession"
                      value={formData.feeConcession}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.feeConcession}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">15. Total No. of working days in the Academic Session</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="totalWorkingDays"
                      value={formData.totalWorkingDays}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.totalWorkingDays}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">16. Total No. of working days pupil present in the School</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="daysPresent"
                      value={formData.daysPresent}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.daysPresent}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">17. End of Year Result (Pass/Fail/InComplete)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="endOfYearResult"
                      value={formData.endOfYearResult}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.endOfYearResult}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">18. Co-curricular activities participated (Mention Achievement Level therein)</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="coCurricularActivities"
                      value={formData.coCurricularActivities}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.coCurricularActivities}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">19. General Conduct</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="generalConduct"
                      value={formData.generalConduct}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.generalConduct}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">20. Date of application for TC</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="dateOfApplication"
                      value={formData.dateOfApplication}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.dateOfApplication}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">21. Date of issue of the Transfer Certificate</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.dateOfIssue}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">22. Reason for leaving the School</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="reasonForLeaving"
                      value={formData.reasonForLeaving}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.reasonForLeaving}`
                  )}
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-8">23. Aadhaar Number</div>
                <div className="col-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    `: ${formData.aadharNumber}`
                  )}
                </div>
              </div>

              <div className="row mt-5">
                <div className="col-6">
                  {isEditing ? (
                    <>
                      Signature of the Parent/Guardian: <input
                        type="text"
                        name="parentGuardianSignature"
                        value=""
                        onChange={handleInputChange}
                        className="form-control d-inline-block"
                        style={{ width: "150px" }}
                        placeholder="Enter signature"
                      />
                    </>
                  ) : (
                    <p>Signature of the Parent/Guardian</p>
                  )}
                </div>
                <div className="col-6 text-end">
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
        `}
      </style>
    </MainContentPage>
  )
}

export default CBSECertificate2 