"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Container, Table, Modal } from "react-bootstrap"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, deleteDoc, doc, query, limit, updateDoc } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaEdit, FaTrash } from "react-icons/fa"

const BookMaster = () => {
  const [books, setBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [storeId, setStoreId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [bookName, setBookName] = useState("")

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
          style: { background: "#dc3545", color: "white" },
        })
      }
    }

    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchBooks()
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
        style: { background: "#dc3545", color: "white" },
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const booksRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup")
      if (editingBook) {
        await updateDoc(doc(booksRef, editingBook.id), { bookname: bookName })
        toast.success("Book updated successfully!")
      } else {
        await addDoc(booksRef, { bookname: bookName })
        toast.success("Book added successfully!")
      }
      setShowModal(false)
      setEditingBook(null)
      setBookName("")
      fetchBooks()
    } catch (error) {
      console.error("Error adding/updating book:", error)
      toast.error("Failed to add/update book. Please try again.")
    }
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setBookName(book.bookname)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    try {
      const bookRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "BookSetup", id)
      await deleteDoc(bookRef)
      toast.success("Book deleted successfully!", {
        style: { background: "#dc3545", color: "white" },
      })
      fetchBooks()
    } catch (error) {
      console.error("Error deleting book:", error)
      toast.error("Failed to delete book. Please try again.", {
        style: { background: "#dc3545", color: "white" },
      })
    }
  }

  const filteredBooks = books.filter((book) => book.bookname.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2">&gt;</span>
            <Link to="/store">Store</Link>
            <span className="separator mx-2">&gt;</span>
            <span>Book Master</span>
          </nav>
        </div>
        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2>Book Master</h2>
          <Button onClick={() => setShowModal(true)} className="btn btn-light text-dark">
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>{book.bookname}</td>
                    <td>
                      <Button
                        variant="link"
                        className="action-button edit-button me-2"
                        onClick={() => handleEdit(book)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="link"
                        className="action-button delete-button"
                        onClick={() => handleDelete(book.id)}
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

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setEditingBook(null)
          setBookName("")
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editingBook ? "Edit Book" : "Add Book"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Book Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter book name"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingBook ? "Update" : "Add"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

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

