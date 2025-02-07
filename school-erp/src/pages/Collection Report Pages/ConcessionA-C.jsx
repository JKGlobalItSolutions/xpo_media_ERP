import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../components/MainContent/MainContentPage";
import "./Styles/TutionFee.css";

const TutionFee = () => {
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
            <h4 className="fw-bold">Concession A/C</h4>
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
                Concession A/C
                </li>
              </ol>
            </nav>
          </div>
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

export default TutionFee;
