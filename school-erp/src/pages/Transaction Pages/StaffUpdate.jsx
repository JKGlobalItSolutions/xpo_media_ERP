"use client"

import React, { useState, useEffect } from 'react';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../../Firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StaffUpdate = () => {
  const navigate = useNavigate();
  const [administrationId, setAdministrationId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [formData, setFormData] = useState({
    staffCode: "",
    staffName: "",
    category: "",
    currentPhone: "",
    newPhone: ""
  });

  // Fetch Administration ID and staff list
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Get Administration ID
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration");
        const adminSnapshot = await getDocs(adminRef);
        if (!adminSnapshot.empty) {
          setAdministrationId(adminSnapshot.docs[0].id);
        }

        // Fetch all staff members
        if (administrationId) {
          const staffRef = collection(
            db,
            "Schools",
            auth.currentUser.uid,
            "Administration",
            administrationId,
            "StaffMaster"
          );
          const staffSnapshot = await getDocs(staffRef);
          const staffData = staffSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setStaffList(staffData);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
        toast.error("Failed to load data. Please try again.");
      }
    };

    initializeData();
  }, [administrationId]);

  // Handle staff code selection
  const handleStaffCodeChange = (e) => {
    const selectedStaffCode = e.target.value;
    const selectedStaff = staffList.find(staff => staff.staffCode === selectedStaffCode);
    
    if (selectedStaff) {
      setFormData({
        staffCode: selectedStaff.staffCode || "",
        staffName: selectedStaff.name || "",
        category: selectedStaff.category || "",
        currentPhone: selectedStaff.mobileNumber || "",
        newPhone: ""
      });
    } else {
      setFormData({
        staffCode: "",
        staffName: "",
        category: "",
        currentPhone: "",
        newPhone: ""
      });
    }
  };

  // Handle new phone number change
  const handleNewPhoneChange = (e) => {
    setFormData(prev => ({
      ...prev,
      newPhone: e.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e, action) => {
    e.preventDefault();
    
    if (action === "cancel") {
      navigate("/home");
      return;
    }

    if (!formData.staffCode) {
      toast.error("Please select a staff member");
      return;
    }

    if (!formData.newPhone) {
      toast.error("Please enter a new phone number");
      return;
    }

    try {
      const selectedStaff = staffList.find(staff => staff.staffCode === formData.staffCode);
      if (!selectedStaff) {
        toast.error("Staff member not found");
        return;
      }

      if (action === "save") {
        const staffRef = doc(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          "StaffMaster",
          selectedStaff.id
        );

        await updateDoc(staffRef, {
          mobileNumber: formData.newPhone
        });

        toast.success("Phone number updated successfully!");
        setTimeout(() => navigate("/home"), 2000);
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error("Failed to update phone number. Please try again.");
    }
  };

  return (
    <MainContentPage>
      <div className="mb-4">
        <nav className=" d-flex custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator mx-2"></span>
          <div>Transaction</div>
          <span className="separator mx-2"></span>
          <span>Staff Phone Update</span>
        </nav>
      </div>
      
      <div className="bg-white rounded shadow">
        {/* Header */}
        <div className="bg-primary text-white p-3 mb-4">
          <h2 className="m-0">Staff Phone Update</h2>
        </div>

        {/* Form Rows */}
        <div className="row g-3 mb-4 p-3">
          {/* Staff Code */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Staff Code</label>
              <select 
                className="form-control form-select" 
                name="staffCode"
                value={formData.staffCode}
                onChange={handleStaffCodeChange}
              >
                <option value="">Select Staff Code</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.staffCode}>
                    {staff.staffCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff Name */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Staff Name</label>
              <input
                className="form-control"
                value={formData.staffName}
                disabled
              />
            </div>
          </div>

          {/* Category */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-control"
                value={formData.category}
                disabled
              />
            </div>
          </div>

          {/* Current Phone (Read-only) */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Current Phone</label>
              <input
                className="form-control"
                value={formData.currentPhone}
                disabled
              />
            </div>
          </div>

          {/* New Phone */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Update Phone Number</label>
              <input
                className="form-control"
                value={formData.newPhone}
                onChange={handleNewPhoneChange}
                placeholder="Enter new phone number"
                type="tel"
                maxLength="10"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-3 p-3">
          <button
            className="btn custom-btn-clr flex-grow-1 flex-md-grow-0"
            onClick={(e) => handleSubmit(e, "save")}
          >
            Save
          </button>
          <button 
            className="btn btn-secondary flex-grow-1 flex-md-grow-0"
            onClick={(e) => handleSubmit(e, "cancel")}
          >
            Cancel
          </button>
        </div>

        {/* Styles */}
        <style jsx>{`
          .bg-primary {
            background-color: #0B3D7B !important;
          }
          .form-control {
            border-radius: 4px;
            border: 1px solid #ced4da;
          }
          .form-control:disabled {
            background-color: #f8f9fa;
            opacity: 1;
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
          .custom-btn-clr {
            background-color: #0B3D7B;
            color: white;
          }
          .custom-btn-clr:hover {
            background-color: #092f63;
            color: white;
          }
          @media (max-width: 768px) {
            .btn {
              width: 100%;
            }
          }
        `}</style>
      </div>
      
      <ToastContainer 
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </MainContentPage>
  );
};

export default StaffUpdate;