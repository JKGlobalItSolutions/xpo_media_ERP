"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container, Card } from "react-bootstrap"
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa"
import { db, auth } from "../../../Firebase/config"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, limit } from "firebase/firestore"
import { useAuthContext } from "../../../Context/AuthContext"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx" // Added for import/export

const GenericModal = ({ isOpen, onClose, onConfirm, title, fields, data }) => {
  const [formData, setFormData] = useState(data || {})

  if (!isOpen) return null

  const handleSubmit = () => {
    onConfirm(formData)
    setFormData({})
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">
          {fields.map((field) => (
            <Form.Group className="mb-3" key={field}>
              <Form.Label>{`Enter ${field}`}</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Enter ${field.toLowerCase()}`}
                value={formData[field.toLowerCase()] || ""}
                onChange={(e) => setFormData({ ...formData, [field.toLowerCase()]: e.target.value })}
                className="custom-input"
              />
            </Form.Group>
          ))}
        </div>
        <div className="modal-buttons">
          <Button className="modal-button confirm" onClick={handleSubmit}>
            {data ? "Update" : "Add"}
          </Button>
          <Button className="modal-button cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const DeleteModal = ({ isOpen, onClose, onConfirm, title, itemName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Delete {title}</h2>
        <div className="modal-body text-center">
          <p>Are you sure you want to delete this entry?</p>
          <p className="fw-bold">{itemName}</p>
        </div>
        <div className="modal-buttons">
          <Button className="modal-button delete" onClick={onConfirm}>
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

const ConfirmEditModal = ({ isOpen, onClose, onConfirm, category, currentName, newName }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">	Confirm Edit</h2>
        <div className="modal-body">
          <p>Are you sure you want to edit this {category.toLowerCase()} entry? This may affect related data.</p>
          <p>
            <strong>Current Name:</strong> {currentName}
          </p>
          <p>
            <strong>New Name:</strong> {newName}
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

const StateAndDistrictManagement = () => {
  const [administrationId, setAdministrationId] = useState(null)
  const { user } = useAuthContext()

  const [state, setState] = useState({ items: [], searchTerm: "" })
  const [district, setDistrict] = useState({ items: [], searchTerm: "" })

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "",
    action: "",
    data: null,
  })

  const [confirmEditModalState, setConfirmEditModalState] = useState({
    isOpen: false,
    category: "",
    currentName: "",
    newName: "",
    id: "",
  })

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (auth.currentUser) {
        console.log("User is authenticated:", auth.currentUser.uid)
        await fetchAdministrationId()
      } else {
        console.log("User is not authenticated")
        toast.error("Please log in to view and manage entries.", {
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

    checkAuthAndFetchData()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchItems("State")
      fetchItems("District")
    }
  }, [administrationId])

  const fetchAdministrationId = async () => {
    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
      const q = query(adminRef, limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        const newAdminRef = await addDoc(adminRef, { createdAt: new Date() })
        setAdministrationId(newAdminRef.id)
      } else {
        setAdministrationId(querySnapshot.docs[0].id)
      }
    } catch (error) {
      console.error("Error fetching/creating Administration ID:", error)
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

  const fetchItems = async (category) => {
    if (!administrationId) return

    try {
      const itemsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        `${category}Setup`,
      )
      const querySnapshot = await getDocs(itemsRef)
      const itemsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      console.log(`Fetched ${category}:`, itemsData)

      switch (category) {
        case "State":
          setState((prev) => ({ ...prev, items: itemsData }))
          break
        case "District":
          setDistrict((prev) => ({ ...prev, items: itemsData }))
          break
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error)
      toast.error(`Failed to fetch ${category} entries. Please try again.`, {
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

  const handleAdd = async (category, newItem) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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

    if (!newItem[category.toLowerCase()].trim()) {
      toast.error(`${category} name cannot be empty.`, {
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

    const isDuplicate = checkDuplicate(category, newItem[category.toLowerCase()])
    if (isDuplicate) {
      toast.error(`A ${category.toLowerCase()} with this name already exists. Please choose a different name.`, {
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
      const itemsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        `${category}Setup`,
      )
      const docRef = await addDoc(itemsRef, newItem)
      console.log(`${category} added with ID:`, docRef.id)
      if (category === "State") {
        setState((prev) => ({ ...prev, items: [...prev.items, { id: docRef.id, ...newItem }] }))
      } else {
        setDistrict((prev) => ({ ...prev, items: [...prev.items, { id: docRef.id, ...newItem }] }))
      }
      setModalState({ isOpen: false, type: "", action: "", data: null })
      toast.success(`${category} entry added successfully!`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchItems(category)
    } catch (error) {
      console.error(`Error adding ${category}:`, error)
      toast.error(`Failed to add ${category} entry. Please try again.`, {
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

  const handleEdit = async (category, id, updatedItem) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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

    if (!updatedItem[category.toLowerCase()].trim()) {
      toast.error(`${category} name cannot be empty.`, {
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

    const isDuplicate = checkDuplicate(category, updatedItem[category.toLowerCase()], id)
    if (isDuplicate) {
      toast.error(`A ${category.toLowerCase()} with this name already exists. Please choose a different name.`, {
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

    setModalState({ isOpen: false, type: "", action: "", data: null })
    setConfirmEditModalState({
      isOpen: true,
      category,
      currentName: modalState.data[category.toLowerCase()],
      newName: updatedItem[category.toLowerCase()],
      id,
    })
  }

  const confirmEdit = async () => {
    const { category, id, newName } = confirmEditModalState
    try {
      const itemRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        `${category}Setup`,
        id,
      )
      await updateDoc(itemRef, { [category.toLowerCase()]: newName })
      console.log(`${category} updated:`, id)
      if (category === "State") {
        setState((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? { ...item, [category.toLowerCase()]: newName } : item
          ),
        }))
      } else {
        setDistrict((prev) => ({
          ...prev,
          items: prev.items.map((item) =>
            item.id === id ? { ...item, [category.toLowerCase()]: newName } : item
          ),
        }))
      }
      setConfirmEditModalState({ isOpen: false, category: "", currentName: "", newName: "", id: "" })
      toast.success(`${category} entry updated successfully!`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: { background: "#0B3D7B", color: "white" },
      })
      await fetchItems(category)
    } catch (error) {
      console.error(`Error updating ${category}:`, error)
      toast.error(`Failed to update ${category} entry. Please try again.`, {
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

  const handleDelete = async (category, id) => {
    if (!administrationId) {
      toast.error("Administration not initialized. Please try again.", {
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
      const itemRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "Administration",
        administrationId,
        `${category}Setup`,
        id,
      )
      await deleteDoc(itemRef)
      console.log(`${category} deleted:`, id)
      if (category === "State") {
        setState((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }))
      } else {
        setDistrict((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }))
      }
      setModalState({ isOpen: false, type: "", action: "", data: null })
      toast.success(`${category} entry deleted successfully!`, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
      await fetchItems(category)
    } catch (error) {
      console.error(`Error deleting ${category}:`, error)
      toast.error(`Failed to delete ${category} entry. Please try again.`, {
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

  const handleImport = async (category, event) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
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

    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      if (jsonData.length === 0) {
        toast.error("No data found in the imported file.")
        return
      }

      try {
        const itemsRef = collection(
          db,
          "Schools",
          auth.currentUser.uid,
          "Administration",
          administrationId,
          `${category}Setup`,
        )
        const newItems = []
        const currentItems = category === "State" ? state.items : district.items
        for (const row of jsonData) {
          const name = row[category] || row[category.toLowerCase()]
          if (name && name.trim()) {
            const isDuplicate = currentItems.some(
              (item) => item[category.toLowerCase()].toLowerCase() === name.toLowerCase()
            )
            if (!isDuplicate) {
              const docRef = await addDoc(itemsRef, { [category.toLowerCase()]: name })
              newItems.push({ id: docRef.id, [category.toLowerCase()]: name })
            }
          }
        }
        if (category === "State") {
          setState((prev) => ({ ...prev, items: [...prev.items, ...newItems] }))
        } else {
          setDistrict((prev) => ({ ...prev, items: [...prev.items, ...newItems] }))
        }
        toast.success(`${category} entries imported successfully!`, {
          style: { background: "#0B3D7B", color: "white" },
        })
        await fetchItems(category)
      } catch (error) {
        console.error(`Error importing ${category}:`, error)
        toast.error(`Failed to import ${category} entries. Please try again.`)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleExport = (category) => {
    if (!administrationId || !auth.currentUser) {
      toast.error("Administration not initialized or user not logged in. Please try again.", {
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

    const items = category === "State" ? state.items : district.items
    if (items.length === 0) {
      toast.error(`No ${category.toLowerCase()} data available to export.`)
      return
    }

    const exportData = items.map((item) => ({
      [category]: item[category.toLowerCase()],
    }))
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, category)
    XLSX.writeFile(workbook, `${category}_Export_${auth.currentUser.uid}.xlsx`)
    toast.success(`${category} entries exported successfully!`, {
      style: { background: "#0B3D7B", color: "white" },
    })
  }

  const openModal = (type, action, data = null) => {
    setModalState({ isOpen: true, type, action, data })
  }

  const closeModal = () => {
    setModalState({ isOpen: false, type: "", action: "", data: null })
  }

  const handleConfirm = (formData) => {
    const { type, action, data } = modalState
    if (action === "add") {
      handleAdd(type, formData)
    } else if (action === "edit") {
      handleEdit(type, data.id, formData)
    }
  }

  const handleConfirmDelete = () => {
    const { type, data } = modalState
    handleDelete(type, data.id)
  }

  const checkDuplicate = (category, name, id = null) => {
    let items
    switch (category) {
      case "State":
        items = state.items
        break
      case "District":
        items = district.items
        break
      default:
        return false
    }

    return items.some((item) => item.id !== id && item[category.toLowerCase()].toLowerCase() === name.toLowerCase())
  }

  const renderCard = (category, items, searchTerm) => {
    const filteredItems = items.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
      <Card className="mb-4">
        <Card.Header
          className="d-flex justify-content-between align-items-center"
          style={{ backgroundColor: "#0B3D7B", color: "white" }}
        >
          <h5 className="m-0">{category} Setup</h5>
          <div className="d-flex align-items-center gap-2">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => handleImport(category, e)}
              style={{ display: "none" }}
              id={`import-file-${category}`}
            />
            <Button
              onClick={() => document.getElementById(`import-file-${category}`).click()}
              variant="light"
              size="sm"
            >
              Import
            </Button>
            <Button onClick={() => handleExport(category)} variant="light" size="sm">
              Export
            </Button>
            <Button onClick={() => openModal(category, "add")} variant="light" size="sm">
              + Add {category}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Form className="mb-3">
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                placeholder={`Search ${category}`}
                value={searchTerm}
                onChange={(e) => {
                  switch (category) {
                    case "State":
                      setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                      break
                    case "District":
                      setDistrict((prev) => ({ ...prev, searchTerm: e.target.value }))
                      break
                  }
                }}
                className="me-2"
              />
              <Button variant="outline-secondary">
                <FaSearch />
              </Button>
            </Form.Group>
          </Form>
          {filteredItems.length === 0 ? (
            <p>No {category.toLowerCase()} entries found</p>
          ) : (
            filteredItems.map((item) => (
              <Card key={item.id} className="mb-2">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <span>{item[category.toLowerCase()] || item.name || "N/A"}</span>
                  <div>
                    <Button variant="link" className="p-0 me-2" onClick={() => openModal(category, "edit", item)}>
                      <FaEdit color="#0B3D7B" />
                    </Button>
                    <Button variant="link" className="p-0" onClick={() => openModal(category, "delete", item)}>
                      <FaTrash color="#dc3545" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>
    )
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0 px-lg-0">
        <nav className="custom-breadcrumb py-1 py-lg-3">
          <Link to="/home">Home</Link>
          <span className="separator">&gt;</span>
          <span>Administration</span>
          <span className="separator">&gt;</span>
          <span className="current col-12">State and District Management</span>
        </nav>
        <Row>
          <Col xs={12}>
            <div className="setup-container">
              <Row>
                <Col xs={12} md={6} className="mb-3">
                  {renderCard("State", state.items, state.searchTerm)}
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  {renderCard("District", district.items, district.searchTerm)}
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      {modalState.isOpen && modalState.action !== "delete" && (
        <GenericModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          title={`${modalState.action === "add" ? "Add" : "Edit"} ${modalState.type}`}
          fields={[modalState.type]}
          data={modalState.data}
        />
      )}
      {modalState.isOpen && modalState.action === "delete" && (
        <DeleteModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirmDelete}
          title={modalState.type}
          itemName={modalState.data[modalState.type.toLowerCase()] || modalState.data.name || "N/A"}
        />
      )}
      <ConfirmEditModal
        isOpen={confirmEditModalState.isOpen}
        onClose={() => setConfirmEditModalState({ isOpen: false, category: "", currentName: "", newName: "", id: "" })}
        onConfirm={confirmEdit}
        category={confirmEditModalState.category}
        currentName={confirmEditModalState.currentName}
        newName={confirmEditModalState.newName}
      />

      <ToastContainer />

      <style>
        {`
          .setup-container {
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

          .gap-2 {
            gap: 0.5rem;
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default StateAndDistrictManagement