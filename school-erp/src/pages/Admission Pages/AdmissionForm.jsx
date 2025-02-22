"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { Form, Button, Row, Col, Container } from "react-bootstrap"
import { db, auth, storage } from "../../Firebase/config"
import { doc, getDoc, setDoc, collection, getDocs, query, limit, where, orderBy } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import defaultStudentPhoto from "../../images/StudentProfileIcon/studentProfile.jpeg"

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
  const [photoPreview, setPhotoPreview] = useState(defaultStudentPhoto)
  const fileInputRef = useRef(null)
  const dateOfBirthRef = useRef(null)
  const dateOfAdmissionRef = useRef(null)
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
    busRoutes: [],
    parentOccupations: [],
    bloodGroups: [],
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
      } else {
        generateAdmissionNumber()
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
        parentOccupationData,
        bloodGroupData,
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
        fetchData("ParentOccupation"),
        fetchData("BloodGroupSetup"),
      ])

      // Fetch boarding points from PlaceSetup
      const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
      const transportSnapshot = await getDocs(transportRef)
      let boardingPointData = []
      let busRouteData = []
      if (!transportSnapshot.empty) {
        const transportId = transportSnapshot.docs[0].id
        const placeSetupRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "PlaceSetup")
        const placeSetupSnapshot = await getDocs(placeSetupRef)
        boardingPointData = placeSetupSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        const routeSetupRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "RouteSetup")
        const routeSetupSnapshot = await getDocs(routeSetupRef)
        busRouteData = routeSetupSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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
        busRoutes: busRouteData,
        parentOccupations: parentOccupationData,
        bloodGroups: bloodGroupData,
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
        setPhotoPreview(admissionSnap.data().studentPhoto || defaultStudentPhoto)
      }
    } catch (error) {
      console.error("Error fetching admission data:", error)
      toast.error("Failed to fetch admission data. Please try again.")
    }
  }

  const generateAdmissionNumber = async () => {
    try {
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )
      const q = query(admissionsRef, orderBy("admissionNumber", "desc"), limit(1))
      const querySnapshot = await getDocs(q)

      let newAdmissionNumber = "ADM1"
      if (!querySnapshot.empty) {
        const lastAdmissionNumber = querySnapshot.docs[0].data().admissionNumber
        const lastNumber = Number.parseInt(lastAdmissionNumber.replace("ADM", ""))
        newAdmissionNumber = `ADM${lastNumber + 1}`
      }

      setFormData((prev) => ({ ...prev, admissionNumber: newAdmissionNumber }))
    } catch (error) {
      console.error("Error generating admission number:", error)
      toast.error("Failed to generate admission number. Please try again.")
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
          admissionNumber: prevData.admissionNumber, // Preserve the existing admission number
        }))
        setPhotoPreview(enquiryData.studentPhoto || defaultStudentPhoto)
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

    // Allow manual editing of admission number
    if (name === "admissionNumber") {
      if (!value.startsWith("ADM")) {
        setFormData((prev) => ({
          ...prev,
          admissionNumber: "ADM" + value,
        }))
      }
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

  const handleDateInputClick = (ref) => {
    ref.current.showPicker()
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

        // Redirect to the StudentDetails page
        navigate("/admission/StudentDetails")
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

  const handleBack = () => {
    navigate("/admission")
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admission">Admission</Link>
            <span className="separator mx-2">&gt;</span>
            <span>{isViewMode ? "View Admission" : id ? "Edit Admission" : "Add Admission"}</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">{isViewMode ? "View Admission" : id ? "Edit Admission" : "Add Admission"}</h2>
          </div>
          <div style={{ width: "20px" }}></div>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Left Column */}
              <Col md={4} className="d-flex flex-column">
                <div className="text-center mb-3">
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
                    <img
                      src={photoPreview || defaultStudentPhoto}
                      alt="Student"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
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

                <Form.Group className="flex-grow-1">
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
                            className="p-2 hover-bg-light cursor-pointer"
                            onClick={() => handleEnquirySelect(key)}
                          >
                            {key}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Form.Group>

                <Form.Group className="flex-grow-1">
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

                <Form.Group className="flex-grow-1">
                  <Form.Label>Student Name</Form.Label>
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

                <Form.Group className="flex-grow-1">
                  <Form.Label>Father's Name</Form.Label>
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

                <Form.Group className="flex-grow-1">
                  <Form.Label>Mother's Name</Form.Label>
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
                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
                  <Form.Label>Bus Route Number</Form.Label>
                  <Form.Select
                    name="busRouteNumber"
                    value={formData.busRouteNumber}
                    onChange={handleInputChange}
                    isInvalid={!!errors.busRouteNumber}
                    disabled={isViewMode}
                  >
                    <option value="">Select Bus Route Number</option>
                    {setupData.busRoutes.map((route) => (
                      <option key={route.id} value={route.route}>
                        {route.route}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.busRouteNumber}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="">
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

                <Form.Group className="">
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
              </Col>

              <Col md={4}>
                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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

                <Form.Group className="">
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
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="">
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
              </Col>
              <Col md={4}>
                <Form.Group className="">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    isInvalid={!!errors.dateOfBirth}
                    disabled={isViewMode}
                    ref={dateOfBirthRef}
                    onClick={() => handleDateInputClick(dateOfBirthRef)}
                  />
                  <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="">
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
                <Form.Group className="">
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
              </Col>
              <Col md={4}>
                <Form.Group className="">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    isInvalid={!!errors.bloodGroup}
                    disabled={isViewMode}
                  >
                    <option value="">Select Blood Group</option>
                    {setupData.bloodGroups.map((bloodGroup) => (
                      <option key={bloodGroup.id} value={bloodGroup.name}>
                        {bloodGroup.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.bloodGroup}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="">
                  <Form.Label>Date of Admission</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfAdmission"
                    value={formData.dateOfAdmission}
                    onChange={handleInputChange}
                    isInvalid={!!errors.dateOfAdmission}
                    disabled={isViewMode}
                    ref={dateOfAdmissionRef}
                    onClick={() => handleDateInputClick(dateOfAdmissionRef)}
                  />
                  <Form.Control.Feedback type="invalid">{errors.dateOfAdmission}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="">
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
                <Form.Group className="">
                  <Form.Label>Father's Occupation</Form.Label>
                  <Form.Select
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleInputChange}
                    isInvalid={!!errors.fatherOccupation}
                    disabled={isViewMode}
                  >
                    <option value="">Select Father's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.name}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.fatherOccupation}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="">
                  <Form.Label>Mother's Occupation</Form.Label>
                  <Form.Select
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleInputChange}
                    isInvalid={!!errors.motherOccupation}
                    disabled={isViewMode}
                  >
                    <option value="">Select Mother's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.name}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.motherOccupation}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
                <Form.Group className="">
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
              {!isViewMode && (
                <Button className="custom-btn-premium" size="lg" type="submit">
                  {id ? "Update Admission" : "Submit Admission"}
                </Button>
              )}
            </div>
          </Form>
        </div>
        <ToastContainer />
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

          .custom-breadcrumb .current {
            color: #212529;
          }

          .custom-btn-premium {
            background: linear-gradient(to bottom, #1565C0, #0B3D7B);
            border: none;
            color: white;
            padding: 10px 20px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }

          .custom-btn-premium:hover {
            background: linear-gradient(to bottom, #1565C0, #0B3D7B);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .back-button {
            transition: opacity 0.2s;
          }

          .back-button:hover {
            opacity: 0.8;
          }

          h2 {
            font-size: 1.5rem;
            margin-bottom: 0;
          }

          /* Toastify custom styles */
          .Toastify__toast-container {
            z-index: 9999;
          }

          .Toastify__toast {
            background-color: #0B3D7B;
            color: white;
          }

          .Toastify__toast--success {
            background-color: #0B3D7B;
          }

          .Toastify__toast--error {
            background-color: #dc3545;
          }

          .Toastify__progress-bar {
            background-color: rgba(255, 255, 255, 0.7);
          }
          .form-group {
            margin-bottom: 0.5rem;
          }
          .form-control, .form-select {
            margin-bottom: 0.5rem;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default AdmissionForm