"use client"

import { useState } from "react"
import MainContentPage from "../../components/MainContent/MainContentPage"

const AttendanceEntry = () => {
  const [formData, setFormData] = useState({
    course: "",
    section: "",
    session: "",
    date: "",
  })

  const [students, setStudents] = useState([
    { id: 1, adminNo: "1001", name: "John Doe", attendance: "P" },
    { id: 2, adminNo: "1002", name: "Jane Smith", attendance: "P" },
  ])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleAttendanceChange = (id, value) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => (student.id === id ? { ...student, attendance: value } : student)),
    )
  }

  return (
    <MainContentPage>
      <div className="bg-white rounded shadow p-0">
        {/* Header */}
        <div className="bg-primary text-white p-3 rounded-top mb-4">
          <h2 className="m-0">Attendance Entry Window</h2>
        </div>

        {/* Form Section */}
        <div className="row g-3 px-4">
          {/* Select Course */}
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="form-group position-relative">
              <label className="form-label">Select Course / Std</label>
              <div className="input-group">
                <select
                  className="form-control form-select"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                >
                  <option value="">Select Course / Std</option>
                  <option value="course1">Course 1</option>
                  <option value="course2">Course 2</option>
                  <option value="course3">Course 3</option>
                </select>
                <span className="input-group-text">
                  <i className="bi bi-chevron-down" style={{ color: "#0B3D7B" }}></i>
                </span>
              </div>
            </div>
          </div>

          {/* Select Section */}
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="form-group position-relative">
              <label className="form-label">Select Section</label>
              <div className="input-group">
                <select
                  className="form-control form-select"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                >
                  <option value="">Select Section</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                <span className="input-group-text">
                  <i className="bi bi-chevron-down" style={{ color: "#0B3D7B" }}></i>
                </span>
              </div>
            </div>
          </div>

          {/* Select Session */}
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="form-group position-relative">
              <label className="form-label">Select Session</label>
              <div className="input-group">
                <select
                  className="form-control form-select"
                  name="session"
                  value={formData.session}
                  onChange={handleInputChange}
                >
                  <option value="">Select Session</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
                <span className="input-group-text">
                  <i className="bi bi-chevron-down" style={{ color: "#0B3D7B" }}></i>
                </span>
              </div>
            </div>
          </div>

          {/* Select Date */}
          <div className="col-md-6 col-lg-3 mb-3">
            <div className="form-group position-relative">
              <label className="form-label">Select Your Date</label>
              <div className="input-group">
                <select
                  className="form-control form-select"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                >
                  <option value="">Select Your Date</option>
                  <option value="2025-02-01">2025-02-01</option>
                  <option value="2025-02-02">2025-02-02</option>
                  <option value="2025-02-03">2025-02-03</option>
                </select>
                <span className="input-group-text">
                  <i className="bi bi-chevron-down" style={{ color: "#0B3D7B" }}></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-4 table-responsive">
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Admin.No</th>
                <th>Student Name</th>
                <th>P/A</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.adminNo}</td>
                  <td>{student.name}</td>
                  <td>
                    <select
                      className="form-control"
                      value={student.attendance}
                      onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    >
                      <option value="P">P</option>
                      <option value="A">A</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons Section */}
        <div className="d-flex flex-wrap justify-content-center gap-3 mt-4 mb-4">
          <button className="btn custom-btn-clr flex-grow-1 flex-md-grow-0">
            Insert
          </button>
          <button className="btn custom-btn-clr  flex-grow-1 flex-md-grow-0" >
            Save
          </button>
          <button className="btn custom-btn-clr flex-grow-1 flex-md-grow-0" >
            View
          </button>
          <button className="btn btn-secondary flex-grow-1 flex-md-grow-0">Cancel</button>
        </div>
        <br className="d-none d-lg-block" />

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
  )
}

export default AttendanceEntry

