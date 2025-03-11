import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { db, auth } from "../../../Firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query } from "firebase/firestore";
import { useAuthContext } from "../../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Add SubHead Modal Component
const AddSubHeadModal = ({ isOpen, onClose, onConfirm, mainHeads }) => {
  const [mainHead, setMainHead] = useState("");
  const [subHeadName, setSubHeadName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(mainHead, subHeadName);
    setMainHead("");
    setSubHeadName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Sub Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Select Main Head</Form.Label>
            <Form.Control
              as="select"
              value={mainHead}
              onChange={(e) => setMainHead(e.target.value)}
              className="custom-input mb-3"
            >
              <option value="">-- Select Main Head --</option>
              {mainHeads.map((head) => (
                <option key={head.id} value={head.id}>
                  {head.headName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Sub Head Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Sub Head Name"
              value={subHeadName}
              onChange={(e) => setSubHeadName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
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

// Edit SubHead Modal Component
const EditSubHeadModal = ({ isOpen, onClose, onConfirm, subHead, mainHeads }) => {
  const [mainHead, setMainHead] = useState(subHead?.mainHeadId || "");
  const [subHeadName, setSubHeadName] = useState(subHead?.subHeadName || "");

  useEffect(() => {
    if (subHead) {
      setMainHead(subHead.mainHeadId);
      setSubHeadName(subHead.subHeadName);
    }
  }, [subHead]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(subHead.id, mainHead, subHeadName);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Sub Head</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Select Main Head</Form.Label>
            <Form.Control
              as="select"
              value={mainHead}
              onChange={(e) => setMainHead(e.target.value)}
              className="custom-input mb-3"
            >
              <option value="">-- Select Main Head --</option>
              {mainHeads.map((head) => (
                <option key={head.id} value={head.id}>
                  {head.headName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Enter Sub Head Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Sub Head Name"
              value={subHeadName}
              onChange={(e) => setSubHeadName(e.target.value)}
              className="custom-input"
            />
          </Form.Group>
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

// Delete SubHead Modal Component
const DeleteSubHeadModal = ({ isOpen, onClose, onConfirm, subHead }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Sub Head</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this sub head?</p>
          <p className="fw-bold">{subHead?.subHeadName}</p>
          <p>Main Head: {subHead?.mainHeadName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(subHead.id)}>
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

const ReceiptSubHeadSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubHead, setSelectedSubHead] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [subHeads, setSubHeads] = useState([]);
  const [mainHeads, setMainHeads] = useState([]);
  const [administrationId, setAdministrationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuthContext();

  // Reset state and fetch data when user changes
  useEffect(() => {
    const resetState = () => {
      setSubHeads([]);
      setMainHeads([]);
      setAdministrationId(null);
      setSearchTerm("");
      setSelectedSubHead(null);
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
        toast.error("Please log in to view and manage receipt sub heads.", {
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
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    if (administrationId && auth.currentUser) {
      fetchMainHeads();
      fetchSubHeads();
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

  const fetchMainHeads = async () => {
    if (!administrationId || !auth.currentUser) return;

    try {
      const headsRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "ReceiptHeadSetup");
      const querySnapshot = await getDocs(headsRef);
      const headsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched main heads for user", auth.currentUser.uid, ":", headsData);
      setMainHeads(headsData);
    } catch (error) {
      console.error("Error fetching main heads:", error);
      toast.error("Failed to fetch main heads. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setMainHeads([]);
    }
  };

  const fetchSubHeads = async () => {
    if (!administrationId || !auth.currentUser) return;

    try {
      setIsLoading(true);
      const subHeadsRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "ReceiptSubHeadSetup");
      const querySnapshot = await getDocs(subHeadsRef);
      const subHeadsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched sub heads for user", auth.currentUser.uid, ":", subHeadsData);
      setSubHeads(subHeadsData);
    } catch (error) {
      console.error("Error fetching sub heads:", error);
      toast.error("Failed to fetch sub heads. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSubHeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubHead = async (mainHeadId, subHeadName) => {
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

    if (!mainHeadId) {
      toast.error("Please select a main head.", {
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

    if (!subHeadName.trim()) {
      toast.error("Sub head name cannot be empty.", {
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

    const isDuplicate = subHeads.some(
      (subHead) =>
        subHead.mainHeadId === mainHeadId &&
        subHead.subHeadName.toLowerCase() === subHeadName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("A sub head with this name already exists under the selected main head.", {
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
      const mainHead = mainHeads.find((head) => head.id === mainHeadId);
      if (!mainHead) {
        toast.error("Selected main head not found.", {
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

      const subHeadsRef = collection(db, "Schools", auth.currentUser.uid, "Administration", administrationId, "ReceiptSubHeadSetup");
      const docRef = await addDoc(subHeadsRef, {
        mainHeadId,
        mainHeadName: mainHead.headName,
        subHeadName: subHeadName.trim(),
        createdAt: new Date(),
      });
      console.log("Receipt sub head added with ID:", docRef.id, "for user:", auth.currentUser.uid);

      const newSubHead = {
        id: docRef.id,
        mainHeadId,
        mainHeadName: mainHead.headName,
        subHeadName: subHeadName.trim(),
        createdAt: new Date(),
      };
      setSubHeads((prevSubHeads) => [...prevSubHeads, newSubHead]);

      setIsAddModalOpen(false);
      toast.success("Receipt sub head added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      });

      await fetchSubHeads();
    } catch (error) {
      console.error("Error adding receipt sub head:", error);
      toast.error("Failed to add receipt sub head. Please try again.", {
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

  const handleEditSubHead = async (subHeadId, mainHeadId, newSubHeadName) => {
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

    if (!mainHeadId) {
      toast.error("Please select a main head.", {
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

    if (!newSubHeadName.trim()) {
      toast.error("Sub head name cannot be empty.", {
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

    const isDuplicate = subHeads.some(
      (subHead) =>
        subHead.id !== subHeadId &&
        subHead.mainHeadId === mainHeadId &&
        subHead.subHeadName.toLowerCase() === newSubHeadName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("A sub head with this name already exists under the selected main head.", {
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
      const mainHead = mainHeads.find((head) => head.id === mainHeadId);
      if (!mainHead) {
        toast.error("Selected main head not found.", {
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

      const subHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ReceiptSubHeadSetup",
        subHeadId
      );
      await updateDoc(subHeadRef, {
        mainHeadId,
        mainHeadName: mainHead.headName,
        subHeadName: newSubHeadName.trim(),
        updatedAt: new Date(),
      });
      console.log("Receipt sub head updated:", subHeadId, "for user:", auth.currentUser.uid);

      setSubHeads((prevSubHeads) =>
        prevSubHeads.map((subHead) =>
          subHead.id === subHeadId
            ? { ...subHead, mainHeadId, mainHeadName: mainHead.headName, subHeadName: newSubHeadName.trim(), updatedAt: new Date() }
            : subHead
        )
      );

      setIsEditModalOpen(false);
      setSelectedSubHead(null);
      toast.success("Receipt sub head updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      });

      await fetchSubHeads();
    } catch (error) {
      console.error("Error updating receipt sub head:", error);
      toast.error("Failed to update receipt sub head. Please try again.", {
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

  const handleDeleteSubHead = async (subHeadId) => {
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
      const subHeadRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "ReceiptSubHeadSetup",
        subHeadId
      );
      await deleteDoc(subHeadRef);
      console.log("Receipt sub head deleted:", subHeadId, "for user:", auth.currentUser.uid);

      setSubHeads((prevSubHeads) => prevSubHeads.filter((subHead) => subHead.id !== subHeadId));

      setIsDeleteModalOpen(false);
      setSelectedSubHead(null);
      toast.success("Receipt sub head deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      await fetchSubHeads();
    } catch (error) {
      console.error("Error deleting receipt sub head:", error);
      toast.error("Failed to delete receipt sub head. Please try again.", {
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

  const openEditModal = (subHead) => {
    setSelectedSubHead(subHead);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (subHead) => {
    setSelectedSubHead(subHead);
    setIsDeleteModalOpen(true);
  };

  const filteredSubHeads = subHeads.filter((subHead) =>
    (subHead.subHeadName && subHead.subHeadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subHead.mainHeadName && subHead.mainHeadName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator"> &gt; </span>
          <span>Administration</span>
          <span className="separator"> &gt; </span>
          <Link to="/admin/receipt-setup">Receipt Setup</Link>
          <span className="separator"> &gt; </span>
          <span className="current">Receipt Sub Head Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="m-0 d-none d-lg-block">Sub Head Of Account</h2>
                    <h6 className="m-0 d-lg-none">Sub Head Of Account</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                      + Add Sub Head
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Sub Head or Main Head Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Sub Heads Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Main Head Name</th>
                          <th>Sub Head Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="3" className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : subHeads.length === 0 ? (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No data available
                            </td>
                          </tr>
                        ) : filteredSubHeads.length === 0 && searchTerm ? (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No matching sub heads found
                            </td>
                          </tr>
                        ) : (
                          filteredSubHeads.map((subHead) => (
                            <tr key={subHead.id}>
                              <td>{subHead.mainHeadName}</td>
                              <td>{subHead.subHeadName}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(subHead)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(subHead)}
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
      <AddSubHeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddSubHead}
        mainHeads={mainHeads}
      />
      <EditSubHeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubHead(null);
        }}
        onConfirm={handleEditSubHead}
        subHead={selectedSubHead}
        mainHeads={mainHeads}
      />
      <DeleteSubHeadModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSubHead(null);
        }}
        onConfirm={handleDeleteSubHead}
        subHead={selectedSubHead}
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

export default ReceiptSubHeadSetup;