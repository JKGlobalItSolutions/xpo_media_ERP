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
import CategoryWiseReport from '../../pages/Admission Pages/StudentDetaisReport.jsx/CategoryWiseReport';
import RouteWiseReport from '../../pages/Admission Pages/StudentDetaisReport.jsx/RouteWiserReport';
import IndividualFullView from '../../pages/Admission Pages/StudentDetaisReport.jsx/IndividualFullView';
import CourseStudyCertificate from '../../pages/Admission Pages/StudentDetaisReport.jsx/CourseStudyCertificate';
import TypeWise from '../../pages/Admission Pages/StudentDetaisReport.jsx/TypeWise';
import CustomizedReportGenerate from '../../pages/Admission Pages/StudentDetaisReport.jsx/CustomizedReportGenerate';


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
      <Route path="Student-Details-Report/category-wise-report" element={<CategoryWiseReport />} />
      <Route path="Student-Details-Report/route-wise-report" element={<RouteWiseReport />} />
      <Route path="Student-Details-Report/individual-full-view" element={<IndividualFullView />} />
      <Route path="Student-Details-Report/course-study-certificate" element={<CourseStudyCertificate />} />
      <Route path="Student-Details-Report/type-wise-report" element={<TypeWise />} />
      <Route path="Student-Details-Report/customize-report-generate" element={<CustomizedReportGenerate />} />
    </Routes>
  );
}

export default AdmissionMaster;