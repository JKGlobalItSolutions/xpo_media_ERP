"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore"
import { useAuthContext } from "../../../context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx" // For import/export functionality

// Add Payment Head Modal Component
const AddPaymentHeadModal = ({ isOpen, onClose, onConfirm }) => {
  const [headName, setHeadName] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(headName)
    setHeadName("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Payment Head</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Payment Head Name"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
            className="custom-input"
          />
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Payment Head Modal Component
const EditPaymentHeadModal = ({ isOpen, onClose, onConfirm, paymentHead }) => {
  const [headName, setHeadName] = useState(paymentHead?.name || "")

  useEffect(() => {
    if (paymentHead) {
      setHeadName(paymentHead.name)
    }
  }, [paymentHead])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(paymentHead.id, headName)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Payment Head</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Payment Head Name"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
            className="custom-input"
          />
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Payment Head Modal Component
const DeletePaymentHeadModal = ({ isOpen, onClose, onConfirm, paymentHead }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Payment Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this payment head?</p>
          <p className="fw-bold">{paymentHead?.name}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(paymentHead.id)}>
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

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentName, newName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this payment head? This may affect the structure of payment data.</p>
          <p>
            <strong>Current Name:</strong> {currentName}
          </p>
          <p>
            <strong>New Name:</strong> {newName}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={onConfirm}>
            Confirm Edit
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const PaymentHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedPaymentHead, setSelectedPaymentHead] = useState(null)
  const [newHeadName, setNewHeadName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentHeads, setPaymentHeads] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [administrationId, setAdministrationId] = useState(null)
  const { user } = useAuthContext()
  const location = useLocation()

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchAdministrationId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage payment heads.", {
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
    if (administrationId) {
      fetchPaymentHeads()
    }
  }, [administrationId])

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

  const fetchPaymentHeads = async () => {
    if (!administrationId) return

    setError(null)
    try {
      const paymentHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "PaymentHeadSetup",
      )
      const querySnapshot = await getDocs(paymentHeadsRef)
      const paymentHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log("Fetched payment heads:", paymentHeadsData)
      setPaymentHeads(paymentHeadsData)
    } catch (error) {
      console.error("Error fetching payment heads:", error)
      toast.error("Failed to fetch payment heads. Please try again.", {
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

  const handleAddPaymentHead = async (name) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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

    if (!name.trim()) {
      toast.error("Payment head name cannot be empty.", {
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

    const isDuplicate = paymentHeads.some((head) => head.name.toLowerCase() === name.toLowerCase())
    if (isDuplicate) {
      toast.error("A payment head with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const paymentHeadsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "PaymentHeadSetup",
      )
      const docRef = await addDoc(paymentHeadsRef, { name })
      console.log("Payment head added with ID:", docRef.id)

      // Immediately update UI
      const newPaymentHead = { id: docRef.id, name }
      setPaymentHeads((prevHeads) => [...prevHeads, newPaymentHead])

      setIsAddModalOpen(false)
      toast.success("Payment head added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchPaymentHeads()
    } catch (error) {
      console.error("Error adding payment head:", error)
      toast.error("Failed to add payment head. Please try again.", {
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

  const handleEditPaymentHead = async (headId, newName) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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

    if (!newName.trim()) {
      toast.error("Payment head name cannot be empty.", {
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

    const isDuplicate = paymentHeads.some(
      (head) => head.id !== headId && head.name.toLowerCase() === newName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A payment head with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsEditModalOpen(false)
    setIsConfirmEditModalOpen(true)
    setNewHeadName(newName)
  }

  const confirmEditPaymentHead = async () => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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
      const headRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "PaymentHeadSetup",
        selectedPaymentHead.id,
      )
      await updateDoc(headRef, { name: newHeadName })
      console.log("Payment head updated:", selectedPaymentHead.id)

      // Immediately update UI
      setPaymentHeads((prevHeads) =>
        prevHeads.map((head) => (head.id === selectedPaymentHead.id ? { ...head, name: newHeadName } : head)),
      )

      setIsConfirmEditModalOpen(false)
      setSelectedPaymentHead(null)
      setNewHeadName("")
      toast.success("Payment head updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchPaymentHeads()
    } catch (error) {
      console.error("Error updating payment head:", error)
      toast.error("Failed to update payment head. Please try again.", {
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

  const handleDeletePaymentHead = async (headId) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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
      const headRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "PaymentHeadSetup",
        headId,
      )
      await deleteDoc(headRef)
      console.log("Payment head deleted:", headId)

      // Immediately update UI
      setPaymentHeads((prevHeads) => prevHeads.filter((head) => head.id !== headId))

      setIsDeleteModalOpen(false)
      setSelectedPaymentHead(null)
      toast.success("Payment head deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchPaymentHeads()
    } catch (error) {
      console.error("Error deleting payment head:", error)
      toast.error("Failed to delete payment head. Please try again.", {
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

  // Import function
  const handleImport = async (event) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
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

    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        toast.error("No data found in the imported file.")
        return
      }

      try {
        const paymentHeadsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "PaymentHeadSetup",
        )
        const newHeads = []
        for (const row of jsonData) {
          const name = row["Payment Head"] || row["name"] || row["Expense Name"]
          if (name && name.trim()) {
            const isDuplicate = paymentHeads.some((head) => head.name.toLowerCase() === name.toLowerCase())
            if (!isDuplicate) {
              const docRef = await addDoc(paymentHeadsRef, { name })
              newHeads.push({ id: docRef.id, name })
              console.log("Imported payment head:", name, "for user:", auth.currentUser.uid)
            }
          }
        }

        // Update UI with imported payment heads
        setPaymentHeads((prevHeads) => [...prevHeads, ...newHeads])

        toast.success("Payment heads imported successfully!", {
          style: { background: "#0B3D7B", color: "white" },
        })
        await fetchPaymentHeads()
      } catch (error) {
        console.error("Error importing payment heads:", error)
        toast.error("Failed to import payment heads. Please try again.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Export function
  const handleExport = () => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
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

    if (paymentHeads.length === 0) {
      toast.error("No data available to export.")
      return
    }

    const exportData = paymentHeads.map((head) => ({
      "Payment Head": head.name,
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "PaymentHeads")
    XLSX.writeFile(workbook, `PaymentHeads_Export_${auth.currentUser.uid}.xlsx`)
    toast.success("Payment heads exported successfully!", {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openEditModal = (head) => {
    setSelectedPaymentHead(head)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (head) => {
    setSelectedPaymentHead(head)
    setIsDeleteModalOpen(true)
  }

  const filteredPaymentHeads = paymentHeads.filter((head) => head.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <Row>
          <Col xs={12}>
            <div className="payment-head-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator"> &gt; </span>
                <span>Administration</span>
                <span className="separator"> &gt; </span>
                <Link to="/admin/payment-setup">Payment Setup</Link>
                <span className="separator"> &gt; </span>
                <span className="current">Receipt Head Setup</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Head Of Account</h2>
                    <h6 className="m-0 d-lg-none">Head Of Account</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleImport}
                      style={{ display: "none" }}
                      id="import-file"
                    />
                    <Button
                      onClick={() => document.getElementById("import-file").click()}
                      className="btn btn-light text-dark"
                    >
                      Import
                    </Button>
                    <Button onClick={handleExport} className="btn btn-light text-dark">
                      Export
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                      + Add Payment Head
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Payment Head Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Payment Heads Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Payment Head Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHeads.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredPaymentHeads.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No matching payment heads found
                            </td>
                          </tr>
                        ) : (
                          filteredPaymentHeads.map((head) => (
                            <tr key={head.id}>
                              <td>{head.name}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(head)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(head)}
                                >
                                  <FaTrash />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
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
      <AddPaymentHeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddPaymentHead}
      />
      <EditPaymentHeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPaymentHead(null)
        }}
        onConfirm={handleEditPaymentHead}
        paymentHead={selectedPaymentHead}
      />
      <DeletePaymentHeadModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedPaymentHead(null)
        }}
        onConfirm={handleDeletePaymentHead}
        paymentHead={selectedPaymentHead}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedPaymentHead(null)
          setNewHeadName("")
        }}
        onConfirm={confirmEditPaymentHead}
        currentName={selectedPaymentHead?.name}
        newName={newHeadName}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .payment-head-setup-container {
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

          .gap-2 {
            gap: 0.5rem;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default PaymentHeadSetup

