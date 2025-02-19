import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CourseSetup from '../../pages/Administration Pages/MainPages/CourseSetup';
import FeeHeadSetup from '../../pages/Administration Pages/MainPages/FeeHeadSetup';
import TutionFeeSetup from '../../pages/Administration Pages/MainPages/TutionFeeSetup';
import CommunityAndCasteSetup from '../../pages/Administration Pages/MainPages/CommunityAndCasteSetup';
import ParentOccupationSetup from '../../pages/Administration Pages/MainPages/ParentOccupationSetup';
import StaffDesignationandCategory from '../../pages/Administration Pages/MainPages/StaffDesignationandCategory';
import ReceiptSetup from '../../pages/Administration Pages/MainPages/ReceiptSetup';
import ReceiptHeadSetup from '../../pages/Administration Pages/ReceiptSetupPages/ReceiptHeadSetup';
import ReceiptSubHeadSetup from '../../pages/Administration Pages/ReceiptSetupPages/ReceiptSubHeadSetup';
import PaymentSetup from '../../pages/Administration Pages/MainPages/PaymentSetup';
import PaymenHeadSetup from '../../pages/Administration Pages/PaymentSetupPages/PaymentHeadSetup';
import PaymentSubHeadSetup from '../../pages/Administration Pages/PaymentSetupPages/PaymentSubHeadSetup';
import CertificatePreparation from '../../pages/Administration Pages/MainPages/CirtificatePreparation';
import AttendanceCertificate from '../../pages/Administration Pages/CertificatePreparationPages/Attendancecertificate';
import CourseCertificate from '../../pages/Administration Pages/CertificatePreparationPages/CourseCertificate';
import ExperienceCertificate from '../../pages/Administration Pages/CertificatePreparationPages/ExperienceCertificate';
import SubjectHead from '../../pages/Administration Pages/MainPages/SubjectHead';
import StaffMaster from '../../pages/Administration Pages/MainPages/StaffMaster';
import PasswordSetup from '../../pages/Administration Pages/MainPages/PasswordSetup';
import SupplierSetup from '../../pages/Administration Pages/MainPages/SupplierSetup';
import StudentsCategory from '../../pages/Administration Pages/MainPages/StudentsCategory';
import StateAndDistrictManagement from '../../pages/Administration Pages/MainPages/StateAndDistrictManagement';
import MotherTongueSetup from '../../pages/Administration Pages/MainPages/MotherTongueSetup';
import SectionSetup from '../../pages/Admission Pages/SectionSetup';



function AdministrationRoute() {
  return (
    <Routes>
      <Route path="standard-setup" element={<CourseSetup />} />
      <Route path="fee-setup" element={<FeeHeadSetup />} />
      <Route path="password-setup" element={<PasswordSetup />} />
      <Route path="tuition-setup" element={<TutionFeeSetup />} />
      <Route path="Students-Category" element={<StudentsCategory />} />
      <Route path="Subject-Head" element={<SubjectHead />} />
      <Route path="community-setup" element={<CommunityAndCasteSetup />} />
      <Route path="Staff-Designation-and-Category" element={<StaffDesignationandCategory />} />
      <Route path="occupation-setup" element={<ParentOccupationSetup />} />
      <Route path="receipt-setup" element={<ReceiptSetup />} />
      <Route path="head-setup" element={<ReceiptHeadSetup />} />
      <Route path="subhead-setup" element={<ReceiptSubHeadSetup />} />
      <Route path="payment-setup" element={<PaymentSetup />} />
      <Route path="staff-master" element={<StaffMaster />} />
      <Route path="paymenthead-setup" element={<PaymenHeadSetup />} />
      <Route path="paymentsubhead-setup" element={<PaymentSubHeadSetup />} />
      <Route path="certificate" element={<CertificatePreparation />} />
      <Route path="attendance-certificate" element={<AttendanceCertificate />} />
      <Route path="course-certificate" element={<CourseCertificate />} />
      <Route path="experience-certificate" element={<ExperienceCertificate/>} />
      <Route path="supplier-Setup" element={<SupplierSetup/>} />
      <Route path="State-And-District-Management" element={<StateAndDistrictManagement/>} />
      <Route path="Mother-Tongue-Setup" element={<MotherTongueSetup/>} />
      <Route path="section-setup" element={<SectionSetup/>} />

    
    </Routes>
  );
}

export default AdministrationRoute;