import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DAYDCReport from '../../pages/DebitCard Report Pages/DAYDCReport';
import BackupData from '../../pages/DebitCard Report Pages/BackupData';
import TrailBalance from '../../pages/DebitCard Report Pages/TrailBalance';
import BankExpenses from '../../pages/DebitCard Report Pages/BankExpenses';
import CashExpenses from '../../pages/DebitCard Report Pages/CashExpenses';
import PromotionHigher from '../../pages/DebitCard Report Pages/PromotionHigher';





function DebitCardReportRoute() {
  return (
    <Routes>
      <Route path="day-dc-report" element={< DAYDCReport/>} />      
      <Route path="Backup-Data" element={< BackupData/>} />      
      <Route path="Trail-Balance" element={< TrailBalance/>} />      
      <Route path="Bank-Expenses" element={< BankExpenses/>} />      
      <Route path="Cash-Expenses" element={< CashExpenses/>} />      
      <Route path="Promotion-Higher" element={< PromotionHigher/>} />      
    </Routes>
  );
}

export default DebitCardReportRoute