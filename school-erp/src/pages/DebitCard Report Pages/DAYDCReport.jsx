"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Calendar } from "react-bootstrap-icons"
import MainContentPage from "../../components/MainContent/MainContentPage"

const DayDCReport = () => {
  const [selectedDate, setSelectedDate] = useState("")
  const [reportType, setReportType] = useState("SMS")

  return (
    <MainContentPage>
      <div className="container-fluid p-0">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/" className="text-decoration-none">
                Home
              </a>
            </li>
            <li className="breadcrumb-item">
              <a href="#" className="text-decoration-none">
                Debit / Credit Card Report
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Period D/C Report ( Ledger )
            </li>
          </ol>
        </nav>

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
