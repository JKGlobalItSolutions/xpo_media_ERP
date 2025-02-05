import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CourseSetup from '../../pages/Administration Pages/MainPages/CourseSetup';
import FeeHeadSetup from '../../pages/Administration Pages/MainPages/FeeHeadSetup';
import TutionFeeSetup from '../../pages/Administration Pages/MainPages/TutionFeeSetup';
import CommunityAndCasteSetup from '../../pages/Administration Pages/MainPages/CommunityAndCasteSetup';
import ParentOccupationSetup from '../../pages/Administration Pages/MainPages/ParentOccupationSetup';
import ReceiptSetup from '../../pages/Administration Pages/MainPages/ReceiptSetup';
import ReceiptHeadSetup from '../../pages/Administration Pages/ReceiptSetupPages/ReceiptHeadSetup';



function AdministrationRoute() {
  return (
    <Routes>
      <Route path="standard-setup" element={<CourseSetup />} />
      <Route path="fee-setup" element={<FeeHeadSetup />} />
      <Route path="tuition-setup" element={<TutionFeeSetup />} />
 
      <Route path="community-setup" element={<CommunityAndCasteSetup />} />
      <Route path="occupation-setup" element={<ParentOccupationSetup />} />
      <Route path="receipt-setup" element={<ReceiptSetup />} />
      <Route path="head-setup" element={<ReceiptHeadSetup />} />
    </Routes>
  );
}

export default AdministrationRoute;