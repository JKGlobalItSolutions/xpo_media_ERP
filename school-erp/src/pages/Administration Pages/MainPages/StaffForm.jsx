"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Row, Col } from "react-bootstrap"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link, useParams, useNavigate, useLocation } from "react-router-dom"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, limit, orderBy } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaArrowLeft } from "react-icons/fa"

const StaffForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isViewMode = new URLSearchParams(location.search).get("mode") === "view"
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
  const [administrationId, setAdministrationId] = useState(null)

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
      fetchStates()
      fetchDistricts()
      fetchItems("CommunitySetup")
      fetchItems("CasteSetup")
      fetchItems("ReligionSetup")
      fetchItems("NationalitySetup")
      fetchItems("StaffDesignation")
      fetchItems("StaffCategory")
      fetchCourses()

      if (id) {
        fetchStaffMember(id)
      } else {
        generateStaffCode()
      }
    }
  }, [administrationId, id])

  const fetchStaffMember = async (staffId) => {
    try {
      const staffRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
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
    } catch (error) {
      console.error("Error fetching staff member:", error)
      toast.error("Failed to fetch staff member. Please try again.")
    }
  }

  const generateStaffCode = async () => {
    try {
      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
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
    try {
      const statesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StateSetup",
      )
      const querySnapshot = await getDocs(statesRef)
      const statesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStates(statesData)
    } catch (error) {
      console.error("Error fetching states:", error)
    }
  }

  const fetchDistricts = async () => {
    try {
      const districtsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "DistrictSetup",
      )
      const querySnapshot = await getDocs(districtsRef)
      const districtsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setDistricts(districtsData)
    } catch (error) {
      console.error("Error fetching districts:", error)
    }
  }

  const fetchItems = async (category) => {
    try {
      const itemsRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, category)
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
        case "StaffDesignation":
          setStaffDesignations(itemsData)
          break
        case "StaffCategory":
          setStaffCategories(itemsData)
          break
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error)
    }
  }

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "Courses")
      const querySnapshot = await getDocs(coursesRef)
      const coursesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setCourses(coursesData)
    } catch (error) {
      console.error("Error fetching courses:", error)
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
    const [id, displayValue] = value.split("|")
    setFormData((prevState) => ({
      ...prevState,
      [`${name}Id`]: id,
      [name]: displayValue,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StaffMaster",
      )

      if (id) {
        await updateDoc(doc(staffRef, id), formData)
        toast.success("Staff member updated successfully!")
      } else {
        await addDoc(staffRef, formData)
        toast.success("Staff member added successfully!")
      }
      navigate("/admin/staff-master")
    } catch (error) {
      console.error("Error adding/updating staff member:", error)
      toast.error("Failed to add/update staff member. Please try again.")
    }
  }

  const handleBack = () => {
    navigate("/admin/staff-master")
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/administration">Administration</Link>
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>State</Form.Label>
                  <Form.Select
                    name="state"
                    value={`${formData.stateId}|${formData.state}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  >
                    <option value="">Select Designation</option>
                    {staffDesignations.map((designation) => (
                      <option key={designation.id} value={`${designation.id}|${designation.staffdesignation}`}>
                        {designation.staffdesignation}
                      </option>
                    ))}
                  </Form.Select>
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={`${formData.categoryId}|${formData.category}`}
                    onChange={handleSelectChange}
                    required
                    disabled={isViewMode}
                  >
                    <option value="">Select Category</option>
                    {staffCategories.map((category) => (
                      <option key={category.id} value={`${category.id}|${category.staffcategory}`}>
                        {category.staffcategory}
                      </option>
                    ))}
                  </Form.Select>
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Class IN charge</Form.Label>
                  <Form.Select
                    name="classInCharge"
                    value={`${formData.classInChargeId}|${formData.classInCharge}`}
                    onChange={handleSelectChange}
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </Form.Group>
              </Col>
            </Row>

            {!isViewMode && (
              <div className="text-center mt-3">
                <Button size="lg" type="submit" className="custom-btn">
                  {id ? "Update" : "Submit"}
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

export default StaffForm

