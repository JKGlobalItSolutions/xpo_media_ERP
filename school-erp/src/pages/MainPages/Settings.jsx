"use client"

import { useState, useEffect } from "react"
import { Container, Card, Form, Button, Image, Spinner } from "react-bootstrap"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db, auth, storage } from "../../Firebase/config"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Link } from "react-router-dom"
import { Person, Pencil, Camera } from "react-bootstrap-icons"
import "bootstrap-icons/font/bootstrap-icons.css"

const Settings = () => {
  const [schoolData, setSchoolData] = useState({
    SchoolName: "",
    SchoolAddres: "",
    email: "",
    profileImage: "",
    phoneNumber: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageFile, setImageFile] = useState(null)
  const [schoolDocId, setSchoolDocId] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        if (!auth.currentUser) {
          toast.error("No user logged in")
          setLoading(false)
          return
        }

        const schoolsCollection = collection(db, "Schools")
        const q = query(schoolsCollection, where("email", "==", auth.currentUser.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const schoolDoc = querySnapshot.docs[0]
          const data = schoolDoc.data()
          setSchoolDocId(schoolDoc.id)
          setSchoolData({
            SchoolName: data.SchoolName || "",
            SchoolAddres: data.SchoolAddres || "",
            email: data.email || "",
            profileImage: data.profileImage || "",
            phoneNumber: data.phoneNumber || "",
          })
        } else {
          toast.error("No school profile found for this email")
        }
      } catch (error) {
        console.error("Error fetching school data:", error)
        toast.error("Failed to fetch school profile")
      } finally {
        setLoading(false)
      }
    }

    fetchSchoolData()
  }, [])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSchoolData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleSave = async () => {
    try {
      setImageLoading(true)
      if (!schoolDocId) {
        toast.error("No school document found to update")
        return
      }

      const schoolDoc = doc(db, "Schools", schoolDocId)

      let profileImageUrl = schoolData.profileImage
      if (imageFile) {
        const storageRef = ref(storage, `profile/${auth.currentUser.email}/profileImage`)
        await uploadBytes(storageRef, imageFile)
        profileImageUrl = await getDownloadURL(storageRef)
      }

      await updateDoc(schoolDoc, {
        SchoolName: schoolData.SchoolName,
        SchoolAddres: schoolData.SchoolAddres,
        email: schoolData.email,
        profileImage: profileImageUrl,
        phoneNumber: schoolData.phoneNumber,
      })

      setSchoolData((prevData) => ({
        ...prevData,
        profileImage: profileImageUrl,
      }))
      setImageFile(null)
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setImageLoading(false)
    }
  }

  if (loading) {
    return (
      <MainContentPage>
        <Container fluid className="px-0">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading...</p>
          </div>
        </Container>
      </MainContentPage>
    )
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2 text-muted">/</span>
            <span className="text-dark">Profile</span>
          </nav>
        </div>

        <div style={{ backgroundColor: "#0B3D7B" }} className="text-white p-3 rounded-top">
          <h2 className="mb-0">{isEditing ? "Edit Profile" : "Profile"}</h2>
        </div>

        <Card className="shadow-sm border-0 rounded-bottom">
          <Card.Body className="p-0">
            <div className="profile-layout">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {imageFile || schoolData.profileImage ? (
                    <div className="profile-image-wrapper">
                      <Image
                        src={imageFile ? URL.createObjectURL(imageFile) : schoolData.profileImage}
                        className="profile-image"
                        onError={(e) => {
                          e.target.src = ""
                          e.target.style.display = "none"
                        }}
                      />
                      {isEditing && (
                        <div className="image-overlay">
                          <div className="camera-icon">
                            <Camera size={24} />
                          </div>
                          <p className="change-photo-text">Change Photo</p>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                            id="profileImage"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="profile-placeholder">
                      <Person size={80} className="placeholder-icon" />
                      {isEditing && (
                        <>
                          <div className="upload-text mt-3">Upload Photo</div>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                            id="profileImage"
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="profile-details-section">
                <div className="profile-details-content">
                  {isEditing ? (
                    <Form className="profile-form">
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">Name:</Form.Label>
                        <Form.Control
                          type="text"
                          name="SchoolName"
                          value={schoolData.SchoolName}
                          onChange={handleChange}
                          placeholder="Enter name"
                          className="form-input"
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">Email:</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={schoolData.email}
                          onChange={handleChange}
                          placeholder="Enter email"
                          className="form-input"
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">Phone Number:</Form.Label>
                        <Form.Control
                          type="text"
                          name="phoneNumber"
                          value={schoolData.phoneNumber || ""}
                          onChange={handleChange}
                          placeholder="Enter phone number"
                          className="form-input"
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label className="form-label">Address:</Form.Label>
                        <Form.Control
                          type="text"
                          name="SchoolAddres"
                          value={schoolData.SchoolAddres}
                          onChange={handleChange}
                          placeholder="Enter address"
                          className="form-input"
                        />
                      </Form.Group>

                      <div className="button-container">
                        <Button variant="outline-secondary" onClick={handleEditToggle} className="cancel-button me-2">
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} className="save-button" disabled={imageLoading}>
                          {imageLoading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </Form>
                  ) : (
                    <div className="profile-info">
                      <div className="info-row">
                        <div className="info-label">Name:</div>
                        <div className="info-value">{schoolData.SchoolName || "User name"}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Email:</div>
                        <div className="info-value">{schoolData.email || "ml@xpaytech.co"}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Phone Number:</div>
                        <div className="info-value">{schoolData.phoneNumber || "+20-01274318900"}</div>
                      </div>
                      <div className="info-row">
                        <div className="info-label">Address:</div>
                        <div className="info-value">
                          {schoolData.SchoolAddres || "285 N Broad St, Elizabeth, NJ 07208, USA"}
                        </div>
                      </div>

                      <div className="edit-button-container">
                        <Button variant="outline-primary" onClick={handleEditToggle} className="edit-profile-button">
                          <Pencil className="me-2" /> Edit Profile
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style>
        {`
          .custom-breadcrumb {
            padding: 0.5rem 1rem;
            font-size: 0.95rem;
          }

          .custom-breadcrumb a {
            color: #0B3D7B;
            text-decoration: none;
            font-weight: 500;
          }

          .custom-breadcrumb a:hover {
            text-decoration: underline;
          }

          .custom-breadcrumb .separator {
            color: #6c757d;
          }

          .profile-layout {
            display: flex;
            min-height: 500px;
          }
          
          .profile-image-section {
            width: 40%;
            background-color: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px;
          }
          
          .profile-image-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .profile-image-wrapper {
            position: relative;
            width: 100%;
            max-width: 300px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .profile-image {
            width: 100%;
            height: auto;
            object-fit: cover;
            display: block;
          }
          
          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .profile-image-wrapper:hover .image-overlay {
            opacity: 1;
          }
          
          .camera-icon {
            background-color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .change-photo-text {
            color: white;
            font-weight: 500;
            margin: 0;
          }
          
          .file-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }
          
          .profile-placeholder {
            width: 100%;
            max-width: 300px;
            height: 250px;
            background-color: #e9ecef;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
          }
          
          .placeholder-icon {
            color: #adb5bd;
          }
          
          .upload-text {
            color: #495057;
            font-weight: 500;
          }
          
          .profile-details-section {
            width: 60%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
          }
          
          .profile-details-content {
            width: 100%;
            max-width: 600px;
          }
          
          .profile-form {
            width: 100%;
          }
          
          .form-label {
            font-weight: 500;
            color: #495057;
          }
          
          .form-input {
            border-radius: 4px;
            border: 1px solid #ced4da;
            padding: 10px 12px;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          }
          
          .form-input:focus {
            border-color: #0B3D7B;
            box-shadow: 0 0 0 0.2rem rgba(11, 61, 123, 0.25);
          }
          
          .profile-info {
            width: 100%;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
          }
          
          .info-label {
            width: 150px;
            font-weight: 500;
            color: #6c757d;
          }
          
          .info-value {
            flex: 1;
            color: #212529;
          }
          
          .button-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
          }
          
          .save-button,
          .cancel-button {
            min-width: 120px;
            padding: 8px 16px;
          }
          
          .edit-button-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
          }
          
          .edit-profile-button {
            min-width: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          @media (max-width: 991px) {
            .profile-layout {
              flex-direction: column;
            }
            
            .profile-image-section,
            .profile-details-section {
              width: 100%;
            }
            
            .profile-image-section {
              padding: 30px 20px;
            }
            
            .profile-details-section {
              padding: 30px 20px;
            }
          }
          
          @media (max-width: 576px) {
            .info-row {
              flex-direction: column;
            }
            
            .info-label {
              width: 100%;
              margin-bottom: 5px;
            }
            
            .button-container {
              flex-direction: column-reverse;
              gap: 10px;
            }
            
            .save-button,
            .cancel-button,
            .edit-profile-button {
              width: 100%;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  )
}

export default Settings

