import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../../components/MainContent/MainContentPage";
import "../Styles/ReceiptSetup.css";

const PaymentSetup = () => {
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
            <h4 className="fw-bold">Students</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="mb-4">
                <nav className="custom-breadcrumb py-1 py-lg-3">
                  <Link to="/home">Home</Link>
                  <span className="separator mx-2">&gt;</span>
                  <div>Administration</div>
                  <span className="separator mx-2">&gt;</span>
                  <span>Payment Report</span>
                </nav>
              </div>

        {/* Cards Grid */}
        <div className="row g-4">
          {/* Regular Candidates Card */}

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="/admin/paymenthead-setup"
          >
            <div>
              <div className="card fee-setup-card h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
            
                <h5 className="card-title text-white m-0">
                  Head Setup
                  </h5>
                
                </div>
              </div>
            </div>
          </Link>

          {/* RTE Candidates Card */}
          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="/admin/paymentsubhead-setup"
          >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Sub Head Setup</h5>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </MainContentPage>
  );
};

export default PaymentSetup;
