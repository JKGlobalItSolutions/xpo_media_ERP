import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CourseSetup from '../../pages/Administration Pages/MainPages/CourseSetup';
import BookManagement from '../../pages/LibraryManagement.jsx/BookManagement';
import AddNewBookDetail from '../../pages/LibraryManagement.jsx/AddNewBookDetail';
import BookEntry from '../../pages/LibraryManagement.jsx/BookEntry';
import MembersManagement from '../../pages/LibraryManagement.jsx/MembersManagement';




function LibraryManagementRoute() {
  return (
    <Routes>
      <Route path="book-management" element={<BookManagement />} />
      <Route path="add-new-book" element={<AddNewBookDetail />} />
      <Route path="book-entry" element={<BookEntry />} />
      <Route path="members-management" element={<MembersManagement />} />
    </Routes>
  );
}

export default LibraryManagementRoute;