"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Container, Form, Button, Row, Col, Table } from "react-bootstrap"
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
  const [transportId, setTransportId] = useState(null)
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
    hostelFee: "",
    tutionFees: "",
    studiedYear: "",
    classLastStudied: "",
    classToBeAdmitted: "",
    nameOfSchool: "",
    remarks: "",
    identificationMark1: "",
    identificationMark2: "",
    aadharNumber: "",
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
  const [fees, setFees] = useState([])
  const [busFee, setBusFee] = useState("")
  const [hostelFee, setHostelFee] = useState("")
  const [tuitionFee, setTuitionFee] = useState("")
  const [tuitionFeeDetails, setTuitionFeeDetails] = useState([])
  const [busFeeDetails, setBusFeeDetails] = useState([])
  const [hostelFeeDetails, setHostelFeeDetails] = useState([])
  const [isSetupDataLoaded, setIsSetupDataLoaded] = useState(false)
  const [hostelFeeHeads, setHostelFeeHeads] = useState([])

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
    fetchTransportId()
  }, [])

  const fetchTransportId = async () => {
    try {
      const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
      const q = query(transportRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        const newTransportRef = await addDoc(transportRef, { createdAt: new Date() })
        setTransportId(newTransportRef.id)
      } else {
        setTransportId(querySnapshot.docs[0].id)
      }
    } catch (error) {
      console.error("Error fetching/creating Transport ID:", error)
      toast.error("Failed to initialize transport. Please try again.")
    }
  }

  useEffect(() => {
    if (administrationId) {
      fetchSetupData()
      fetchHostelFeeHeads()
    }
  }, [administrationId])

  useEffect(() => {
    if (isSetupDataLoaded && administrationId) {
      if (id) {
        fetchEnquiryData(id)
      } else {
        generateEnquiryKey()
      }
    }
  }, [isSetupDataLoaded, administrationId, id])

  useEffect(() => {
    fetchBusFee()
  }, [formData.boardingPoint, formData.busRouteNumber, transportId])

  useEffect(() => {
    fetchHostelFee()
  }, [formData.studentCategory, formData.standard, formData.lunchRefresh, administrationId])

  useEffect(() => {
    fetchTuitionFee()
  }, [formData.studentCategory, formData.standard, administrationId])

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

      const busFeeSetupRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "BusFeeSetup")
      const busFeeSetupSnapshot = await getDocs(busFeeSetupRef)
      const busFeeSetupData = busFeeSetupSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      const uniqueBoardingPoints = [...new Set(busFeeSetupData.map((item) => item.boardingPoint))]
      const uniqueRoutes = [...new Set(busFeeSetupData.map((item) => item.routeNumber))]

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
        parentOccupations: parentOccupationData,
        bloodGroups: bloodGroupData,
        boardingPoints: uniqueBoardingPoints.map((point) => ({ id: point, placeName: point })),
        busRoutes: uniqueRoutes.map((route) => ({ id: route, route: route })),
      })

      setFees(busFeeSetupData)
      setIsSetupDataLoaded(true)
    } catch (error) {
      console.error("Error fetching setup data:", error)
      toast.error("Failed to fetch setup data. Please try again.")
    }
  }

  const fetchHostelFeeHeads = async () => {
    try {
      const hostelFeeHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "HostelFeeHeadSetup",
      )
      const snapshot = await getDocs(hostelFeeHeadsRef)
      const hostelFeeHeadsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setHostelFeeHeads(hostelFeeHeadsData)
    } catch (error) {
      console.error("Error fetching hostel fee heads:", error)
      toast.error("Failed to fetch hostel fee heads. Please try again.")
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

        setBusFee(enquiryData.busFee || "")
        setHostelFee(enquiryData.hostelFee || "")
        setTuitionFee(enquiryData.tutionFees || "")

        await Promise.all([fetchBusFee(), fetchHostelFee(), fetchTuitionFee()])
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

  const fetchBusFee = useCallback(async () => {
    if (formData.boardingPoint && formData.busRouteNumber && transportId) {
      try {
        const busFeeRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "BusFeeSetup")
        const q = query(
          busFeeRef,
          where("boardingPoint", "==", formData.boardingPoint),
          where("routeNumber", "==", formData.busRouteNumber),
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          let totalBusFee = 0
          const details = querySnapshot.docs.map((doc) => {
            const feeData = doc.data()
            totalBusFee += Number.parseFloat(feeData.fee) || 0
            return { type: "Bus Fee", heading: feeData.feeHeading, amount: feeData.fee }
          })
          setBusFee(totalBusFee.toFixed(2))
          setBusFeeDetails(details)
          setFormData((prev) => ({ ...prev, busFee: totalBusFee.toFixed(2) }))
        } else {
          setBusFee("")
          setBusFeeDetails([])
          setFormData((prev) => ({ ...prev, busFee: "" }))
        }
      } catch (error) {
        console.error("Error fetching bus fee:", error)
        toast.error("Failed to fetch bus fee. Please try again.")
      }
    } else {
      setBusFee("")
      setBusFeeDetails([])
      setFormData((prev) => ({ ...prev, busFee: "" }))
    }
  }, [formData.boardingPoint, formData.busRouteNumber, transportId])

  const fetchHostelFee = useCallback(async () => {
    if (formData.studentCategory && formData.standard && administrationId && formData.lunchRefresh) {
      try {
        const hostelFeeRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "HostelFeeSetup",
        )
        const q = query(
          hostelFeeRef,
          where("studentCategoryId", "==", formData.studentCategory),
          where("standardId", "==", formData.standard),
          where("feeHeading", "==", formData.lunchRefresh),
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          let totalHostelFee = 0
          const details = querySnapshot.docs.map((doc) => {
            const fee = doc.data()
            totalHostelFee += Number.parseFloat(fee.feeAmount) || 0
            return { type: "Hostel Fee", heading: fee.feeHeading || "Hostel Fee", amount: fee.feeAmount }
          })
          setHostelFee(totalHostelFee.toFixed(2))
          setHostelFeeDetails(details)
          setFormData((prev) => ({ ...prev, hostelFee: totalHostelFee.toFixed(2) }))
        } else {
          setHostelFee("")
          setHostelFeeDetails([])
          setFormData((prev) => ({ ...prev, hostelFee: "" }))
        }
      } catch (error) {
        console.error("Error fetching hostel fee:", error)
        toast.error("Failed to fetch hostel fee. Please try again.")
      }
    } else {
      setHostelFee("")
      setHostelFeeDetails([])
      setFormData((prev) => ({ ...prev, hostelFee: "" }))
    }
  }, [administrationId, formData.studentCategory, formData.standard, formData.lunchRefresh])

  const fetchTuitionFee = useCallback(async () => {
    if (formData.studentCategory && formData.standard && administrationId) {
      try {
        const tuitionFeeRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "FeeSetup",
        )
        const q = query(
          tuitionFeeRef,
          where("studentCategoryId", "==", formData.studentCategory),
          where("standardId", "==", formData.standard),
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          let totalTuitionFee = 0
          const details = querySnapshot.docs.map((doc) => {
            const feeData = doc.data()
            totalTuitionFee += Number.parseFloat(feeData.feeAmount) || 0
            return { type: "Tuition Fee", heading: feeData.feeHeading || "Tuition Fee", amount: feeData.feeAmount }
          })
          setTuitionFee(totalTuitionFee.toFixed(2))
          setTuitionFeeDetails(details)
          setFormData((prev) => ({ ...prev, tutionFees: totalTuitionFee.toFixed(2) }))
        } else {
          setTuitionFee("")
          setTuitionFeeDetails([])
          setFormData((prev) => ({ ...prev, tutionFees: "" }))
        }
      } catch (error) {
        console.error("Error fetching tuition fee:", error)
        toast.error("Failed to fetch tuition fee. Please try again.")
      }
    } else {
      setTuitionFee("")
      setTuitionFeeDetails([])
      setFormData((prev) => ({ ...prev, tutionFees: "" }))
    }
  }, [administrationId, formData.studentCategory, formData.standard])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "boardingPoint") {
      const selectedBoardingPoint = setupData.boardingPoints.find((point) => point.placeName === value)
      if (selectedBoardingPoint) {
        const associatedRoute = setupData.busRoutes.find((route) => {
          const busFeeEntry = fees.find((fee) => fee.boardingPoint === value && fee.routeNumber === route.route)
          return busFeeEntry !== undefined
        })
        setFormData((prev) => ({
          ...prev,
          boardingPoint: value,
          busRouteNumber: associatedRoute ? associatedRoute.route : "",
        }))
        fetchBusFee()
      }
    }

    if (name === "busRouteNumber") {
      fetchBusFee()
    }

    if (name === "studentCategory" || name === "standard") {
      fetchHostelFee()
      fetchTuitionFee()
    }

    if (name === "lunchRefresh") {
      fetchHostelFee()
    }
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

    if (name === "studentCategory" || name === "standard") {
      fetchHostelFee()
      fetchTuitionFee()
    }

    if (name === "boardingPoint" || name === "busRouteNumber") {
      fetchBusFee()
    }
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
    if (!isViewMode) {
      fileInputRef.current.click()
    }
  }

  const handleDateInputClick = (ref) => {
    if (!isViewMode) {
      ref.current.showPicker()
    }
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
      "studiedYear",
      "classLastStudied",
      "classToBeAdmitted",
      "nameOfSchool",
      "identificationMark1",
      "identificationMark2",
      "aadharNumber",
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
          busFee: busFee || "",
          hostelFee: hostelFee || "",
          tutionFees: tuitionFee || "",
        }

        const enquiryRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "EnquirySetup",
        )

        const studentFeeData = {
          ...enquiryData,
          feeDetails: [...tuitionFeeDetails, ...busFeeDetails, ...hostelFeeDetails],
        }

        if (id) {
          await updateDoc(doc(enquiryRef, id), enquiryData)
          toast.success("Enquiry updated successfully!")
        } else {
          const docRef = await addDoc(enquiryRef, enquiryData)
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

  const calculateOverallTotal = () => {
    const tuitionTotal = Number.parseFloat(tuitionFee) || 0
    const busTotal = Number.parseFloat(busFee) || 0
    const hostelTotal = Number.parseFloat(hostelFee) || 0
    return (tuitionTotal + busTotal + hostelTotal).toFixed(2)
  }

  const renderFeeTableRows = () => {
    const allFees = [...tuitionFeeDetails, ...busFeeDetails, ...hostelFeeDetails]

    if (!allFees.length) {
      return (
        <tr>
          <td colSpan="3" className="text-center">
            No fee details available
          </td>
        </tr>
      )
    }

    const rows = []
    let currentType = null

    allFees.forEach((detail, index) => {
      if (currentType !== detail.type) {
        rows.push(
          <tr key={`${detail.type}-${index}`}>
            <td rowSpan={allFees.filter((fee) => fee.type === detail.type).length} style={{ verticalAlign: "middle" }}>
              {detail.type}
            </td>
            <td>{detail.heading}</td>
            <td>{detail.amount}</td>
          </tr>,
        )
        currentType = detail.type
      } else {
        rows.push(
          <tr key={`${detail.type}-${index}`}>
            <td>{detail.heading}</td>
            <td>{detail.amount}</td>
          </tr>,
        )
      }
    })

    return rows
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
                      cursor: isViewMode ? "default" : "pointer",
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
                    value={formData.studentName || ""}
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
                    value={formData.fatherName || ""}
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
                    value={formData.motherName || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Father's Occupation</Form.Label>
                  <Form.Select
                    name="fatherOccupation"
                    value={formData.fatherOccupation || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Father's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.name}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother's Occupation</Form.Label>
                  <Form.Select
                    name="motherOccupation"
                    value={formData.motherOccupation || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Mother's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.name}>
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
                    value={formData.phoneNumber || ""}
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
                    value={formData.emailId || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender || ""}
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
                    value={formData.dateOfBirth || ""}
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
                    value={formData.bloodGroup || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Blood Group</option>
                    {setupData.bloodGroups.map((bg) => (
                      <option key={bg.id} value={bg.name}>
                        {bg.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select
                    name="nationality"
                    value={formData.nationality || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Nationality</option>
                    {setupData.nationalities.map((nat) => (
                      <option key={nat.id} value={nat.nationality}>
                        {nat.nationality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Religion</Form.Label>
                  <Form.Select
                    name="religion"
                    value={formData.religion || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Religion</option>
                    {setupData.religions.map((rel) => (
                      <option key={rel.id} value={rel.religion}>
                        {rel.religion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Community</Form.Label>
                  <Form.Select
                    name="community"
                    value={formData.community || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Community</option>
                    {setupData.communities.map((comm) => (
                      <option key={comm.id} value={comm.community}>
                        {comm.community}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Caste</Form.Label>
                  <Form.Select
                    name="caste"
                    value={formData.caste || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Caste</option>
                    {setupData.castes.map((caste) => (
                      <option key={caste.id} value={caste.caste}>
                        {caste.caste}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother Tongue</Form.Label>
                  <Form.Select
                    name="motherTongue"
                    value={formData.motherTongue || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Mother Tongue</option>
                    {setupData.motherTongues.map((mt) => (
                      <option key={mt.id} value={mt.MotherTongueName}>
                        {mt.MotherTongueName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aadhar Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                {/* Address Details */}
                <h3 className="section-title">Address Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Street/Village</Form.Label>
                  <Form.Control
                    type="text"
                    name="streetVillage"
                    value={formData.streetVillage || ""}
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
                    value={formData.placePincode || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select State</option>
                    {setupData.states.map((state) => (
                      <option key={state.id} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    name="district"
                    value={formData.district || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select District</option>
                    {setupData.districts.map((district) => (
                      <option key={district.id} value={district.district}>
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
                    value={formData.communicationAddress || ""}
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
                    value={formData.studentType || ""}
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
                    value={formData.studentCategory || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Category</option>
                    {setupData.studentCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.StudentCategoryName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Standard</Form.Label>
                  <Form.Select
                    name="standard"
                    value={formData.standard || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Standard</option>
                    {setupData.courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.standard}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    name="section"
                    value={formData.section || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Section</option>
                    {setupData.sections.map((section) => (
                      <option key={section.id} value={section.name}>
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
                    value={formData.emis || ""}
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
                    value={formData.dateOfAdmission || ""}
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
                    value={formData.examNumber || ""}
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
                    value={formData.boardingPoint || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Boarding Point</option>
                    {setupData.boardingPoints.map((point) => (
                      <option key={point.id} value={point.placeName}>
                        {point.placeName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bus Route Number</Form.Label>
                  <Form.Select
                    name="busRouteNumber"
                    value={formData.busRouteNumber || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Bus Route</option>
                    {setupData.busRoutes.map((route) => (
                      <option key={route.id} value={route.route}>
                        {route.route}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Hostel Details */}
                <h3 className="section-title mt-4">Hostel Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Hostel Fee Head</Form.Label>
                  <Form.Select
                    name="lunchRefresh"
                    value={formData.lunchRefresh || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Hostel Fee Head</option>
                    {hostelFeeHeads.map((feeHead) => (
                      <option key={feeHead.id} value={feeHead.feeHead}>
                        {feeHead.feeHead}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Previous Studied Details */}
                <h3 className="section-title mt-4">Previous Studied Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Studied Year</Form.Label>
                  <Form.Control
                    type="text"
                    name="studiedYear"
                    value={formData.studiedYear || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Class Last Studied</Form.Label>
                  <Form.Select
                    name="classLastStudied"
                    value={formData.classLastStudied || ""}
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
                    value={formData.classToBeAdmitted || ""}
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
                    value={formData.nameOfSchool || ""}
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
                    value={formData.identificationMark1 || ""}
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
                    value={formData.identificationMark2 || ""}
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
                    value={formData.remarks || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                {/* Fee Details Table */}
                <h3 className="section-title mt-4">All Fees Details</h3>
                <div className="fee-details-table mb-4">
                  <Table bordered hover size="sm">
                    <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                      <tr>
                        <th>Fee Type</th>
                        <th>Fee Heading</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>{renderFeeTableRows()}</tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2" className="text-end fw-bold">
                          Overall Total:
                        </td>
                        <td className="fw-bold">{calculateOverallTotal()}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
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

          .photo-upload-circle:hover:not(:disabled) {
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

          .fee-details-table table {
            margin-bottom: 1rem;
          }

          .fee-details-table th,
          .fee-details-table td {
            vertical-align: middle;
            padding: 0.5rem;
          }

          .fee-details-table tfoot td {
            background-color: #f8f9fa;
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
            
            .fee-details-table table {
              font-size: 0.9rem;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default EnquiryForm

