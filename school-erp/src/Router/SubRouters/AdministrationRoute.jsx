import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CourseSetup from '../../pages/Administration Pages/CourseSetup'
import FeeHeadSetup from '../../pages/Administration Pages/FeeHeadSetup'
import TutionFeeSetup from '../../pages/Administration Pages/TutionFeeSetup'
import RegularCandidates from '../../pages/Administration Pages/Tution Fee Setup Pages/RegularCandidatesPage'
import RTECandidate from '../../pages/Administration Pages/Tution Fee Setup Pages/RTECandidate'
import OtherCandidates from '../../pages/Administration Pages/Tution Fee Setup Pages/OtherCandidates'
import SingleParent from '../../pages/Administration Pages/Tution Fee Setup Pages/SingleParent'


function AdministrationRoute() {
  return (
    <Routes>
      <Route path="standard-setup" element={<CourseSetup />} />
      <Route path="fee-setup" element={<FeeHeadSetup />} />
      <Route path="tuition-setup" element={<TutionFeeSetup />} />
      <Route path="tuition-setup/regular-candidates" element={<RegularCandidates />} />
      <Route path="tuition-setup/rte-candidate" element={<RTECandidate />} />
      <Route path="tuition-setup/other-candidate" element={<OtherCandidates />} />
      <Route path="tuition-setup/single-parent" element={<SingleParent />} />
    </Routes>
  );
}

export default AdministrationRoute;