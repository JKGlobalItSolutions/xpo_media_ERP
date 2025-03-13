"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Container, Table } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc, query, limit, updateDoc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaEdit, FaTrash } from "react-icons/fa"

// Add Book Modal Component
const AddBookModal = ({ isOpen, onClose, onConfirm, book, categories }) => {
  const [bookName, setBookName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    if (book) {
      setBookName(book.bookname)
      setAmount(book.amount || "")
      setCategory(book.category || "") // Load existing category if editing
    } else {
      setBookName("")
      setAmount("")
      setCategory("")
    }
  }, [book])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(bookName, amount, category)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{book ? "Edit Book" : "Add Book"}</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter Book Name"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="number"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="custom-input"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.newCategory}>
                {cat.newCategory} ({cat.accountHead})
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            {book ? "Update" : "Add"}
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Book Modal Component
const DeleteBookModal = ({ isOpen, onClose, onConfirm, book }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Book</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this book?</p>
          <p className="fw-bold">{book?.bookname}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(book.id)}>
            Delete
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentName, newName, currentAmount, newAmount, currentCategory, newCategory }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this book? This may affect related data.</p>
          <p>
            <strong>Current Name:</strong> {currentName}
          </p>
          <p>
            <strong>New Name:</strong> {newName}
          </p>
          <p>
            <strong>Current Amount:</strong> {currentAmount}
          </p>
          <p>
            <strong>New Amount:</strong> {newAmount}
          </p>
          <p>
            <strong>Current Category:</strong> {currentCategory || "None"}
          </p>
          <p>
            <strong>New Category:</strong> {newCategory || "None"}
          </p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={onConfirm}>
            Confirm Edit
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const BookMaster = () => {
  const [books, setBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [storeId, setStoreId] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [newBookName, setNewBookName] = useState("")
  const [newBookAmount, setNewBookAmount] = useState("")
  const [newBookCategory, setNewBookCategory] = useState("")
  const [categories, setCategories] = useState([]) // To store CategoryHead data

  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const storeRef = collection(db, "Schools", auth.currentUser.uid, "Store")
        const q = query(storeRef, limit(1))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          const newStoreRef = await addDoc(storeRef, { createdAt: new Date() })
          setStoreId(newStoreRef.id)
        } else {
          setStoreId(querySnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching/creating Store ID:", error)
        toast.error("Failed to initialize. Please try again.", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      }
    }

    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchBooks()
      fetchCategories() // Fetch CategoryHead data
    }
  }, [storeId])

  const fetchBooks = async () => {
    try {
      const booksRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup")
      const querySnapshot = await getDocs(booksRef)
      const booksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setBooks(booksData)
    } catch (error) {
      console.error("Error fetching books:", error)
      toast.error("Failed to fetch books. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "CategoryHead")
      const querySnapshot = await getDocs(categoriesRef)
      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Failed to fetch categories. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleAddBook = async (bookName, amount, category) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    // Check for duplicate book name
    const isDuplicate = books.some((book) => book.bookname.toLowerCase() === bookName.toLowerCase())
    if (isDuplicate) {
      toast.error("A book with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const booksRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup")
      await addDoc(booksRef, { bookname: bookName, amount: amount, category: category || null })
      setIsAddModalOpen(false)
      toast.success("Book added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchBooks()
    } catch (error) {
      console.error("Error adding book:", error)
      toast.error("Failed to add book. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleEditBook = async (newName, newAmount, newCategory) => {
    if (!storeId || !selectedBook) {
      toast.error("Store not initialized or no book selected. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    // Check for duplicate book name
    const isDuplicate = books.some(
      (book) => book.id !== selectedBook.id && book.bookname.toLowerCase() === newName.toLowerCase(),
    )
    if (isDuplicate) {
      toast.error("A book with this name already exists. Please choose a different name.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    setIsAddModalOpen(false)
    setIsConfirmEditModalOpen(true)
    setNewBookName(newName)
    setNewBookAmount(newAmount)
    setNewBookCategory(newCategory)
  }

  const confirmEditBook = async () => {
    try {
      const bookRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup", selectedBook.id)
      await updateDoc(bookRef, { bookname: newBookName, amount: newBookAmount, category: newBookCategory || null })
      setIsConfirmEditModalOpen(false)
      setSelectedBook(null)
      setNewBookName("")
      setNewBookAmount("")
      setNewBookCategory("")
      toast.success("Book updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchBooks()
    } catch (error) {
      console.error("Error updating book:", error)
      toast.error("Failed to update book. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      return
    }

    try {
      const bookRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup", bookId)
      await deleteDoc(bookRef)
      setIsDeleteModalOpen(false)
      setSelectedBook(null)
      toast.success("Book deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchBooks()
    } catch (error) {
      console.error("Error deleting book:", error)
      toast.error("Failed to delete book. Please try again.", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  const openEditModal = (book) => {
    setSelectedBook(book)
    setIsAddModalOpen(true)
  }

  const openDeleteModal = (book) => {
    setSelectedBook(book)
    setIsDeleteModalOpen(true)
  }

  const filteredBooks = books.filter((book) => book.bookname.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <div to="/store">Store</div>
            <span className="separator mx-2">&gt;</span>
            <span>Book Master</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2>Book Master</h2>
          <Button
            onClick={() => {
              setSelectedBook(null)
              setIsAddModalOpen(true)
            }}
            className="btn btn-light text-dark"
          >
            + Add Book
          </Button>
        </div>

        <div className="bg-white p-4 rounded-bottom shadow">
          <Form className="mb-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Search by book name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Form>

          <div className="table-responsive">
            <Table bordered hover>
              <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                <tr>
                  <th>Book Name</th>
                  <th>Amount</th>
                  <th>Category</th> {/* Added Category column */}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.bookname}</td>
                    <td>{book.amount}</td>
                    <td>{book.category || "None"}</td> {/* Display category or "None" */}
                    <td>
                      <Button
                        variant="link"
                        className="action-button edit-button me-2"
                        onClick={() => openEditModal(book)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        className="action-button delete-button"
                        onClick={() => openDeleteModal(book)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Container>

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setSelectedBook(null)
        }}
        onConfirm={(bookName, amount, category) =>
          selectedBook ? handleEditBook(bookName, amount, category) : handleAddBook(bookName, amount, category)
        }
        book={selectedBook}
        categories={categories} // Pass categories to the modal
      />

      <DeleteBookModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedBook(null)
        }}
        onConfirm={handleDeleteBook}
        book={selectedBook}
      />

      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedBook(null)
          setNewBookName("")
          setNewBookAmount("")
          setNewBookCategory("")
        }}
        onConfirm={confirmEditBook}
        currentName={selectedBook?.bookname}
        newName={newBookName}
        currentAmount={selectedBook?.amount}
        newAmount={newBookAmount}
        currentCategory={selectedBook?.category} // Added category fields
        newCategory={newBookCategory}
      />

      <ToastContainer />

      <style>
        {`
          .custom-breadcrumb {
            padding: 0.5rem 1rem;
          }

          .custom-breadcrumb a {
            color: #0B3D7B;
            text-decoration: none;
          }

          .custom-breadcrumb .separator {
            margin: 0 0.5rem;
            color: #6c757d;
          }

          .custom-breadcrumb .current {
            color: #212529;
          }

          .action-button {
            width: 30px;
            height: 30px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            padding: 0;
            color: white;
          }

          .edit-button {
            background-color: #0B3D7B;
          }

          .edit-button:hover {
            background-color: #092a54;
            color: white;
          }

          .delete-button {
            background-color: #dc3545;
          }

          .delete-button:hover {
            background-color: #bb2d3b;
            color: white;
          }

          /* Modal Styles */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1100;
          }

          .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
          }

          .modal-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
            text-align: center;
          }

          .modal-body {
            margin-bottom: 1.5rem;
          }

          .modal-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }

          .modal-button {
            padding: 0.5rem 2rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
          }

          .modal-button.confirm {
            background-color: #0B3D7B;
            color: white;
          }

          .modal-button.delete {
            background-color: #dc3545;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }

          .custom-input {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
          }

          /* Toastify custom styles */
          .Toastify__toast-container {
            z-index: 9999;
          }

          .Toastify__toast {
            background-color: #0B3D7B;
            color: white;
          }

          .Toastify__toast--success {
            background-color: #0B3D7B;
          }

          .Toastify__toast--error {
            background-color: #dc3545;
          }

          .Toastify__progress-bar {
            background-color: rgba(255, 255, 255, 0.7);
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default BookMaster