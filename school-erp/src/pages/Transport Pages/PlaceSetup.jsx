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

// Add Place Modal Component
const AddPlaceModal = ({ isOpen, onClose, onConfirm }) => {
  const [placeName, setPlaceName] = useState("")
  const [routeNumber, setRouteNumber] = useState("")
  const [fee, setFee] = useState("")
  const [driverName, setDriverName] = useState("")
  const [conductorName, setConductorName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm({ placeName, routeNumber, fee, driverName, conductorName })
    setPlaceName("")
    setRouteNumber("")
    setFee("")
    setDriverName("")
    setConductorName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Place</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Name Place</Form.Label>
            <Form.Control
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Number Route</Form.Label>
            <Form.Control
              type="text"
              value={routeNumber}
              onChange={(e) => setRouteNumber(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee Van / Bus</Form.Label>
            <Form.Control type="text" value={fee} onChange={(e) => setFee(e.target.value)} className="custom-input" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Name Driver</Form.Label>
            <Form.Control
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Name Conductor</Form.Label>
            <Form.Control
              type="text"
              value={conductorName}
              onChange={(e) => setConductorName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add Place
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Place Modal Component
const EditPlaceModal = ({ isOpen, onClose, onConfirm, placeData }) => {
  const [placeName, setPlaceName] = useState("")
  const [routeNumber, setRouteNumber] = useState("")
  const [fee, setFee] = useState("")
  const [driverName, setDriverName] = useState("")
  const [conductorName, setConductorName] = useState("")

  useEffect(() => {
    if (placeData) {
      setPlaceName(placeData.placeName || "")
      setRouteNumber(placeData.routeNumber || "")
      setFee(placeData.fee || "")
      setDriverName(placeData.driverName || "")
      setConductorName(placeData.conductorName || "")
    }
  }, [placeData])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(placeData.id, { placeName, routeNumber, fee, driverName, conductorName })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Place</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Name Place</Form.Label>
            <Form.Control
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Number Route</Form.Label>
            <Form.Control
              type="text"
              value={routeNumber}
              onChange={(e) => setRouteNumber(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Fee Van / Bus</Form.Label>
            <Form.Control type="text" value={fee} onChange={(e) => setFee(e.target.value)} className="custom-input" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Name Driver</Form.Label>
            <Form.Control
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="w-100 text-start">Name Conductor</Form.Label>
            <Form.Control
              type="text"
              value={conductorName}
              onChange={(e) => setConductorName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update Place
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Place Modal Component
const DeletePlaceModal = ({ isOpen, onClose, onConfirm, placeData }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Place</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this place?</p>
          <p className="fw-bold">{placeData?.placeName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(placeData.id)}>
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

const PlaceSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [places, setPlaces] = useState([])
  const [transportId, setTransportId] = useState(null)
  const { user } = useAuthContext()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchTransportId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage places.", {
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
      fetchPlaces()
    }
  }, [transportId])

  const fetchTransportId = async () => {
    try {
      const transportRef = collection(db, "Schools", auth.currentUser.uid, "Transport")
      const q = query(transportRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        // If no Transport document exists, create one
        const newTransportRef = await addDoc(transportRef, { createdAt: new Date() })
        setTransportId(newTransportRef.id)
      } else {
        // Use the ID of the first (and presumably only) Transport document
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

  const handleAddPlace = async (newPlace) => {
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
      const placesRef = collection(db, "Schools", auth.currentUser.uid, "Transport", transportId, "PlaceSetup")
      const docRef = await addDoc(placesRef, newPlace)
      console.log("Place added with ID:", docRef.id)
      setIsAddModalOpen(false)
      toast.success("Place added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchPlaces()
    } catch (error) {
      console.error("Error adding place:", error)
      toast.error("Failed to add place. Please try again.", {
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

  const handleEditPlace = async (id, updatedPlace) => {
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
      const placeRef = doc(db, "Schools", auth.currentUser.uid, "Transport", transportId, "PlaceSetup", id)
      await updateDoc(placeRef, updatedPlace)
      console.log("Place updated:", id)
      setIsEditModalOpen(false)
      setSelectedPlace(null)
      toast.success("Place updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchPlaces()
    } catch (error) {
      console.error("Error updating place:", error)
      toast.error("Failed to update place. Please try again.", {
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

  const handleDeletePlace = async (id) => {
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
      const placeRef = doc(db, "Schools", auth.currentUser.uid, "Transport", transportId, "PlaceSetup", id)
      await deleteDoc(placeRef)
      console.log("Place deleted:", id)
      setIsDeleteModalOpen(false)
      setSelectedPlace(null)
      toast.success("Place deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchPlaces()
    } catch (error) {
      console.error("Error deleting place:", error)
      toast.error("Failed to delete place. Please try again.", {
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

  const openEditModal = (place) => {
    setSelectedPlace(place)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (place) => {
    setSelectedPlace(place)
    setIsDeleteModalOpen(true)
  }

  const filteredPlaces = places.filter(
    (place) =>
      place.placeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.routeNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Transport</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Place Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="place-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Place Setup</h2>
                  <h6 className="m-0 d-lg-none">Place Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Place
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Place Name or Route Number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Place Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Place Name</th>
                          <th>Route Number</th>
                          <th>Fee</th>
                          <th>Driver Name</th>
                          <th>Conductor Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlaces.map((place) => (
                          <tr key={place.id}>
                            <td>{place.placeName}</td>
                            <td>{place.routeNumber}</td>
                            <td>{place.fee}</td>
                            <td>{place.driverName}</td>
                            <td>{place.conductorName}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(place)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(place)}
                              >
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
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <AddPlaceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onConfirm={handleAddPlace} />
      <EditPlaceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPlace(null)
        }}
        onConfirm={handleEditPlace}
        placeData={selectedPlace}
      />
      <DeletePlaceModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedPlace(null)
        }}
        onConfirm={handleDeletePlace}
        placeData={selectedPlace}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .place-setup-container {
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

export default PlaceSetup

