import React from 'react';
import MainContentPage from '../../components/MainContent/MainContentPage';
import 'bootstrap/dist/css/bootstrap.min.css';

const IndividualPaid = () => {
  return (
    <MainContentPage>
      <div className="billing-container container-fluid p-0 bg-white rounded shadow">
        {/* Header */}
        <div className="bg-primary text-white p-3 mb-4">
          <h2>Individual Paid Amount</h2>
        </div>

        {/* Top Row */}
        <div className="row mb-4 px-3">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Admission Number</label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Fixed Amount</label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Balance Amount</label>
              <input type="text" className="form-control" />
            </div>
          </div>
        </div>

        {/* Student Details Section */}
        <div className="bg-primary text-white p-3 mb-4">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label text-light">Student Name</label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label text-light">Admission No</label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label text-light">Standard</label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label text-light">Section</label>
                <input type="text" className="form-control" />
              </div>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="row mb-4 px-3">
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label text-primary">Total Amount Paid Rs</label>
              <input type="text" className="form-control" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="form-label text-primary">Concess Amount</label>
              <input type="text" className="form-control" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mb-4">
          <div className="table-responsive custom-table-container">
            <table className="table table-bordered">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="sno-column">S.No</th>
                  <th className="date-column">Paid Date</th>
                  <th className="amount-column">Paid Amount</th>
                  <th className="bill-column">Bill Number</th>
                  <th className="desc-column">Fee Head Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="sno-column">1</td>
                  <td className="date-column">01-01-2025</td>
                  <td className="amount-column">120</td>
                  <td className="bill-column">12345</td>
                  <td className="desc-column">Tuition Fee</td>
                </tr>
                <tr>
                  <td className="sno-column">2</td>
                  <td className="date-column">01-02-2025</td>
                  <td className="amount-column">150</td>
                  <td className="bill-column">12346</td>
                  <td className="desc-column">Library Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 mt-3">
            <button className="btn custom-btn-clr w-20 w-md-auto">
              Softcopy
            </button>
            <button className="btn custom-btn-clr  w-20 w-md-auto">
              Hardcopy
            </button>
            <button className="btn  btn-secondary w-20 w-md-auto">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-primary {
          background-color: #0B3D7B !important;
        }
        .text-primary {
          color: #0B3D7B !important;
        }
        .form-control {
          border-radius: 4px;
          border: 1px solid #ced4da;
        }
        .form-label {
          margin-bottom: 0.5rem;
        }
        .gap-3 {
          gap: 1rem;
        }
        .table th {
          background-color: #0B3D7B;
          color: white;
        }
        .btn {
          padding: 0.5rem 2rem;
        }

        .custom-table-container {
          overflow-x: auto;
          margin: 0 15px;
        }

        .table {
          margin-bottom: 0;
        }

        /* Column specific widths */
        .sno-column {
          min-width: 80px;
          width: 80px;
        }
        .date-column {
          min-width: 150px;
          width: 150px;
        }
        .amount-column {
          min-width: 130px;
          width: 130px;
        }
        .bill-column {
          min-width: 120px;
          width: 120px;
        }
        .desc-column {
          min-width: 200px;
          width: 200px;
        }

        /* Table cell styles */
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
            padding: 0 10px;
          }
          .billing-container .row {
            margin: 0;
          }
          .billing-container .col-md-4, 
          .billing-container .col-md-3, 
          .billing-container .col-md-6 {
            flex: 0 0 100%;
            max-width: 100%;
          }
          .btn {
            width: 100%;
            margin-bottom: 10px;
          }
          .custom-table-container {
            margin: 0;
          }
          .table {
            min-width: 680px; /* Sum of all column widths */
          }
        }
      `}</style>
    </MainContentPage>
  );
};

export default IndividualPaid;