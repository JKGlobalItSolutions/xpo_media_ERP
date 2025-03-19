"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore"
import { useAuthContext } from "../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Add Bus Fee Modal Component
const AddBusFeeModal = ({ isOpen, onClose, onConfirm, places, routes, feeHeads }) => {
  const [boardingPoint, setBoardingPoint] = useState("")
  const [routeNumber, setRouteNumber] = useState("")
  const [feeHeading, setFeeHeading] = useState("")
  const [fee, setFee] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm({ boardingPoint, routeNumber, feeHeading, fee })
    setBoardingPoint("")
    setRouteNumber("")
    setFeeHeading("")
    setFee("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Bus Fee</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Enter Place / Boarding Point</Form.Label>
            <Form.Select
              value={boardingPoint}
              onChange={(e) => setBoardingPoint(e.target.value)}
              className="custom-input"
            >
              <option value="">Select Boarding Point</option>
              {places.map((place) => (
                <option key={place.id} value={place.placeName}>
                  {place.placeName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select / Enter Route Number</Form.Label>
            <Form.Select value={routeNumber} onChange={(e) => setRouteNumber(e.target.value)} className="custom-input">
              <option value="">Select Route Number</option>
              {routes.map((route) => (
                <option key={route.id} value={route.route}>
                  {route.route}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Fee Heading</Form.Label>
            <Form.Select value={feeHeading} onChange={(e) => setFeeHeading(e.target.value)} className="custom-input">
              <option value="">Select Fee Heading</option>
              {feeHeads.map((feeHead) => (
                <option key={feeHead.id} value={feeHead.feeHead}>
                  {feeHead.feeHead}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee</Form.Label>
            <Form.Control type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="custom-input" />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add Fee
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Bus Fee Modal Component
const EditBusFeeModal = ({ isOpen, onClose, onConfirm, feeData, places, routes, feeHeads }) => {
  const [boardingPoint, setBoardingPoint] = useState("")
  const [routeNumber, setRouteNumber] = useState("")
  const [feeHeading, setFeeHeading] = useState("")
  const [fee, setFee] = useState("")

  useEffect(() => {
    if (feeData) {
      setBoardingPoint(feeData.boardingPoint || "")
      setRouteNumber(feeData.routeNumber || "")
      setFeeHeading(feeData.feeHeading || "")
      setFee(feeData.fee || "")
    }
  }, [feeData])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(feeData.id, { boardingPoint, routeNumber, feeHeading, fee })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Bus Fee</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Enter Place / Boarding Point</Form.Label>
            <Form.Select
              value={boardingPoint}
              onChange={(e) => setBoardingPoint(e.target.value)}
              className="custom-input"
            >
              <option value="">Select Boarding Point</option>
              {places.map((place) => (
                <option key={place.id} value={place.placeName}>
                  {place.placeName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select / Enter Route Number</Form.Label>
            <Form.Select value={routeNumber} onChange={(e) => setRouteNumber(e.target.value)} className="custom-input">
              <option value="">Select Route Number</option>
              {routes.map((route) => (
                <option key={route.id} value={route.route}>
                  {route.route}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Select Fee Heading</Form.Label>
            <Form.Select value={feeHeading} onChange={(e) => setFeeHeading(e.target.value)} className="custom-input">
              <option value="">Select Fee Heading</option>
              {feeHeads.map((feeHead) => (
                <option key={feeHead.id} value={feeHead.feeHead}>
                  {feeHead.feeHead}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee</Form.Label>
            <Form.Control type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="custom-input" />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update Fee
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Bus Fee Modal Component
const DeleteBusFeeModal = ({ isOpen, onClose, onConfirm, feeData }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Bus Fee</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this bus fee entry?</p>
          <p className="fw-bold">
            {feeData?.boardingPoint} - {feeData?.routeNumber}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(feeData.id)}>
            Delete
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const BusFeeSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [fees, setFees] = useState([])
  const [transportId, setTransportId] = useState(null)
  const [places, setPlaces] = useState([])
  const [routes, setRoutes] = useState([])
  const [feeHeads, setFeeHeads] = useState([])
  const { user } = useAuthContext()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchTransportId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage bus fees.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    }

    checkAuthAndFetchData()
  }, [])

  useEffect(() => {
    if (transportId) {
      fetchFees()
      fetchPlaces()
      fetchRoutes()
      fetchFeeHeads()
    }
  }, [transportId])

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
      toast.error("Failed to initialize. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchFees = async () => {
    if (!transportId) return

    try {
      const feesRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "BusFeeSetup")
      const querySnapshot = await getDocs(feesRef)
      const feesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched fees:", feesData)
      setFees(feesData)
    } catch (error) {
      console.error("Error fetching fees:", error)
      toast.error("Failed to fetch fees. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchPlaces = async () => {
    if (!transportId) return

    try {
      const placesRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "PlaceSetup")
      const querySnapshot = await getDocs(placesRef)
      const placesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched places:", placesData)
      setPlaces(placesData)
    } catch (error) {
      console.error("Error fetching places:", error)
      toast.error("Failed to fetch places. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchRoutes = async () => {
    if (!transportId) return

    try {
      const routesRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "RouteSetup")
      const querySnapshot = await getDocs(routesRef)
      const routesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched routes:", routesData)
      setRoutes(routesData)
    } catch (error) {
      console.error("Error fetching routes:", error)
      toast.error("Failed to fetch routes. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchFeeHeads = async () => {
    if (!transportId) return

    try {
      const feeHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Transport",
        transportId,
        "BusVanFeeHeadSetup",
      )
      const querySnapshot = await getDocs(feeHeadsRef)
      const feeHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched fee heads:", feeHeadsData)
      setFeeHeads(feeHeadsData)
    } catch (error) {
      console.error("Error fetching fee heads:", error)
      toast.error("Failed to fetch fee heads. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleAddFee = async (newFee) => {
    if (!transportId) {
      toast.error("Transport not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const feesRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "BusFeeSetup")
      const docRef = await addDoc(feesRef, newFee)
      console.log("Fee added with ID:", docRef.id)
      setIsAddModalOpen(false)
      toast.success("Fee added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchFees()
    } catch (error) {
      console.error("Error adding fee:", error)
      toast.error("Failed to add fee. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleEditFee = async (id, updatedFee) => {
    if (!transportId) {
      toast.error("Transport not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const feeRef = doc(db, "Schools", auth.currentUser.uid, "Transport", transportId, "BusFeeSetup", id)
      await updateDoc(feeRef, updatedFee)
      console.log("Fee updated:", id)
      setIsEditModalOpen(false)
      setSelectedFee(null)
      toast.success("Fee updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchFees()
    } catch (error) {
      console.error("Error updating fee:", error)
      toast.error("Failed to update fee. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleDeleteFee = async (id) => {
    if (!transportId) {
      toast.error("Transport not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const feeRef = doc(db, "Schools", auth.currentUser.uid, "Transport", transportId, "BusFeeSetup", id)
      await deleteDoc(feeRef)
      console.log("Fee deleted:", id)
      setIsDeleteModalOpen(false)
      setSelectedFee(null)
      toast.success("Fee deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchFees()
    } catch (error) {
      console.error("Error deleting fee:", error)
      toast.error("Failed to delete fee. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const openEditModal = (fee) => {
    setSelectedFee(fee)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (fee) => {
    setSelectedFee(fee)
    setIsDeleteModalOpen(true)
  }

  const filteredFees = fees.filter(
    (fee) =>
      fee.boardingPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateTotalFee = () => {
    return filteredFees.reduce((total, fee) => total + Number.parseFloat(fee.fee || 0), 0).toFixed(2)
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Transport</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Bus Fee Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="bus-fee-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block text-light">Bus Fee Setup</h2>
                  <h6 className="m-0 d-lg-none text-light">Bus Fee Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Fee
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Boarding Point or Route Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Fee Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Boarding Point</th>
                          <th>Route Number</th>
                          <th>Fee Heading</th>
                          <th>Fee Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFees.map((fee) => (
                          <tr key={fee.id}>
                            <td>{fee.boardingPoint}</td>
                            <td>{fee.routeNumber}</td>
                            <td>{fee.feeHeading}</td>
                            <td>{fee.fee}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(fee)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(fee)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-end fw-bold">
                            Total Fee:
                          </td>
                          <td colSpan="2" className="fw-bold">
                            {calculateTotalFee()}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <AddBusFeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddFee}
        places={places}
        routes={routes}
        feeHeads={feeHeads}
      />
      <EditBusFeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedFee(null)
        }}
        onConfirm={handleEditFee}
        feeData={selectedFee}
        places={places}
        routes={routes}
        feeHeads={feeHeads}
      />
      <DeleteBusFeeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedFee(null)
        }}
        onConfirm={handleDeleteFee}
        feeData={selectedFee}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .bus-fee-setup-container {
            background-color: #fff;
          }

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

          .form-card {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
          }

          .header {
            border-bottom: 1px solid #dee2e6;
            background-color: #0B3D7B;
          }

          .custom-search {
            max-width: 300px;
          }

          .table-responsive {
            margin-bottom: 0;
          }

          .table th {
            font-weight: 500;
          }

          .table td {
            vertical-align: middle;
          }

          .action-button {
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            padding: 0;
            color: white;
          }

          .edit-button {
            background-color: #0B3D7B;
          }

          .edit-button:hover {
            background-color: #092a54;
            color: white;
          }

          .delete-button {
            background-color: #dc3545;
          }

          .delete-button:hover {
            background-color: #bb2d3b;
            color: white;
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1100;
          }

          .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
          }

          .modal-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
            text-align: center;
          }

          .modal-body {
            margin-bottom: 1.5rem;
          }

          .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }

          .modal-button {
            padding: 0.5rem 2rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
          }

          .modal-button.confirm {
            background-color: #0B3D7B;
            color: white;
          }

          .modal-button.delete {
            background-color: #dc3545;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }

          .custom-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
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

          /* Form Label Styles */
          .form-label {
            text-align: left !important;
            display: block;
            width: 100%;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default BusFeeSetup

