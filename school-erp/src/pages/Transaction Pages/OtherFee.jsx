// OtherFee.jsx

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainContentPage from '../../components/MainContent/MainContentPage';

const styles = {
  headerBg: {
    backgroundColor: '#0B3D7B',
    color: 'white',
    padding: '15px',
    borderRadius: '4px 4px 0 0'
  },
  formSection: {
    backgroundColor: '#0B3D7B',
    color: 'white',
    padding: '20px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  tableHeader: {
    backgroundColor: '#0B3D7B',
    color: 'white'
  },
  actionButton: {
    backgroundColor: '#0B3D7B',
    color: 'white',
    border: 'none',
    margin: '5px',
    padding: '8px 16px',
    borderRadius: '4px'
  },
  closeButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    margin: '5px',
    padding: '8px 16px',
    borderRadius: '4px'
  }
};

const OtherFee = () => {
  return (
    <MainContentPage>
      <div className="">
        <div className="card">
          <div style={styles.headerBg}>
            <h4 className="mb-0">Other Fee / Miscellaneous Fee</h4>
          </div>
          
          <div className="card-body">
            <div className="row">
              {/* Left Column */}
              <div className="col-md-6">
                <div style={styles.formSection}>
                  <div className="mb-3">
                    <label className="form-label text-light ">Bill Number</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light ">Admin Number</label>
                    <select className="form-select">
                      <option>Select Admin Number</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light ">Student Name</label>
                    <select className="form-select">
                      <option>Select Student Name</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-md-6">
                <div style={styles.formSection}>
                  <div className="mb-3">
                    <label className="form-label text-light ">Standard</label>
                    <select className="form-select">
                      <option>Select Standard</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light ">Section</label>
                    <select className="form-select">
                      <option>Select Section</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light ">Date</label>
                    <input type="date" className="form-select" />
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Description Section */}
            <div className="mb-4">
              <label className="form-label text-primary">Fee Description</label>
              <select className="form-select mb-3">
                <option>Select Fee Description</option>
              </select>

              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr style={styles.tableHeader}>
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
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex align-items-center mb-3">
                <label className="form-label text-primary me-3">Total</label>
                <input type="text" className="form-control w-25" readOnly />
              </div>
            </div>

            {/* Right Side Form Fields */}
            <div className="row">
              <div className="col-md-6">
                <div style={styles.formSection}>
                  <div className="mb-3">
                    <label className="form-label text-light ">Amount</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light">Qty/Nos</label>
                    <input type="number" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light">Total Amount</label>
                    <input type="number" className="form-control" readOnly />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light">Balance Amount</label>
                    <input type="number" className="form-control" readOnly />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div style={styles.formSection}>
                  <div className="mb-4">
                    <label className="form-label text-light">Payment Mode</label>
                    <div>
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="paymentMode" id="online" defaultChecked />
                        <label className="form-check-label" htmlFor="online">Online</label>
                      </div>
                      <div className="form-check form-check-inline">
                        <input className="form-check-input" type="radio" name="paymentMode" id="cash" />
                        <label className="form-check-label" htmlFor="cash">Cash</label>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light">Reference Number</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-light">Select Operator Name</label>
                    <select className="form-select">
                      <option>Select Operator</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
     
            <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn custom-btn-clr" >Insert</button>
                <button type="button" className="btn custom-btn-clr" >View</button>
                <button type="button" className="btn custom-btn-clr" >Bill Cancel</button>
                <button type="button" className="btn custom-btn-clr" >Save</button>
                <button type="button" className="btn custom-btn-clr" >PayDetails</button>
                <button type="button" className="btn custom-btn-clr" >Row Del</button>
                <button type="button" className="btn custom-btn-clr" >Print</button>
                <button type="button" className='btn custom-btn-clr' >Close</button>

              </div>
          </div>
        </div>
      </div>
    </MainContentPage>
  );
};

export default OtherFee;