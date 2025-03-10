import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table } from 'react-bootstrap';
import { db, auth } from "../../Firebase/config";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, limit, orderBy, where } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaEye, FaSearch } from "react-icons/fa";

// Add Customer/Staff Modal Component
const AddCustomerStaffModal = ({ isOpen, onClose, onConfirm, nextCustomerStaffCode, states, districts }) => {
  const [customerStaffName, setCustomerStaffName] = useState("");
  const [numberStreetName, setNumberStreetName] = useState("");
  const [placePinCode, setPlacePinCode] = useState("");
  const [stateId, setStateId] = useState("");
  const [state, setState] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [district, setDistrict] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  if (!isOpen) return null;

  const handleStateChange = (e) => {
    const [id, name] = e.target.value.split("|");
    setStateId(id);
    setState(name);
  };

  const handleDistrictChange = (e) => {
    const [id, name] = e.target.value.split("|");
    setDistrictId(id);
    setDistrict(name);
  };

  const handleSubmit = () => {
    onConfirm(
      nextCustomerStaffCode, 
      customerStaffName, 
      numberStreetName, 
      placePinCode, 
      stateId, 
      state, 
      districtId, 
      district, 
      phoneNumber, 
      email, 
      contactPerson
    );
    setCustomerStaffName("");
    setNumberStreetName("");
    setPlacePinCode("");
    setStateId("");
    setState("");
    setDistrictId("");
    setDistrict("");
    setPhoneNumber("");
    setEmail("");
    setContactPerson("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Customer/Staff</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Customer/Staff Code</Form.Label>
            <Form.Control
              type="text"
              value={nextCustomerStaffCode}
              readOnly
              className="custom-input bg-light"
            />
            <Form.Text className="text-muted">
              Customer/Staff code is auto-generated
            </Form.Text>
          </Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter Customer/Staff Name"
            value={customerStaffName}
            onChange={(e) => setCustomerStaffName(e.target.value)}
            className="custom-input mb-3"
            required
          />
          <Form.Control
            type="text"
            placeholder="Enter Number & Street Name"
            value={numberStreetName}
            onChange={(e) => setNumberStreetName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Place/Pin Code"
            value={placePinCode}
            onChange={(e) => setPlacePinCode(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Select
            value={stateId && state ? `${stateId}|${state}` : ""}
            onChange={handleStateChange}
            className="custom-input mb-3"
          >
            <option value="">Select State</option>
            {states.map((stateItem) => (
              <option key={stateItem.id} value={`${stateItem.id}|${stateItem.state}`}>
                {stateItem.state}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            value={districtId && district ? `${districtId}|${district}` : ""}
            onChange={handleDistrictChange}
            className="custom-input mb-3"
          >
            <option value="">Select District</option>
            {districts.map((districtItem) => (
              <option key={districtItem.id} value={`${districtItem.id}|${districtItem.district}`}>
                {districtItem.district}
              </option>
            ))}
          </Form.Select>
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

// Edit Customer/Staff Modal Component
const EditCustomerStaffModal = ({ isOpen, onClose, onConfirm, customerStaff, states, districts }) => {
  const [customerStaffName, setCustomerStaffName] = useState(customerStaff?.customerStaffName || "");
  const [numberStreetName, setNumberStreetName] = useState(customerStaff?.numberStreetName || "");
  const [placePinCode, setPlacePinCode] = useState(customerStaff?.placePinCode || "");
  const [stateId, setStateId] = useState(customerStaff?.stateId || "");
  const [state, setState] = useState(customerStaff?.state || "");
  const [districtId, setDistrictId] = useState(customerStaff?.districtId || "");
  const [district, setDistrict] = useState(customerStaff?.district || "");
  const [phoneNumber, setPhoneNumber] = useState(customerStaff?.phoneNumber || "");
  const [email, setEmail] = useState(customerStaff?.email || "");
  const [contactPerson, setContactPerson] = useState(customerStaff?.contactPerson || "");

  useEffect(() => {
    if (customerStaff) {
      setCustomerStaffName(customerStaff.customerStaffName || "");
      setNumberStreetName(customerStaff.numberStreetName || "");
      setPlacePinCode(customerStaff.placePinCode || "");
      setStateId(customerStaff.stateId || "");
      setState(customerStaff.state || "");
      setDistrictId(customerStaff.districtId || "");
      setDistrict(customerStaff.district || "");
      setPhoneNumber(customerStaff.phoneNumber || "");
      setEmail(customerStaff.email || "");
      setContactPerson(customerStaff.contactPerson || "");
    }
  }, [customerStaff]);

  if (!isOpen) return null;

  const handleStateChange = (e) => {
    const [id, name] = e.target.value.split("|");
    setStateId(id);
    setState(name);
  };

  const handleDistrictChange = (e) => {
    const [id, name] = e.target.value.split("|");
    setDistrictId(id);
    setDistrict(name);
  };

  const handleSubmit = () => {
    onConfirm(
      customerStaff.id,
      customerStaff.customerStaffCode,
      customerStaffName,
      numberStreetName,
      placePinCode,
      stateId,
      state,
      districtId,
      district,
      phoneNumber,
      email,
      contactPerson
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Customer/Staff</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Customer/Staff Code</Form.Label>
            <Form.Control
              type="text"
              value={customerStaff?.customerStaffCode || ""}
              readOnly
              className="custom-input bg-light"
            />
            <Form.Text className="text-muted">
              Customer/Staff code cannot be changed
            </Form.Text>
          </Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter Customer/Staff Name"
            value={customerStaffName}
            onChange={(e) => setCustomerStaffName(e.target.value)}
            className="custom-input mb-3"
            required
          />
          <Form.Control
            type="text"
            placeholder="Enter Number & Street Name"
            value={numberStreetName}
            onChange={(e) => setNumberStreetName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Place/Pin Code"
            value={placePinCode}
            onChange={(e) => setPlacePinCode(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Select
            value={stateId && state ? `${stateId}|${state}` : ""}
            onChange={handleStateChange}
            className="custom-input mb-3"
          >
            <option value="">Select State</option>
            {states.map((stateItem) => (
              <option key={stateItem.id} value={`${stateItem.id}|${stateItem.state}`}>
                {stateItem.state}
              </option>
            ))}
          </Form.Select>
          <Form.Select
            value={districtId && district ? `${districtId}|${district}` : ""}
            onChange={handleDistrictChange}
            className="custom-input mb-3"
          >
            <option value="">Select District</option>
            {districts.map((districtItem) => (
              <option key={districtItem.id} value={`${districtItem.id}|${districtItem.district}`}>
                {districtItem.district}
              </option>
            ))}
          </Form.Select>
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

// View Customer/Staff Modal Component
const ViewCustomerStaffModal = ({ isOpen, onClose, customerStaff }) => {
  if (!isOpen || !customerStaff) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Customer/Staff Details</h2>
        <div className="modal-body">
          <div className="customer-staff-detail">
            <strong>Customer/Staff Code:</strong> {customerStaff.customerStaffCode}
          </div>
          <div className="customer-staff-detail">
            <strong>Customer/Staff Name:</strong> {customerStaff.customerStaffName}
          </div>
          <div className="customer-staff-detail">
            <strong>Number & Street Name:</strong> {customerStaff.numberStreetName}
          </div>
          <div className="customer-staff-detail">
            <strong>Place/Pin Code:</strong> {customerStaff.placePinCode}
          </div>
          <div className="customer-staff-detail">
            <strong>State:</strong> {customerStaff.state}
          </div>
          <div className="customer-staff-detail">
            <strong>District:</strong> {customerStaff.district}
          </div>
          <div className="customer-staff-detail">
            <strong>Phone Number:</strong> {customerStaff.phoneNumber}
          </div>
          <div className="customer-staff-detail">
            <strong>E-Mail:</strong> {customerStaff.email}
          </div>
          <div className="customer-staff-detail">
            <strong>Contact Person:</strong> {customerStaff.contactPerson}
          </div>
          <div className="customer-staff-detail">
            <strong>Created At:</strong> {customerStaff.createdAt?.toDate().toLocaleString() || "N/A"}
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

// Delete Customer/Staff Modal Component
const DeleteCustomerStaffModal = ({ isOpen, onClose, onConfirm, customerStaff }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Customer/Staff</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this customer/staff?</p>
          <p className="fw-bold">{customerStaff?.customerStaffName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(customerStaff.id)}>
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
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, customerStaff, newCustomerStaff }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this customer/staff? This may affect related data.</p>
          <p><strong>Customer/Staff Code:</strong> {customerStaff?.customerStaffCode}</p>
          <p><strong>Current Name:</strong> {customerStaff?.customerStaffName}</p>
          <p><strong>New Name:</strong> {newCustomerStaff?.customerStaffName}</p>
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

// Search Staff Modal Component
const SearchStaffModal = ({ isOpen, onClose, onSelect, staffList }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  if (!isOpen) return null;

  const filteredStaff = staffList.filter(staff => 
    staff.staffCode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Search Staff</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Search by Staff Code or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-input mb-3"
          />
          <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Staff Code</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.staffCode}</td>
                    <td>{staff.name}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelect(staff)}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const CustomerStaffMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  const [isSearchStaffModalOpen, setIsSearchStaffModalOpen] = useState(false);
  const [selectedCustomerStaff, setSelectedCustomerStaff] = useState(null);
  const [newCustomerStaffData, setNewCustomerStaffData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerStaffList, setCustomerStaffList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [administrationId, setAdministrationId] = useState(null);
  const [nextCustomerStaffCode, setNextCustomerStaffCode] = useState("CS-1");
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const location = useLocation();

  // Form state for the main form
  const [formData, setFormData] = useState({
    customerStaffCode: "",
    customerStaffName: "",
    numberStreetName: "",
    placePinCode: "",
    stateId: "",
    state: "",
    districtId: "",
    district: "",
    phoneNumber: "",
    email: "",
    contactPerson: ""
  });

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

  // Fetch or create Administration ID (for staff data)
  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration");
        const q = query(adminRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const newAdminRef = await addDoc(adminRef, { createdAt: new Date() });
          setAdministrationId(newAdminRef.id);
        } else {
          setAdministrationId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching/creating Administration ID:", error);
        toast.error("Failed to initialize. Please try again.");
      }
    };

    fetchAdministrationId();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchCustomerStaffList();
    }
  }, [storeId]);

  useEffect(() => {
    if (administrationId) {
      fetchStaffList();
      fetchStates();
      fetchDistricts();
    }
  }, [administrationId]);

  const fetchCustomerStaffList = async () => {
    if (!storeId) return;

    try {
      const customerStaffRef = collection(
        db, 
        "Schools", 
        auth.currentUser.uid, 
        "Store", 
        storeId, 
        "CustomerStaffMaster"
      );
      const querySnapshot = await getDocs(customerStaffRef);
      const customerStaffData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCustomerStaffList(customerStaffData);
      
      // Generate next customer/staff code
      generateNextCustomerStaffCode(customerStaffData);
    } catch (error) {
      console.error("Error fetching customer/staff list:", error);
      toast.error("Failed to fetch customer/staff list. Please try again.");
    }
  };

  const fetchStaffList = async () => {
    if (!administrationId) return;

    try {
      const staffRef = collection(
        db, 
        "Schools", 
        auth.currentUser.uid, 
        "Administration", 
        administrationId, 
        "StaffMaster"
      );
      const querySnapshot = await getDocs(staffRef);
      const staffData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStaffList(staffData);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      toast.error("Failed to fetch staff list. Please try again.");
    }
  };

  const fetchStates = async () => {
    if (!administrationId) return;

    try {
      const statesRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "StateSetup"
      );
      const querySnapshot = await getDocs(statesRef);
      const statesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStates(statesData);
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error("Failed to fetch states. Please try again.");
    }
  };

  const fetchDistricts = async () => {
    if (!administrationId) return;

    try {
      const districtsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "DistrictSetup"
      );
      const querySnapshot = await getDocs(districtsRef);
      const districtsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDistricts(districtsData);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Failed to fetch districts. Please try again.");
    }
  };

  // Generate the next customer/staff code based on existing entries
  const generateNextCustomerStaffCode = (customerStaffData) => {
    if (!customerStaffData || customerStaffData.length === 0) {
      setNextCustomerStaffCode("CS-1");
      return;
    }

    // Extract numbers from existing customer/staff codes
    const customerStaffNumbers = customerStaffData.map(cs => {
      const match = cs.customerStaffCode.match(/CS-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    // Find the highest number and increment by 1
    const nextNumber = Math.max(...customerStaffNumbers) + 1;
    setNextCustomerStaffCode(`CS-${nextNumber}`);
  };

  const handleAddCustomerStaff = async (
    customerStaffCode, 
    customerStaffName, 
    numberStreetName, 
    placePinCode, 
    stateId, 
    state, 
    districtId, 
    district, 
    phoneNumber, 
    email, 
    contactPerson
  ) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    if (!customerStaffName) {
      toast.error("Customer/Staff Name is a required field.");
      return;
    }

    try {
      const customerStaffRef = collection(
        db, 
        "Schools", 
        auth.currentUser.uid, 
        "Store", 
        storeId, 
        "CustomerStaffMaster"
      );
      await addDoc(customerStaffRef, { 
        customerStaffCode, 
        customerStaffName, 
        numberStreetName, 
        placePinCode, 
        stateId, 
        state, 
        districtId, 
        district, 
        phoneNumber, 
        email, 
        contactPerson, 
        createdAt: new Date() 
      });
      setIsAddModalOpen(false);
      toast.success("Customer/Staff added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      });
      await fetchCustomerStaffList();
      resetForm();
    } catch (error) {
      console.error("Error adding customer/staff:", error);
      toast.error("Failed to add customer/staff. Please try again.");
    }
  };

  const handleEditCustomerStaff = async (
    id,
    customerStaffCode, 
    customerStaffName, 
    numberStreetName, 
    placePinCode, 
    stateId, 
    state, 
    districtId, 
    district, 
    phoneNumber, 
    email, 
    contactPerson
  ) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    if (!customerStaffName) {
      toast.error("Customer/Staff Name is a required field.");
      return;
    }

    setIsEditModalOpen(false);
    setIsConfirmEditModalOpen(true);
    setNewCustomerStaffData({ 
      id,
      customerStaffCode, 
      customerStaffName, 
      numberStreetName, 
      placePinCode, 
      stateId, 
      state, 
      districtId, 
      district, 
      phoneNumber, 
      email, 
      contactPerson 
    });
  };

  const confirmEditCustomerStaff = async () => {
    try {
      const customerStaffRef = doc(
        db, 
        "Schools", 
        auth.currentUser.uid, 
        "Store", 
        storeId, 
        "CustomerStaffMaster",
        newCustomerStaffData.id
      );
      await updateDoc(customerStaffRef, { 
        customerStaffName: newCustomerStaffData.customerStaffName, 
        numberStreetName: newCustomerStaffData.numberStreetName, 
        placePinCode: newCustomerStaffData.placePinCode, 
        stateId: newCustomerStaffData.stateId, 
        state: newCustomerStaffData.state, 
        districtId: newCustomerStaffData.districtId, 
        district: newCustomerStaffData.district, 
        phoneNumber: newCustomerStaffData.phoneNumber, 
        email: newCustomerStaffData.email, 
        contactPerson: newCustomerStaffData.contactPerson, 
        updatedAt: new Date() 
      });
      setIsConfirmEditModalOpen(false);
      setSelectedCustomerStaff(null);
      setNewCustomerStaffData(null);
      toast.success("Customer/Staff updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      });
      await fetchCustomerStaffList();
      resetForm();
    } catch (error) {
      console.error("Error updating customer/staff:", error);
      toast.error("Failed to update customer/staff. Please try again.");
    }
  };

  const handleDeleteCustomerStaff = async (id) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    try {
      const customerStaffRef = doc(
        db, 
        "Schools", 
        auth.currentUser.uid, 
        "Store", 
        storeId, 
        "CustomerStaffMaster",
        id
      );
      await deleteDoc(customerStaffRef);
      setIsDeleteModalOpen(false);
      setSelectedCustomerStaff(null);
      toast.success("Customer/Staff deleted successfully!");
      await fetchCustomerStaffList();
      resetForm();
    } catch (error) {
      console.error("Error deleting customer/staff:", error);
      toast.error("Failed to delete customer/staff. Please try again.");
    }
  };

  const handleStaffCodeSearch = () => {
    setIsSearchStaffModalOpen(true);
  };

  const handleStaffSelect = (staff) => {
    // Map staff data to customer/staff form
    setFormData({
      customerStaffCode: staff.staffCode,
      customerStaffName: staff.name,
      numberStreetName: staff.numberStreetName || "",
      placePinCode: staff.placePinCode || "",
      stateId: staff.stateId || "",
      state: staff.state || "",
      districtId: staff.districtId || "",
      district: staff.district || "",
      phoneNumber: staff.mobileNumber || "",
      email: staff.emailBankAcId || "",
      contactPerson: staff.familyHeadName || ""
    });
    setIsSearchStaffModalOpen(false);
  };

  const openEditModal = (customerStaff) => {
    setSelectedCustomerStaff(customerStaff);
    setIsEditModalOpen(true);
  };

  const openViewModal = (customerStaff) => {
    setSelectedCustomerStaff(customerStaff);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (customerStaff) => {
    setSelectedCustomerStaff(customerStaff);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    const [id, displayValue] = value.split("|");
    setFormData({
      ...formData,
      [`${name}Id`]: id,
      [name]: displayValue
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if we're adding a new record or updating an existing one
    if (selectedCustomerStaff) {
      handleEditCustomerStaff(
        selectedCustomerStaff.id,
        formData.customerStaffCode,
        formData.customerStaffName,
        formData.numberStreetName,
        formData.placePinCode,
        formData.stateId,
        formData.state,
        formData.districtId,
        formData.district,
        formData.phoneNumber,
        formData.email,
        formData.contactPerson
      );
    } else {
      handleAddCustomerStaff(
        nextCustomerStaffCode,
        formData.customerStaffName,
        formData.numberStreetName,
        formData.placePinCode,
        formData.stateId,
        formData.state,
        formData.districtId,
        formData.district,
        formData.phoneNumber,
        formData.email,
        formData.contactPerson
      );
    }
  };

  const resetForm = () => {
    setFormData({
      customerStaffCode: "",
      customerStaffName: "",
      numberStreetName: "",
      placePinCode: "",
      stateId: "",
      state: "",
      districtId: "",
      district: "",
      phoneNumber: "",
      email: "",
      contactPerson: ""
    });
    setSelectedCustomerStaff(null);
  };

  const handleNew = () => {
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    setSearchTerm("");
  };

  const filteredCustomerStaff = customerStaffList.filter((cs) =>
    cs.customerStaffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cs.customerStaffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <Row>
          <Col xs={12}>
            <div className="customer-staff-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <span>Administration</span>
                <span className="separator">&gt;</span>
                <span className="current col-12">Customer / Staff Master</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3" style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                  <h2 className="m-0 d-none d-lg-block">Customer / Staff Master</h2>
                  <h6 className="m-0 d-lg-none">Customer / Staff Master</h6>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Customer / Staff Code</Form.Label>
                      </Col>
                      <Col xs={12} lg={8} className="d-flex">
                        <Form.Control
                          type="text"
                          name="customerStaffCode"
                          placeholder="Enter Customer/Staff Code"
                          value={formData.customerStaffCode}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                        />
                        <Button 
                          variant="outline-secondary" 
                          className="ms-2" 
                          onClick={handleStaffCodeSearch}
                        >
                          <FaSearch />
                        </Button>
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Customer / Staff Name</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          name="customerStaffName"
                          placeholder="Enter Customer/Staff Name"
                          value={formData.customerStaffName}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                          required
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Number & Street Name</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          name="numberStreetName"
                          placeholder="Enter street address"
                          value={formData.numberStreetName}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Place/Pin Code</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          name="placePinCode"
                          placeholder="Enter place and pin code"
                          value={formData.placePinCode}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">State</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Select
                          name="state"
                          value={formData.stateId && formData.state ? `${formData.stateId}|${formData.state}` : ""}
                          onChange={handleSelectChange}
                          className="custom-input py-2"
                        >
                          <option value="">Select State</option>
                          {states.map((stateItem) => (
                            <option key={stateItem.id} value={`${stateItem.id}|${stateItem.state}`}>
                              {stateItem.state}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">District</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Select
                          name="district"
                          value={formData.districtId && formData.district ? `${formData.districtId}|${formData.district}` : ""}
                          onChange={handleSelectChange}
                          className="custom-input py-2"
                        >
                          <option value="">Select District</option>
                          {districts.map((districtItem) => (
                            <option key={districtItem.id} value={`${districtItem.id}|${districtItem.district}`}>
                              {districtItem.district}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Phone Number</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          placeholder="Enter Phone Number"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">E-Mail</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="Enter E-Mail"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>
                    <Row className="mb-4 align-items-center">
                      <Col xs={12} lg={4} className="label-col mb-2 mb-lg-0">
                        <Form.Label className="mb-0 ms-lg-5">Contact Person</Form.Label>
                      </Col>
                      <Col xs={12} lg={8}>
                        <Form.Control
                          type="text"
                          name="contactPerson"
                          placeholder="Enter Contact Person"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          className="custom-input py-2"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={12}>
                        <div className="button-group mt-4">
                          <Button 
                            style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                            type="button"
                            className="custom-btn-clr px-4 py-2"
                            onClick={handleNew}
                          >
                            New
                          </Button>
                          <Button 
                            style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                            type="submit"
                            className="custom-btn-clr px-4 py-2"
                          >
                            Save
                          </Button>
                          <Button 
                            style={{backgroundColor:"#0B3D7B",borderColor:"#0B3D7B"}}
                            type="button"
                            className="custom-btn-clr px-4 py-2"
                            onClick={() => setIsAddModalOpen(true)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="danger" 
                            type="button"
                            className="reset-btn px-4 py-2"
                            onClick={() => {
                              if (selectedCustomerStaff) {
                                openDeleteModal(selectedCustomerStaff);
                              } else {
                                toast.info("Please select a customer/staff to delete");
                              }
                            }}
                          >
                            Delete
                          </Button>
                          <Button 
                            variant="secondary" 
                            type="button"
                            className="cancel-btn px-4 py-2"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>

                  {/* Customer/Staff Table */}
                  <div className="mt-5">
                    <h4>Customer/Staff List</h4>
                    <Form.Control
                      type="text"
                      placeholder="Search by Code or Name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="custom-search mb-3"
                    />
                    <div className="table-responsive">
                      <Table bordered hover>
                        <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                          <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCustomerStaff.map((cs) => (
                            <tr key={cs.id}>
                              <td>{cs.customerStaffCode}</td>
                              <td>{cs.customerStaffName}</td>
                              <td>{cs.phoneNumber}</td>
                              <td>{cs.email}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="action-button view-button me-2"
                                  onClick={() => openViewModal(cs)}
                                >
                                  <FaEye />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button edit-button me-2"
                                  onClick={() => openEditModal(cs)}
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  variant="link"
                                  className="action-button delete-button"
                                  onClick={() => openDeleteModal(cs)}
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
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <AddCustomerStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddCustomerStaff}
        nextCustomerStaffCode={nextCustomerStaffCode}
        states={states}
        districts={districts}
      />
      <EditCustomerStaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomerStaff(null);
        }}
        onConfirm={handleEditCustomerStaff}
        customerStaff={selectedCustomerStaff}
        states={states}
        districts={districts}
      />
      <ViewCustomerStaffModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCustomerStaff(null);
        }}
        customerStaff={selectedCustomerStaff}
      />
      <DeleteCustomerStaffModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCustomerStaff(null);
        }}
        onConfirm={handleDeleteCustomerStaff}
        customerStaff={selectedCustomerStaff}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false);
          setSelectedCustomerStaff(null);
          setNewCustomerStaffData(null);
        }}
        onConfirm={confirmEditCustomerStaff}
        customerStaff={selectedCustomerStaff}
        newCustomerStaff={newCustomerStaffData}
      />
      <SearchStaffModal
        isOpen={isSearchStaffModalOpen}
        onClose={() => setIsSearchStaffModalOpen(false)}
        onSelect={handleStaffSelect}
        staffList={staffList}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .customer-staff-container {
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

          .customer-staff-detail {
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

export default CustomerStaffMaster;