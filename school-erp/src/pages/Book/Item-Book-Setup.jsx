"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Table } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"

// Add Item Modal Component
const AddItemModal = ({ isOpen, onClose, onConfirm, nextItemCode }) => {
  const [itemName, setItemName] = useState("")
  const [purchaseRate, setPurchaseRate] = useState("")
  const [group, setGroup] = useState("")
  const [unit, setUnit] = useState("")
  const [gstType, setGstType] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(nextItemCode, itemName, purchaseRate, group, unit, gstType)
    setItemName("")
    setPurchaseRate("")
    setGroup("")
    setUnit("")
    setGstType("")
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Item / Book</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Item Code</Form.Label>
            <Form.Control type="text" value={nextItemCode} readOnly className="custom-input bg-light" />
            <Form.Text className="text-muted">Item code is auto-generated</Form.Text>
          </Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="number"
            placeholder="Enter Purchase Rate"
            value={purchaseRate}
            onChange={(e) => setPurchaseRate(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter GST Type"
            value={gstType}
            onChange={(e) => setGstType(e.target.value)}
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
  )
}

// Edit Item Modal Component
const EditItemModal = ({ isOpen, onClose, onConfirm, item }) => {
  const [itemName, setItemName] = useState(item?.itemName || "")
  const [purchaseRate, setPurchaseRate] = useState(item?.purchaseRate || "")
  const [group, setGroup] = useState(item?.group || "")
  const [unit, setUnit] = useState(item?.unit || "")
  const [gstType, setGstType] = useState(item?.gstType || "")

  useEffect(() => {
    if (item) {
      setItemName(item.itemName)
      setPurchaseRate(item.purchaseRate)
      setGroup(item.group)
      setUnit(item.unit)
      setGstType(item.gstType)
    }
  }, [item])

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(item.id, item.itemCode, itemName, purchaseRate, group, unit, gstType)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Item / Book</h2>
        <div className="modal-body">
          <Form.Group className="mb-3">
            <Form.Label>Item Code</Form.Label>
            <Form.Control type="text" value={item?.itemCode || ""} readOnly className="custom-input bg-light" />
            <Form.Text className="text-muted">Item code cannot be changed</Form.Text>
          </Form.Group>
          <Form.Control
            type="text"
            placeholder="Enter Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="number"
            placeholder="Enter Purchase Rate"
            value={purchaseRate}
            onChange={(e) => setPurchaseRate(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="custom-input mb-3"
          />
          <Form.Control
            type="text"
            placeholder="Enter GST Type"
            value={gstType}
            onChange={(e) => setGstType(e.target.value)}
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
  )
}

// View Item Modal Component
const ViewItemModal = ({ isOpen, onClose, item }) => {
  if (!isOpen || !item) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Item / Book Details</h2>
        <div className="modal-body">
          <div className="item-detail">
            <strong>Item Code:</strong> {item.itemCode}
          </div>
          <div className="item-detail">
            <strong>Item Name:</strong> {item.itemName}
          </div>
          <div className="item-detail">
            <strong>Purchase Rate:</strong> {item.purchaseRate}
          </div>
          <div className="item-detail">
            <strong>Group:</strong> {item.group}
          </div>
          <div className="item-detail">
            <strong>Unit:</strong> {item.unit}
          </div>
          <div className="item-detail">
            <strong>GST Type:</strong> {item.gstType}
          </div>
          <div className="item-detail">
            <strong>Created At:</strong> {item.createdAt?.toDate().toLocaleString() || "N/A"}
          </div>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button cancel" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

// Delete Item Modal Component
const DeleteItemModal = ({ isOpen, onClose, onConfirm, item }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete Item / Book</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this item?</p>
          <p className="fw-bold">{item?.itemName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={() => onConfirm(item.id)}>
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
const ConfirmEditModal = ({ isOpen, onClose, onConfirm, item, newItem }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this item? This may affect related data.</p>
          <p>
            <strong>Item Code:</strong> {item?.itemCode}
          </p>
          <p>
            <strong>Current Item Name:</strong> {item?.itemName}
          </p>
          <p>
            <strong>New Item Name:</strong> {newItem?.itemName}
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

const ItemBookMaster = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [newItemData, setNewItemData] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [items, setItems] = useState([])
  const [storeId, setStoreId] = useState(null)
  const [nextItemCode, setNextItemCode] = useState("ITEM-1")
  const location = useLocation()

  // Fetch or create Store ID
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
        toast.error("Failed to initialize store. Please try again.")
      }
    }

    fetchStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchItems()
    }
  }, [storeId])

  const fetchItems = async () => {
    if (!storeId) return

    try {
      const itemsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "Item-Book-Master")
      const querySnapshot = await getDocs(itemsRef)
      const itemsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setItems(itemsData)

      // Generate next item code
      generateNextItemCode(itemsData)
    } catch (error) {
      console.error("Error fetching items:", error)
      toast.error("Failed to fetch items. Please try again.")
    }
  }

  // Generate the next item code based on existing items
  const generateNextItemCode = (itemsData) => {
    if (!itemsData || itemsData.length === 0) {
      setNextItemCode("ITEM-1")
      return
    }

    // Extract numbers from existing item codes
    const itemNumbers = itemsData.map((item) => {
      const match = item.itemCode.match(/ITEM-(\d+)/)
      return match ? Number.parseInt(match[1], 10) : 0
    })

    // Find the highest number and increment by 1
    const nextNumber = Math.max(...itemNumbers) + 1
    setNextItemCode(`ITEM-${nextNumber}`)
  }

  const handleAddItem = async (itemCode, itemName, purchaseRate, group, unit, gstType) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.")
      return
    }

    if (!itemName) {
      toast.error("Item Name is a required field.")
      return
    }

    try {
      const itemsRef = collection(db, "Schools", auth.currentUser.uid, "Store", storeId, "Item-Book-Master")
      await addDoc(itemsRef, {
        itemCode,
        itemName,
        purchaseRate,
        group,
        unit,
        gstType,
        createdAt: new Date(),
      })
      setIsAddModalOpen(false)
      toast.success("Item added successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchItems()
    } catch (error) {
      console.error("Error adding item:", error)
      toast.error("Failed to add item. Please try again.")
    }
  }

  const handleEditItem = async (itemId, itemCode, itemName, purchaseRate, group, unit, gstType) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.")
      return
    }

    if (!itemName) {
      toast.error("Item Name is a required field.")
      return
    }

    setIsEditModalOpen(false)
    setIsConfirmEditModalOpen(true)
    setNewItemData({ itemId, itemCode, itemName, purchaseRate, group, unit, gstType })
  }

  const confirmEditItem = async () => {
    try {
      const itemRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "Item-Book-Master", newItemData.itemId)
      await updateDoc(itemRef, {
        itemName: newItemData.itemName,
        purchaseRate: newItemData.purchaseRate,
        group: newItemData.group,
        unit: newItemData.unit,
        gstType: newItemData.gstType,
        updatedAt: new Date(),
      })
      setIsConfirmEditModalOpen(false)
      setSelectedItem(null)
      setNewItemData(null)
      toast.success("Item updated successfully!", {
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchItems()
    } catch (error) {
      console.error("Error updating item:", error)
      toast.error("Failed to update item. Please try again.")
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!storeId) {
      toast.error("Store not initialized. Please try again.")
      return
    }

    try {
      const itemRef = doc(db, "Schools", auth.currentUser.uid, "Store", storeId, "Item-Book-Master", itemId)
      await deleteDoc(itemRef)
      setIsDeleteModalOpen(false)
      setSelectedItem(null)
      toast.success("Item deleted successfully!")
      await fetchItems()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast.error("Failed to delete item. Please try again.")
    }
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  const openViewModal = (item) => {
    setSelectedItem(item)
    setIsViewModalOpen(true)
  }

  const openDeleteModal = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleReset = () => {
    setSearchTerm("")
  }

  const filteredItems = items.filter(
    (item) =>
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        {/* Breadcrumb Navigation */}
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">Item / Book Master</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="item-book-container">
              <div className="form-card mt-3">
                {/* Header */}
                <div className="header p-3 d-flex justify-content-between align-items-center">
                  <h2 className="m-0 d-none d-lg-block">Item / Book Setup</h2>
                  <h6 className="m-0 d-lg-none">Item / Book Setup</h6>
                  <Button onClick={() => setIsAddModalOpen(true)} className="btn btn-light text-dark">
                    + Add Item
                  </Button>
                </div>

                {/* Content */}
                <div className="content-wrapper p-4">
                  {/* Search Bar */}
                  <Form.Control
                    type="text"
                    placeholder="Search by Item Code or Name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="custom-search mb-3"
                  />

                  {/* Item Table */}
                  <div className="table-responsive">
                    <Table bordered hover>
                      <thead style={{ backgroundColor: "#0B3D7B", color: "white" }}>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Purchase Rate</th>
                          <th>Group</th>
                          <th>Unit</th>
                          <th>GST Type</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map((item) => (
                          <tr key={item.id}>
                            <td>{item.itemCode}</td>
                            <td>{item.itemName}</td>
                            <td>{item.purchaseRate}</td>
                            <td>{item.group}</td>
                            <td>{item.unit}</td>
                            <td>{item.gstType}</td>
                            <td>
                              <Button
                                variant="link"
                                className="action-button view-button me-2"
                                onClick={() => openViewModal(item)}
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button edit-button me-2"
                                onClick={() => openEditModal(item)}
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="link"
                                className="action-button delete-button"
                                onClick={() => openDeleteModal(item)}
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
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleAddItem}
        nextItemCode={nextItemCode}
      />
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={handleEditItem}
        item={selectedItem}
      />
      <ViewItemModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedItem(null)
        }}
        item={selectedItem}
      />
      <DeleteItemModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={handleDeleteItem}
        item={selectedItem}
      />
      <ConfirmEditModal
        isOpen={isConfirmEditModalOpen}
        onClose={() => {
          setIsConfirmEditModalOpen(false)
          setSelectedItem(null)
          setNewItemData(null)
        }}
        onConfirm={confirmEditItem}
        item={selectedItem}
        newItem={newItemData}
      />

      {/* Toastify Container */}
      <ToastContainer />

      <style>
        {`
          .item-book-container {
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

          .view-button {
            background-color: #28a745;
          }

          .view-button:hover {
            background-color: #218838;
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

          .button-group {
            display: flex;
            gap: 10px;
            justify-content: center;
          }

          .custom-btn-clr {
            background-color: #0B3D7B;
            border-color: #0B3D7B;
          }

          .reset-btn {
            background-color: #dc3545;
            border-color: #dc3545;
          }

          .cancel-btn {
            background-color: #6c757d;
            border-color: #6c757d;
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
            max-width: 500px;
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

          .item-detail {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
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

export default ItemBookMaster

