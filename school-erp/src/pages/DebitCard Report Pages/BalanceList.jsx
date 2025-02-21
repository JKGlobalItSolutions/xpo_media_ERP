import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";


const BalanceList = () => {
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
            <h4 className="fw-bold"> Balance List</h4>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
       
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div >Debit / Credit Card Report
            </div>
            <span className="separator mx-2">&gt;</span>
            <span>Balance List</span>
          </nav>
        </div>

        {/* Cards Grid */}
        <div className="row g-4">
          {/* Regular Candidates Card */}

          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="/debit-credit-report/school-fee"
          >
            <div>
              <div className="card fee-setup-card h-100">
                <div className="card-body d-flex align-items-center justify-content-center">
            
                <h5 className="card-title text-white m-0">
                School Fee
                  </h5>
                
                </div>
              </div>
            </div>
          </Link>

          {/* RTE Candidates Card */}
          <Link
            style={{ textDecoration: "none" }}
            className="col-12 col-md-6 col-lg-3"
            to="/debit-credit-report/transport-fee"  >
            <div className="card fee-setup-card h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <h5 className="card-title text-white m-0">Transport Fee</h5>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </MainContentPage>
  );
};

export default BalanceList;
