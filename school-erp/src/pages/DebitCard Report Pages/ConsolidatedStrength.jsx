import React from 'react';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { Breadcrumb } from 'react-bootstrap'; // Using Bootstrap for breadcrumb
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Link } from "react-router-dom"


const ConsolidatedStrength = () => {
  return (
    <MainContentPage>
      <div className="container mx-auto p-4">
        {/* Breadcrumb */}
        <div className="mb-4">
          <h2 className="mb-2">Promotion Higher</h2>
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/admission">Debit/Credit Report</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Consolidated Strength</span>
          </nav>
        </div>
      

        {/* Header */}
        <div
          className="text-white text-lg font-bold py-3 px-4 rounded-t-md"
          style={{ backgroundColor: '#0B3D7B' }}
        >
          Consolidated Strength
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table table-bordered w-100">
            <thead>
              <tr style={{ backgroundColor: '#0B3D7B', color: 'white' }}>
                <th className="px-4 py-2">S.no</th>
                <th className="px-4 py-2">Class</th>
                <th className="px-4 py-2">Section</th>
                <th className="px-4 py-2">Previous Year (old)</th>
                <th className="px-4 py-2">Current Year (old)</th>
                <th className="px-4 py-2">Left With TC</th>
                <th className="px-4 py-2">Left Without TC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2">1</td>
                <td className="px-4 py-2">Example</td>
                <td className="px-4 py-2">A</td>
                <td className="px-4 py-2">100</td>
                <td className="px-4 py-2">110</td>
                <td className="px-4 py-2">5</td>
                <td className="px-4 py-2">3</td>
              </tr>
              <tr>
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">Example</td>
                <td className="px-4 py-2">B</td>
                <td className="px-4 py-2">90</td>
                <td className="px-4 py-2">95</td>
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">4</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn text-white px-4 py-2"
            style={{ backgroundColor: '#0B3D7B' }}
            type="button"
          >
            Save
          </button>
          <button
            className="btn text-white px-4 py-2"
            style={{ backgroundColor: '#0B3D7B' }}
            type="button"
          >
            View
          </button>
          <button
            className="btn text-white px-4 py-2"
            style={{ backgroundColor: '#0B3D7B' }}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </MainContentPage>
  );
};

export default ConsolidatedStrength;
