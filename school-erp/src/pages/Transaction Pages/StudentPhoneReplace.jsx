import React from 'react';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Link } from "react-router-dom";

const StudentPhoneReplace = () => {
  return (
    <MainContentPage>
      <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link >Transaction
            </Link>
            <span className="separator mx-2">&gt;</span>
            <span>Student Phone Replace</span>
          </nav>
        </div>
      <div className="bg-white rounded shadow">
        {/* Header */}
        <div className="bg-primary text-white p-3 mb-4">
          <h2 className="m-0">Phone Update</h2>
        </div>

        {/* Form Rows */}
        <div className="row g-3 mb-4 p-3">
          {/* Staff Code */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Register Number</label>
              <select className="form-control form-select " name="staffCode">
                <option value="">Select Staff Code</option>
                <option value="SC001">SC001</option>
                <option value="SC002">SC002</option>
                <option value="SC003">SC003</option>
              </select>
            </div>
          </div>

          {/* Staff Name */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Present Phone</label>
              <select className="form-control form-select " name="staffName">
                <option value="">Select Staff Name</option>
                <option value="John Doe">John Doe</option>
                <option value="Jane Smith">Jane Smith</option>
                <option value="Robert Brown">Robert Brown</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">New Phone</label>
              <select className="form-control form-select " name="category">
                <option value="">Select Category</option>
                <option value="Teaching">Teaching</option>
                <option value="Non-Teaching">Non-Teaching</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <select className="form-control form-select " name="phone">
                <option value="">Select Phone</option>
                <option value="9876543210">9876543210</option>
                <option value="9123456789">9123456789</option>
                <option value="8765432109">8765432109</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-3 p-3">
         
          <button className="btn custom-btn-clr flex-grow-1 flex-md-grow-0">Replace</button>
          <button className="btn btn-secondary flex-grow-1 flex-md-grow-0">Cancel</button>
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
      </div>
    </MainContentPage>
  );
};

export default StudentPhoneReplace;
