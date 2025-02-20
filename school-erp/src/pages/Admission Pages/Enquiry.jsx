"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Button, Container, Table, Form, Dropdown, Modal } from "react-bootstrap"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs, deleteDoc, doc, query, where, limit, addDoc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Enquiry = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const [enquiries, setEnquiries] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("All")
  const [years, setYears] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [enquiryToDelete, setEnquiryToDelete] = useState(null)
  const navigate = useNavigate()

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
      fetchEnquiries()
    }
  }, [administrationId])

  const fetchEnquiries = async () => {
    try {
      const enquiriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "EnquirySetup",
      )
      let q = enquiriesRef
      if (selectedYear !== "All") {
        q = query(enquiriesRef, where("studiedYear", "==", selectedYear))
      }
      const snapshot = await getDocs(q)
      const enquiriesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setEnquiries(enquiriesData)

      const uniqueYears = [...new Set(enquiriesData.map((e) => e.studiedYear))].filter(Boolean)
      setYears(["All", ...uniqueYears.sort()])
    } catch (error) {
      console.error("Error fetching enquiries:", error)
      toast.error("Failed to fetch enquiries. Please try again.")
    }
  }

  const handleEdit = (enquiryId) => {
    navigate(`/admission/enquiry-form/${enquiryId}`)
  }

  const handleDeleteClick = (enquiryId) => {
    setEnquiryToDelete(enquiryId)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (enquiryToDelete) {
      try {
        const enquiryRef = doc(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "EnquirySetup",
          enquiryToDelete,
        )
        await deleteDoc(enquiryRef)
        toast.success("Enquiry deleted successfully!")
        fetchEnquiries()
      } catch (error) {
        console.error("Error deleting enquiry:", error)
        toast.error(`Failed to delete enquiry: ${error.message}`)
      }
    }
    setShowDeleteModal(false)
    setEnquiryToDelete(null)
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setEnquiryToDelete(null)
  }

  const handleView = (enquiryId) => {
    navigate(`/admission/enquiry-form/${enquiryId}?view=true`)
  }

  const filteredEnquiries = enquiries.filter(
    (enquiry) =>
      (selectedYear === "All" || enquiry.studiedYear === selectedYear) &&
      (enquiry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.motherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.phoneNumber.includes(searchTerm) ||
        enquiry.enquiryKey.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="admission-form">
          <div className="mb-4 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-2">Enquiry</h2>
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator mx-2">&gt;</span>
                <span>Admission</span>
                <span className="separator mx-2">&gt;</span>
                <Link to="/admission/enquiry">Enquiry Form</Link>
              </nav>
            </div>
            <Button className="custom-btn-clr px-2 py-2" onClick={() => navigate("/admission/enquiry-form")}>
              Add New Enquiry
            </Button>
          </div>

          <div>
            <div className="mb-4">
              <h3>Enquiries</h3>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Control
                  type="text"
                  placeholder="Search enquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-50"
                />
                <Dropdown>
                  <Dropdown.Toggle className="custom-btn-clr py-2" id="dropdown-year-filter">
                    {selectedYear === "All" ? "Filter by Year" : selectedYear}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {years.map((year) => (
                      <Dropdown.Item key={year} onClick={() => setSelectedYear(year)}>
                        {year}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Enquiry Key</th>
                    <th>Student Name</th>
                    <th>Father's Name</th>
                    <th>Mother's Name</th>
                    <th>Phone Number</th>
                    <th>Studied Year</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnquiries.map((enquiry) => (
                    <tr key={enquiry.id}>
                      <td>{enquiry.enquiryKey}</td>
                      <td>{enquiry.studentName}</td>
                      <td>{enquiry.fatherName}</td>
                      <td>{enquiry.motherName}</td>
                      <td>{enquiry.phoneNumber}</td>
                      <td>{enquiry.studiedYear}</td>
                      <td>
                        <Button variant="info" size="sm" onClick={() => handleView(enquiry.id)} className="me-2">
                          <FaEye />
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => handleEdit(enquiry.id)} className="me-2">
                          <FaEdit />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(enquiry.id)}>
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </Container>
      <ToastContainer />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleDeleteCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this enquiry?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleDeleteCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </MainContentPage>
  )
}

export default Enquiry

