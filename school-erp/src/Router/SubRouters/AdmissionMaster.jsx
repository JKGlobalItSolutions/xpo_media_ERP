import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Enquiry from '../../pages/Admission Pages/Enquiry';
import AdmissionForm from '../../pages/Admission Pages/AdmissionForm';
import StudentDetails from '../../pages/Admission Pages/StudentDetails';
import EditStudentDetails from '../../pages/Admission Pages/EditStudentDetails';
import StudentDetailsReport from '../../pages/Admission Pages/StudentDetailsReport';
import TransferCertificate from '../../pages/Admission Pages/TransferCertificate';
import DemandReport from '../../pages/Admission Pages/DemandReport';
import SectionReplace from '../../pages/Admission Pages/SectionReplace';
import ArrearFeeUpdating from '../../pages/Admission Pages/ArrearFeeUpdating';
import BillCancel from '../../pages/Admission Pages/BillCancel';
import BarcodeDesign from '../../pages/Admission Pages/BarcodeDesign';
import EnquiryForm from '../../pages/Admission Pages/EnquiryForm';
import StudentRegisterReport from '../../pages/Admission Pages/StudentDetaisReport.jsx/StudentRegisterReport';
import ReligionWiseReport from '../../pages/Admission Pages/StudentDetaisReport.jsx/ReligionwiseReport';
import StageWiseReport from '../../pages/Admission Pages/StudentDetaisReport.jsx/StageWiseReport';


function AdmissionMaster() {
  return (
    <Routes>
      <Route path="enquiry" element={<Enquiry />} />
      <Route path="AdmissionForm" element={<AdmissionForm />} />
      <Route path="AdmissionForm/:id" element={<AdmissionForm />} />
      <Route path="Bar-code-Design" element={<BarcodeDesign />} />
      <Route path="StudentDetails" element={<StudentDetails />} />
      <Route path="EditStudentDetails" element={<EditStudentDetails />} />
      <Route path="Student-Details-Report" element={<StudentDetailsReport />} />
      <Route path="Transfer-Certificate" element={<TransferCertificate />} />
      <Route path="Demand-Report" element={<DemandReport />} />
      <Route path="Section-Replace" element={<SectionReplace />} />
      <Route path="Arrear-FeeUpdating" element={<ArrearFeeUpdating />} />
      <Route path="Bill-Cancel" element={<BillCancel />} />
      <Route path="/enquiry-form/:id" element={<EnquiryForm />} />
      <Route path="/enquiry-form/" element={<EnquiryForm />} />
      <Route path="Student-Details-Report/student-register-report" element={<StudentRegisterReport />} />
      <Route path="Student-Details-Report/religion-wise-report" element={<ReligionWiseReport />} />
      <Route path="Student-Details-Report/stage-wise-report" element={<StageWiseReport />} />
    </Routes>
  );
}

export default AdmissionMaster;