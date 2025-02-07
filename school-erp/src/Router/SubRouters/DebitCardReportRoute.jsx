import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DAYDCReport from '../../pages/DebitCard Report Pages/DAYDCReport';





function DebitCardReportRoute() {
  return (
    <Routes>
      <Route path="day-dc-report" element={< DAYDCReport/>} />      
    </Routes>
  );
}

export default DebitCardReportRoute