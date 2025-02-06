// BillingWindow.jsx

import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainContentPage from '../../components/MainContent/MainContentPage';

// Custom CSS for buttons and table headers
const styles = {
  headerBg: {
    backgroundColor: '#0B3D7B',
    color: 'white'
  },
  customBtn: {
    backgroundColor: '#0B3D7B',
    color: 'white',
    border: 'none',
    margin: '0.25rem',
    '&:hover': {
      backgroundColor: '#092c5a'
    }
  }
};

function BillingWindow() {
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
    transactionDate: ''
  });

  return (
    <MainContentPage>
      <div className="">
        <div className="card">
          <div className="card-header" style={styles.headerBg}>
            <h5 className="mb-0">Billing Window</h5>
          </div>
          <div className="card-body">
            <form>
              <div className="row g-3">
                {/* Left Column */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Bill Number</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Admin Number</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Bar Code Number</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Student Name</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Father Name</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Course</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Section</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pickup Point</label>
                    <input type="text" className="form-control" />
                  </div>
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
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Balance</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Paid Amount</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Balance Amount</label>
                    <input type="number" className="form-control" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Payment Mode</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="paymentMode" value="Online" defaultChecked />
                        <label className="form-check-label">Online</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="paymentMode" value="D.D." />
                        <label className="form-check-label">D.D.</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="paymentMode" value="Cash" />
                        <label className="form-check-label">Cash</label>
                      </div>
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
                      <div className="mb-3">
                        <label className="form-label text-dark">Enter concess %</label>
                        <input type="number" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-dark">Concess Head</label>
                        <select className="form-select">
                          <option>Select Concess Head</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label text-dark">Enter Concess</label>
                        <input type="number" className="form-control" />
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Balance Before</label>
                      <input type="number" className="form-control" readOnly />
                    </div>
                    <div className="col">
                      <label className="form-label">Balance After</label>
                      <input type="number" className="form-control" readOnly />
                    </div>
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
                  <label className="form-label">Transaction/Narrat</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn" style={styles.customBtn}>Insert</button>
                <button type="button" className="btn" style={styles.customBtn}>View</button>
                <button type="button" className="btn" style={styles.customBtn}>Bill Cancel</button>
                <button type="button" className="btn" style={styles.customBtn}>Save</button>
                <button type="button" className="btn" style={styles.customBtn}>Row Del</button>
                <button type="button" className="btn" style={styles.customBtn}>Bus Bill</button>
                <button type="button" className="btn" style={styles.customBtn}>Print</button>
                <button type="button" className="btn" style={styles.customBtn}>Due status</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainContentPage>
  );
}

export default BillingWindow;