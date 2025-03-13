"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { FaEdit, FaTrash } from "react-icons/fa"
import { db, auth } from "../../Firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc, query, limit, updateDoc, where } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

// Add Book Setup Modal Component
const AddBookSetupModal = ({ isOpen, onClose, onConfirm, standards, books, existingSetups }) => {
  const [standard, setStandard] = useState("")
  const [selectedBooks, setSelectedBooks] = useState([])

  if (!isOpen) return null

  const handleAddBook = () => {
    setSelectedBooks([...selectedBooks, { id: "", quantity: "", amount: "" }])
  }

  const handleBookChange = (index, field, value) => {
    const updatedBooks = [...selectedBooks]
    if (field === "quantity") {
      value = Math.max(0, Number.parseInt(value) || 0)
    }
    updatedBooks[index][field] = value
    setSelectedBooks(updatedBooks)
  }

  const handleRemoveBook = (index) => {
    const updatedBooks = selectedBooks.filter((_, i) => i !== index)
    setSelectedBooks(updatedBooks)
  }

  const handleSubmit = () => {
    if (existingSetups.some((setup) => setup.standard === standard)) {
      toast.error("A book setup for this standard already exists. Please edit the existing setup instead.")
      return
    }

    // Check for duplicate books
    const bookIds = selectedBooks.map((book) => book.id)
    if (new Set(bookIds).size !== bookIds.length) {
      toast.error("Duplicate books are not allowed. Please remove duplicates.")
      return
    }

    onConfirm({ standard, books: selectedBooks })
    setStandard("")
    setSelectedBooks([])
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Book Setup</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="text-start w-100">Select Standard</Form.Label>
            <Form.Select value={standard} onChange={(e) => setStandard(e.target.value)}>
              <option value="">Select Standard</option>
              {standards
                .filter((std) => !existingSetups.some((setup) => setup.standard === std.standard))
                .map((std) => (
                  <option key={std.id} value={std.standard}>
                    {std.standard}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Label>Book</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Quantity</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Amount</Form.Label>
            </Col>
          </Row>
          {selectedBooks.map((book, index) => (
            <Row key={index} className="mb-3">
              <Col xs={12} md={4}>
                <Form.Select
                  value={book.id}
                  onChange={(e) => {
                    const selectedBook = books.find((b) => b.id === e.target.value)
                    handleBookChange(index, "id", e.target.value)
                    handleBookChange(index, "amount", selectedBook ? selectedBook.amount : "")
                  }}
                >
                  <option value="">Select Book</option>
                  {books
                    .filter((b) => !selectedBooks.some((sb) => sb.id === b.id && sb !== book))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookname}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={3}>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={book.quantity}
                  onChange={(e) => handleBookChange(index, "quantity", e.target.value)}
                />
              </Col>
              <Col xs={6} md={3}>
                <Form.Control type="number" min="0" placeholder="Amount" value={book.amount} readOnly />
              </Col>
              <Col xs={12} md={2}>
                <Button variant="danger" onClick={() => handleRemoveBook(index)} className="w-100">
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" onClick={handleAddBook} className="mb-3">
            Add Book
          </Button>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Add
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Edit Book Setup Modal Component
const EditBookSetupModal = ({ isOpen, onClose, onConfirm, setup, standards, books }) => {
  const [standard, setStandard] = useState(setup?.standard || "")
  const [selectedBooks, setSelectedBooks] = useState(setup?.books || [])

  useEffect(() => {
    if (setup) {
      setStandard(setup.standard)
      setSelectedBooks(setup.books)
    }
  }, [setup])

  if (!isOpen) return null

  const handleAddBook = () => {
    setSelectedBooks([...selectedBooks, { id: "", quantity: "", amount: "" }])
  }

  const handleBookChange = (index, field, value) => {
    const updatedBooks = [...selectedBooks]
    if (field === "quantity") {
      value = Math.max(0, Number.parseInt(value) || 0)
    }
    updatedBooks[index][field] = value
    setSelectedBooks(updatedBooks)
  }

  const handleRemoveBook = (index) => {
    const updatedBooks = selectedBooks.filter((_, i) => i !== index)
    setSelectedBooks(updatedBooks)
  }

  const handleSubmit = () => {
    // Check for duplicate books
    const bookIds = selectedBooks.map((book) => book.id)
    if (new Set(bookIds).size !== bookIds.length) {
      toast.error("Duplicate books are not allowed. Please remove duplicates.")
      return
    }

    onConfirm({ id: setup.id, standard, books: selectedBooks })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Book Setup</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label className="text-start w-100">Standard</Form.Label>
            <Form.Control type="text" value={standard} readOnly />
          </Form.Group>
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Label>Book</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Quantity</Form.Label>
            </Col>
            <Col xs={6} md={3}>
              <Form.Label>Amount</Form.Label>
            </Col>
          </Row>
          {selectedBooks.map((book, index) => (
            <Row key={index} className="mb-3">
              <Col xs={12} md={4}>
                <Form.Select
                  value={book.id}
                  onChange={(e) => {
                    const selectedBook = books.find((b) => b.id === e.target.value)
                    handleBookChange(index, "id", e.target.value)
                    handleBookChange(index, "amount", selectedBook ? selectedBook.amount : "")
                  }}
                >
                  <option value="">Select Book</option>
                  {books
                    .filter((b) => !selectedBooks.some((sb) => sb.id === b.id && sb !== book))
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookname}
                      </option>
                    ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={3}>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Quantity"
                  value={book.quantity}
                  onChange={(e) => handleBookChange(index, "quantity", e.target.value)}
                />
              </Col>
              <Col xs={6} md={3}>
                <Form.Control type="number" min="0" placeholder="Amount" value={book.amount} readOnly />
              </Col>
              <Col xs={12} md={2}>
                <Button variant="danger" onClick={() => handleRemoveBook(index)} className="w-100">
                  Remove
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" onClick={handleAddBook} className="mb-3">
            Add Book
          </Button>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            Update
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Book Setup Modal Component
const DeleteBookSetupModal = ({ isOpen, onClose, onConfirm, setup }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Book Setup</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this book setup?</p>
          <p className="fw-bold">{setup?.standard}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(setup.id)}>
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

const BookSetupClassWise = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSetup, setSelectedSetup] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [standards, setStandards] = useState([])
  const [books, setBooks] = useState([])
  const [bookSetups, setBookSetups] = useState([])
  const [selectedStandard, setSelectedStandard] = useState("")
  const [storeId, setStoreId] = useState(null)
  const [administrationId, setAdministrationId] = useState(null)

  useEffect(() => {
    const fetchIds = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const storeRef = collection(db, "Schools", auth.currentUser.uid, "Store")
        const adminQuery = query(adminRef, limit(1))
        const storeQuery = query(storeRef, limit(1))

        const [adminSnapshot, storeSnapshot] = await Promise.all([getDocs(adminQuery), getDocs(storeQuery)])

        if (adminSnapshot.empty) {
          const newAdminRef = await addDoc(adminRef, { createdAt: new Date() })
          setAdministrationId(newAdminRef.id)
        } else {
          setAdministrationId(adminSnapshot.docs[0].id)
        }

        if (storeSnapshot.empty) {
          const newStoreRef = await addDoc(storeRef, { createdAt: new Date() })
          setStoreId(newStoreRef.id)
        } else {
          setStoreId(storeSnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching IDs:", error)
        toast.error("Failed to initialize. Please try again.")
      }
    }

    fetchIds()
  }, [])

  useEffect(() => {
    if (administrationId && storeId) {
      fetchStandards()
      fetchBooks()
      fetchBookSetups()
    }
  }, [administrationId, storeId])

  const fetchStandards = async () => {
    try {
      const standardsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        "Courses",
      )
      const querySnapshot = await getDocs(standardsRef)
      const standardsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setStandards(standardsData)
    } catch (error) {
      console.error("Error fetching standards:", error)
      toast.error("Failed to fetch standards. Please try again.")
    }
  }

  const fetchBooks = async () => {
    try {
      const booksRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup")
      const querySnapshot = await getDocs(booksRef)
      const booksData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setBooks(booksData)
    } catch (error) {
      console.error("Error fetching books:", error)
      toast.error("Failed to fetch books. Please try again.")
    }
  }

  const fetchBookSetups = async () => {
    try {
      const bookSetupRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "booksetupstandard")
      const querySnapshot = await getDocs(bookSetupRef)
      const bookSetupData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setBookSetups(bookSetupData)
    } catch (error) {
      console.error("Error fetching book setups:", error)
      toast.error("Failed to fetch book setups. Please try again.")
    }
  }

  const handleAddBookSetup = async (newSetup) => {
    try {
      const bookSetupRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "booksetupstandard")
      const existingSetupQuery = query(bookSetupRef, where("standard", "==", newSetup.standard))
      const existingSetupSnapshot = await getDocs(existingSetupQuery)

      if (!existingSetupSnapshot.empty) {
        toast.error("A book setup for this standard already exists. Please edit the existing setup instead.")
        return
      }

      await addDoc(bookSetupRef, newSetup)
      setIsAddModalOpen(false)
      toast.success("Book setup added successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      fetchBookSetups()
    } catch (error) {
      console.error("Error adding book setup:", error)
      toast.error("Failed to add book setup. Please try again.")
    }
  }

  const handleEditBookSetup = async (updatedSetup) => {
    try {
      const setupRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "booksetupstandard", updatedSetup.id)
      await updateDoc(setupRef, updatedSetup)
      setIsEditModalOpen(false)
      setSelectedSetup(null)
      toast.success("Book setup updated successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      fetchBookSetups()
    } catch (error) {
      console.error("Error updating book setup:", error)
      toast.error("Failed to update book setup. Please try again.")
    }
  }

  const handleDeleteBookSetup = async (setupId) => {
    try {
      const setupRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "booksetupstandard", setupId)
      await deleteDoc(setupRef)
      setIsDeleteModalOpen(false)
      setSelectedSetup(null)
      toast.success("Book setup deleted successfully!", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      fetchBookSetups()
    } catch (error) {
      console.error("Error deleting book setup:", error)
      toast.error("Failed to delete book setup. Please try again.")
    }
  }

  const openEditModal = (setup) => {
    setSelectedSetup(setup)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (setup) => {
    setSelectedSetup(setup)
    setIsDeleteModalOpen(true)
  }

  const calculateTotalAmount = (books) => {
    return books.reduce(
      (total, book) => total + (Number.parseFloat(book.amount) || 0) * (Number.parseInt(book.quantity) || 0),
      0,
    )
  }

  const filteredBookSetups = bookSetups.filter(
    (setup) =>
      (selectedStandard === "" || setup.standard === selectedStandard) &&
      (setup.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setup.books.some((book) =>
          books
            .find((b) => b.id === book.id)
            ?.bookname.toLowerCase()
            .includes(searchTerm.toLowerCase()),
        )),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <Row>
          <Col xs={12}>
            <div className="course-setup-container">
              <nav className="d-flex custom-breadcrumb py-1 py-lg-3">
                <Link to="/home">Home</Link>
                <span className="separator">&gt;</span>
                <div to="/store">Store</div>
                <span className="separator">&gt;</span>
                <span className="current">Book Setup Class Wise</span>
              </nav>

              <div className="form-card mt-3">
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Book Setup Class Wise</h2>
                  <h6 className="m-0 d-lg-none">Book Setup Class Wise</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Book Setup
                  </Button>
                </div>

                <div className="content-wrapper p-4">
                  <Row className="mb-3">
                    <Col xs={12} md={6} lg={4}>
                      <Form.Group>
                        <Form.Label>Select Standard</Form.Label>
                        <Form.Select value={selectedStandard} onChange={(e) => setSelectedStandard(e.target.value)}>
                          <option value="">All Standards</option>
                          {standards.map((std) => (
                            <option key={std.id} value={std.standard}>
                              {std.standard}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6} lg={8}>
                      <Form.Group>
                        <Form.Label>Search</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search by Standard or Book Name"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Standard</th>
                          <th>Books</th>
                          <th>Total Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookSetups.map((setup) => (
                          <tr key={setup.id}>
                            <td>{setup.standard}</td>
                            <td>
                              {setup.books.map((book) => (
                                <div key={book.id}>
                                  {books.find((b) => b.id === book.id)?.bookname}: {book.quantity} (Rs. {book.amount})
                                </div>
                              ))}
                            </td>
                            <td>Rs. {calculateTotalAmount(setup.books).toFixed(2)}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(setup)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(setup)}
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
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modals */}
      <AddBookSetupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddBookSetup}
        standards={standards}
        books={books}
        existingSetups={bookSetups}
      />
      <EditBookSetupModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedSetup(null)
        }}
        onConfirm={handleEditBookSetup}
        setup={selectedSetup}
        standards={standards}
        books={books}
      />
      <DeleteBookSetupModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedSetup(null)
        }}
        onConfirm={handleDeleteBookSetup}
        setup={selectedSetup}
      />

      {/* Toastify Container */}
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

          .form-card {
            background-color: #fff;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
          }

          .header {
            border-bottom: 1px solid #dee2e6;
            background-color: #0B3D7B;
            color: white;
          }

          .table-responsive {
            margin-bottom: 0;
          }

          .table th {
            font-weight: 500;
          }

          .table td {
            vertical-align: middle;
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
            max-width: 700px;
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

export default BookSetupClassWise

