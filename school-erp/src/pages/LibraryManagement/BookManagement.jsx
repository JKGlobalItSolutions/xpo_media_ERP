"use client";

import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaFilter, FaPlus } from "react-icons/fa";
import "./styles/book-management.css";
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Link } from "react-router-dom";

const BookManagement = () => {
  const [books] = useState([
    {
      id: "001",
      title: "The Alchemist",
      author: "Paulo Coelho",
      isbn: "978-3-16-148410-0",
      category: "Fiction",
      status: "Available",
    },
    {
      id: "002",
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "978-1-59330-235-6",
      category: "Self-Help",
      status: "Issued",
    },
    {
      id: "003",
      title: "Rich Dad Poor Dad",
      author: "Robert Kiyosaki",
      isbn: "978-0-7352-1121-6",
      category: "Finance",
      status: "Available",
    },
    {
      id: "004",
      title: "The Psychology of Money",
      author: "Morgan Housel",
      isbn: "978-0-85719-768-2",
      category: "Finance",
      status: "Available",
    },
    {
      id: "005",
      title: "Sapiens",
      author: "Yuval Noah Harari",
      isbn: "978-0-06-231609-7",
      category: "History",
      status: "Issued",
    },
    {
      id: "006",
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      category: "Dystopian",
      status: "Available",
    },
    {
      id: "007",
      title: "The Lean Startup",
      author: "Eric Ries",
      isbn: "978-0-307-88791-7",
      category: "Business",
      status: "Available",
    },
    {
      id: "008",
      title: "The Subtle Art",
      author: "Mark Manson",
      isbn: "978-0-06-245771-4",
      category: "Self-Help",
      status: "Issued",
    },
    {
      id: "009",
      title: "The Power of Now",
      author: "Eckhart Tolle",
      isbn: "978-1-57731-152-2",
      category: "Spiritual",
      status: "Available",
    },
    {
      id: "010",
      title: "Ikigai",
      author: "Héctor García",
      isbn: "978-0-241-30292-6",
      category: "Philosophy",
      status: "Issued",
    },
  ]);

  return (
    <MainContentPage>
      <div className="container-fluid p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="mb-2 fw-bolder ">Library Management</h2>
        </div>
        {/* Header and Breadcrumb */}
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/library">Library Management</Link>
            <span className="separator mx-2">&gt;</span>
            <span> Book Management</span>
          </nav>
        </div>

        {/* Search and Actions */}
        <h2 className="book-title">Book Management</h2>

        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Book Title, Author, ISBN, Category"
                  />
                  <button
                   
                    className="btn text-light px-lg-4 custom-btn-clr "
                  >
                    SEARCH
                  </button>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="d-flex gap-2 justify-content-md-end">
                  <button className="btn btn-outline-primary custom-outline-btn">
                    <FaFilter className="me-2" />
                    Filter
                  </button>
                  <button className="btn custom-btn-clr custom-btn">
                    <FaPlus className="me-2" />
                    Add Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Book ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="book-id">{book.id}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        book.status === "Available" ? "available" : "issued"
                      }`}
                    >
                      {book.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm custom-btn">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mt-4">
          <div className="text-muted small">Showing 1 to 10 of 10 entries</div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" disabled>
              Previous
            </button>
            <button className="btn btn-primary custom-btn">1</button>
            <button className="btn btn-outline-primary custom-outline-btn">
              2
            </button>
            <button className="btn btn-outline-primary custom-outline-btn">
              3
            </button>
            <button className="btn btn-outline-primary custom-outline-btn">
              Next
            </button>
          </div>
        </div>
      </div>
    </MainContentPage>
  );
};

export default BookManagement;
