import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CourseSetup from '../../pages/Administration Pages/MainPages/CourseSetup';
import BookManagement from '../../pages/LibraryManagement/BookManagement';
import AddNewBookDetail from '../../pages/LibraryManagement/AddNewBookDetail';
import BookEntry from '../../pages/LibraryManagement/BookEntry';
import MembersManagement from '../../pages/LibraryManagement/MembersManagement';




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