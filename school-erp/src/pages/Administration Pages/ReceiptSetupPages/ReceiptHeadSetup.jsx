import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { db, auth } from "../../../Firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getFirestore } from "firebase/firestore";
import { useAuthContext } from "../../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Add Head Modal Component
const AddHeadModal = ({ isOpen, onClose, onConfirm }) => {
  const [headName, setHeadName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(headName);
    setHeadName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Head</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter New Head Name"
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
  );
};

// Edit Head Modal Component
const EditHeadModal = ({ isOpen, onClose, onConfirm, head }) => {
  const [headName, setHeadName] = useState(head?.headName || "");

  useEffect(() => {
    if (head) {
      setHeadName(head.headName);
    }
  }, [head]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(head.id, headName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Head</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Head Name"
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
  );
};

// Delete Head Modal Component
const DeleteHeadModal = ({ isOpen, onClose, onConfirm, head }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this head?</p>
          <p className="fw-bold">{head?.headName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(head.id)}>
            Delete
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReceiptHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHead, setSelectedHead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [heads, setHeads] = useState([]);
  const [administrationId, setAdministrationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuthContext();
  const db = getFirestore();

  // Reset state and fetch data when user changes
  useEffect(() => {
    const resetState = () => {
      setHeads([]);
      setAdministrationId(null);
      setSearchTerm("");
      setSelectedHead(null);
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(false);
    };

    resetState();

    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid);
        await fetchAdministrationId();
      } else {
        console.log("User is not authenticated");
        toast.error("Please log in to view and manage receipt heads.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();

    return () => resetState();
  }, [auth.currentUser?.uid]); // Re-run on user change

  useEffect(() => {
    if (administrationId && auth.currentUser) {
      fetchHeads();
    }
  }, [administrationId]);

  const fetchAdministrationId = async () => {
    if (!auth.currentUser) return;

    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration");
      const q = query(adminRef);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const newAdminRef = await addDoc(adminRef, { createdAt: new Date() });
        setAdministrationId(newAdminRef.id);
        console.log("New Administration ID created:", newAdminRef.id);
      } else {
        const adminId = querySnapshot.docs[0].id;
        setAdministrationId(adminId);
        console.log("Existing Administration ID fetched:", adminId);
      }
    } catch (error) {
      console.error("Error fetching/creating Administration ID:", error);
      toast.error("Failed to initialize administration data. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const fetchHeads = async () => {
    if (!administrationId || !auth.currentUser) return;

    try {
      setIsLoading(true);
      const headsRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "ReceiptHeadSetup");
      const querySnapshot = await getDocs(headsRef);
      const headsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched receipt heads for user", auth.currentUser.uid, ":", headsData);
      setHeads(headsData); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching receipt heads:", error);
      toast.error("Failed to fetch receipt heads. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setHeads([]); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHead = async (headName) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (!headName.trim()) {
      toast.error("Head name cannot be empty.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const isDuplicate = heads.some((head) => head.headName.toLowerCase() === headName.toLowerCase());
    if (isDuplicate) {
      toast.error("A head with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const headsRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "ReceiptHeadSetup");
      const docRef = await addDoc(headsRef, { 
        headName: headName.trim(),
        createdAt: new Date()
      });
      console.log("Receipt head added with ID:", docRef.id, "for user:", auth.currentUser.uid);

      // Immediately update UI
      const newHead = { id: docRef.id, headName: headName.trim(), createdAt: new Date() };
      setHeads((prevHeads) => [...prevHeads, newHead]);

      setIsAddModalOpen(false);
      toast.success("Receipt head added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      });

      // Fetch fresh data to ensure consistency
      await fetchHeads();
    } catch (error) {
      console.error("Error adding receipt head:", error);
      toast.error("Failed to add receipt head. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleEditHead = async (headId, newHeadName) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    if (!newHeadName.trim()) {
      toast.error("Head name cannot be empty.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const isDuplicate = heads.some(
      (head) => head.id !== headId && head.headName.toLowerCase() === newHeadName.toLowerCase(),
    );
    if (isDuplicate) {
      toast.error("A head with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const headRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ReceiptHeadSetup",
        headId
      );
      await updateDoc(headRef, { 
        headName: newHeadName.trim(),
        updatedAt: new Date()
      });
      console.log("Receipt head updated:", headId, "for user:", auth.currentUser.uid);

      // Immediately update UI
      setHeads((prevHeads) =>
        prevHeads.map((head) =>
          head.id === headId ? { ...head, headName: newHeadName.trim(), updatedAt: new Date() } : head
        )
      );

      setIsEditModalOpen(false);
      setSelectedHead(null);
      toast.success("Receipt head updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      });

      // Fetch fresh data
      await fetchHeads();
    } catch (error) {
      console.error("Error updating receipt head:", error);
      toast.error("Failed to update receipt head. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleDeleteHead = async (headId) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    try {
      const headRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ReceiptHeadSetup",
        headId
      );
      await deleteDoc(headRef);
      console.log("Receipt head deleted:", headId, "for user:", auth.currentUser.uid);

      // Immediately update UI
      setHeads((prevHeads) => prevHeads.filter((head) => head.id !== headId));

      setIsDeleteModalOpen(false);
      setSelectedHead(null);
      toast.success("Receipt head deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Fetch fresh data
      await fetchHeads();
    } catch (error) {
      console.error("Error deleting receipt head:", error);
      toast.error("Failed to delete receipt head. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const openEditModal = (head) => {
    setSelectedHead(head);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (head) => {
    setSelectedHead(head);
    setIsDeleteModalOpen(true);
  };

  const filteredHeads = heads.filter((head) =>
    head.headName && head.headName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb d-flex align-items-center py-1 py-lg-3">
  <Link to="/home" className="text-decoration-none text-primary">Home</Link>
  <span className="mx-2">&gt;</span>
  <span>Administration</span>
  <span className="mx-2">&gt;</span>
  <Link to="/admin/receipt-setup" className="text-decoration-none text-primary">Receipt Setup</Link>
  <span className="mx-2">&gt;</span>
  <span className="fw-bold">Receipt Head Setup</span>
</nav>

        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Head Of Account</h2>
                    <h6 className="m-0 d-lg-none">Head Of Account</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                      + Add Head
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Head Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Heads Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Head Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : heads.length === 0 ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredHeads.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="2" className="text-center">
                              No matching heads found
                            </td>
                          </tr>
                        ) : (
                          filteredHeads.map((head) => (
                            <tr key={head.id}>
                              <td>{head.headName}</td>
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
      <AddHeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onConfirm={handleAddHead} />
      <EditHeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedHead(null);
        }}
        onConfirm={handleEditHead}
        head={selectedHead}
      />
      <DeleteHeadModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedHead(null);
        }}
        onConfirm={handleDeleteHead}
        head={selectedHead}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .course-setup-container {
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
  );
};

export default ReceiptHeadSetup;