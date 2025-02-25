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
    bloodGroupId: "",
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
    bloodGroups: [],
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
          bloodGroups: bloodGroupData,
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
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admission">Admission</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admission/enquiry">Enquiry</Link>
            <span className="separator mx-2">&gt;</span>
            <span>{isViewMode ? "View Enquiry" : id ? "Edit Enquiry" : "Add Enquiry"}</span>
          </nav>
        </div>

        {/* Card Header */}
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <div className="d-flex align-items-center">
            <h2 className="mb-0">{isViewMode ? "View Enquiry" : id ? "Edit Enquiry" : "Add Enquiry"}</h2>
          </div>
          <div style={{ width: "20px" }}></div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-4 rounded-bottom shadow">
          <Form onSubmit={handleSubmit} className="enquiry-form">
            <Row>
              <Col md={6}>
                {/* Student Photo Section */}
                <div className="text-center mb-4">
                  <h3 className="section-title">Student Photo</h3>
                  <div
                    className="photo-upload-circle mx-auto"
                    onClick={handlePhotoClick}
                    style={{
                      width: "200px",
                      height: "200px",
                      border: "2px dashed #ccc",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                      backgroundColor: "#f8f9fa",
                      marginBottom: "20px",
                    }}
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview || "/placeholder.svg"}
                        alt="Student"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="text-center">
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
              </Col>
              <Col md={6}>
                {/* Enquiry Key Preview */}
                <div className="text-center mb-4">
                  <h3 className="section-title">Enquiry Key</h3>
                  <div
                    className="enquiry-key-container mx-auto"
                    style={{
                      width: "200px",
                      height: "200px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: "#0B3D7B",
                    }}
                  >
                    {formData.enquiryKey}
                  </div>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                {/* Basic Details */}
                <Form.Group className="mb-3">
                  <Form.Label>Student Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Father's Occupation</Form.Label>
                  <Form.Select
                    name="fatherOccupation"
                    value={`${formData.fatherOccupationId}|${formData.fatherOccupation}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Father's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={`${occupation.id}|${occupation.name}`}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother's Occupation</Form.Label>
                  <Form.Select
                    name="motherOccupation"
                    value={`${formData.motherOccupationId}|${formData.motherOccupation}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Mother's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={`${occupation.id}|${occupation.name}`}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Personal Details */}
                <h3 className="section-title mt-4">Personal Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email ID</Form.Label>
                  <Form.Control
                    type="email"
                    name="emailId"
                    value={formData.emailId}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
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
                    disabled={isViewMode}
                    className="form-control-blue"
                    ref={dateOfBirthRef}
                    onClick={() => handleDateInputClick(dateOfBirthRef)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    name="bloodGroup"
                    value={`${formData.bloodGroupId}|${formData.bloodGroup}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Blood Group</option>
                    {setupData.bloodGroups.map((bg) => (
                      <option key={bg.id} value={`${bg.id}|${bg.name}`}>
                        {bg.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select
                    name="nationality"
                    value={`${formData.nationalityId}|${formData.nationality}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Nationality</option>
                    {setupData.nationalities.map((nat) => (
                      <option key={nat.id} value={`${nat.id}|${nat.nationality}`}>
                        {nat.nationality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Religion</Form.Label>
                  <Form.Select
                    name="religion"
                    value={`${formData.religionId}|${formData.religion}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Religion</option>
                    {setupData.religions.map((rel) => (
                      <option key={rel.id} value={`${rel.id}|${rel.religion}`}>
                        {rel.religion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Community</Form.Label>
                  <Form.Select
                    name="community"
                    value={`${formData.communityId}|${formData.community}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Community</option>
                    {setupData.communities.map((comm) => (
                      <option key={comm.id} value={`${comm.id}|${comm.community}`}>
                        {comm.community}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Caste</Form.Label>
                  <Form.Select
                    name="caste"
                    value={`${formData.casteId}|${formData.caste}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Caste</option>
                    {setupData.castes.map((caste) => (
                      <option key={caste.id} value={`${caste.id}|${caste.caste}`}>
                        {caste.caste}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother Tongue</Form.Label>
                  <Form.Select
                    name="motherTongue"
                    value={`${formData.motherTongueId}|${formData.motherTongue}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Mother Tongue</option>
                    {setupData.motherTongues.map((mt) => (
                      <option key={mt.id} value={`${mt.id}|${mt.MotherTongueName}`}>
                        {mt.MotherTongueName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Address Details */}
                <h3 className="section-title">Address Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Street/Village</Form.Label>
                  <Form.Control
                    type="text"
                    name="streetVillage"
                    value={formData.streetVillage}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Place/Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="placePincode"
                    value={formData.placePincode}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state"
                    value={`${formData.stateId}|${formData.state}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select State</option>
                    {setupData.states.map((state) => (
                      <option key={state.id} value={`${state.id}|${state.state}`}>
                        {state.state}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    name="district"
                    value={`${formData.districtId}|${formData.district}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select District</option>
                    {setupData.districts.map((district) => (
                      <option key={district.id} value={`${district.id}|${district.district}`}>
                        {district.district}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Communication Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="communicationAddress"
                    value={formData.communicationAddress}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                {/* Academic Details */}
                <h3 className="section-title mt-4">Academic Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Student Type</Form.Label>
                  <Form.Select
                    name="studentType"
                    value={formData.studentType}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Student Type</option>
                    <option value="New">New</option>
                    <option value="Existing">Existing</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Student Category</Form.Label>
                  <Form.Select
                    name="studentCategory"
                    value={`${formData.studentCategoryId}|${formData.studentCategory}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Category</option>
                    {setupData.studentCategories.map((category) => (
                      <option key={category.id} value={`${category.id}|${category.StudentCategoryName}`}>
                        {category.StudentCategoryName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Standard</Form.Label>
                  <Form.Select
                    name="standard"
                    value={`${formData.standardId}|${formData.standard}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Standard</option>
                    {setupData.courses.map((course) => (
                      <option key={course.id} value={`${course.id}|${course.standard}`}>
                        {course.standard}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    name="section"
                    value={`${formData.sectionId}|${formData.section}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Section</option>
                    {setupData.sections.map((section) => (
                      <option key={section.id} value={`${section.id}|${section.name}`}>
                        {section.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>EMIS</Form.Label>
                  <Form.Control
                    type="text"
                    name="emis"
                    value={formData.emis}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Lunch / Refresh</Form.Label>
                  <Form.Control
                    type="text"
                    name="lunchRefresh"
                    value={formData.lunchRefresh}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date Of Admission</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfAdmission"
                    value={formData.dateOfAdmission}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                    ref={dateOfAdmissionRef}
                    onClick={() => handleDateInputClick(dateOfAdmissionRef)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Exam Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="examNumber"
                    value={formData.examNumber}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                {/* Bus Transport Details */}
                <h3 className="section-title mt-4">Bus Transport Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Boarding Point</Form.Label>
                  <Form.Select
                    name="boardingPoint"
                    value={`${formData.boardingPointId}|${formData.boardingPoint}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Boarding Point</option>
                    {setupData.boardingPoints.map((point) => (
                      <option key={point.id} value={`${point.id}|${point.placeName}`}>
                        {point.placeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bus Route Number</Form.Label>
                  <Form.Select
                    name="busRouteNumber"
                    value={`${formData.busRouteNumberId}|${formData.busRouteNumber}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Bus Route</option>
                    {setupData.busRoutes.map((route) => (
                      <option key={route.id} value={`${route.id}|${route.route}`}>
                        {route.route}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bus Fee</Form.Label>
                  <Form.Control
                    type="number"
                    name="busFee"
                    value={formData.busFee}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                {/* Previous Studied Details */}
                <h3 className="section-title mt-4">Previous Studied Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Studied Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="studiedYear"
                    value={formData.studiedYear}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Class Last Studied</Form.Label>
                  <Form.Select
                    name="classLastStudied"
                    value={formData.classLastStudied}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Class</option>
                    {setupData.courses.map((course) => (
                      <option key={course.id} value={course.standard}>
                        {course.standard}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Class to be Admitted</Form.Label>
                  <Form.Select
                    name="classToBeAdmitted"
                    value={formData.classToBeAdmitted}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Class</option>
                    {setupData.courses.map((course) => (
                      <option key={course.id} value={course.standard}>
                        {course.standard}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Name of the School</Form.Label>
                  <Form.Control
                    type="text"
                    name="nameOfSchool"
                    value={formData.nameOfSchool}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                {/* Remarks and Identification Marks */}
                <h3 className="section-title mt-4">Remarks</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Student Identification Mark 1</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificationMark1"
                    value={formData.identificationMark1}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Student Identification Mark 2</Form.Label>
                  <Form.Control
                    type="text"
                    name="identificationMark2"
                    value={formData.identificationMark2}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Submit Button */}
            <div className="d-flex justify-content-center mt-4">
              {!isViewMode && (
                <Button type="submit" className="submit-btn">
                  SUBMIT ENQUIRY
                </Button>
              )}
            </div>
          </Form>
        </div>
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

          .enquiry-form-container {
            background-color: #fff;
            padding: 2rem;
          }

          .enquiry-form {
            max-width: 1200px;
            margin: 0 auto;
          }

          .section-title {
            color: #0B3D7B;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .form-control-blue {
            background-color: #F0F4FF !important;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            padding: 0.5rem;
          }

          .form-control-blue:focus {
            border-color: #0B3D7B;
            box-shadow: 0 0 0 0.2rem rgba(11, 61, 123, 0.25);
          }

          .submit-btn {
            background: linear-gradient(to bottom, #1565C0, #0B3D7B);
            border: none;
            padding: 0.75rem 2rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            min-width: 200px;
          }

          .submit-btn:hover {
            background: linear-gradient(to bottom, #1976D2, #1565C0);
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .photo-upload-circle {
            transition: all 0.3s ease;
          }

          .photo-upload-circle:hover {
            border-color: #0B3D7B;
            background-color: #F8FAFF;
          }

          .form-label {
            font-weight: 500;
            color: #2D3748;
          }

          /* Custom styling for date inputs */
          input[type="date"].form-control-blue {
            position: relative;
            padding-right: 35px;
          }

          input[type="date"].form-control-blue::-webkit-calendar-picker-indicator {
            position: absolute;
            right: 10px;
            cursor: pointer;
          }

          /* Card header styles */
          h2 {
            font-size: 1.5rem;
            margin-bottom: 0;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .enquiry-form-container {
              padding: 1rem;
            }

            .section-title {
              font-size: 1.1rem;
            }

            .submit-btn {
              width: 100%;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default EnquiryForm

