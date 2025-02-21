"use client"

import { useState, useEffect } from "react"
import { Container, Form, Button, Table } from "react-bootstrap"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Link, useNavigate } from "react-router-dom"
import { db, auth } from "../../../Firebase/config"
import { collection, getDocs, deleteDoc, doc, query, limit, addDoc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Staff Member</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this staff member?</p>
          <p className="fw-bold">{itemName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={onConfirm}>
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

const StaffMaster = () => {
  const [staffMembers, setStaffMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [administrationId, setAdministrationId] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState(null)
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
        toast.error("Failed to initialize. Please try again.", {
          style: { background: "#dc3545", color: "white" },
        })
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchStaffMembers()
    }
  }, [administrationId])

  const fetchStaffMembers = async () => {
    try {
      const staffRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StaffMaster",
      )
      const querySnapshot = await getDocs(staffRef)
      const staffData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStaffMembers(staffData)
    } catch (error) {
      console.error("Error fetching staff members:", error)
      toast.error("Failed to fetch staff members. Please try again.", {
        style: { background: "#dc3545", color: "white" },
      })
    }
  }

  const handleDelete = async () => {
    try {
      const staffRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StaffMaster",
        staffToDelete.id,
      )
      await deleteDoc(staffRef)
      toast.success("Staff member deleted successfully!", {
        style: { background: "#dc3545", color: "white" },
      })
      fetchStaffMembers()
      setIsDeleteModalOpen(false)
      setStaffToDelete(null)
    } catch (error) {
      console.error("Error deleting staff member:", error)
      toast.error("Failed to delete staff member. Please try again.", {
        style: { background: "#dc3545", color: "white" },
      })
    }
  }

  const filteredStaffMembers = staffMembers.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.staffCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/administration">Administration</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Staff Master</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2>Staff Master</h2>
          <Button onClick={() => navigate("/admin/staff-form")} className="btn btn-light text-dark">
            + Add Staff
          </Button>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form className="mb-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Search by name or staff code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Form>

          <div className="table-responsive">
            <Table bordered hover>
              <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                <tr>
                  <th>Staff Code</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Mobile Number</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffMembers.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.staffCode}</td>
                    <td>{staff.name}</td>
                    <td>{staff.designation}</td>
                    <td>{staff.mobileNumber}</td>
                    <td>
                      <Button
                        variant="secondary"
                        className="action-button view-button me-2"
                        onClick={() => navigate(`/admin/staff-form/${staff.id}?mode=view`)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="link"
                        className="action-button edit-button me-2"
                        onClick={() => navigate(`/admin/staff-form/${staff.id}`)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        className="action-button delete-button"
                        onClick={() => {
                          setStaffToDelete(staff)
                          setIsDeleteModalOpen(true)
                        }}
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
      </Container>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setStaffToDelete(null)
        }}
        onConfirm={handleDelete}
        itemName={staffToDelete?.name}
      />

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

          .view-button {
            background-color: #6c757d;
          }

          .view-button:hover {
            background-color: #5a6268;
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

          .modal-button.delete {
            background-color: #dc3545;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
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

export default StaffMaster

