"use client"

import { useState } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import { Calendar } from "react-bootstrap-icons"
import MainContentPage from "../../components/MainContent/MainContentPage"

const PeriodDCReport = () => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedHead, setSelectedHead] = useState("")
  const [isHeadSelected, setIsHeadSelected] = useState(true)

  // Sample head options - replace with your actual options
  const headOptions = ["Head Option 1", "Head Option 2", "Head Option 3", "Head Option 4"]

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
            <h5 className="mb-0">Period Ledger</h5>
          </div>

          {/* Card Body */}
          <div className="card-body p-4">
            <div className="row">
              {/* Start Date */}
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

              {/* End Date */}
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

              {/* Select Head Radio and Dropdown */}
              <div className="col-12 mb-4">
                <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-2">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="selectHead"
                      name="reportType"
                      checked={isHeadSelected}
                      onChange={(e) => setIsHeadSelected(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="selectHead">
                      Select Head
                    </label>
                  </div>
                </div>
                <select
                  className="form-select"
                  value={selectedHead}
                  onChange={(e) => setSelectedHead(e.target.value)}
                  disabled={!isHeadSelected}
                >
                  <option value="">Select Head</option>
                  {headOptions.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
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

export default PeriodDCReport