import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Enquiry from '../../pages/AdministrationMaster/Enquiry';




function AdmissionMaster() {
  return (
    <Routes>
      <Route path="enquiry" element={< Enquiry/>} />
    
    </Routes>
  );
}

export default AdmissionMaster;