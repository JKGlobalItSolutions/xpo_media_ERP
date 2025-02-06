import React from "react";
import MainContentPage from "../../components/MainContent/MainContentPage";

const AttendanceEntry = () => {
  return (
    <MainContentPage>
      <div className="bg-white rounded shadow p-0">
        {/* Header */}
        <div className="bg-primary text-white p-3 rounded mb-4">
          <h2 className="m-0">Attendance Entry Window</h2>
        </div>

        {/* Form Section */}
        <div className="row g-3 px-4">
          {/* Select Course */}
          <div className="col-md-6">
            <div className="form-group position-relative">
              <label className="form-label">Select Course / Std</label>
              <div className="input-group">
                <select className="form-control form-select " name="course">
                  <option value="">Select Course / Std</option>
                  <option value="course1">Course 1</option>
                  <option value="course2">Course 2</option>
                  <option value="course3">Course 3</option>
                </select>
                <span className="input-group-text">
                  <i
                    className="bi bi-chevron-down"
                    style={{ color: "#0B3D7B" }}
                  ></i>
                </span>
              </div>
            </div>
          </div>

          {/* Select Section */}
          <div className="col-md-6">
            <div className="form-group position-relative">
              <label className="form-label">Select Section</label>
              <div className="input-group">
                <select className="form-control  form-select" name="section">
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <span className="input-group-text">
                  <i
                    className="bi bi-chevron-down"
                    style={{ color: "#0B3D7B" }}
                  ></i>
                </span>
              </div>
            </div>
          </div>

          {/* Select Session */}
          <div className="col-md-6">
            <div className="form-group position-relative">
              <label className="form-label">Select Session</label>
              <div className="input-group">
                <select className="form-control  form-select" name="session">
                  <option value="">Select Session</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
                <span className="input-group-text">
                  <i
                    className="bi bi-chevron-down"
                    style={{ color: "#0B3D7B" }}
                  ></i>
                </span>
              </div>
            </div>
          </div>

          {/* Select Date */}
          <div className="col-md-6">
            <div className="form-group position-relative">
              <label className="form-label">Select Your Date</label>
              <div className="input-group">
                <select className="form-control  form-select" name="date">
                  <option value="">Select Your Date</option>
                  <option value="2025-02-01">2025-02-01</option>
                  <option value="2025-02-02">2025-02-02</option>
                  <option value="2025-02-03">2025-02-03</option>
                </select>
                <span className="input-group-text">
                  <i
                    className="bi bi-chevron-down"
                    style={{ color: "#0B3D7B" }}
                  ></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-4">
          <table  className="table table-bordered text-center">
            <thead  >
              <tr >
                <th>S.No</th>
                <th>Admin.No</th>
                <th>Student Name</th>
                <th>P/A</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>1001</td>
                <td>John Doe</td>
                <td>
                  <select className="form-control">
                    <option value="P">P</option>
                    <option value="A">A</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>2</td>
                <td>1002</td>
                <td>Jane Smith</td>
                <td>
                  <select className="form-control">
                    <option value="P">P</option>
                    <option value="A">A</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons Section */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <button
            className="btn btn-primary flex-grow-1 flex-md-grow-0"
            style={{ backgroundColor: "#0B3D7B" }}
          >
            Insert
          </button>
          <button
            className="btn btn-primary flex-grow-1 flex-md-grow-0"
            style={{ backgroundColor: "#0B3D7B" }}
          >
            Save
          </button>
          <button
            className="btn btn-primary flex-grow-1 flex-md-grow-0"
            style={{ backgroundColor: "#0B3D7B" }}
          >
            View
          </button>
          <button className="btn btn-secondary flex-grow-1 flex-md-grow-0">
            Cancel
          </button>
        </div>
        <br />

        {/* Inline Styles */}
        <style jsx>{`
          .bg-primary {
            background-color: #0B3D7B !important;
          }
          .form-label {
            font-weight: 500;
          }
          .input-group-text {
            background-color: white;
            border: 1px solid #ced4da;
            cursor: pointer;
          }
          .form-control {
            border-radius: 4px;
          }
          .btn {
            padding: 0.5rem 2rem;
          }
          .gap-3 {
            gap: 1rem;
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

export default AttendanceEntry;