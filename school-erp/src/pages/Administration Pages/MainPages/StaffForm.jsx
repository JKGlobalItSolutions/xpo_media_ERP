"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Row, Col } from "react-bootstrap"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link, useParams, useNavigate } from "react-router-dom"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, limit } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const StaffForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    staffCode: "",
    name: "",
    familyHeadName: "",
    numberStreetName: "",
    placePinCode: "",
    state: "",
    district: "",
    gender: "",
    dateOfBirth: "",
    community: "",
    caste: "",
    religion: "",
    nationality: "",
    designation: "",
    educationQualification: "",
    salary: "",
    pfNumber: "",
    category: "",
    maritalStatus: "",
    majorSubject: "",
    optionalSubject: "",
    extraTalentDlNo: "",
    experience: "",
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

      if (id) {
        fetchStaffMember(id)
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
        navigate("/staff-master")
      }
    } catch (error) {
      console.error("Error fetching staff member:", error)
      toast.error("Failed to fetch staff member. Please try again.")
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
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
      navigate("/staff-master")
    } catch (error) {
      console.error("Error adding/updating staff member:", error)
      toast.error("Failed to add/update staff member. Please try again.")
    }
  }

  const handleBack = () => {
    navigate("/staff-master")
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
            <Link to="/staff-master">Staff Master</Link>
            <span className="separator mx-2">&gt;</span>
            <span>{id ? "Edit Staff" : "Add Staff"}</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2>{id ? "Edit Staff" : "Add Staff"}</h2>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form onSubmit={handleSubmit} className="h-100">
            <Row className="h-100">
              {/* Left Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Staff Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="staffCode"
                    value={formData.staffCode}
                    onChange={handleInputChange}
                    placeholder="Enter staff code"
                    required
                  />
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
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
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

                <Form.Group className="mb-3 flex-grow-1">
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

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select name="gender" value={formData.gender} onChange={handleInputChange}>
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
                  />
                </Form.Group>
              </Col>

              {/* Middle Column */}
              <Col md={4} className="d-flex flex-column">
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Community</Form.Label>
                  <Form.Select name="community" value={formData.community} onChange={handleInputChange}>
                    <option value="">Select Community</option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.community}>
                        {community.community}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
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

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Religion</Form.Label>
                  <Form.Select name="religion" value={formData.religion} onChange={handleInputChange}>
                    <option value="">Select Religion</option>
                    {religions.map((religion) => (
                      <option key={religion.id} value={religion.religion}>
                        {religion.religion}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Nationality</Form.Label>
                  <Form.Select name="nationality" value={formData.nationality} onChange={handleInputChange}>
                    <option value="">Select Nationality</option>
                    {nationalities.map((nationality) => (
                      <option key={nationality.id} value={nationality.nationality}>
                        {nationality.nationality}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Designation</Form.Label>
                  <Form.Select name="designation" value={formData.designation} onChange={handleInputChange} required>
                    <option value="">Select Designation</option>
                    {staffDesignations.map((designation) => (
                      <option key={designation.id} value={designation.staffdesignation}>
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
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="">Select Category</option>
                    {staffCategories.map((category) => (
                      <option key={category.id} value={category.staffcategory}>
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
                  <Form.Select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange}>
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
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Class IN charge</Form.Label>
                  <Form.Control
                    type="text"
                    name="classInCharge"
                    value={formData.classInCharge}
                    onChange={handleInputChange}
                    placeholder="Enter class in charge"
                  />
                </Form.Group>

                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Date Of Joining</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleInputChange}
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
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3 flex-grow-1">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
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
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button variant="secondary" size="lg" onClick={handleBack} className="me-2">
                Back to StaffMaster
              </Button>
              <Button variant="primary" size="lg" type="submit">
                {id ? "Update" : "Save"}
              </Button>
            </div>
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

