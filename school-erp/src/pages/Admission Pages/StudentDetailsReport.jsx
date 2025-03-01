import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";
import "./Styles/StudentDetailsReport.css";

const StudentDetailsReport = () => {
  const [className, setClassName] = useState("");
  const location = useLocation();

  // Create breadcrumb items from current path
  const pathnames = location.pathname.split("/").filter((x) => x);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Class Name:", className);
  };

  const handleReset = () => {
    setClassName("");
  };

  return (
    <MainContentPage>
      <div className="container-fluid px-4 py-3">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <h4 className="fw-bold">Student Details Report</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="/home" className="text-decoration-none">
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="" className="text-decoration-none">
                  Admission
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                Student Details Report
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="row g-4">

         

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="student-register-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Student Register</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="adhaar-emis-number"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Aadhar & EMIS</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="religion-wise-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Religion Wise</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="stage-wise-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Stage Wise</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to=""
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center text-center">
                <h5 className="card-title text-white m-0">Student Register
                Grade </h5>
              </div>
            </div>
          </Link>
          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to=""
          >
            <div>
              <div className="card fee-setup-card h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Hostel Status</h5>
                </div>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="category-wise-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Category
                Wise</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="strength-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Strength</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="route-wise-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Route Wise</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="individual-full-view"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Individual Full
                View</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="grade-wise-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Grade Full
                View</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to=""
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Full View</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="type-wise-report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Type Wise</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to=""
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Transfer Certificate
                Form</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="course-study-certificate"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center text-center">
                <h5 className="card-title text-white m-0">Course Of Study
                Certificate</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="service-certificate"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Service Certificate</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6-12 col-lg-12"
            to="customize-report-generate"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Customized Report Generate</h5>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </MainContentPage>
  );
};

export default StudentDetailsReport;
