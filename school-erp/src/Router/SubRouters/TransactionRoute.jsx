import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BillingEntry from '../../pages/Transaction Pages/BillingEntry';
import OtherFee from '../../pages/Transaction Pages/OtherFee';
import IndividualPaid from '../../pages/Transaction Pages/IndividualPaid';
import ReceiptEntry from '../../pages/Transaction Pages/ReceiptEntry';
import DuplicateBill from '../../pages/Transaction Pages/DuplicateBill';
import PaymentEntry from '../../pages/Transaction Pages/PaymentEntry';
import StaffUpdate from '../../pages/Transaction Pages/StaffUpdate';




function TransactionRoute() {
  return (
    <Routes>
      <Route path="billing-entry" element={< BillingEntry/>} />
      <Route path="other-fee" element={< OtherFee/>} />
      <Route path="individual-paid" element={< IndividualPaid/>} />  
      <Route path="payment-entry" element={< PaymentEntry/>} />  
      <Route path="receipt-entry" element={< ReceiptEntry/>} />  
      <Route path="duplicate-bill" element={< DuplicateBill/>} />  
      <Route path="staff-update" element={< StaffUpdate/>} />  
    </Routes>
  );
}

export default TransactionRoute;