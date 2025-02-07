import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Tutionfee from '../../pages/Collection Report Pages/Tutionfee';





function CollectionReportRoute() {
  return (
    <Routes>
      <Route path="tution-fee" element={< Tutionfee/>} />
    
      
    </Routes>
  );
}

export default CollectionReportRoute;