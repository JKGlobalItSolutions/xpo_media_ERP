"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Row, Col, Spinner } from "react-bootstrap"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, limit, orderBy, setDoc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaArrowLeft } from "react-icons/fa"
import { useAuthContext } from "../../../context/AuthContext"

const StaffForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isViewMode = new URLSearchParams(location.search).get("mode") === "view"
  const { user, currentAcademicYear } = useAuthContext()
  const ADMIN_DOC_ID = "admin_doc"

  const [formData, setFormData] = useState({
    staffCode: "",
    name: "",
    familyHeadName: "",
    numberStreetName: "",
    placePinCode: "",
    stateId: "",
    state: "",
    districtId: "",
    district: "",
    gender: "",
    dateOfBirth: "",
    communityId: "",
    community: "",
    casteId: "",
    caste: "",
    religionId: "",
    religion: "",
    nationalityId: "",
    nationality: "",
    designationId: "",
    designation: "",
    educationQualification: "",
    salary: "",
    pfNumber: "",
    categoryId: "",
    category: "",
    maritalStatus: "",
    majorSubject: "",
    optionalSubject: "",
    extraTalentDlNo: "",
    experience: "",
    classInChargeId: "",
    classInCharge: "",
    dateOfJoining: "",
    emailBankAcId: "",
    totalLeaveDays: "",
    mobileNumber: "",
    status: "",
    dateOfRelieve: "",
  })

  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])
  const [communities, setCommunities] = useState([])
  const [castes, setCastes] = useState([])
  const [religions, setReligions] = useState([])
  const [nationalities, setNationalities] = useState([])
  const [staffDesignations, setStaffDesignations] = useState([])
  const [staffCategories, setStaffCategories] = useState([])
  const [courses, setCourses] = useState([])

  const [isLoading, setIsLoading] = useState({
    init: true,
    states: false,
    districts: false,
    communities: false,
    castes: false,
    religions: false,
    nationalities: false,
    staffDesignations: false,
    staffCategories: false,
    courses: false,
    staffMember: false,
    submit: false,
  })

  useEffect(() => {
    if (user && currentAcademicYear) {
      ensureDocumentsExist()
    }
  }, [user, currentAcademicYear])

  const ensureDocumentsExist = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, init: true }))

      // Ensure Administration document exists
      const adminRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
      )

      await setDoc(adminRef, { updatedAt: new Date() }, { merge: true })

      // After ensuring documents exist, fetch all required data
      await Promise.all([
        fetchStates(),
        fetchDistricts(),
        fetchItems("CommunitySetup", "communities"),
        fetchItems("CasteSetup", "castes"),
        fetchItems("ReligionSetup", "religions"),
        fetchItems("NationalitySetup", "nationalities"),
        fetchStaffDesignations(),
        fetchStaffCategories(),
        fetchCourses(),
      ])

      if (id) {
        await fetchStaffMember(id)
      } else {
        await generateStaffCode()
      }

      setIsLoading((prev) => ({ ...prev, init: false }))
    } catch (error) {
      console.error("Error ensuring documents exist:", error)
      toast.error("Failed to initialize. Please try again.")
      setIsLoading((prev) => ({ ...prev, init: false }))
    }
  }

  const fetchStaffMember = async (staffId) => {
    if (!currentAcademicYear) {
      toast.error("Please select an academic year first")
      return
    }

    try {
      setIsLoading((prev) => ({ ...prev, staffMember: true }))

      const staffRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StaffMaster",
        staffId,
      )

      const staffDoc = await getDoc(staffRef)
      if (staffDoc.exists()) {
        setFormData(staffDoc.data())
      } else {
        toast.error("Staff member not found")
        navigate("/admin/staff-master")
      }

      setIsLoading((prev) => ({ ...prev, staffMember: false }))
    } catch (error) {
      console.error("Error fetching staff member:", error)
      toast.error("Failed to fetch staff member. Please try again.")
      setIsLoading((prev) => ({ ...prev, staffMember: false }))
    }
  }

  const generateStaffCode = async () => {
    if (!currentAcademicYear) {
      toast.error("Please select an academic year first")
      return
    }

    try {
      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StaffMaster",
      )

      const q = query(staffRef, orderBy("staffCode", "desc"), limit(1))
      const querySnapshot = await getDocs(q)

      let newStaffCode = "STAFF1"
      if (!querySnapshot.empty) {
        const lastStaffCode = querySnapshot.docs[0].data().staffCode
        const lastNumber = Number.parseInt(lastStaffCode.replace("STAFF", ""))
        newStaffCode = `STAFF${lastNumber + 1}`
      }

      setFormData((prevState) => ({
        ...prevState,
        staffCode: newStaffCode,
      }))
    } catch (error) {
      console.error("Error generating staff code:", error)
      toast.error("Failed to generate staff code. Please try again.")
    }
  }

  const fetchStates = async () => {
    if (!currentAcademicYear) return

    try {
      setIsLoading((prev) => ({ ...prev, states: true }))

      const statesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StateSetup",
      )

      const querySnapshot = await getDocs(statesRef)
      const statesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStates(statesData)

      setIsLoading((prev) => ({ ...prev, states: false }))
    } catch (error) {
      console.error("Error fetching states:", error)
      toast.error("Failed to fetch states. Please try again.")
      setIsLoading((prev) => ({ ...prev, states: false }))
    }
  }

  const fetchDistricts = async () => {
    if (!currentAcademicYear) return

    try {
      setIsLoading((prev) => ({ ...prev, districts: true }))

      const districtsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "DistrictSetup",
      )

      const querySnapshot = await getDocs(districtsRef)
      const districtsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setDistricts(districtsData)

      setIsLoading((prev) => ({ ...prev, districts: false }))
    } catch (error) {
      console.error("Error fetching districts:", error)
      toast.error("Failed to fetch districts. Please try again.")
      setIsLoading((prev) => ({ ...prev, districts: false }))
    }
  }

  const fetchItems = async (category, stateKey) => {
    if (!currentAcademicYear) return

    try {
      setIsLoading((prev) => ({ ...prev, [stateKey]: true }))

      const itemsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        category,
      )

      const querySnapshot = await getDocs(itemsRef)
      const itemsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

      switch (category) {
        case "CommunitySetup":
          setCommunities(itemsData)
          break
        case "CasteSetup":
          setCastes(itemsData)
          break
        case "ReligionSetup":
          setReligions(itemsData)
          break
        case "NationalitySetup":
          setNationalities(itemsData)
          break
      }

      setIsLoading((prev) => ({ ...prev, [stateKey]: false }))
    } catch (error) {
      console.error(`Error fetching ${category}:`, error)
      toast.error(`Failed to fetch ${category}. Please try again.`)
      setIsLoading((prev) => ({ ...prev, [stateKey]: false }))
    }
  }

  // Updated function to fetch staff designations
  const fetchStaffDesignations = async () => {
    if (!currentAcademicYear) return

    try {
      setIsLoading((prev) => ({ ...prev, staffDesignations: true }))

      // This is the correct path based on StaffDesignationandCategory.jsx
      const designationsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StaffDesignationSetup",
      )

      const querySnapshot = await getDocs(designationsRef)

      // Debug log to check what data is being returned
      console.log(
        "Staff Designations Data:",
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      )

      const designationsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStaffDesignations(designationsData)

      setIsLoading((prev) => ({ ...prev, staffDesignations: false }))
    } catch (error) {
      console.error("Error fetching staff designations:", error)
      toast.error("Failed to fetch staff designations. Please try again.")
      setIsLoading((prev) => ({ ...prev, staffDesignations: false }))
    }
  }

  // Updated function to fetch staff categories
  const fetchStaffCategories = async () => {
    if (!currentAcademicYear) return

    try {
      setIsLoading((prev) => ({ ...prev, staffCategories: true }))

      // This is the correct path based on StaffDesignationandCategory.jsx
      const categoriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StaffCategorySetup",
      )

      const querySnapshot = await getDocs(categoriesRef)

      // Debug log to check what data is being returned
      console.log(
        "Staff Categories Data:",
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      )

      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStaffCategories(categoriesData)

      setIsLoading((prev) => ({ ...prev, staffCategories: false }))
    } catch (error) {
      console.error("Error fetching staff categories:", error)
      toast.error("Failed to fetch staff categories. Please try again.")
      setIsLoading((prev) => ({ ...prev, staffCategories: false }))
    }
  }

  const fetchCourses = async () => {
    if (!currentAcademicYear) return

    try {
      setIsLoading((prev) => ({ ...prev, courses: true }))

      const coursesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "Courses",
      )

      const querySnapshot = await getDocs(coursesRef)
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setCourses(coursesData)

      setIsLoading((prev) => ({ ...prev, courses: false }))
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to fetch courses. Please try again.")
      setIsLoading((prev) => ({ ...prev, courses: false }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSelectChange = (e) => {
    const { name, value } = e.target
    if (!value) {
      setFormData((prevState) => ({
        ...prevState,
        [`${name}Id`]: "",
        [name]: "",
      }))
      return
    }

    const [id, displayValue] = value.split("|")
    setFormData((prevState) => ({
      ...prevState,
      [`${name}Id`]: id,
      [name]: displayValue,
    }))
  }

  const validateForm = () => {
    const requiredFields = [
      "name",
      "familyHeadName",
      "numberStreetName",
      "placePinCode",
      "stateId",
      "districtId",
      "gender",
      "dateOfBirth",
      "communityId",
      "casteId",
      "religionId",
      "nationalityId",
      "designationId",
      "educationQualification",
      "salary",
      "pfNumber",
      "categoryId",
      "maritalStatus",
      "majorSubject",
      "extraTalentDlNo",
      "experience",
      "dateOfJoining",
      "emailBankAcId",
      "totalLeaveDays",
      "mobileNumber",
      "status",
    ]

    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((field) => {
        // Convert camelCase to Title Case with spaces
        return field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .replace(/Id$/, "")
      })

      toast.error(`Please fill in all required fields: ${fieldNames.join(", ")}`)
      return false
    }

    // Validate mobile number
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      toast.error("Mobile number must be 10 digits")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentAcademicYear) {
      toast.error("Please select an academic year first")
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading((prev) => ({ ...prev, submit: true }))

      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AcademicYears",
        currentAcademicYear,
        "Administration",
        ADMIN_DOC_ID,
        "StaffMaster",
      )

      const timestamp = new Date()
      const staffData = {
        ...formData,
        updatedAt: timestamp,
      }

      if (id) {
        await updateDoc(doc(staffRef, id), staffData)
        toast.success("Staff member updated successfully!")
      } else {
        staffData.createdAt = timestamp
        await addDoc(staffRef, staffData)
        toast.success("Staff member added successfully!")
      }

      navigate("/admin/staff-master")
      setIsLoading((prev) => ({ ...prev, submit: false }))
    } catch (error) {
      console.error("Error adding/updating staff member:", error)
      toast.error("Failed to add/update staff member. Please try again.")
      setIsLoading((prev) => ({ ...prev, submit: false }))
    }
  }

  const handleBack = () => {
    navigate("/admin/staff-master")
  }

  const isAnyLoading = Object.values(isLoading).some(Boolean)

  if (!currentAcademicYear) {
    return (
      <MainContentPage>
        <Container fluid className="px-0">
          <div className="mb-4">
            <nav className="custom-breadcrumb py-1 py-lg-3">
              <Link to="/home">Home</Link>
              <span className="separator mx-2">&gt;</span>
              <span>Administration</span>
              <span className="separator mx-2">&gt;</span>
              <Link to="/admin/staff-master">Staff Master</Link>
              <span className="separator mx-2">&gt;</span>
              <span>{isViewMode ? "View Staff" : id ? "Edit Staff" : "Add Staff"}</span>
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
              <h2 className="mb-0">{isViewMode ? "View Staff" : id ? "Edit Staff" : "Add Staff"}</h2>
            </div>
            <div style={{ width: "20px" }}></div>
          </div>

          <div className="bg-white p-4 rounded-bottom shadow">
            <div className="alert alert-warning">Please select an academic year to manage staff members.</div>
          </div>
        </Container>

        <ToastContainer />

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

            .back-button {
              transition: opacity 0.2s;
            }

            .back-button:hover {
              opacity: 0.8;
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

  if (isLoading.init) {
    return (
      <MainContentPage>
        <Container fluid className="px-0">
          <div className="mb-4">
            <nav className="custom-breadcrumb py-1 py-lg-3">
              <Link to="/home">Home</Link>
              <span className="separator mx-2">&gt;</span>
              <span>Administration</span>
              <span className="separator mx-2">&gt;</span>
              <Link to="/admin/staff-master">Staff Master</Link>
              <span className="separator mx-2">&gt;</span>
              <span>{isViewMode ? "View Staff" : id ? "Edit Staff" : "Add Staff"}</span>
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
              <h2 className="mb-0">{isViewMode ? "View Staff" : id ? "Edit Staff" : "Add Staff"}</h2>
            </div>
            <div style={{ width: "20px" }}></div>
          </div>

          <div className="bg-white p-4 rounded-bottom shadow">
            <div className="text-center py-5">
              <Spinner animation="border" role="status" style={{ color: "#0B3D7B" }}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading staff data...</p>
            </div>
          </div>
        </Container>

        <ToastContainer />

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

            .back-button {
              transition: opacity 0.2s;
            }

            .back-button:hover {
              opacity: 0.8;
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

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Administration</span>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admin/staff-master">Staff Master</Link>
            <span className="separator mx-2">&gt;</span>
            <span>{isViewMode ? "View Staff" : id ? "Edit Staff" : "Add Staff"}</span>
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
            <h2 className="mb-0">{isViewMode ? "View Staff" : id ? "Edit Staff" : "Add Staff"}</h2>
          </div>
          <div style={{ width: "20px" }}></div>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form onSubmit={handleSubmit} className="h-100">
            <Row className="h-100">
              {/* Left Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Staff Code</Form.Label>
                  <Form.Control type="text" name="staffCode" value={formData.staffCode} readOnly disabled />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Family Head Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="familyHeadName"
                    value={formData.familyHeadName}
                    onChange={handleInputChange}
                    placeholder="Enter family head name"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Number & Street Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="numberStreetName"
                    value={formData.numberStreetName}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Place/Pin Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="placePinCode"
                    value={formData.placePinCode}
                    onChange={handleInputChange}
                    placeholder="Enter place and pin code"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state"
                    value={`${formData.stateId}|${formData.state}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.states}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={`${state.id}|${state.state}`}>
                        {state.state}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>District</Form.Label>
                  <Form.Select
                    name="district"
                    value={`${formData.districtId}|${formData.district}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.districts}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={`${district.id}|${district.district}`}>
                        {district.district}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode || isLoading.submit}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Date Of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>
              </Col>

              {/* Middle Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Community</Form.Label>
                  <Form.Select
                    name="community"
                    value={`${formData.communityId}|${formData.community}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.communities}
                  >
                    <option value="">Select Community</option>
                    {communities.map((community) => (
                      <option key={community.id} value={`${community.id}|${community.community}`}>
                        {community.community}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Caste</Form.Label>
                  <Form.Select
                    name="caste"
                    value={`${formData.casteId}|${formData.caste}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.castes}
                  >
                    <option value="">Select Caste</option>
                    {castes.map((caste) => (
                      <option key={caste.id} value={`${caste.id}|${caste.caste}`}>
                        {caste.caste}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Religion</Form.Label>
                  <Form.Select
                    name="religion"
                    value={`${formData.religionId}|${formData.religion}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.religions}
                  >
                    <option value="">Select Religion</option>
                    {religions.map((religion) => (
                      <option key={religion.id} value={`${religion.id}|${religion.religion}`}>
                        {religion.religion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select
                    name="nationality"
                    value={`${formData.nationalityId}|${formData.nationality}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.nationalities}
                  >
                    <option value="">Select Nationality</option>
                    {nationalities.map((nationality) => (
                      <option key={nationality.id} value={`${nationality.id}|${nationality.nationality}`}>
                        {nationality.nationality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Designation</Form.Label>
                  <Form.Select
                    name="designation"
                    value={`${formData.designationId}|${formData.designation}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.staffDesignations}
                  >
                    <option value="">Select Designation</option>
                    {staffDesignations.map((designation) => (
                      <option key={designation.id} value={`${designation.id}|${designation.staffdesignation}`}>
                        {designation.staffdesignation}
                      </option>
                    ))}
                  </Form.Select>
                  {isLoading.staffDesignations && (
                    <div className="text-center mt-1">
                      <Spinner animation="border" size="sm" role="status" style={{ color: "#0B3D7B" }}>
                        <span className="visually-hidden">Loading designations...</span>
                      </Spinner>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Education Qualification</Form.Label>
                  <Form.Control
                    type="text"
                    name="educationQualification"
                    value={formData.educationQualification}
                    onChange={handleInputChange}
                    placeholder="Enter qualification"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="Enter salary"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>P.F.Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="pfNumber"
                    value={formData.pfNumber}
                    onChange={handleInputChange}
                    placeholder="Enter PF number"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={`${formData.categoryId}|${formData.category}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode || isLoading.submit || isLoading.staffCategories}
                  >
                    <option value="">Select Category</option>
                    {staffCategories.map((category) => (
                      <option key={category.id} value={`${category.id}|${category.staffcategory}`}>
                        {category.staffcategory}
                      </option>
                    ))}
                  </Form.Select>
                  {isLoading.staffCategories && (
                    <div className="text-center mt-1">
                      <Spinner animation="border" size="sm" role="status" style={{ color: "#0B3D7B" }}>
                        <span className="visually-hidden">Loading categories...</span>
                      </Spinner>
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Right Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Marital Status</Form.Label>
                  <Form.Select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode || isLoading.submit}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Major Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="majorSubject"
                    value={formData.majorSubject}
                    onChange={handleInputChange}
                    placeholder="Enter major subject"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Optional Subject</Form.Label>
                  <Form.Control
                    type="text"
                    name="optionalSubject"
                    value={formData.optionalSubject}
                    onChange={handleInputChange}
                    placeholder="Enter optional subject"
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Extra Talent/Dl.No</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="extraTalentDlNo"
                    value={formData.extraTalentDlNo}
                    onChange={handleInputChange}
                    placeholder="Enter extra talent/DL number"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Experience</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Enter experience"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Class IN charge</Form.Label>
                  <Form.Select
                    name="classInCharge"
                    value={`${formData.classInChargeId}|${formData.classInCharge}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode || isLoading.submit || isLoading.courses}
                  >
                    <option value="">Select Class</option>
                    {courses.map((course) => (
                      <option key={course.id} value={`${course.id}|${course.standard}`}>
                        {course.standard}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Date Of Joining</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Email/Bank A/C ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="emailBankAcId"
                    value={formData.emailBankAcId}
                    onChange={handleInputChange}
                    placeholder="Enter email/bank account ID"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Total Leave Days</Form.Label>
                  <Form.Control
                    type="number"
                    name="totalLeaveDays"
                    value={formData.totalLeaveDays}
                    onChange={handleInputChange}
                    placeholder="Enter total leave days"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    required
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    disabled={isViewMode || isLoading.submit}
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Date Of Relieve</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfRelieve"
                    value={formData.dateOfRelieve}
                    onChange={handleInputChange}
                    disabled={isViewMode || isLoading.submit}
                  />
                </Form.Group>
              </Col>
            </Row>

            {!isViewMode && (
              <div className="text-center mt-3">
                <Button size="lg" type="submit" className="custom-btn" disabled={isLoading.submit}>
                  {isLoading.submit ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {id ? "Updating..." : "Submitting..."}
                    </>
                  ) : id ? (
                    "Update"
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            )}
          </Form>
        </div>
      </Container>

      <ToastContainer />

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

          .custom-btn {
            background: #0B3D7B;
            color: rgb(255, 255, 255);
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

export default StaffForm

