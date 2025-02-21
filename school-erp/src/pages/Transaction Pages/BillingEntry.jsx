'use client';

import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './Styles/BillingWindow.css';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Link } from "react-router-dom";


const styles = {
  headerBg: {
    backgroundColor: '#0B3D7B',
    color: 'white',
  },
  customBtn: {
    background: 'linear-gradient(180deg, #1470E1 0%, #0B3D7B 100%)',
    border:'none' ,
    color: 'white',
  },
};

const BillingEntry = () => {
  const [formData, setFormData] = useState({
    billNumber: '',
    adminNumber: '',
    barCodeNumber: '',
    studentName: '',
    fatherName: '',
    course: '',
    section: '',
    pickupPoint: '',
    date: '',
    balance: '',
    paidAmount: '',
    balanceAmount: '',
    paymentMode: 'Online',
    number: '',
    operatorName: '',
    concessPercent: '',
    concessHead: '',
    concessAmount: '',
    balanceBefore: '',
    balanceAfter: '',
    transactionNarrat: '',
    transactionDate: '',
  });

  return (
    <MainContentPage>
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div >Transaction
            </div>
            <span className="separator mx-2">&gt;</span>
            <span>Billing Entry</span>
          </nav>
        </div>
      <div className="billing-container vh-100 d-flex flex-column">
        <div className="card flex-grow-1">
          <div className="card-header py-1" style={styles.headerBg}>
            <h6 className="mb-0">Billing Entry</h6>
          </div>
          <div className="card-body p-2">
            <form className="h-100 d-flex flex-column">
              <div className="row g-2">
                <div className="col-md-3">
                  {["Bill Number", "Admin Number", "Bar Code Number", "Student Name"].map((label, index) => (
                    <div className="mb-1" key={index}>
                      <label className="form-label small mb-0">{label}</label>
                      <input type="text" className="form-control form-control-sm py-0" />
                    </div>
                  ))}
                </div>
                <div className="col-md-3">
                  {["Father Name", "Course", "Section", "Pickup Point"].map((label, index) => (
                    <div className="mb-1" key={index}>
                      <label className="form-label small mb-0">{label}</label>
                      <input type="text" className="form-control form-control-sm py-0" />
                    </div>
                  ))}
                </div>
                <div className="col-md-3">
                  {["Date", "Balance", "Paid Amount", "Balance Amount"].map((label, index) => (
                    <div className="mb-1" key={index}>
                      <label className="form-label small mb-0">{label}</label>
                      <input type="number" className="form-control form-control-sm py-0" />
                    </div>
                  ))}
                </div>
                <div className="col-md-3">
                  <div className="mb-1">
                    <label className="form-label small mb-0">Payment Mode</label>
                    <div>
                      {["Online", "D.D.", "Cash"].map((mode, index) => (
                        <div className="form-check form-check-inline" key={index}>
                          <input className="form-check-input" type="radio" name="paymentMode" value={mode} defaultChecked={mode === "Online"} />
                          <label className="form-check-label small">{mode}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="form-label small mb-0">Number</label>
                    <select className="form-select form-select-sm py-0">
                      <option>Select Number</option>
                    </select>
                  </div>
                  <div className="mb-1">
                    <label className="form-label small mb-0">Select Operator Name</label>
                    <select className="form-select form-select-sm py-0">
                      <option>Select Operator</option>
                    </select>
                  </div>
                  <div className="mb-1">
                    <label className="form-label small mb-0">Fee Head</label>
                    <select className="form-select form-select-sm py-0">
                      <option>Select Fee Head</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row g-2 mt-1">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-header py-1" style={styles.headerBg}>
                      <h6 className="mb-0 small">Concession</h6>
                    </div>
                    <div className="card-body p-1">
                      <div className="row g-1">
                        {["Enter concess %", "Concess Head", "Enter Concess"].map((label, index) => (
                          <div className="col-md-4" key={index}>
                            <label className="form-label small mb-0">{label}</label>
                            <input type="number" className="form-control form-control-sm py-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="row g-1">
                    {["Balance Before", "Balance After"].map((label, index) => (
                      <div className="col-md-6" key={index}>
                        <label className="form-label small mb-0">{label}</label>
                        <input type="number" className="form-control form-control-sm py-0" readOnly />
                      </div>
                    ))}
                  </div>
                  <div className="mt-1">
                    <label className="form-label small mb-0">Entered Amount [ In Rupees ]</label>
                    <input type="number" className="form-control form-control-sm py-0" />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="row g-1">
                    <div className="col-md-8">
                      <label className="form-label small mb-0">Transaction/Narration</label>
                      <input type="text" className="form-control form-control-sm py-0" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small mb-0">Date</label>
                      <input type="date" className="form-control form-control-sm py-0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-1">
                <div className="col-md-6">
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm small mb-0">
                      <thead>
                        <tr style={styles.headerBg}>
                          <th>Select Fee Heading</th>
                          <th>Amount in Rs</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm small mb-0">
                      <thead>
                        <tr style={styles.headerBg}>
                          <th>Date</th>
                          <th>Bill Number</th>
                          <th>Description</th>
                          <th>Paid Amount</th>
                          <th>Narration</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="5" style={styles.headerBg}>
                            <small>Previous Paid Amount Rs: 0.00/-</small>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-1 mt-auto">
                {["Insert", "View", "Bill Cancel", "Save", "Row Del", "Bus Bill", "Print", "Due status"].map((btnText, index) => (
                  <button type="button" className="btn btn-sm" style={styles.customBtn} key={index}>
                    {btnText}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainContentPage>
  );
};

export default BillingEntry;
