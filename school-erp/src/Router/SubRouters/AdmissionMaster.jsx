import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Enquiry from '../../pages/Admission Pages/Enquiry';
import AdmissionForm from '../../pages/Admission Pages/AdmissionForm';
import StudentDetails from '../../pages/Admission Pages/StudentDetails';
import EditStudentDetails from '../../pages/Admission Pages/EditStudentDetails';




function AdmissionMaster() {
  return (
    <Routes>
      <Route path="enquiry" element={< Enquiry/>} />
      <Route path="AdmissionForm" element={< AdmissionForm/>} />
      <Route path="StudentDetails" element={< StudentDetails/>} />
      <Route path="EditStudentDetails" element={< EditStudentDetails/>} />
    
    </Routes>
  );
}

export default AdmissionMaster;