import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainContentPage from "../../components/MainContent/MainContentPage";
import { Form, Button, Row, Col, Container, Table } from 'react-bootstrap';
import { db, auth } from "../../Firebase/config";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from "react-icons/fa";

// Add Category Modal Component
const AddCategoryModal = ({ isOpen, onClose, onConfirm }) => {
  const [newCategory, setNewCategory] = useState("");
  const [accountHead, setAccountHead] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(newCategory, accountHead);
    setNewCategory("");
    setAccountHead("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Category</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Account Head"
            value={accountHead}
            onChange={(e) => setAccountHead(e.target.value)}
            className="custom-input"
          />
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
  );
};

// Edit Category Modal Component
const EditCategoryModal = ({ isOpen, onClose, onConfirm, category }) => {
  const [newCategory, setNewCategory] = useState(category?.newCategory || "");
  const [accountHead, setAccountHead] = useState(category?.accountHead || "");

  useEffect(() => {
    if (category) {
      setNewCategory(category.newCategory);
      setAccountHead(category.accountHead);
    }
  }, [category]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onConfirm(category.id, newCategory, accountHead);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Category</h2>
        <div className="modal-body">
          <Form.Control
            type="text"
            placeholder="Enter New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Account Head"
            value={accountHead}
            onChange={(e) => setAccountHead(e.target.value)}
            className="custom-input"
          />
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
  );
};

// Delete Category Modal Component
const DeleteCategoryModal = ({ isOpen, onClose, onConfirm, category }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Category</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this category?</p>
          <p className="fw-bold">{category?.newCategory}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(category.id)}>
            Delete
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

// Confirm Edit Modal Component
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, currentCategory, newCategory, currentAccountHead, newAccountHead }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this category? This may affect related data.</p>
          <p><strong>Current Category:</strong> {currentCategory}</p>
          <p><strong>New Category:</strong> {newCategory}</p>
          <p><strong>Current Account Head:</strong> {currentAccountHead}</p>
          <p><strong>New Account Head:</strong> {newAccountHead}</p>
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
  );
};

const CategoryHead = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newAccountHead, setNewAccountHead] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const location = useLocation();

  // Fetch or create Store ID
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        const storeRef = collection(db, "Schools", auth.currentUser.uid, "Store");
        const q = query(storeRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          const newStoreRef = await addDoc(storeRef, { createdAt: new Date() });
          setStoreId(newStoreRef.id);
        } else {
          setStoreId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching/creating Store ID:", error);
        toast.error("Failed to initialize store. Please try again.");
      }
    };

    fetchStoreId();
  }, []);

  useEffect(() => {
    if (storeId) {
      fetchCategories();
    }
  }, [storeId]);

  const fetchCategories = async () => {
    if (!storeId) return;

    try {
      const categoriesRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "CategoryHead");
      const querySnapshot = await getDocs(categoriesRef);
      const categoriesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.");
    }
  };

  const handleAddCategory = async (newCategory, accountHead) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    const isDuplicate = categories.some((cat) => cat.newCategory.toLowerCase() === newCategory.toLowerCase());
    if (isDuplicate) {
      toast.error("A category with this name already exists. Please choose a different name.");
      return;
    }

    try {
      const categoriesRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "CategoryHead");
      await addDoc(categoriesRef, { newCategory, accountHead, createdAt: new Date() });
      setIsAddModalOpen(false);
      toast.success("Category added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category. Please try again.");
    }
  };

  const handleEditCategory = async (categoryId, newName, newHead) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    const isDuplicate = categories.some(
      (cat) => cat.id !== categoryId && cat.newCategory.toLowerCase() === newName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("A category with this name already exists. Please choose a different name.");
      return;
    }

    setIsEditModalOpen(false);
    setIsConfirmEditModalOpen(true);
    setNewCategoryName(newName);
    setNewAccountHead(newHead);
  };

  const confirmEditCategory = async () => {
    try {
      const categoryRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "CategoryHead", selectedCategory.id);
      await updateDoc(categoryRef, { newCategory: newCategoryName, accountHead: newAccountHead });
      setIsConfirmEditModalOpen(false);
      setSelectedCategory(null);
      setNewCategoryName("");
      setNewAccountHead("");
      toast.success("Category updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.");
      return;
    }

    try {
      const categoryRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "CategoryHead", categoryId);
      await deleteDoc(categoryRef);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      toast.success("Category deleted successfully!");
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const openEditModal = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.newCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Category Head</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="category-head-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Category Head</h2>
                  <h6 className="m-0 d-lg-none">Category Head</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Category
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Category Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Category Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>New Category</th>
                          <th>Account Head</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((category) => (
                          <tr key={category.id}>
                            <td>{category.newCategory}</td>
                            <td>{category.accountHead}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(category)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(category)}
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
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddCategory}
      />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleEditCategory}
        category={selectedCategory}
      />
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteCategory}
        category={selectedCategory}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false);
          setSelectedCategory(null);
          setNewCategoryName("");
          setNewAccountHead("");
        }}
        onConfirm={confirmEditCategory}
        currentCategory={selectedCategory?.newCategory}
        newCategory={newCategoryName}
        currentAccountHead={selectedCategory?.accountHead}
        newAccountHead={newAccountHead}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .category-head-container {
            background-color: #fff;
          }

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
          }

          .custom-search {
            max-width: 300px;
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
  );
};

export default CategoryHead;