"use client"

import { useState, useEffect, useRef } from "react"
import { Container, Form, Button, Row, Col } from "react-bootstrap"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Link, useNavigate, useParams, useLocation } from "react-router-dom"
import { db, auth, storage } from "../../Firebase/config"
import { collection, getDocs, getDoc, updateDoc, addDoc, doc, query, limit, where } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaArrowLeft } from "react-icons/fa"
import defaultStudentPhoto from "../../images/StudentProfileIcon/studentProfile.jpeg"

const EnquiryForm = () => {
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
    districtId: "",
    district: "",
    phoneNumber: "",
    boardingPointId: "",
    boardingPoint: "",
    busRouteNumberId: "",
    busRouteNumber: "",
    emailId: "",
    communicationAddress: "",
    nationalityId: "",
    nationality: "",
    religionId: "",
    religion: "",
    stateId: "",
    state: "",
    communityId: "",
    community: "",
    casteId: "",
    caste: "",
    studentType: "",
    studentCategoryId: "",
    studentCategory: "",
    standardId: "",
    standard: "",
    sectionId: "",
    section: "",
    gender: "",
    dateOfBirth: "",
    emis: "",
    lunchRefresh: "",
    bloodGroup: "",
    dateOfAdmission: "",
    motherTongueId: "",
    motherTongue: "",
    fatherOccupationId: "",
    fatherOccupation: "",
    motherOccupationId: "",
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
    transportId: null,
  })

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
    const fetchTransportId = async () => {
      try {
        const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
        const transportSnapshot = await getDocs(transportRef)
        if (!transportSnapshot.empty) {
          const transportId = transportSnapshot.docs[0].id
          setSetupData((prevData) => ({ ...prevData, transportId }))
        }
      } catch (error) {
        console.error("Error fetching Transport ID:", error)
        toast.error("Failed to fetch transport data. Please try again.")
      }
    }

    fetchTransportId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchSetupData()
      if (id) {
        fetchEnquiryData(id)
      } else {
        generateEnquiryKey()
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

      if (setupData.transportId) {
        // Fetch bus routes
        const routeRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Transport",
          setupData.transportId,
          "RouteSetup",
        )
        const routeSnapshot = await getDocs(routeRef)
        const routeData = routeSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

        setSetupData((prevData) => ({
          ...prevData,
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
          parentOccupations: parentOccupationData,
          busRoutes: routeData,
        }))
      }
    } catch (error) {
      console.error("Error fetching setup data:", error)
      toast.error("Failed to fetch setup data. Please try again.")
    }
  }

  const fetchEnquiryData = async (enquiryId) => {
    try {
      const enquiryRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "EnquirySetup",
        enquiryId,
      )
      const enquirySnap = await getDoc(enquiryRef)
      if (enquirySnap.exists()) {
        const enquiryData = enquirySnap.data()
        setFormData(enquiryData)
        setPhotoPreview(enquiryData.studentPhoto || defaultStudentPhoto)
      } else {
        toast.error("Enquiry not found")
        navigate("/admission/enquiry")
      }
    } catch (error) {
      console.error("Error fetching enquiry data:", error)
      toast.error("Failed to fetch enquiry data. Please try again.")
    }
  }

  const generateEnquiryKey = async () => {
    try {
      const enquiriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "EnquirySetup",
      )
      const q = query(enquiriesRef, where("enquiryKey", "!=", ""))
      const querySnapshot = await getDocs(q)
      const lastEnquiryKey = querySnapshot.docs
        .map((doc) => doc.data().enquiryKey)
        .sort((a, b) => {
          const aNum = Number.parseInt(a.replace("ENQ", ""))
          const bNum = Number.parseInt(b.replace("ENQ", ""))
          return bNum - aNum
        })[0]

      let newEnquiryNumber = 1
      if (lastEnquiryKey) {
        newEnquiryNumber = Number.parseInt(lastEnquiryKey.replace("ENQ", "")) + 1
      }

      const newEnquiryKey = `ENQ${newEnquiryNumber}`
      setFormData((prevData) => ({ ...prevData, enquiryKey: newEnquiryKey }))
    } catch (error) {
      console.error("Error generating enquiry key:", error)
      toast.error("Failed to generate enquiry key. Please try again.")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    const [id, displayValue] = value.split("|")
    setFormData((prevState) => ({
      ...prevState,
      [`${name}Id`]: id,
      [name]: displayValue,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
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
      "boardingPoint",
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
    if (validateForm()) {
      try {
        let photoUrl = formData.studentPhoto
        if (formData.studentPhoto instanceof File) {
          const storageRef = ref(
            storage,
            `studentPhotos/${auth.currentUser.uid}/${Date.now()}_${formData.studentPhoto.name}`,
          )
          await uploadBytes(storageRef, formData.studentPhoto)
          photoUrl = await getDownloadURL(storageRef)
        }

        const enquiryData = {
          ...formData,
          studentPhoto: photoUrl,
        }

        const enquiryRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "EnquirySetup",
        )

        if (id) {
          await updateDoc(doc(enquiryRef, id), enquiryData)
          toast.success("Enquiry updated successfully!")
        } else {
          await addDoc(enquiryRef, enquiryData)
          toast.success("Enquiry submitted successfully!")
        }

        navigate("/admission/enquiry")
      } catch (error) {
        console.error("Error submitting enquiry:", error)
        toast.error(`Failed to submit enquiry: ${error.message}`)
      }
    } else {
      toast.error("Please fill in all required fields.")
    }
  }

  const handleBack = () => {
    navigate("/admission/enquiry")
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Admission</span>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admission/enquiry">Enquiry</Link>
            <span className="separator mx-2">&gt;</span>
            <span>{isViewMode ? "View Enquiry" : id ? "Edit Enquiry" : "Add Enquiry"}</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <Button variant="link" className="text-white p-0 back-button me-3" onClick={handleBack}>
              <FaArrowLeft size={20} />
            </Button>
            <h2 className="mb-0">{isViewMode ? "View Enquiry" : id ? "Edit Enquiry" : "Add Enquiry"}</h2>
          </div>
          <div style={{ width: "20px" }}></div>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form onSubmit={handleSubmit} className="h-100">
            <Row className="h-100">
              {/* Left Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Enquiry Key</Form.Label>
                  <Form.Control type="text" name="enquiryKey" value={formData.enquiryKey} readOnly disabled />
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
                    <img
                      src={photoPreview || "/placeholder.svg"}
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

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Student Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter student name"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.studentName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.studentName}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="Enter father's name"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.fatherName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.fatherName}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Mother's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    placeholder="Enter mother's name"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.motherName}
                  />
                  <Form.Control.Feedback type="invalid">{errors.motherName}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Middle Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Street/Village</Form.Label>
                  <Form.Control
                    type="text"
                    name="streetVillage"
                    value={formData.streetVillage}
                    onChange={handleInputChange}
                    placeholder="Enter street/village"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.streetVillage}
                  />
                  <Form.Control.Feedback type="invalid">{errors.streetVillage}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Place/Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="placePincode"
                    value={formData.placePincode}
                    onChange={handleInputChange}
                    placeholder="Enter place/pincode"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.placePincode}
                  />
                  <Form.Control.Feedback type="invalid">{errors.placePincode}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    name="district"
                    value={`${formData.districtId}|${formData.district}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.district}
                  >
                    <option value="">Select District</option>
                    {setupData.districts.map((district) => (
                      <option key={district.id} value={`${district.id}|${district.district}`}>
                        {district.district}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.district}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.phoneNumber}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Boarding Point</Form.Label>
                  <Form.Select
                    name="boardingPoint"
                    value={`${formData.boardingPointId}|${formData.boardingPoint}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.boardingPoint}
                  >
                    <option value="">Select Boarding Point</option>
                    {setupData.boardingPoints.map((point) => (
                      <option key={point.id} value={`${point.id}|${point.placeName}`}>
                        {point.placeName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.boardingPoint}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Bus Route Number</Form.Label>
                  <Form.Select
                    name="busRouteNumber"
                    value={`${formData.busRouteNumberId}|${formData.busRouteNumber}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.busRouteNumber}
                  >
                    <option value="">Select Bus Route Number</option>
                    {setupData.busRoutes.map((route) => (
                      <option key={route.id} value={`${route.id}|${route.route}`}>
                        {route.route}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.busRouteNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Right Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Email ID</Form.Label>
                  <Form.Control
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleInputChange}
                    placeholder="Enter email ID"
                    disabled={isViewMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
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

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select
                    name="nationality"
                    value={`${formData.nationalityId}|${formData.nationality}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.nationality}
                  >
                    <option value="">Select Nationality</option>
                    {setupData.nationalities.map((nationality) => (
                      <option key={nationality.id} value={`${nationality.id}|${nationality.nationality}`}>
                        {nationality.nationality}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.nationality}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Religion</Form.Label>
                  <Form.Select
                    name="religion"
                    value={`${formData.religionId}|${formData.religion}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.religion}
                  >
                    <option value="">Select Religion</option>
                    {setupData.religions.map((religion) => (
                      <option key={religion.id} value={`${religion.id}|${religion.religion}`}>
                        {religion.religion}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.religion}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state"
                    value={`${formData.stateId}|${formData.state}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.state}
                  >
                    <option value="">Select State</option>
                    {setupData.states.map((state) => (
                      <option key={state.id} value={`${state.id}|${state.state}`}>
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
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Community</Form.Label>
                  <Form.Select
                    name="community"
                    value={`${formData.communityId}|${formData.community}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.community}
                  >
                    <option value="">Select Community</option>
                    {setupData.communities.map((community) => (
                      <option key={community.id} value={`${community.id}|${community.community}`}>
                        {community.community}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.community}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Caste</Form.Label>
                  <Form.Select
                    name="caste"
                    value={`${formData.casteId}|${formData.caste}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.caste}
                  >
                    <option value="">Select Caste</option>
                    {setupData.castes.map((caste) => (
                      <option key={caste.id} value={`${caste.id}|${caste.caste}`}>
                        {caste.caste}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.caste}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Student Type</Form.Label>
                  <Form.Select
                    name="studentType"
                    value={formData.studentType}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.studentType}
                  >
                    <option value="">Select Student Type</option>
                    <option value="New">New</option>
                    <option value="Existing">Existing</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.studentType}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Student Category</Form.Label>
                  <Form.Select
                    name="studentCategory"
                    value={`${formData.studentCategoryId}|${formData.studentCategory}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.studentCategory}
                  >
                    <option value="">Select Student Category</option>
                    {setupData.studentCategories.map((category) => (
                      <option key={category.id} value={`${category.id}|${category.StudentCategoryName}`}>
                        {category.StudentCategoryName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.studentCategory}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Standard</Form.Label>
                  <Form.Select
                    name="standard"
                    value={`${formData.standardId}|${formData.standard}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.standard}
                  >
                    <option value="">Select Standard</option>
                    {setupData.courses.map((course) => (
                      <option key={course.id} value={`${course.id}|${course.standard}`}>
                        {course.standard}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.standard}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    name="section"
                    value={`${formData.sectionId}|${formData.section}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.section}
                  >
                    <option value="">Select Section</option>
                    {setupData.sections.map((section) => (
                      <option key={section.id} value={`${section.id}|${section.name}`}>
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
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.gender}
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
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.dateOfBirth}
                    ref={dateOfBirthRef}
                    onClick={() => handleDateInputClick(dateOfBirthRef)}
                  />
                  <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>EMIS</Form.Label>
                  <Form.Control
                    type="text"
                    name="emis"
                    value={formData.emis}
                    onChange={handleInputChange}
                    placeholder="Enter EMIS number"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.emis}
                  />
                  <Form.Control.Feedback type="invalid">{errors.emis}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Lunch / Refresh</Form.Label>
                  <Form.Select
                    name="lunchRefresh"
                    value={formData.lunchRefresh}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.lunchRefresh}
                  >
                    <option value="">Select Option</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Refresh">Refresh</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.lunchRefresh}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.bloodGroup}
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
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Date of Admission</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfAdmission"
                    value={formData.dateOfAdmission}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.dateOfAdmission}
                    ref={dateOfAdmissionRef}
                    onClick={() => handleDateInputClick(dateOfAdmissionRef)}
                  />
                  <Form.Control.Feedback type="invalid">{errors.dateOfAdmission}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Mother Tongue</Form.Label>
                  <Form.Select
                    name="motherTongue"
                    value={`${formData.motherTongueId}|${formData.motherTongue}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.motherTongue}
                  >
                    <option value="">Select Mother Tongue</option>
                    {setupData.motherTongues.map((mt) => (
                      <option key={mt.id} value={`${mt.id}|${mt.MotherTongueName}`}>
                        {mt.MotherTongueName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.motherTongue}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Father's Occupation</Form.Label>
                  <Form.Select
                    name="fatherOccupation"
                    value={`${formData.fatherOccupationId}|${formData.fatherOccupation}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.fatherOccupation}
                  >
                    <option value="">Select Father's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={`${occupation.id}|${occupation.name}`}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.fatherOccupation}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Mother's Occupation</Form.Label>
                  <Form.Select
                    name="motherOccupation"
                    value={`${formData.motherOccupationId}|${formData.motherOccupation}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.motherOccupation}
                  >
                    <option value="">Select Mother's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={`${occupation.id}|${occupation.name}`}>
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
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Exam Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="examNumber"
                    value={formData.examNumber}
                    onChange={handleInputChange}
                    placeholder="Enter exam number"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.examNumber}
                  />
                  <Form.Control.Feedback type="invalid">{errors.examNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Bus Fee</Form.Label>
                  <Form.Control
                    type="number"
                    name="busFee"
                    value={formData.busFee}
                    onChange={handleInputChange}
                    placeholder="Enter bus fee"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.busFee}
                  />
                  <Form.Control.Feedback type="invalid">{errors.busFee}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <h5 className="mt-4 mb-3">Previous Studied Details</h5>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Studied Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="studiedYear"
                    value={formData.studiedYear}
                    onChange={handleInputChange}
                    placeholder="Enter studied year"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.studiedYear}
                  />
                  <Form.Control.Feedback type="invalid">{errors.studiedYear}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Class Last Studied</Form.Label>
                  <Form.Control
                    type="text"
                    name="classLastStudied"
                    value={formData.classLastStudied}
                    onChange={handleInputChange}
                    placeholder="Enter class last studied"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.classLastStudied}
                  />
                  <Form.Control.Feedback type="invalid">{errors.classLastStudied}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Class to be Admitted</Form.Label>
                  <Form.Control
                    type="text"
                    name="classToBeAdmitted"
                    value={formData.classToBeAdmitted}
                    onChange={handleInputChange}
                    placeholder="Enter class to be admitted"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.classToBeAdmitted}
                  />
                  <Form.Control.Feedback type="invalid">{errors.classToBeAdmitted}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Name of the School</Form.Label>
                  <Form.Control
                    type="text"
                    name="nameOfSchool"
                    value={formData.nameOfSchool}
                    onChange={handleInputChange}
                    placeholder="Enter name of the school"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.nameOfSchool}
                  />
                  <Form.Control.Feedback type="invalid">{errors.nameOfSchool}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3 flex-grow-1">
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
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Identification Mark 1</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificationMark1"
                    value={formData.identificationMark1}
                    onChange={handleInputChange}
                    placeholder="Enter identification mark 1"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.identificationMark1}
                  />
                  <Form.Control.Feedback type="invalid">{errors.identificationMark1}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Identification Mark 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificationMark2"
                    value={formData.identificationMark2}
                    onChange={handleInputChange}
                    placeholder="Enter identification mark 2"
                    required
                    disabled={isViewMode}
                    isInvalid={!!errors.identificationMark2}
                  />
                  <Form.Control.Feedback type="invalid">{errors.identificationMark2}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" size="md" className="me-2" onClick={() => navigate("/admission/enquiry")}>
                Cancel
              </Button>
              {!isViewMode && (
                <Button className="custom-btn-clr" size="md" type="submit">
                  {id ? "Update Enquiry" : "Submit Enquiry"}
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

          .custom-btn-clr {
            background: #0B3D7B;
            color:rgb(255, 255, 255);
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
        `}
      </style>
    </MainContentPage>
  )
}

export default EnquiryForm

