"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { db, auth, storage } from "../../Firebase/config"
import { doc, getDoc, setDoc, collection, getDocs, query, limit, where, deleteDoc, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MainContentPage from "../../components/MainContent/MainContentPage"
import defaultStudentPhoto from "../../images/StudentProfileIcon/studentProfile.jpeg"
import { QRCodeSVG } from "qrcode.react"
import "./AdmissionForm.css" // Import the separate CSS file

// Custom styles for date inputs
const dateInputStyles = {
  wrapper: {
    position: "relative",
    width: "100%",
  },
  calendarIcon: {
    position: "absolute",
    right: "0",
    top: "0",
    height: "100%",
    width: "38px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    zIndex: 2,
  },
  error: {
    color: "#dc3545",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
}

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
    tutionFees: "",
    hostelFee: "",
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
  const [enquiryNumbers, setEnquiryNumbers] = useState([])
  const [filteredEnquiryNumbers, setFilteredEnquiryNumbers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [qrCodeData, setQRCodeData] = useState("")
  const [busFee, setBusFee] = useState("")
  const [transportId, setTransportId] = useState(null)
  const [fees, setFees] = useState([])
  const [hostelFee, setHostelFee] = useState("")
  const [tuitionFee, setTuitionFee] = useState("")
  const [tuitionFeeDetails, setTuitionFeeDetails] = useState([])
  const [busFeeDetails, setBusFeeDetails] = useState([])
  const [hostelFeeDetails, setHostelFeeDetails] = useState([])
  const [isSetupDataLoaded, setIsSetupDataLoaded] = useState(false)
  const [hostelFeeHeads, setHostelFeeHeads] = useState([])
  const [isHostelRequired, setIsHostelRequired] = useState(false)
  const [isBusRequired, setIsBusRequired] = useState(false)

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
            return { type: "Bus Fee", heading: feeData.feeHeading, amount: feeData.fee, status: "pending" }
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
            return {
              type: "Hostel Fee",
              heading: fee.feeHeading || "Hostel Fee",
              amount: fee.feeAmount,
              status: "pending",
            }
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
            return {
              type: "Tuition Fee",
              heading: feeData.feeHeading || "Tuition Fee",
              amount: feeData.feeAmount,
              status: "pending",
            }
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
      fetchEnquiryNumbers()
      if (id) {
        fetchAdmissionData()
      } else {
        generateAdmissionNumber()
      }
    }
  }, [isSetupDataLoaded, administrationId, id])

  useEffect(() => {
    if (setupData.courses.length > 0 && formData.studentName) {
      const standardName =
        setupData.courses.find((course) => course.id === formData.standard)?.standard || formData.standard
      const essentialData = {
        admissionNumber: formData.admissionNumber,
        studentName: formData.studentName,
        standard: standardName,
        section: formData.section,
      }
      setQRCodeData(JSON.stringify(essentialData))
    }
  }, [formData.admissionNumber, formData.studentName, formData.standard, formData.section, setupData.courses])

  useEffect(() => {
    fetchBusFee()
  }, [fetchBusFee])

  useEffect(() => {
    fetchHostelFee()
  }, [fetchHostelFee])

  useEffect(() => {
    fetchTuitionFee()
  }, [fetchTuitionFee])

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
      const studentFeeDetailsRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "StudentFeeDetails",
        id,
      )

      const [admissionSnap, feeSnap] = await Promise.all([getDoc(admissionRef), getDoc(studentFeeDetailsRef)])

      if (admissionSnap.exists()) {
        const admissionData = admissionSnap.data()

        const standardId = setupData.courses.find((course) => course.standard === admissionData.standard)?.id || ""
        const studentCategoryId =
          setupData.studentCategories.find((category) => category.StudentCategoryName === admissionData.studentCategory)
            ?.id || ""

        const updatedFormData = {
          ...formData,
          ...admissionData,
          standard: standardId,
          studentCategory: studentCategoryId,
        }

        setFormData(updatedFormData)
        setPhotoPreview(admissionData.studentPhoto || defaultStudentPhoto)

        setBusFee(admissionData.busFee || "")
        setHostelFee(admissionData.hostelFee || "")
        setTuitionFee(admissionData.tutionFees || "")

        if (feeSnap.exists()) {
          const feeData = feeSnap.data()
          const feeDetails = feeData.feeDetails || []

          setTuitionFeeDetails(feeDetails.filter((fee) => fee.type === "Tuition Fee"))
          setBusFeeDetails(feeDetails.filter((fee) => fee.type === "Bus Fee"))
          setHostelFeeDetails(feeDetails.filter((fee) => fee.type === "Hostel Fee"))
        }

        await Promise.all([fetchBusFee(), fetchHostelFee(), fetchTuitionFee()])
        setIsHostelRequired(admissionData.isHostelRequired || false)
        setIsBusRequired(admissionData.isBusRequired || false)
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
      const querySnapshot = await getDocs(admissionsRef)

      const existingNumbers = querySnapshot.docs
        .map((doc) => doc.data().admissionNumber)
        .filter((num) => num && num.startsWith("ADM"))
        .map((num) => Number.parseInt(num.replace("ADM", ""), 10))
        .sort((a, b) => a - b)

      let nextNumber = 1
      if (existingNumbers.length > 0) {
        const highestNumber = existingNumbers[existingNumbers.length - 1]
        nextNumber = highestNumber + 1

        // Ensure no gaps are missed by checking sequence
        for (let i = 0; i < existingNumbers.length; i++) {
          if (existingNumbers[i] !== i + 1) {
            nextNumber = i + 1
            break
          }
        }
      }

      const newAdmissionNumber = `ADM${nextNumber}`

      // Double-check if the number exists
      const checkQuery = query(admissionsRef, where("admissionNumber", "==", newAdmissionNumber))
      const checkSnapshot = await getDocs(checkQuery)

      if (!checkSnapshot.empty) {
        // If number exists, recurse to get next available number
        return generateAdmissionNumber()
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
          admissionNumber: prevData.admissionNumber,
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

    // Add validation for Aadhar Number - only allow 12 digits
    if (name === "aadharNumber") {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, "")
      // Limit to 12 digits
      const limitedValue = digitsOnly.slice(0, 12)
      setFormData((prev) => ({
        ...prev,
        [name]: limitedValue,
      }))
      setErrors((prev) => ({ ...prev, [name]: "" }))
      return
    }

    // Add validation for Phone Number - only allow 10 digits
    if (name === "phoneNumber") {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, "")
      // Limit to 10 digits
      const limitedValue = digitsOnly.slice(0, 10)
      setFormData((prev) => ({
        ...prev,
        [name]: limitedValue,
      }))
      setErrors((prev) => ({ ...prev, [name]: "" }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))

    if (name === "enquiryKey") {
      const filtered = enquiryNumbers.filter((key) => key.toLowerCase().includes(value.toLowerCase()))
      setFilteredEnquiryNumbers(filtered)
      setShowDropdown(filtered.length > 0)

      if (enquiryNumbers.includes(value)) {
        fetchEnquiryData(value)
      }
    }

    if (name === "admissionNumber" && value && !value.startsWith("ADM")) {
      setFormData((prev) => ({
        ...prev,
        admissionNumber: "ADM" + value,
      }))
    }

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
    if (!isViewMode) {
      fileInputRef.current.click()
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
        const fieldName =
          field.charAt(0).toUpperCase() +
          field
            .slice(1)
            .replace(/([A-Z])/g, " $1")
            .trim()
        newErrors[field] = `${fieldName} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleHostelToggle = (e) => {
    setIsHostelRequired(e.target.checked)
    if (!e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        lunchRefresh: "",
        hostelFee: "",
      }))
      setHostelFee("")
      setHostelFeeDetails([])
    }
  }

  const handleBusToggle = (e) => {
    setIsBusRequired(e.target.checked)
    if (!e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        boardingPoint: "",
        busRouteNumber: "",
        busFee: "",
      }))
      setBusFee("")
      setBusFeeDetails([])
    }
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

        const standardName =
          setupData.courses.find((course) => course.id === formData.standard)?.standard || formData.standard
        const studentCategoryName =
          setupData.studentCategories.find((category) => category.id === formData.studentCategory)
            ?.StudentCategoryName || formData.studentCategory

        const essentialData = {
          admissionNumber: formData.admissionNumber,
          studentName: formData.studentName,
          standard: standardName,
          section: formData.section,
        }
        const qrCodeData = JSON.stringify(essentialData)

        const admissionData = {
          ...formData,
          studentPhoto: photoUrl,
          qrCode: qrCodeData,
          standard: standardName,
          studentCategory: studentCategoryName,
          busFee: busFee || "",
          hostelFee: hostelFee || "",
          tutionFees: tuitionFee || "",
          isHostelRequired: isHostelRequired,
          isBusRequired: isBusRequired,
        }

        const admissionRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "AdmissionSetup",
        )
        const studentFeeDetailsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "StudentFeeDetails",
        )

        const allFeeDetails = [...tuitionFeeDetails, ...busFeeDetails, ...hostelFeeDetails]

        const studentFeeData = {
          ...admissionData,
          feeDetails: allFeeDetails,
        }

        if (id) {
          await setDoc(doc(admissionRef, id), admissionData)
          await setDoc(doc(studentFeeDetailsRef, id), studentFeeData)
          toast.success("Admission updated successfully!")
        } else {
          const admissionDocRef = await addDoc(admissionRef, admissionData)
          await setDoc(doc(studentFeeDetailsRef, admissionDocRef.id), studentFeeData)
          toast.success("Admission submitted successfully!")

          if (formData.enquiryKey) {
            const enquiryRef = collection(
              db,
              "Schools",
              auth.currentUser.uid,
              "AdmissionMaster",
              administrationId,
              "EnquirySetup",
            )
            const q = query(enquiryRef, where("enquiryKey", "==", formData.enquiryKey))
            const querySnapshot = await getDocs(q)
            if (!querySnapshot.empty) {
              const enquiryDoc = querySnapshot.docs[0]
              await deleteDoc(doc(enquiryRef, enquiryDoc.id))
            }
          }
        }
        toast.success("Admission submitted successfully!")
        setTimeout(() => {
          navigate("/admission/StudentDetails")
        }, 1500)
      } catch (error) {
        console.error("Error submitting admission:", error)
        toast.error(`Failed to submit admission: ${error.message}`)
      }
    } else {
      // Scroll to the first error field
      const firstErrorField = Object.keys(errors)[0]
      const element = document.querySelector(`[name="${firstErrorField}"]`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }

      // Show toast with more specific message
      toast.error("Please fill in all required fields marked in red")
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
          <td colSpan="4" className="text-center">
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
            <td>{detail.status || "pending"}</td>
          </tr>,
        )
        currentType = detail.type
      } else {
        rows.push(
          <tr key={`${detail.type}-${index}`}>
            <td>{detail.heading}</td>
            <td>{detail.amount}</td>
            <td>{detail.status || "pending"}</td>
          </tr>,
        )
      }
    })

    return rows
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2"></span>
            <Link to="/admission">Admission</Link>
            <span className="separator mx-2"></span>
            <span>{isViewMode ? "View Admission" : id ? "Edit Admission" : "Add Admission"}</span>
          </nav>
        </div>

        <div className="header-container">
          <div className="d-flex align-items-center">
            <h2 className="mb-0">{isViewMode ? "View Admission" : id ? "Edit Admission" : "Add Admission"}</h2>
          </div>
          <div style={{ width: "20px" }}></div>
        </div>

        <div className="form-container">
          <Form onSubmit={handleSubmit} className="admission-form">
            <Row>
              <Col md={6}>
                <div className="text-center mb-4">
                  <h3 className="section-title">Student Photo</h3>
                  <div className="photo-upload-circle mx-auto" onClick={handlePhotoClick}>
                    {photoPreview ? (
                      <img src={photoPreview || "/placeholder.svg"} alt="Student" />
                    ) : (
                      <div className="text-center">Upload Photo Here</div>
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
                <div className="text-center mb-4">
                  <h3 className="section-title">QR Code Preview</h3>
                  <div className="qr-code-container mx-auto">
                    {qrCodeData && <QRCodeSVG value={qrCodeData} size={200} level="M" includeMargin={true} />}
                  </div>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Enquiry Key</Form.Label>
                  <Form.Select
                    name="enquiryKey"
                    value={formData.enquiryKey || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  >
                    <option value="">Select Enquiry Key</option>
                    {enquiryNumbers.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Admission Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="admissionNumber"
                    value={formData.admissionNumber || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className="form-control-blue"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Student Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="studentName"
                    value={formData.studentName || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.studentName ? "is-invalid" : ""}`}
                  />
                  {errors.studentName && <div style={dateInputStyles.error}>{errors.studentName}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Father's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fatherName"
                    value={formData.fatherName || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.fatherName ? "is-invalid" : ""}`}
                  />
                  {errors.fatherName && <div style={dateInputStyles.error}>{errors.fatherName}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother's Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="motherName"
                    value={formData.motherName || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.motherName ? "is-invalid" : ""}`}
                  />
                  {errors.motherName && <div style={dateInputStyles.error}>{errors.motherName}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Father's Occupation</Form.Label>
                  <Form.Select
                    name="fatherOccupation"
                    value={formData.fatherOccupation || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.fatherOccupation ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Father's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.name}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.fatherOccupation && <div style={dateInputStyles.error}>{errors.fatherOccupation}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother's Occupation</Form.Label>
                  <Form.Select
                    name="motherOccupation"
                    value={formData.motherOccupation || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.motherOccupation ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Mother's Occupation</option>
                    {setupData.parentOccupations.map((occupation) => (
                      <option key={occupation.id} value={occupation.name}>
                        {occupation.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.motherOccupation && <div style={dateInputStyles.error}>{errors.motherOccupation}</div>}
                </Form.Group>

                <h3 className="section-title mt-4">Personal Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.phoneNumber ? "is-invalid" : ""}`}
                  />
                  {errors.phoneNumber && <div style={dateInputStyles.error}>{errors.phoneNumber}</div>}
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
                    className={`form-control-blue ${errors.gender ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender </option>
                  </Form.Select>
                  {errors.gender && <div style={dateInputStyles.error}>{errors.gender}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date Of Birth</Form.Label>
                  <div style={dateInputStyles.wrapper}>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className={`form-control-blue ${errors.dateOfBirth ? "is-invalid" : ""}`}
                      ref={dateOfBirthRef}
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        style={dateInputStyles.calendarIcon}
                        onClick={(e) => {
                          e.preventDefault()
                          dateOfBirthRef.current.showPicker()
                        }}
                      />
                    )}
                  </div>
                  {errors.dateOfBirth && <div style={dateInputStyles.error}>{errors.dateOfBirth}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Blood Group</Form.Label>
                  <Form.Select
                    name="bloodGroup"
                    value={formData.bloodGroup || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.bloodGroup ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Blood Group</option>
                    {setupData.bloodGroups.map((bg) => (
                      <option key={bg.id} value={bg.name}>
                        {bg.name}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.bloodGroup && <div style={dateInputStyles.error}>{errors.bloodGroup}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select
                    name="nationality"
                    value={formData.nationality || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.nationality ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Nationality</option>
                    {setupData.nationalities.map((nat) => (
                      <option key={nat.id} value={nat.nationality}>
                        {nat.nationality}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.nationality && <div style={dateInputStyles.error}>{errors.nationality}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Religion</Form.Label>
                  <Form.Select
                    name="religion"
                    value={formData.religion || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.religion ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Religion</option>
                    {setupData.religions.map((rel) => (
                      <option key={rel.id} value={rel.religion}>
                        {rel.religion}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.religion && <div style={dateInputStyles.error}>{errors.religion}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Community</Form.Label>
                  <Form.Select
                    name="community"
                    value={formData.community || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.community ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Community</option>
                    {setupData.communities.map((comm) => (
                      <option key={comm.id} value={comm.community}>
                        {comm.community}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.community && <div style={dateInputStyles.error}>{errors.community}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Caste</Form.Label>
                  <Form.Select
                    name="caste"
                    value={formData.caste || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.caste ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Caste</option>
                    {setupData.castes.map((caste) => (
                      <option key={caste.id} value={caste.caste}>
                        {caste.caste}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.caste && <div style={dateInputStyles.error}>{errors.caste}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mother Tongue</Form.Label>
                  <Form.Select
                    name="motherTongue"
                    value={formData.motherTongue || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.motherTongue ? "is-invalid" : ""}`}
                  >
                    <option value="">Select Mother Tongue</option>
                    {setupData.motherTongues.map((mt) => (
                      <option key={mt.id} value={mt.MotherTongueName}>
                        {mt.MotherTongueName}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.motherTongue && <div style={dateInputStyles.error}>{errors.motherTongue}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Aadhar Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.aadharNumber ? "is-invalid" : ""}`}
                  />
                  {errors.aadharNumber && <div style={dateInputStyles.error}>{errors.aadharNumber}</div>}
                </Form.Group>

                <h3 className="section-title">Address Details</h3>
                <Form.Group className="mb-3">
                  <Form.Label>Street/Village</Form.Label>
                  <Form.Control
                    type="text"
                    name="streetVillage"
                    value={formData.streetVillage || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.streetVillage ? "is-invalid" : ""}`}
                  />
                  {errors.streetVillage && <div style={dateInputStyles.error}>{errors.streetVillage}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Place/Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="placePincode"
                    value={formData.placePincode || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.placePincode ? "is-invalid" : ""}`}
                  />
                  {errors.placePincode && <div style={dateInputStyles.error}>{errors.placePincode}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state"
                    value={formData.state || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.state ? "is-invalid" : ""}`}
                  >
                    <option value="">Select State</option>
                    {setupData.states.map((state) => (
                      <option key={state.id} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.state && <div style={dateInputStyles.error}>{errors.state}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    name="district"
                    value={formData.district || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                    className={`form-control-blue ${errors.district ? "is-invalid" : ""}`}
                  >
                    <option value="">Select District</option>
                    {setupData.districts.map((district) => (
                      <option key={district.id} value={district.district}>
                        {district.district}
                      </option>
                    ))}
                  </Form.Select>
                  {errors.district && <div style={dateInputStyles.error}>{errors.district}</div>}
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
                  {errors.studentType && <div style={dateInputStyles.error}>{errors.studentType}</div>}
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
                  {errors.studentCategory && <div style={dateInputStyles.error}>{errors.studentCategory}</div>}
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
                  {errors.standard && <div style={dateInputStyles.error}>{errors.standard}</div>}
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
                  {errors.section && <div style={dateInputStyles.error}>{errors.section}</div>}
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
                  {errors.emis && <div style={dateInputStyles.error}>{errors.emis}</div>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date Of Admission</Form.Label>
                  <div style={dateInputStyles.wrapper}>
                    <Form.Control
                      type="date"
                      name="dateOfAdmission"
                      value={formData.dateOfAdmission || ""}
                      onChange={handleInputChange}
                      disabled={isViewMode}
                      className="form-control-blue"
                      ref={dateOfAdmissionRef}
                    />
                    {!isViewMode && (
                      <button
                        type="button"
                        style={dateInputStyles.calendarIcon}
                        onClick={(e) => {
                          e.preventDefault()
                          dateOfAdmissionRef.current.showPicker()
                        }}
                      />
                    )}
                  </div>
                  {errors.dateOfAdmission && <div style={dateInputStyles.error}>{errors.dateOfAdmission}</div>}
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
                  {errors.examNumber && <div style={dateInputStyles.error}>{errors.examNumber}</div>}
                </Form.Group>

                <h3 className="section-title mt-4">Bus Transport Details</h3>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="bus-toggle"
                    label="Bus Transport Required"
                    // checked={isBusRequired}
                    onChange={handleBusToggle}
                    disabled={isViewMode}
                  />
                </Form.Group>
                {isBusRequired && (
                  <>
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
                  </>
                )}

                <h3 className="section-title mt-4">Hostel Details</h3>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="hostel-toggle"
                    label="Hostel Required"
                    // checked={isHostelRequired}
                    onChange={handleHostelToggle}
                    disabled={isViewMode}
                  />
                </Form.Group>
                {isHostelRequired && (
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
                )}

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
                  {errors.studiedYear && <div style={dateInputStyles.error}>{errors.studiedYear}</div>}
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
                  {errors.classLastStudied && <div style={dateInputStyles.error}>{errors.classLastStudied}</div>}
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
                  {errors.classToBeAdmitted && <div style={dateInputStyles.error}>{errors.classToBeAdmitted}</div>}
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
                  {errors.nameOfSchool && <div style={dateInputStyles.error}>{errors.nameOfSchool}</div>}
                </Form.Group>

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
                  {errors.identificationMark1 && <div style={dateInputStyles.error}>{errors.identificationMark1}</div>}
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
                  {errors.identificationMark2 && <div style={dateInputStyles.error}>{errors.identificationMark2}</div>}
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

                <h3 className="section-title mt-4">All Fees Details</h3>
                <div className="fee-details-table mb-4">
                  <Table bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Fee Type</th>
                        <th>Fee Heading</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>{renderFeeTableRows()}</tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" className="text-end fw-bold">
                          Overall Total:
                        </td>
                        <td className="fw-bold">{calculateOverallTotal()}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>
              </Col>
            </Row>

            <div className="d-flex justify-content-center mt-4">
              {!isViewMode && (
                <Button type="submit" className="submit-btn">
                  SUBMIT ADMISSION
                </Button>
              )}
            </div>
          </Form>
        </div>
      </Container>
      <ToastContainer />
    </MainContentPage>
  )
}

export default AdmissionForm

