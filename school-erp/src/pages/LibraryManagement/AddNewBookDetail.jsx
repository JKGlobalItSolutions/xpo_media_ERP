"use client"

import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Form, Button, Row, Col, Container } from "react-bootstrap"

const AddNewBookDetail = () => {
  const [formData, setFormData] = useState({
    bookId: "",
    bookCoverPhoto: null,
    bookTitle: "",
    authorName: "",
    category: "",
    edition: "",
    publisher: "",
    totalCopies: "",
    bookStatus: "",
  })

  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        bookCoverPhoto: file,
      }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoClick = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Data:", formData)
    // Add your form submission logic here
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="book-form">
          {/* Header and Breadcrumb */}
          <div className="mb-4">
            <h2 className="mb-2">Library Management</h2>
            <nav className="custom-breadcrumb py-1 py-lg-3">
              <Link to="/home">Home</Link>
              <span className="separator mx-2">&gt;</span>
              <div to="/library">Library Management</div>
              <span className="separator mx-2">&gt;</span>
              <span>Add Book</span>
            </nav>
          </div>

          {/* Main Form Card */}
          <div className="form-card mt-3">
            {/* Card Header */}
            <div className="header p-3 custom-btn-clr" >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <span>
                    <b>Add New Book Detail</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="content-wrapper p-4">
              <Form onSubmit={handleSubmit}>
                <Row>

                </Row>
                <Row>
                  {/* Left Column - Photo Upload */}
                  <Col md={12}>
                    <div className="text-center mb-4">
                      <h6>Book Cover Photo</h6>
                      <div
                        className="photo-upload-circle mx-auto"
                        onClick={handlePhotoClick}
                        style={{
                          width: "150px",
                          height: "150px",
                          border: "2px dashed #ccc",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          overflow: "hidden",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Preview"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <div>Upload Photo</div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                    </div>
                  </Col>

                  {/* Right Column - Form Fields */}
                  <Col md={12}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Book ID</Form.Label>
                          <Form.Control
                            type="text"
                            name="bookId"
                            value={formData.bookId}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Book Title</Form.Label>
                          <Form.Control
                            type="text"
                            name="bookTitle"
                            value={formData.bookTitle}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Author Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="authorName"
                            value={formData.authorName}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Category</Form.Label>
                          <Form.Select name="category" value={formData.category} onChange={handleInputChange}>
                            <option value="">Select Category</option>
                            <option value="fiction">Fiction</option>
                            <option value="non-fiction">Non-Fiction</option>
                            <option value="reference">Reference</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Edition</Form.Label>
                          <Form.Control
                            type="text"
                            name="edition"
                            value={formData.edition}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Publisher</Form.Label>
                          <Form.Select name="publisher" value={formData.publisher} onChange={handleInputChange}>
                            <option value="">Select Publisher</option>
                            <option value="publisher1">Publisher 1</option>
                            <option value="publisher2">Publisher 2</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Total Copies</Form.Label>
                          <Form.Control
                            type="number"
                            name="totalCopies"
                            value={formData.totalCopies}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Book Status</Form.Label>
                          <Form.Select name="bookStatus" value={formData.bookStatus} onChange={handleInputChange}>
                            <option value="">Select Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* Form Actions */}
                <Row className="mt-4">
                  <Col className="d-flex justify-content-center gap-3">
                    <Button type="submit" className="custom-btn-clr">
                      Insert
                    </Button>
                    <Button type="submit" className="custom-btn-clr">
                      Save
                    </Button>
                    <Button variant="secondary">Cancel</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      </Container>
    </MainContentPage>
  )
}

export default AddNewBookDetail

