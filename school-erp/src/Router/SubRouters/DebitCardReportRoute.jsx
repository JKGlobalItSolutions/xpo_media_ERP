import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DAYDCReport from '../../pages/DebitCard Report Pages/DAYDCReport';
import PeriodDCReport from '../../pages/DebitCard Report Pages/PeriodDCReport';
import BankLedger from '../../pages/DebitCard Report Pages/BankLedger';
import BalanceList from '../../pages/DebitCard Report Pages/BalanceList';
import SchoolFee from '../../pages/DebitCard Report Pages/Balancelist Pages/SchoolFee';
import TransportFee from '../../pages/DebitCard Report Pages/Balancelist Pages/TransportFee';
import ConsolidatedStrength from '../../pages/DebitCard Report Pages/ConsolidatedStrength';
import BackupData from '../../pages/DebitCard Report Pages/BackupData';
import TrailBalance from '../../pages/DebitCard Report Pages/TrailBalance';
import BankExpenses from '../../pages/DebitCard Report Pages/BankExpenses';
import CashExpenses from '../../pages/DebitCard Report Pages/CashExpenses';
import PromotionHigher from '../../pages/DebitCard Report Pages/PromotionHigher';





function DebitCardReportRoute() {
  return (
    <Routes>
      <Route path="day-dc-report" element={< DAYDCReport/>} />      
      <Route path="period-dc-report" element={< PeriodDCReport/>} />      
      <Route path="bank-ledger" element={< BankLedger/>} />      
      <Route path="balance-list" element={< BalanceList/>} />      
      <Route path="school-fee" element={< SchoolFee/>} />      
      <Route path="transport-fee" element={<TransportFee/>} />      
      <Route path="consolidated-strength" element={<ConsolidatedStrength/>} />      
      <Route path="Backup-Data" element={< BackupData/>} />      
      <Route path="Trail-Balance" element={< TrailBalance/>} />      
      <Route path="Bank-Expenses" element={< BankExpenses/>} />      
      <Route path="Cash-Expenses" element={< CashExpenses/>} />      
      <Route path="Promotion-Higher" element={< PromotionHigher/>} />      
    </Routes>
  );
}

export default DebitCardReportRoute