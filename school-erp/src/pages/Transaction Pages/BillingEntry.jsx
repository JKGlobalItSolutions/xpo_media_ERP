import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
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
              <div className="custom-table-wrapper mb-3">
                <table className="table table-bordered fee-table">
                  <thead>
                    <tr style={styles.headerBg}>
                      <th className="fee-heading-column">Select Fee Heading</th>
                      <th className="amount-column">Amount in Rs</th>
                      <th className="balance-column">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fee-heading-column"></td>
                      <td className="amount-column"></td>
                      <td className="balance-column"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-3">
                <label className="form-label">Entered Amount [ In Rupees ]</label>
                <input type="number" className="form-control w-25" />
              </div>

              {/* Transaction Table */}
              <div className="custom-table-wrapper mb-3">
                <table className="table table-bordered transaction-table">
                  <thead>
                    <tr style={styles.headerBg}>
                      <th className="date-column">Date</th>
                      <th className="bill-column">Bill Number</th>
                      <th className="desc-column">Description</th>
                      <th className="amount-column">Paid Amount</th>
                      <th className="narration-column">Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="date-column"></td>
                      <td className="bill-column"></td>
                      <td className="desc-column"></td>
                      <td className="amount-column"></td>
                      <td className="narration-column"></td>
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
                  <button type="button" className="btn" style={styles.customBtn} key={index}>
                    {btnText}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        <style jsx>{`
          .billing-container {
            padding: 1rem;
          }

          .custom-table-wrapper {
            overflow-x: auto;
            margin: 0;
            padding: 0 1px;
          }

          /* Fee Table Styles */
          .fee-table {
            min-width: 600px;
          }

          .fee-heading-column {
            min-width: 250px;
          }

          .amount-column {
            min-width: 150px;
          }

          .balance-column {
            min-width: 150px;
          }

          /* Transaction Table Styles */
          .transaction-table {
            min-width: 800px;
          }

          .date-column {
            min-width: 120px;
          }

          .bill-column {
            min-width: 120px;
          }

          .desc-column {
            min-width: 200px;
          }

          .narration-column {
            min-width: 200px;
          }

          /* Common table styles */
          .table th,
          .table td {
            padding: 12px;
            vertical-align: middle;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
          }

          @media (max-width: 768px) {
            .billing-container {
              padding: 0.5rem;
            }

            .custom-table-wrapper {
              margin: 0 -0.5rem;
              padding: 0 0.5rem;
            }

            .btn {
              margin: 0.25rem;
              flex: 1 1 auto;
              min-width: 120px;
            }
          }
        `}</style>
      </div>
    </MainContentPage>
  );
};

export default BillingEntry;