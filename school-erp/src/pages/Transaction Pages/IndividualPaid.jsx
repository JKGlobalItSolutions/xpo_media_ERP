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
          <div className="table-responsive" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <table className="table table-bordered">
              <thead className="bg-primary text-white">
                <tr>
                  <th>S.No</th>
                  <th>Paid Date</th>
                  <th>Paid Amount</th>
                  <th>Bill Number</th>
                  <th>Fee Head Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>01-01-2025</td>
                  <td>120</td>
                  <td>12345</td>
                  <td>Tuition Fee</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>01-02-2025</td>
                  <td>150</td>
                  <td>12346</td>
                  <td>Library Fee</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 mt-3">
            <button style={{ backgroundColor: "#0B3D7B" }} className="btn btn-primary w-100 w-md-auto">
              Softcopy
            </button>
            <button className="btn btn-primary w-100 w-md-auto">
              Hardcopy
            </button>
            <button className="btn btn-secondary w-100 w-md-auto">
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
          .table-responsive {
            display: block;
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </MainContentPage>
  );
};

export default IndividualPaid;
