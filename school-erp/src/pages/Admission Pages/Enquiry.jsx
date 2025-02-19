"use client"

import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Enquiry = () => {
  const [formData, setFormData] = useState({
    admissionNumber: "",
    studentPhoto: null,
    studentName: "",
    fatherName: "",
    motherName: "",
    streetVillage: "",
    placePincode: "",
    district: "",
    phoneNumber: "",
    boardingPoint: "",
    busRouteNumber: "",
    emailId: "",
    communicationAddress: "",
    nationality: "",
    religion: "",
    state: "",
    community: "",
    caste: "",
    studentType: "",
    studentCategory: "",
    standard: "",
    section: "",
    gender: "",
    dateOfBirth: "",
    emis: "",
    lunchRefresh: "",
    bloodGroup: "",
    dateOfAdmission: "",
    motherTongue: "",
    fatherOccupation: "",
    motherOccupation: "",
    examNumber: "",
    busFee: "",
    studiedYear: "",
    classLastStudied: "",
    classToBeAdmitted: "",
    nameOfSchool: "",
    remarks: "",
    identificationMark1: "",
    identificationMark2: "",
  })

  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)
  const [administrationId, setAdministrationId] = useState(null)
  const [nationalities, setNationalities] = useState([])
  const [religions, setReligions] = useState([])
  const [communities, setCommunities] = useState([])
  const [castes, setCastes] = useState([])
  const [districts, setDistricts] = useState([])
  const [states, setStates] = useState([])
  const [sections, setSections] = useState([])
  const [motherTongues, setMotherTongues] = useState([])
  const [studentCategories, setStudentCategories] = useState([])

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const q = query(adminRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          const newAdminRef = await addDoc(adminRef, { createdAt: new Date() })
          setAdministrationId(newAdminRef.id)
        } else {
          setAdministrationId(querySnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching/creating Administration ID:", error)
        toast.error("Failed to initialize. Please try again.")
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchSetupData()
    }
  }, [administrationId])

  const fetchSetupData = async () => {
    try {
      const fetchData = async (collectionName) => {
        const dataRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          collectionName,
        )
        const snapshot = await getDocs(dataRef)
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      }

      const [
        nationalityData,
        religionData,
        communityData,
        casteData,
        districtData,
        stateData,
        sectionData,
        motherTongueData,
        studentCategoryData,
      ] = await Promise.all([
        fetchData("NationalitySetup"),
        fetchData("ReligionSetup"),
        fetchData("CommunitySetup"),
        fetchData("CasteSetup"),
        fetchData("DistrictSetup"),
        fetchData("StateSetup"),
        fetchData("SectionSetup"),
        fetchData("MotherTongue"),
        fetchData("StudentCategory"),
      ])

      setNationalities(nationalityData)
      setReligions(religionData)
      setCommunities(communityData)
      setCastes(casteData)
      setDistricts(districtData)
      setStates(stateData)
      setSections(sectionData)
      setMotherTongues(motherTongueData)
      setStudentCategories(studentCategoryData)

      console.log("Fetched setup data:", {
        nationalities: nationalityData,
        religions: religionData,
        communities: communityData,
        castes: casteData,
        districts: districtData,
        states: stateData,
        sections: sectionData,
        motherTongues: motherTongueData,
        studentCategories: studentCategoryData,
      })
    } catch (error) {
      console.error("Error fetching setup data:", error)
      toast.error("Failed to fetch setup data. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        studentPhoto: file,
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const enquiryRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "EnquirySetup",
      )
      await addDoc(enquiryRef, formData)
      toast.success("Enquiry submitted successfully!")
      // Reset form or redirect as needed
    } catch (error) {
      console.error("Error submitting enquiry:", error)
      toast.error("Failed to submit enquiry. Please try again.")
    }
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="admission-form">
          {/* Header and Breadcrumb */}
          <div className="mb-4">
            <h2 className="mb-2">Enquiry</h2>
            <nav className="custom-breadcrumb py-1 py-lg-3">
              <Link to="/home">Home</Link>
              <span className="separator mx-2">&gt;</span>
              <span>Admission</span>
              <span className="separator mx-2">&gt;</span>
              <Link to="/admission/enquiry">Enquiry Form</Link>
            </nav>
          </div>

          {/* Main Form Card */}
          <div className="form-card mt-3">
            {/* Card Header */}
            <div className="header p-3 custom-btn-clr">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span>
                    <b>Enquiry Form</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="content-wrapper p-4">
              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* Left Column */}
                  <Col md={4}>
                    <div className="text-center mb-4">
                      <h6>Student Photo</h6>
                      <div
                        className="photo-upload-circle mx-auto"
                        onClick={handlePhotoClick}
                        style={{
                          width: "150px",
                          height: "150px",
                          border: "2px dashed #ccc",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          overflow: "hidden",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <div>Upload Photo Here</div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Student name</Form.Label>
                      <Form.Control
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        placeholder="Enter student full name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Father's name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        placeholder="Enter father's name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mother's name</Form.Label>
                      <Form.Control
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        placeholder="Enter mother's name"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Street/Village</Form.Label>
                      <Form.Control
                        type="text"
                        name="streetVillage"
                        value={formData.streetVillage}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Place/Pincode</Form.Label>
                      <Form.Control
                        type="text"
                        name="placePincode"
                        value={formData.placePincode}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>District</Form.Label>
                      <Form.Select name="district" value={formData.district} onChange={handleInputChange}>
                        <option value="">Select District</option>
                        {districts.map((district) => (
                          <option key={district.id} value={district.district}>
                            {district.district}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>

                  {/* Middle Column */}
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nationality</Form.Label>
                      <Form.Select name="nationality" value={formData.nationality} onChange={handleInputChange}>
                        <option value="">Select Nationality</option>
                        {nationalities.map((nat) => (
                          <option key={nat.id} value={nat.nationality}>
                            {nat.nationality}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Religion</Form.Label>
                      <Form.Select name="religion" value={formData.religion} onChange={handleInputChange}>
                        <option value="">Select Religion</option>
                        {religions.map((rel) => (
                          <option key={rel.id} value={rel.religion}>
                            {rel.religion}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>State</Form.Label>
                      <Form.Select name="state" value={formData.state} onChange={handleInputChange}>
                        <option value="">Select State</option>
                        {states.map((state) => (
                          <option key={state.id} value={state.state}>
                            {state.state}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Community</Form.Label>
                      <Form.Select name="community" value={formData.community} onChange={handleInputChange}>
                        <option value="">Select Community</option>
                        {communities.map((comm) => (
                          <option key={comm.id} value={comm.community}>
                            {comm.community}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Caste</Form.Label>
                      <Form.Select name="caste" value={formData.caste} onChange={handleInputChange}>
                        <option value="">Select Caste</option>
                        {castes.map((caste) => (
                          <option key={caste.id} value={caste.caste}>
                            {caste.caste}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Student Type</Form.Label>
                      <Form.Select name="studentType" value={formData.studentType} onChange={handleInputChange}>
                        <option value="">Select Student Type</option>
                        {/* Add student type options */}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Student Category</Form.Label>
                      <Form.Select name="studentCategory" value={formData.studentCategory} onChange={handleInputChange}>
                        <option value="">Select Category</option>
                        {studentCategories.map((category) => (
                          <option key={category.id} value={category.StudentCategoryName}>
                            {category.StudentCategoryName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Standard</Form.Label>
                      <Form.Select name="standard" value={formData.standard} onChange={handleInputChange}>
                        <option value="">Select Standard</option>
                        {/* Add standard options */}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Section</Form.Label>
                      <Form.Select name="section" value={formData.section} onChange={handleInputChange}>
                        <option value="">Select Section</option>
                        {sections.map((section) => (
                          <option key={section.id} value={section.name}>
                            {section.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Right Column */}
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Date Of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>EMIS</Form.Label>
                      <Form.Control type="text" name="emis" value={formData.emis} onChange={handleInputChange} />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Lunch / Refresh</Form.Label>
                      <Form.Select name="lunchRefresh" value={formData.lunchRefresh} onChange={handleInputChange}>
                        <option value="">Select Option</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Refresh">Refresh</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Blood Group</Form.Label>
                      <Form.Select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}>
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Date Of Admission</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfAdmission"
                        value={formData.dateOfAdmission}
                        onChange={handleInputChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Mother Tongue</Form.Label>
                      <Form.Select name="motherTongue" value={formData.motherTongue} onChange={handleInputChange}>
                        <option value="">Select Mother Tongue</option>
                        {motherTongues.map((mt) => (
                          <option key={mt.id} value={mt.MotherTongueName}>
                            {mt.MotherTongueName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Father's Occupation</Form.Label>
                      <Form.Control
                        type="text"
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mother's Occupation</Form.Label>
                      <Form.Control
                        type="text"
                        name="motherOccupation"
                        value={formData.motherOccupation}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Exam Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="examNumber"
                        value={formData.examNumber}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bus Fee</Form.Label>
                      <Form.Control type="number" name="busFee" value={formData.busFee} onChange={handleInputChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <h5 className="mt-4 mb-3">Previous Studied Details</h5>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Studied Year</Form.Label>
                      <Form.Control
                        type="text"
                        name="studiedYear"
                        value={formData.studiedYear}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Class Last Studied</Form.Label>
                      <Form.Control
                        type="text"
                        name="classLastStudied"
                        value={formData.classLastStudied}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Class to be Admitted</Form.Label>
                      <Form.Control
                        type="text"
                        name="classToBeAdmitted"
                        value={formData.classToBeAdmitted}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name of the School</Form.Label>
                      <Form.Control
                        type="text"
                        name="nameOfSchool"
                        value={formData.nameOfSchool}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Remarks</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Identification Mark 1</Form.Label>
                      <Form.Control
                        type="text"
                        name="identificationMark1"
                        value={formData.identificationMark1}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Identification Mark 2</Form.Label>
                      <Form.Control
                        type="text"
                        name="identificationMark2"
                        value={formData.identificationMark2}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-3">
                  <Button variant="secondary" size="lg" className="me-2">
                    Cancel
                  </Button>
                  <Button variant="primary" size="lg" type="submit">
                    Submit Enquiry
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Container>
      <ToastContainer />
    </MainContentPage>
  )
}

export default Enquiry

