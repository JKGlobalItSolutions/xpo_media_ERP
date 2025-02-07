import React from 'react';
import MainContentPage from '../../components/MainContent/MainContentPage';

const ConsolidatedStrength = () => {
  return (
   <MainContentPage>
     <div className="container mx-auto p-4">
      {/* Header */}
      <div
        className="text-white text-lg font-bold py-3 px-4 rounded-t-md"
        style={{ backgroundColor: '#0B3D7B' }}
      >
        Consolidated Strength
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-blue-800">
          <thead>
            <tr style={{ backgroundColor: '#0B3D7B', color: 'white' }}>
              <th className="border border-blue-800 px-4 py-2">S.no</th>
              <th className="border border-blue-800 px-4 py-2">Class</th>
              <th className="border border-blue-800 px-4 py-2">Section</th>
              <th className="border border-blue-800 px-4 py-2">Previous Year (old)</th>
              <th className="border border-blue-800 px-4 py-2">Current Year (old)</th>
              <th className="border border-blue-800 px-4 py-2">Left With TC</th>
              <th className="border border-blue-800 px-4 py-2">Left Without TC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-blue-800 px-4 py-2">1</td>
              <td className="border border-blue-800 px-4 py-2">Example</td>
              <td className="border border-blue-800 px-4 py-2">A</td>
              <td className="border border-blue-800 px-4 py-2">100</td>
              <td className="border border-blue-800 px-4 py-2">110</td>
              <td className="border border-blue-800 px-4 py-2">5</td>
              <td className="border border-blue-800 px-4 py-2">3</td>
            </tr>
            <tr>
              <td className="border border-blue-800 px-4 py-2">2</td>
              <td className="border border-blue-800 px-4 py-2">Example</td>
              <td className="border border-blue-800 px-4 py-2">B</td>
              <td className="border border-blue-800 px-4 py-2">90</td>
              <td className="border border-blue-800 px-4 py-2">95</td>
              <td className="border border-blue-800 px-4 py-2">2</td>
              <td className="border border-blue-800 px-4 py-2">4</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer placeholder */}
      <div className="h-8" />
    </div>
   </MainContentPage>
  );
};

export default ConsolidatedStrength;
