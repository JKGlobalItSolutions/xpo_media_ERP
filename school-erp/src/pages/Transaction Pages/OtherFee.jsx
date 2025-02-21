'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainContentPage from '../../components/MainContent/MainContentPage';
import './Styles/OtherFee.css';
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

const OtherFee = () => {
  return (
    <MainContentPage>
      <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div >Transaction
            </div>
            <span className="separator mx-2">&gt;</span>
            <span>Other Fee / Miscellaneous Fee
            </span>
          </nav>
        </div>
      <div className="other-fee-container vh-100 d-flex flex-column">
        <div className="card flex-grow-1">
          <div className="card-header py-1" style={styles.headerBg}>
            <h6 className="mb-0">Other Fee / Miscellaneous Fee</h6>
          </div>
          <div className="card-body p-2">
            <form className="h-100 d-flex flex-column">
              <div className="row g-2">
                <div className="col-md-6">
                  {['Bill Number', 'Admin Number', 'Student Name'].map((label, index) => (
                    <div className="mb-1" key={index}>
                      <label className="form-label small mb-0 text-dark">{label}</label>
                      <input type="text" className="form-control form-control-sm py-0" />
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  {['Standard', 'Section', 'Date'].map((label, index) => (
                    <div className="mb-1" key={index}>
                      <label className="form-label small mb-0 text-dark">{label}</label>
                      <input type={label === 'Date' ? 'date' : 'text'} className="form-control form-control-sm py-0" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-1">
                <label className="form-label small mb-0 text-dark">Fee Description</label>
                <select className="form-select form-select-sm py-0">
                  <option>Select Fee Description</option>
                </select>
              </div>
              
              <div className="row g-2">
                <div className="col-md-6">
                  {['Amount', 'Qty/Nos', 'Total Amount', 'Balance Amount'].map((label, index) => (
                    <div className="mb-1" key={index}>
                      <label className="form-label small mb-0 text-dark">{label}</label>
                      <input type="number" className="form-control form-control-sm py-0" readOnly={label.includes('Total') || label.includes('Balance')} />
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  <div className="mb-1">
                    <label className="form-label small mb-0 text-dark">Payment Mode</label>
                    <div>
                      {['Online', 'Cash'].map((mode, index) => (
                        <div className="form-check form-check-inline" key={index}>
                          <input className="form-check-input" type="radio" name="paymentMode" value={mode} defaultChecked={mode === 'Online'} />
                          <label className="form-check-label small">{mode}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="form-label small mb-0 text-dark">Reference Number</label>
                    <input type="text" className="form-control form-control-sm py-0" />
                  </div>
                  <div className="mb-1">
                    <label className="form-label small mb-0 text-dark">Select Operator Name</label>
                    <select className="form-select form-select-sm py-0">
                      <option>Select Operator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-responsive mt-2">
                <table className="table table-bordered table-sm small">
                  <thead>
                    <tr style={styles.headerBg}>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Concession</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex flex-wrap gap-1 mt-auto">
                {['Insert', 'View', 'Bill Cancel', 'Save', 'PayDetails', 'Row Del', 'Print', 'Close'].map((btnText, index) => (
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

export default OtherFee;
