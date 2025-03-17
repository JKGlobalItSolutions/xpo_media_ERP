"use client"

import { useState, useEffect } from "react"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"
import { FaPrint, FaSearch } from "react-icons/fa"
import { Form, Button, Card, Row, Col, Spinner } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import DuplicateBillPreviewModal from "./BillPreviewModals/DuplicateBillPreviewModal"

const DuplicateBill = () => {
  const [loading, setLoading] = useState(false)
  const [administrationId, setAdministrationId] = useState(null)
  const [schoolInfo, setSchoolInfo] = useState({ name: "", address: "" })
  const [showBillPreviewModal, setShowBillPreviewModal] = useState(false)

  // Form state
  const [billNumber, setBillNumber] = useState("")
  const [billData, setBillData] = useState({
    billNumber: "",
    admissionNumber: "",
    studentName: "",
    fatherName: "",
    standard: "",
    course: "",
    section: "",
    billDate: "",
    paymentMode: "",
  })

  const [feeTableData, setFeeTableData] = useState([])
  const [concessionData, setConcessionData] = useState([])

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSchoolInfo()
      await fetchAdministrationId()
    }

    fetchInitialData()
  }, [])

  const fetchSchoolInfo = async () => {
    try {
      const schoolDoc = doc(db, "Schools", auth.currentUser.uid)
      const schoolSnapshot = await getDoc(schoolDoc)
      if (schoolSnapshot.exists()) {
        const data = schoolSnapshot.data()
        setSchoolInfo({
          name: data.SchoolName || "XPOMEDIA MATRIC. HR. SEC. SCHOOL",
          address: data.SchoolAddres || "TIRUVANNAMALAIA 606601",
        })
      }
    } catch (error) {
      console.error("Error fetching school information:", error)
      toast.error("Failed to fetch school information")
    }
  }

  const fetchAdministrationId = async () => {
    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
      const q = query(adminRef)
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const adminId = querySnapshot.docs[0].id
        setAdministrationId(adminId)
        return adminId
      } else {
        toast.error("No administration found")
        return null
      }
    } catch (error) {
      console.error("Error fetching Administration ID:", error)
      toast.error("Failed to initialize. Please try again.")
      return null
    }
  }

  const handleBillNumberChange = (e) => {
    setBillNumber(e.target.value)
  }

  const fetchBillData = async () => {
    if (!billNumber.trim()) {
      toast.error("Please enter a bill number")
      return
    }

    if (!administrationId) {
      const adminId = await fetchAdministrationId()
      if (!adminId) return
    }

    setLoading(true)
    try {
      const billEntriesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transactions",
        administrationId,
        "BillEntries",
      )

      // First, find the main bill entry
      const q = query(billEntriesRef, where("billNumber", "==", billNumber))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.error("No bill found with this number")
        setLoading(false)
        return
      }

      // Process all bill entries with this bill number (main entry and possible concession entry)
      let mainBillData = null
      const regularFees = []
      const concessionFees = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()

        // If this is the main bill entry (not a concession entry)
        if (!data.isConcession) {
          mainBillData = {
            billNumber: data.billNumber || "",
            admissionNumber: data.admissionNumber || "",
            studentName: data.studentName || "",
            fatherName: data.fatherName || "",
            standard: data.standard || "",
            course: data.course || "",
            section: data.section || "",
            billDate: data.billDate || "",
            paymentMode: data.paymentMode || "",
          }

          // Process regular fee details
          if (data.feeDetails && Array.isArray(data.feeDetails)) {
            data.feeDetails.forEach((fee) => {
              regularFees.push({
                description: fee.feeHead,
                amount: Number.parseFloat(fee.paidAmount) || 0,
                feeHead: fee.feeHead,
              })
            })
          }
        }
        // If this is a concession entry
        else if (data.isConcession) {
          // Process concession fee details
          if (data.feeDetails && Array.isArray(data.feeDetails)) {
            data.feeDetails.forEach((fee) => {
              concessionFees.push({
                description: "Concession",
                amount: Number.parseFloat(fee.paidAmount) || 0, // This should be negative
                feeHead: fee.feeHead,
                isConcession: true,
              })
            })
          } else {
            // If there are no fee details but it's a concession entry
            concessionFees.push({
              description: "Concession",
              amount: Number.parseFloat(data.totalPaidAmount) || 0, // This should be negative
              isConcession: true,
            })
          }
        }
      })

      if (!mainBillData) {
        toast.error("Could not find main bill data")
        setLoading(false)
        return
      }

      // Set the bill data
      setBillData(mainBillData)

      // Combine regular fees and concession fees
      const allFees = [...regularFees, ...concessionFees]
      setFeeTableData(allFees)

      toast.success("Bill data loaded successfully")
    } catch (error) {
      console.error("Error fetching bill data:", error)
      toast.error("Failed to fetch bill data")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateClick = () => {
    if (!billData.billNumber) {
      toast.error("Please fetch bill data first")
      return
    }

    setShowBillPreviewModal(true)
  }

  const handleCancel = () => {
    // Reset form
    setBillNumber("")
    setBillData({
      billNumber: "",
      admissionNumber: "",
      studentName: "",
      fatherName: "",
      standard: "",
      course: "",
      section: "",
      billDate: "",
      paymentMode: "",
    })
    setFeeTableData([])
    setConcessionData([])
  }

  const handleBillPreviewClose = () => {
    setShowBillPreviewModal(false)
  }

  return (
    <MainContentPage>
      <div className="mb-4">
        <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator mx-2">&gt;</span>
          <div>Transaction</div>
          <span className="separator mx-2">&gt;</span>
          <span>Duplicate Bill</span>
        </nav>
      </div>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white p-3">
          <h2 className="m-0">Duplicate Bill</h2>
        </Card.Header>

        <Card.Body className="p-4">
          <Form>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Bill Number</Form.Label>
                  <div className="d-flex">
                    <Form.Control
                      type="text"
                      value={billNumber}
                      onChange={handleBillNumberChange}
                      placeholder="Enter bill number"
                    />
                    <Button variant="outline-primary" className="ms-2" onClick={fetchBillData} disabled={loading}>
                      {loading ? <Spinner size="sm" /> : <FaSearch />}
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" value={billData.studentName} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Standard</Form.Label>
                  <Form.Control type="text" value={billData.course || billData.standard} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Section</Form.Label>
                  <Form.Control type="text" value={billData.section} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      billData.billDate instanceof Date
                        ? billData.billDate.toLocaleDateString()
                        : typeof billData.billDate?.toDate === "function"
                          ? billData.billDate.toDate().toLocaleDateString()
                          : billData.billDate || ""
                    }
                    readOnly
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={feeTableData.map((fee) => fee.description || fee.feeHead).join(", ")}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 p-3">
              <Button
                className="btn custom-btn-clr flex-grow-1 flex-md-grow-0"
                onClick={handleGenerateClick}
                disabled={!billData.billNumber || loading}
              >
                <FaPrint className="me-2" /> Generate
              </Button>
              <Button className="btn btn-secondary flex-grow-1 flex-md-grow-0" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Duplicate Bill Preview Modal */}
      <DuplicateBillPreviewModal
        show={showBillPreviewModal}
        onHide={handleBillPreviewClose}
        billData={billData}
        feeTableData={feeTableData}
        schoolInfo={schoolInfo}
        onClose={handleBillPreviewClose}
      />

      <ToastContainer position="top-right" autoClose={3000} />

      <style jsx>{`
        .bg-primary {
          background-color: #0B3D7B !important;
        }
        .text-primary {
          color: #0B3D7B !important;
        }
        .custom-btn-clr {
          background-color: #0B3D7B;
          border-color: #0B3D7B;
          color: white;
        }
        .custom-btn-clr:hover {
          background-color: #092c5a;
          border-color: #092c5a;
        }
        .form-control {
          border-radius: 4px;
          border: 1px solid #ced4da;
        }
        .form-label {
          font-weight: 500;
        }
        .gap-3 {
          gap: 1rem;
        }
        .btn {
          padding: 0.5rem 2rem;
        }
        @media (max-width: 768px) {
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </MainContentPage>
  )
}

export default DuplicateBill

