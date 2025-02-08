import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";
import "./Styles/TutionFee.css";

const MiscellaneousFeeCollection = () => {
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
            <h4 className="fw-bold">Miscellaneous Fee Collection</h4>
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
                <li className="breadcrumb-item active" aria-current="page">
                Miscellaneous Fee Collection
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
            to="/collection-report/Miscellaneous-Day-Collection-Report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Day Collection Report</h5>
              </div>
            </div>
          </Link>

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="/collection-report/Miscellaneous-Periodical-Collection-Report"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Period Collection Report</h5>
              </div>
            </div>
          </Link>

        </div>
      </div>
      <footer className="mt-4 text-muted fixed-bottom text-center py-2">
        <small>
          © Copyrights{" "}
          <a href="#" className="text-decoration-none">
            XPO Media
          </a>{" "}
          2024. All rights reserved
        </small>
      </footer>
    </MainContentPage>
  );
};

export default MiscellaneousFeeCollection;
