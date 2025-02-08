import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MainContentPage from "../../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col } from "react-bootstrap";
import "../Styles/TwoBox.css";

const PaymentSubHeadSetup = () => {
  const [feeHead, setFeeHead] = useState("");
  const [accountHead, setAccountHead] = useState("");
  const location = useLocation();

  // Sample options for the dropdown
  const mainHeadOptions = ["Tuition Fees", "Transport Fees", "Library Fees", "Hostel Fees"];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected Main Head:", feeHead);
    console.log("Sub Head Name:", accountHead);
  };

  const handleReset = () => {
    setFeeHead("");
    setAccountHead("");
  };

  return (
    <MainContentPage>
      <div className="px-lg-3 px-0 ">
        <Row>
          <Col xs={12}>
            <div className="fee-setup-container">
              {/* Breadcrumb Navigation */}
              <nav className="custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator"> &gt; </span>
                <span>Administration</span>
                <span className="separator"> &gt; </span>
                <Link to="/admin/payment-setup">Payment Setup</Link>
                <span className="separator"> &gt; </span>
                <span className="current">Receipt SubHead Setup</span>
              </nav>

              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3">
                  <h2 className="m-0">Sub Head Setup</h2>
                </div>

                {/* Form Content */}
                <div className="content-wrapper p-4">
                  <Form onSubmit={handleSubmit}>
                    <Row className="mb-4">
                      <Col xs={12} md={4} className="label-col mb-2 mb-md-0">
                        <Form.Label className="mb-0">Select Main Head</Form.Label>
                      </Col>
                      <Col xs={12} md={8}>
                        <Form.Control
                          as="select"
                          value={feeHead}
                          onChange={(e) => setFeeHead(e.target.value)}
                          className="custom-input"
                        >
                          <option value="">-- Select Main Head --</option>
                          {mainHeadOptions.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>

                    <Row className="mb-4">
                      <Col xs={12} md={4} className="label-col mb-2 mb-md-0">
                        <Form.Label className="mb-0">Enter Sub Head Name</Form.Label>
                      </Col>
                      <Col xs={12} md={8}>
                        <Form.Control
                          type="text"
                          placeholder="Enter Sub Head Name"
                          value={accountHead}
                          onChange={(e) => setAccountHead(e.target.value)}
                          className="custom-input"
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={12}>
                        <div className="button-group mt-4">
                          <Button
                            variant="primary"
                            type="submit"
                            className="custom-btn-clr px-4 py-2"
                          >
                            Save
                          </Button>
                          <Button
                            variant="danger"
                            type="button"
                            className="reset-btn px-4 py-2"
                            onClick={handleReset}
                          >
                            Reset
                          </Button>
                          <Button
                            variant="secondary"
                            type="button"
                            className="cancel-btn px-4 py-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </MainContentPage>
  );
};

export default PaymentSubHeadSetup;
