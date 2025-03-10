import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table } from 'react-bootstrap';
import { db, auth } from "../../Firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

// Add Supplier Modal Component
const AddSupplierModal = ({ isOpen, onClose, onConfirm, nextSupplierCode }) => {
  const [supplierName, setSupplierName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [otherDetails, setOtherDetails] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(nextSupplierCode, supplierName, address, phoneNumber, email, contactPerson, otherDetails);
    setSupplierName("");
    setAddress("");
    setPhoneNumber("");
    setEmail("");
    setContactPerson("");
    setOtherDetails("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Supplier</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Supplier Code</Form.Label>
            <Form.Control
              type="text"
              value={nextSupplierCode}
              readOnly
              className="custom-input bg-light"
            />
            <Form.Text className="text-muted">
              Supplier code is auto-generated
            </Form.Text>
          </Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="email"
            placeholder="Enter E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Other Details"
            value={otherDetails}
            onChange={(e) => setOtherDetails(e.target.value)}
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

// Edit Supplier Modal Component
const EditSupplierModal = ({ isOpen, onClose, onConfirm, supplier }) => {
  const [supplierName, setSupplierName] = useState(supplier?.supplierName || "");
  const [address, setAddress] = useState(supplier?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(supplier?.phoneNumber || "");
  const [email, setEmail] = useState(supplier?.email || "");
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson || "");
  const [otherDetails, setOtherDetails] = useState(supplier?.otherDetails || "");

  useEffect(() => {
    if (supplier) {
      setSupplierName(supplier.supplierName);
      setAddress(supplier.address);
      setPhoneNumber(supplier.phoneNumber);
      setEmail(supplier.email);
      setContactPerson(supplier.contactPerson);
      setOtherDetails(supplier.otherDetails);
    }
  }, [supplier]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(supplier.id, supplier.supplierCode, supplierName, address, phoneNumber, email, contactPerson, otherDetails);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Supplier</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Supplier Code</Form.Label>
            <Form.Control
              type="text"
              value={supplier?.supplierCode || ""}
              readOnly
              className="custom-input bg-light"
            />
            <Form.Text className="text-muted">
              Supplier code cannot be changed
            </Form.Text>
          </Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter Supplier Name"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="email"
            placeholder="Enter E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Contact Person"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Other Details"
            value={otherDetails}
            onChange={(e) => setOtherDetails(e.target.value)}
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

// View Supplier Modal Component
const ViewSupplierModal = ({ isOpen, onClose, supplier }) => {
  if (!isOpen || !supplier) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Supplier Details</h2>
        <div className="modal-body">
          <div className="supplier-detail">
            <strong>Supplier Code:</strong> {supplier.supplierCode}
          </div>
          <div className="supplier-detail">
            <strong>Supplier Name:</strong> {supplier.supplierName}
          </div>
          <div className="supplier-detail">
            <strong>Address:</strong> {supplier.address}
          </div>
          <div className="supplier-detail">
            <strong>Phone Number:</strong> {supplier.phoneNumber}
          </div>
          <div className="supplier-detail">
            <strong>E-Mail:</strong> {supplier.email}
          </div>
          <div className="supplier-detail">
            <strong>Contact Person:</strong> {supplier.contactPerson}
          </div>
          <div className="supplier-detail">
            <strong>Other Details:</strong> {supplier.otherDetails}
          </div>
          <div className="supplier-detail">
            <strong>Created At:</strong> {supplier.createdAt?.toDate().toLocaleString() || "N/A"}
          </div>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button cancel" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Delete Supplier Modal Component
const DeleteSupplierModal = ({ isOpen, onClose, onConfirm, supplier }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Supplier</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this supplier?</p>
          <p className="fw-bold">{supplier?.supplierName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(supplier.id)}>
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

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, supplier, newSupplier }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this supplier? This may affect related data.</p>
          <p><strong>Supplier Code:</strong> {supplier?.supplierCode}</p>
          <p><strong>Current Supplier Name:</strong> {supplier?.supplierName}</p>
          <p><strong>New Supplier Name:</strong> {newSupplier?.supplierName}</p>
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
  );
};

const SupplierSetup = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [newSupplierData, setNewSupplierData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [nextSupplierCode, setNextSupplierCode] = useState("SUP-1");
  const location = useLocation();

  // Fetch or create Store ID
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const storeRef = collection(db, "Schools", auth.currentUser.uid, "Store");
        const q = query(storeRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const newStoreRef = await addDoc(storeRef, { createdAt: new Date() });
          setStoreId(newStoreRef.id);
        } else {
          setStoreId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching/creating Store ID:", error);
        toast.error("Failed to initialize store. Please try again.");
      }
    };

    fetchStoreId();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchSuppliers();
    }
  }, [storeId]);

  const fetchSuppliers = async () => {
    if (!storeId) return;

    try {
      const suppliersRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "SupplierSetup");
      const querySnapshot = await getDocs(suppliersRef);
      const suppliersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSuppliers(suppliersData);
      
      // Generate next supplier code
      generateNextSupplierCode(suppliersData);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers. Please try again.");
    }
  };

  // Generate the next supplier code based on existing suppliers
  const generateNextSupplierCode = (suppliersData) => {
    if (!suppliersData || suppliersData.length === 0) {
      setNextSupplierCode("SUP-1");
      return;
    }

    // Extract numbers from existing supplier codes
    const supplierNumbers = suppliersData.map(supplier => {
      const match = supplier.supplierCode.match(/SUP-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    // Find the highest number and increment by 1
    const nextNumber = Math.max(...supplierNumbers) + 1;
    setNextSupplierCode(`SUP-${nextNumber}`);
  };

  const handleAddSupplier = async (supplierCode, supplierName, address, phoneNumber, email, contactPerson, otherDetails) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    if (!supplierName) {
      toast.error("Supplier Name is a required field.");
      return;
    }

    try {
      const suppliersRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "SupplierSetup");
      await addDoc(suppliersRef, { 
        supplierCode, 
        supplierName, 
        address, 
        phoneNumber, 
        email, 
        contactPerson, 
        otherDetails, 
        createdAt: new Date() 
      });
      setIsAddModalOpen(false);
      toast.success("Supplier added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      });
      await fetchSuppliers();
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier. Please try again.");
    }
  };

  const handleEditSupplier = async (supplierId, supplierCode, supplierName, address, phoneNumber, email, contactPerson, otherDetails) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    if (!supplierName) {
      toast.error("Supplier Name is a required field.");
      return;
    }

    setIsEditModalOpen(false);
    setIsConfirmEditModalOpen(true);
    setNewSupplierData({ supplierId, supplierCode, supplierName, address, phoneNumber, email, contactPerson, otherDetails });
  };

  const confirmEditSupplier = async () => {
    try {
      const supplierRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "SupplierSetup", newSupplierData.supplierId);
      await updateDoc(supplierRef, { 
        supplierName: newSupplierData.supplierName, 
        address: newSupplierData.address, 
        phoneNumber: newSupplierData.phoneNumber, 
        email: newSupplierData.email, 
        contactPerson: newSupplierData.contactPerson, 
        otherDetails: newSupplierData.otherDetails,
        updatedAt: new Date()
      });
      setIsConfirmEditModalOpen(false);
      setSelectedSupplier(null);
      setNewSupplierData(null);
      toast.success("Supplier updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      });
      await fetchSuppliers();
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier. Please try again.");
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    try {
      const supplierRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "SupplierSetup", supplierId);
      await deleteDoc(supplierRef);
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      toast.success("Supplier deleted successfully!");
      await fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier. Please try again.");
    }
  };

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const openViewModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleReset = () => {
    setSearchTerm("");
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Supplier Setup</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="supplier-setup-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Supplier Details Setup</h2>
                  <h6 className="m-0 d-lg-none">Supplier Details Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Supplier
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Supplier Code or Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Supplier Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Supplier Code</th>
                          <th>Supplier Name</th>
                          <th>Phone Number</th>
                          <th>Email</th>
                          <th>Contact Person</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSuppliers.map((supplier) => (
                          <tr key={supplier.id}>
                            <td>{supplier.supplierCode}</td>
                            <td>{supplier.supplierName}</td>
                            <td>{supplier.phoneNumber}</td>
                            <td>{supplier.email}</td>
                            <td>{supplier.contactPerson}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button view-button me-2"
                                onClick={() => openViewModal(supplier)}
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(supplier)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(supplier)}
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Button Group */}
                  <div className="button-group mt-4">
                    <Button 
                      style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                      type="button"
                      className="custom-btn-clr px-4 py-2"
                      onClick={() => setIsAddModalOpen(true)}
                    >
                      Insert
                    </Button>
                    <Button 
                      style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                      type="button"
                      className="custom-btn-clr px-4 py-2"
                      onClick={() => {
                        if (selectedSupplier) {
                          openEditModal(selectedSupplier);
                        } else {
                          toast.info("Please select a supplier to edit");
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="danger" 
                      type="button"
                      className="reset-btn px-4 py-2"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                    <Button 
                      variant="secondary" 
                      type="button"
                      className="cancel-btn px-4 py-2"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedSupplier(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddSupplier}
        nextSupplierCode={nextSupplierCode}
      />
      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSupplier(null);
        }}
        onConfirm={handleEditSupplier}
        supplier={selectedSupplier}
      />
      <ViewSupplierModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSupplier(null);
        }}
        supplier={selectedSupplier}
      />
      <DeleteSupplierModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSupplier(null);
        }}
        onConfirm={handleDeleteSupplier}
        supplier={selectedSupplier}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false);
          setSelectedSupplier(null);
          setNewSupplierData(null);
        }}
        onConfirm={confirmEditSupplier}
        supplier={selectedSupplier}
        newSupplier={newSupplierData}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .supplier-setup-container {
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

          .view-button {
            background-color: #28a745;
          }

          .view-button:hover {
            background-color: #218838;
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

          .button-group {
            display: flex;
            gap: 10px;
            justify-content: center;
          }

          .custom-btn-clr {
            background-color: #0B3D7B;
            border-color: #0B3D7B;
          }

          .reset-btn {
            background-color: #dc3545;
            border-color: #dc3545;
          }

          .cancel-btn {
            background-color: #6c757d;
            border-color: #6c757d;
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
            max-width: 500px;
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

          .supplier-detail {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
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
        `}
      </style>
    </MainContentPage>
  );
};

export default SupplierSetup;