"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import { db, auth, storage } from "../../Firebase/config"
import { doc, getDoc, setDoc, collection, getDocs, query, limit, where } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { FaArrowLeft } from "react-icons/fa"

const AdmissionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isViewMode = new URLSearchParams(location.search).get("view") === "true"

  const [administrationId, setAdministrationId] = useState(null)
  const [formData, setFormData] = useState({
    enquiryKey: "",
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
  const [errors, setErrors] = useState({})
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)
  const [setupData, setSetupData] = useState({
    nationalities: [],
    religions: [],
    communities: [],
    castes: [],
    districts: [],
    states: [],
    sections: [],
    motherTongues: [],
    studentCategories: [],
    courses: [],
    boardingPoints: [],
  })
  const [enquiryNumbers, setEnquiryNumbers] = useState([])
  const [filteredEnquiryNumbers, setFilteredEnquiryNumbers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const q = query(adminRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          const newAdminRef = await setDoc(doc(adminRef), { createdAt: new Date() })
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
      fetchEnquiryNumbers()
      if (id) {
        fetchAdmissionData()
      }
    }
  }, [administrationId, id])

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
        courseData,
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
        fetchData("Courses"),
      ])

      // Fetch boarding points from PlaceSetup
      const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
      const transportSnapshot = await getDocs(transportRef)
      let boardingPointData = []
      if (!transportSnapshot.empty) {
        const transportId = transportSnapshot.docs[0].id
        const placeSetupRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "PlaceSetup")
        const placeSetupSnapshot = await getDocs(placeSetupRef)
        boardingPointData = placeSetupSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      }

      setSetupData({
        nationalities: nationalityData,
        religions: religionData,
        communities: communityData,
        castes: casteData,
        districts: districtData,
        states: stateData,
        sections: sectionData,
        motherTongues: motherTongueData,
        studentCategories: studentCategoryData,
        courses: courseData,
        boardingPoints: boardingPointData,
      })

      console.log("Fetched setup data successfully")
    } catch (error) {
      console.error("Error fetching setup data:", error)
      toast.error("Failed to fetch setup data. Please try again.")
    }
  }

  const fetchEnquiryNumbers = async () => {
    try {
      const enquiriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "EnquirySetup",
      )
      const snapshot = await getDocs(enquiriesRef)
      const enquiryKeys = snapshot.docs.map((doc) => doc.data().enquiryKey).filter(Boolean)
      setEnquiryNumbers(enquiryKeys)
      setFilteredEnquiryNumbers(enquiryKeys)
    } catch (error) {
      console.error("Error fetching enquiry numbers:", error)
      toast.error("Failed to fetch enquiry numbers. Please try again.")
    }
  }

  const fetchAdmissionData = async () => {
    try {
      const admissionRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
        id,
      )
      const admissionSnap = await getDoc(admissionRef)
      if (admissionSnap.exists()) {
        setFormData(admissionSnap.data())
        setPhotoPreview(admissionSnap.data().studentPhoto)
      }
    } catch (error) {
      console.error("Error fetching admission data:", error)
      toast.error("Failed to fetch admission data. Please try again.")
    }
  }

  const fetchEnquiryData = async (enquiryKey) => {
    try {
      const enquiriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "EnquirySetup",
      )
      const q = query(enquiriesRef, where("enquiryKey", "==", enquiryKey))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const enquiryData = querySnapshot.docs[0].data()
        setFormData((prevData) => ({
          ...prevData,
          ...enquiryData,
        }))
        setPhotoPreview(enquiryData.studentPhoto)
        toast.success("Enquiry data fetched successfully!")
      } else {
        toast.error("No enquiry found with the given key.")
      }
    } catch (error) {
      console.error("Error fetching enquiry data:", error)
      toast.error("Failed to fetch enquiry data. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "enquiryKey") {
      const filtered = enquiryNumbers.filter((key) => key.toLowerCase().includes(value.toLowerCase()))
      setFilteredEnquiryNumbers(filtered)
      setShowDropdown(filtered.length > 0)
    }
  }

  const handleEnquirySelect = (enquiryKey) => {
    setFormData((prev) => ({
      ...prev,
      enquiryKey: enquiryKey,
    }))
    setShowDropdown(false)
    fetchEnquiryData(enquiryKey)
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

  const validateForm = () => {
    const newErrors = {}
    const requiredFields = [
      "studentName",
      "fatherName",
      "motherName",
      "streetVillage",
      "placePincode",
      "district",
      "phoneNumber",
      "nationality",
      "religion",
      "state",
      "community",
      "caste",
      "studentType",
      "studentCategory",
      "standard",
      "section",
      "gender",
      "dateOfBirth",
      "emis",
      "lunchRefresh",
      "bloodGroup",
      "dateOfAdmission",
      "motherTongue",
      "fatherOccupation",
      "motherOccupation",
      "examNumber",
      "busFee",
      "studiedYear",
      "classLastStudied",
      "classToBeAdmitted",
      "nameOfSchool",
      "identificationMark1",
      "identificationMark2",
    ]

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() +
          field
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        } is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Form submission started")
    if (validateForm()) {
      try {
        console.log("Form is valid, attempting to submit")

        let photoUrl = formData.studentPhoto
        if (formData.studentPhoto instanceof File) {
          const storageRef = ref(
            storage,
            `studentPhotos/${auth.currentUser.uid}/${Date.now()}_${formData.studentPhoto.name}`,
          )
          await uploadBytes(storageRef, formData.studentPhoto)
          photoUrl = await getDownloadURL(storageRef)
        }

        const admissionData = {
          ...formData,
          studentPhoto: photoUrl,
        }

        const admissionRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "AdmissionSetup",
        )

        if (id) {
          await setDoc(doc(admissionRef, id), admissionData)
          toast.success("Admission updated successfully!")
        } else {
          await setDoc(doc(admissionRef), admissionData)
          toast.success("Admission submitted successfully!")
        }

        navigate("/admission")
      } catch (error) {
        console.error("Error submitting admission:", error)
        toast.error(`Failed to submit admission: ${error.message}`)
      }
    } else {
      console.log("Form validation failed")
      const missingFields = Object.keys(errors).join(", ")
      toast.error(`Please fill in all required fields. Missing: ${missingFields}`)
    }
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="form-card mt-3">
          <div className="header p-3 custom-btn-clr">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Button variant="link" className="text-white p-0 me-2" onClick={() => navigate("/admission")}>
                  <FaArrowLeft />
                </Button>
                <span>
                  <b>{id ? (isViewMode ? "View Admission" : "Edit Admission") : "Add New Admission"}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="content-wrapper p-4">
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Enquiry Key</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        name="enquiryKey"
                        value={formData.enquiryKey}
                        onChange={handleInputChange}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="Enter or search enquiry key"
                        disabled={isViewMode || id}
                        autoComplete="off"
                      />
                      {showDropdown && filteredEnquiryNumbers.length > 0 && (
                        <div
                          className="position-absolute w-100 bg-white border rounded mt-1"
                          style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                        >
                          {filteredEnquiryNumbers.map((key) => (
                            <div
                              key={key}
                              className="p-2 hover-bg-light"
                              onClick={() => handleEnquirySelect(key)}
                              style={{ cursor: "pointer" }}
                            >
                              {key}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Admission Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="admissionNumber"
                      value={formData.admissionNumber}
                      onChange={handleInputChange}
                      placeholder="Enter admission number"
                      isInvalid={!!errors.admissionNumber}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.admissionNumber}</Form.Control.Feedback>
                  </Form.Group>

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
                      disabled={isViewMode}
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
                      isInvalid={!!errors.studentName}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.studentName}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Father's name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                      isInvalid={!!errors.fatherName}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.fatherName}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mother's name</Form.Label>
                    <Form.Control
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                      isInvalid={!!errors.motherName}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.motherName}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Street/Village</Form.Label>
                    <Form.Control
                      type="text"
                      name="streetVillage"
                      value={formData.streetVillage}
                      onChange={handleInputChange}
                      placeholder="Enter street/village"
                      isInvalid={!!errors.streetVillage}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.streetVillage}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Place/Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      name="placePincode"
                      value={formData.placePincode}
                      onChange={handleInputChange}
                      placeholder="Enter place/pincode"
                      isInvalid={!!errors.placePincode}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.placePincode}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Select
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      isInvalid={!!errors.district}
                      disabled={isViewMode}
                    >
                      <option value="">Select District</option>
                      {setupData.districts.map((district) => (
                        <option key={district.id} value={district.district}>
                          {district.district}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.district}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      isInvalid={!!errors.phoneNumber}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Boarding Point</Form.Label>
                    <Form.Select
                      name="boardingPoint"
                      value={formData.boardingPoint}
                      onChange={handleInputChange}
                      isInvalid={!!errors.boardingPoint}
                      disabled={isViewMode}
                    >
                      <option value="">Select Boarding Point</option>
                      {setupData.boardingPoints.map((point) => (
                        <option key={point.id} value={point.placeName}>
                          {point.placeName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.boardingPoint}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Bus Route Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="busRouteNumber"
                      value={formData.busRouteNumber}
                      onChange={handleInputChange}
                      placeholder="Enter bus route number"
                      disabled={isViewMode}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email ID</Form.Label>
                    <Form.Control
                      type="email"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      disabled={isViewMode}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Communication Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="communicationAddress"
                      value={formData.communicationAddress}
                      onChange={handleInputChange}
                      placeholder="Enter communication address"
                      disabled={isViewMode}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Nationality</Form.Label>
                    <Form.Select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      isInvalid={!!errors.nationality}
                      disabled={isViewMode}
                    >
                      <option value="">Select Nationality</option>
                      {setupData.nationalities.map((nat) => (
                        <option key={nat.id} value={nat.nationality}>
                          {nat.nationality}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.nationality}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Religion</Form.Label>
                    <Form.Select
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      isInvalid={!!errors.religion}
                      disabled={isViewMode}
                    >
                      <option value="">Select Religion</option>
                      {setupData.religions.map((rel) => (
                        <option key={rel.id} value={rel.religion}>
                          {rel.religion}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.religion}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      isInvalid={!!errors.state}
                      disabled={isViewMode}
                    >
                      <option value="">Select State</option>
                      {setupData.states.map((state) => (
                        <option key={state.id} value={state.state}>
                          {state.state}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.state}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Community</Form.Label>
                    <Form.Select
                      name="community"
                      value={formData.community}
                      onChange={handleInputChange}
                      isInvalid={!!errors.community}
                      disabled={isViewMode}
                    >
                      <option value="">Select Community</option>
                      {setupData.communities.map((comm) => (
                        <option key={comm.id} value={comm.community}>
                          {comm.community}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.community}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Caste</Form.Label>
                    <Form.Select
                      name="caste"
                      value={formData.caste}
                      onChange={handleInputChange}
                      isInvalid={!!errors.caste}
                      disabled={isViewMode}
                    >
                      <option value="">Select Caste</option>
                      {setupData.castes.map((caste) => (
                        <option key={caste.id} value={caste.caste}>
                          {caste.caste}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.caste}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Student Type</Form.Label>
                    <Form.Select
                      name="studentType"
                      value={formData.studentType}
                      onChange={handleInputChange}
                      isInvalid={!!errors.studentType}
                      disabled={isViewMode}
                    >
                      <option value="">Select Student Type</option>
                      <option value="New">New</option>
                      <option value="Existing">Existing</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.studentType}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Student Category</Form.Label>
                    <Form.Select
                      name="studentCategory"
                      value={formData.studentCategory}
                      onChange={handleInputChange}
                      isInvalid={!!errors.studentCategory}
                      disabled={isViewMode}
                    >
                      <option value="">Select Category</option>
                      {setupData.studentCategories.map((category) => (
                        <option key={category.id} value={category.StudentCategoryName}>
                          {category.StudentCategoryName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.studentCategory}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Standard</Form.Label>
                    <Form.Select
                      name="standard"
                      value={formData.standard}
                      onChange={handleInputChange}
                      isInvalid={!!errors.standard}
                      disabled={isViewMode}
                    >
                      <option value="">Select Standard</option>
                      {setupData.courses.map((course) => (
                        <option key={course.id} value={course.standard}>
                          {course.standard}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.standard}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      isInvalid={!!errors.section}
                      disabled={isViewMode}
                    >
                      <option value="">Select Section</option>
                      {setupData.sections.map((section) => (
                        <option key={section.id} value={section.name}>
                          {section.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.section}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      isInvalid={!!errors.gender}
                      disabled={isViewMode}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      isInvalid={!!errors.dateOfBirth}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>EMIS</Form.Label>
                    <Form.Control
                      type="text"
                      name="emis"
                      value={formData.emis}
                      onChange={handleInputChange}
                      placeholder="Enter EMIS number"
                      isInvalid={!!errors.emis}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.emis}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Lunch / Refresh</Form.Label>
                    <Form.Select
                      name="lunchRefresh"
                      value={formData.lunchRefresh}
                      onChange={handleInputChange}
                      isInvalid={!!errors.lunchRefresh}
                      disabled={isViewMode}
                    >
                      <option value="">Select Option</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Refresh">Refresh</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.lunchRefresh}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Blood Group</Form.Label>
                    <Form.Select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      isInvalid={!!errors.bloodGroup}
                      disabled={isViewMode}
                    >
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
                    <Form.Control.Feedback type="invalid">{errors.bloodGroup}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date of Admission</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfAdmission"
                      value={formData.dateOfAdmission}
                      onChange={handleInputChange}
                      isInvalid={!!errors.dateOfAdmission}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.dateOfAdmission}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mother Tongue</Form.Label>
                    <Form.Select
                      name="motherTongue"
                      value={formData.motherTongue}
                      onChange={handleInputChange}
                      isInvalid={!!errors.motherTongue}
                      disabled={isViewMode}
                    >
                      <option value="">Select Mother Tongue</option>
                      {setupData.motherTongues.map((mt) => (
                        <option key={mt.id} value={mt.MotherTongueName}>
                          {mt.MotherTongueName}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.motherTongue}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Father's Occupation</Form.Label>
                    <Form.Control
                      type="text"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleInputChange}
                      placeholder="Enter father's occupation"
                      isInvalid={!!errors.fatherOccupation}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.fatherOccupation}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mother's Occupation</Form.Label>
                    <Form.Control
                      type="text"
                      name="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={handleInputChange}
                      placeholder="Enter mother's occupation"
                      isInvalid={!!errors.motherOccupation}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.motherOccupation}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Exam Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="examNumber"
                      value={formData.examNumber}
                      onChange={handleInputChange}
                      placeholder="Enter exam number"
                      isInvalid={!!errors.examNumber}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.examNumber}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bus Fee</Form.Label>
                    <Form.Control
                      type="number"
                      name="busFee"
                      value={formData.busFee}
                      onChange={handleInputChange}
                      placeholder="Enter bus fee"
                      isInvalid={!!errors.busFee}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.busFee}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Studied Year</Form.Label>
                    <Form.Control
                      type="text"
                      name="studiedYear"
                      value={formData.studiedYear}
                      onChange={handleInputChange}
                      placeholder="Enter studied year"
                      isInvalid={!!errors.studiedYear}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.studiedYear}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Class Last Studied</Form.Label>
                    <Form.Control
                      type="text"
                      name="classLastStudied"
                      value={formData.classLastStudied}
                      onChange={handleInputChange}
                      placeholder="Enter class last studied"
                      isInvalid={!!errors.classLastStudied}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.classLastStudied}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Class to be Admitted</Form.Label>
                    <Form.Control
                      type="text"
                      name="classToBeAdmitted"
                      value={formData.classToBeAdmitted}
                      onChange={handleInputChange}
                      placeholder="Enter class to be admitted"
                      isInvalid={!!errors.classToBeAdmitted}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.classToBeAdmitted}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name of the School</Form.Label>
                    <Form.Control
                      type="text"
                      name="nameOfSchool"
                      value={formData.nameOfSchool}
                      onChange={handleInputChange}
                      placeholder="Enter name of the school"
                      isInvalid={!!errors.nameOfSchool}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.nameOfSchool}</Form.Control.Feedback>
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
                      placeholder="Enter remarks"
                      disabled={isViewMode}
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
                      placeholder="Enter identification mark 1"
                      isInvalid={!!errors.identificationMark1}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.identificationMark1}</Form.Control.Feedback>
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
                      placeholder="Enter identification mark 2"
                      isInvalid={!!errors.identificationMark2}
                      disabled={isViewMode}
                    />
                    <Form.Control.Feedback type="invalid">{errors.identificationMark2}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" size="md" className="me-2" onClick={() => navigate("/admission")}>
                  Cancel
                </Button>
                {!isViewMode && (
                  <Button className="custom-btn-clr" size="sm" type="submit">
                    {id ? "Update Admission" : "Submit Admission"}
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </div>
        <ToastContainer />
      </Container>
    </MainContentPage>
  )
}

export default AdmissionForm

