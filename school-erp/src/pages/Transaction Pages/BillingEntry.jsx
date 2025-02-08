// BillingEntry.jsx

import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import './Styles/BillingWindow.css'; // Import custom styles
import MainContentPage from '../../components/MainContent/MainContentPage';

const styles = {
  headerBg: {
    backgroundColor: '#0B3D7B',
    color: 'white',
  },
  customBtn: {
    backgroundColor: '#0B3D7B',
    color: 'white',
    border: 'none',
    margin: '0.25rem',
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
      <div className="billing-container">
        <div className="card">
          <div className="card-header" style={styles.headerBg}>
            <h5 className="mb-0">Billing Entry</h5>
          </div>
          <div className="card-body">
            <form>
              <div className="row g-3">
                {/* Left Column */}
                <div className="col-md-6">
                  {["Bill Number", "Admin Number", "Bar Code Number", "Student Name", "Father Name", "Course", "Section", "Pickup Point"].map((label, index) => (
                    <div className="mb-3" key={index}>
                      <label className="form-label">{label}</label>
                      <input type="text" className="form-control" />
                    </div>
                  ))}

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Fee Head</label>
                      <select className="form-select">
                        <option>Select Fee Head</option>
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label">Amount</label>
                      <input type="number" className="form-control" />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-6">
                  {["Date", "Balance", "Paid Amount", "Balance Amount"].map((label, index) => (
                    <div className="mb-3" key={index}>
                      <label className="form-label">{label}</label>
                      <input type="number" className="form-control" />
                    </div>
                  ))}

                  <div className="mb-3">
                    <label className="form-label">Payment Mode</label>
                    <div>
                      {["Online", "D.D.", "Cash"].map((mode, index) => (
                        <div className="form-check form-check-inline" key={index}>
                          <input className="form-check-input" type="radio" name="paymentMode" value={mode} defaultChecked={mode === "Online"} />
                          <label className="form-check-label">{mode}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Number</label>
                    <select className="form-select">
                      <option>Select Number</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Select Operator Name</label>
                    <select className="form-select">
                      <option>Select Operator</option>
                    </select>
                  </div>

                  {/* Concession Section */}
                  <div className="card mb-3">
                    <div className="card-header" style={styles.headerBg}>
                      <h6 className="mb-0">Concession</h6>
                    </div>
                    <div className="card-body bg-white">
                      {["Enter concess %", "Concess Head", "Enter Concess"].map((label, index) => (
                        <div className="mb-3" key={index}>
                          <label className="form-label text-dark">{label}</label>
                          <input type="number" className="form-control" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row mb-3">
                    {["Balance Before", "Balance After"].map((label, index) => (
                      <div className="col" key={index}>
                        <label className="form-label">{label}</label>
                        <input type="number" className="form-control" readOnly />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fee Heading Table */}
              <div className="table-responsive mb-3">
                <table className="table table-bordered">
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

              <div className="mb-3">
                <label className="form-label">Entered Amount [ In Rupees ]</label>
                <input type="number" className="form-control w-25" />
              </div>

              {/* Transaction Table */}
              <div className="table-responsive mb-3">
                <table className="table table-bordered">
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
                        Previous Paid Amount Rs: 0.00/-
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Transaction/Narration</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-2">
                {["Insert", "View", "Bill Cancel", "Save", "Row Del", "Bus Bill", "Print", "Due status"].map((btnText, index) => (
                  <button type="button" className="btn custom-btn-clr" key={index}>
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
