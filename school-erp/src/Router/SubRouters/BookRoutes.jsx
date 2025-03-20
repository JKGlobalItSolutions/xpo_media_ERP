import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CategoryHead from '../../pages/Book/CategoryHead';
import CustomerStaffMaster from '../../pages/Book/Customer-Staff-Master';
import BookMaster from '../../pages/Book/Book-Master';
import BookSetupClassWise from '../../pages/Book/BookSetupClassWise';
import SupplierSetup from '../../pages/Book/SupplierSetup';
import ItemBookSetup from '../../pages/Book/Item-Book-Setup';
import BookTransaction from '../../pages/Book/BookTransaction';
import BookMaterialPurchase from '../../pages/Book/BookTransaction Pages/BookMaterialPurchase';
import BookDistribute from '../../pages/Book/BookTransaction Pages/BookDistribute';
import UtiliseMaterialOtherItems from '../../pages/Book/BookTransaction Pages/UtiliseMaterialOtherItems';
import PurchaseEntry from '../../pages/Book/BookTransaction Pages/PurchaseEntry';
import SupplierPaymentEntry from '../../pages/Book/BookTransaction Pages/SupplierPaymentEntry';
import UnitsSetup from '../../pages/Book/UnitsSetup';
import BookMaterialPurchaseView from '../../pages/Book/BookTransaction Pages/BookMaterialPurchaseView';





function BookRoutes() {
  return (
    <Routes>
   <Route path="item-book-master" element={<ItemBookSetup/>} />
      <Route path="category-head" element={<CategoryHead/>} />
      <Route path="customer-staff-master" element={<CustomerStaffMaster/>} />
      <Route path="Book-Master" element={<BookMaster/>} />
      <Route path="Book-setup-class-wise" element={<BookSetupClassWise/>} />
      <Route path="supplier-Setup" element={<SupplierSetup/>} />
      <Route path="book-transaction" element={<BookTransaction/>} />
      <Route path="book-material-purchase" element={<BookMaterialPurchase/>} />
      <Route path="book-distribute" element={<BookDistribute/>} />
      <Route path="utilise-other-items" element={<UtiliseMaterialOtherItems/>} />
      <Route path="purchase-entry" element={<PurchaseEntry/>} />
      <Route path="supplier-payment-entry" element={<SupplierPaymentEntry/>} />
      <Route path="unit-setup" element={<UnitsSetup/>} />
      <Route path="book-material-view" element={<BookMaterialPurchaseView/>} />

    </Routes>
  );
}

export default BookRoutes;