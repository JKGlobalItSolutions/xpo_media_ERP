import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ItemBookSetup from '../../pages/Administration Pages/MainPages/Item-Book-Setup';
import CategoryHead from '../../pages/Administration Pages/MainPages/CategoryHead';
import CustomerStaffMaster from '../../pages/Administration Pages/MainPages/Customer-Staff-Master';
import BookMaster from '../../pages/Administration Pages/MainPages/Book-Master';
import BookSetupClassWise from '../../pages/Administration Pages/MainPages/BookSetupClassWise';
import SupplierSetup from '../../pages/Administration Pages/MainPages/SupplierSetup';




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