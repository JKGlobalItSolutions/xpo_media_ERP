"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Calendar } from "react-bootstrap-icons"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom";


const DayDCReport = () => {
  const [selectedDate, setSelectedDate] = useState("")
  const [reportType, setReportType] = useState("SMS")

  return (
    <MainContentPage>
      <div className="container-fluid p-0">
        {/* Breadcrumb */}
       
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div >Debit / Credit Card Report
            </div>
            <span className="separator mx-2">&gt;</span>
            <span>Day D/C Report ( Ledger )</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="card shadow-sm">
          {/* Header */}
          <div className="card-header text-white custom-btn-clr">
            <h5 className="mb-0">Day Ledger</h5>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            <div className="row">
              {/* Date Selection */}
              <div className="col-12 col-md-6 mb-4">
                <label className="form-label">Select Report Date</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                  <span className="input-group-text">
                    <Calendar />
                  </span>
                </div>
              </div>

              {/* Radio Buttons */}
              <div className="col-12 col-md-6 mb-4">
                <label className="form-label">Select Report Type</label>
                <div className="d-flex flex-column flex-md-row gap-3">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="sms"
                      name="reportType"
                      value="SMS"
                      checked={reportType === "SMS"}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="sms">
                      SMS
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="openingBalance"
                      name="reportType"
                      value="Opening Balance"
                      checked={reportType === "Opening Balance"}
                      onChange={(e) => setReportType(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="openingBalance">
                      Opening Balance
                    </label>
                  </div>
                </div>
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
                  <button className="btn btn-secondary px-4" onClick={() => console.log("Cancel clicked")}> 
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainContentPage>
  )
}

export default DayDCReport
