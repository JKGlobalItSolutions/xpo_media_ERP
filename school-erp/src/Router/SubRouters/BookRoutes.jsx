import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ItemBookSetup from '../../pages/Book/Item-Book-Setup copy';
import CategoryHead from '../../pages/Book/CategoryHead';
import CustomerStaffMaster from '../../pages/Book/Customer-Staff-Master';
import BookMaster from '../../pages/Book/Book-Master';
import BookSetupClassWise from '../../pages/Book/BookSetupClassWise';
import SupplierSetup from '../../pages/Book/SupplierSetup';





function BookRoutes() {
  return (
    <Routes>
   <Route path="item-book-master" element={<ItemBookSetup/>} />
      <Route path="category-head" element={<CategoryHead/>} />
      <Route path="customer-staff-master" element={<CustomerStaffMaster/>} />
      <Route path="Book-Master" element={<BookMaster/>} />
      <Route path="Book-setup-class-wise" element={<BookSetupClassWise/>} />
      <Route path="supplier-Setup" element={<SupplierSetup/>} />

    </Routes>
  );
}

export default BookRoutes;