"use client";

import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Calendar } from "react-bootstrap-icons";
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Link } from "react-router-dom";


const BankLedger = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedHead, setSelectedHead] = useState("");

  return (
    <MainContentPage>
      <div className="container-fluid p-0">
        {/* Breadcrumb */}
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link >Debit / Credit Card Report
            </Link>
            <span className="separator mx-2">&gt;</span>
            <span>Bank Ledger</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="card shadow-sm">
          {/* Header */}
          <div className="card-header text-white custom-btn-clr">
            <h5 className="mb-0">Bank Ledger</h5>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            <div className="row">
              {/* Starting Date */}
              <div className="col-12 col-md-6 mb-4">
                <label className="form-label">Select Starting Date</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <span className="input-group-text">
                    <Calendar />
                  </span>
                </div>
              </div>

              {/* Ending Date */}
              <div className="col-12 col-md-6 mb-4">
                <label className="form-label">Select Ending Date</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <span className="input-group-text">
                    <Calendar />
                  </span>
                </div>
              </div>

              {/* Select Head */}
              <div className="col-12 mb-4">
                <label className="form-label">Select Head</label>
                <select
                  className="form-select"
                  value={selectedHead}
                  onChange={(e) => setSelectedHead(e.target.value)}
                >
                  <option value="">-- Select --</option>
                  <option value="Head1">Head 1</option>
                  <option value="Head2">Head 2</option>
                  <option value="Head3">Head 3</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="col-12">
                <div className="d-flex flex-column flex-md-row gap-2">
                  <button
                    className="btn text-white px-4 custom-btn-clr"
                    onClick={() => console.log("Generate clicked")}
                  >
                    Generate
                  </button>
                  <button
                    className="btn text-white px-4 custom-btn-clr"
                    onClick={() => console.log("View clicked")}
                  >
                    View
                  </button>
                  <button 
                    className="btn btn-secondary px-4" 
                    onClick={() => console.log("Cancel clicked")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContentPage>
  );
};

export default BankLedger;
