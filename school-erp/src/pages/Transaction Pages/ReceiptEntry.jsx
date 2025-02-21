import React from 'react';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Link } from "react-router-dom";

const ReceiptEntry = () => {
  return (
    <MainContentPage>
      <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div >Transaction
            </div>
            <span className="separator mx-2">&gt;</span>
            <span>Receipt Entry</span>
          </nav>
        </div>
      <div className="bg-white rounded shadow">
        {/* Header */}
        <div className="bg-primary text-white p-3 mb-4">
          <h2 className="m-0">Receipt Entry</h2>
        </div>

        {/* Form Rows */}
        <div className="row g-3 mb-4 p-3">
          {/* Date */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" name="receiptDate" />
            </div>
          </div>

          {/* Unique Receipt Number Inputs */}
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Receipt Number 1</label>
              <input type="text" className="form-control" name="receiptNumber1" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Receipt Number 2</label>
              <input type="text" className="form-control" name="receiptNumber2" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Receipt Number 3</label>
              <input type="text" className="form-control" name="receiptNumber3" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Receipt Number 4</label>
              <input type="text" className="form-control" name="receiptNumber4" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Receipt Number 5</label>
              <input type="text" className="form-control" name="receiptNumber5" />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label">Receipt Number 6</label>
              <input type="text" className="form-control" name="receiptNumber6" />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-3 p-3">
          <button
            className="btn custom-btn-clr flex-grow-1 flex-md-grow-0"
           
          >
            Insert
          </button>
          <button className="btn custom-btn-clr flex-grow-1 flex-md-grow-0">Save</button>
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

export default ReceiptEntry;
