import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Image } from "react-bootstrap";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth, storage } from "../../Firebase/config";
import MainContentPage from "../../components/MainContent/MainContentPage";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";
import { Person } from "react-bootstrap-icons"; // Use Person instead of User

const Profile = () => {
  const [schoolData, setSchoolData] = useState({
    SchoolName: "",
    SchoolAddres: "",
    email: "",
    profileImage: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [schoolDocId, setSchoolDocId] = useState(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        if (!auth.currentUser) {
          toast.error("No user logged in");
          setLoading(false);
          return;
        }

        const schoolsCollection = collection(db, "Schools");
        const q = query(schoolsCollection, where("email", "==", auth.currentUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const schoolDoc = querySnapshot.docs[0];
          const data = schoolDoc.data();
          setSchoolDocId(schoolDoc.id);
          setSchoolData({
            SchoolName: data.SchoolName || "",
            SchoolAddres: data.SchoolAddres || "",
            email: data.email || "",
            profileImage: data.profileImage || "",
          });
        } else {
          toast.error("No school profile found for this email");
        }
      } catch (error) {
        console.error("Error fetching school data:", error);
        toast.error("Failed to fetch school profile");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchoolData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!schoolDocId) {
        toast.error("No school document found to update");
        return;
      }

      const schoolDoc = doc(db, "Schools", schoolDocId);

      let profileImageUrl = schoolData.profileImage;
      if (imageFile) {
        const storageRef = ref(storage, `profile/${auth.currentUser.email}/profileImage`);
        await uploadBytes(storageRef, imageFile);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(schoolDoc, {
        SchoolName: schoolData.SchoolName,
        SchoolAddres: schoolData.SchoolAddres,
        email: schoolData.email,
        profileImage: profileImageUrl,
      });

      setSchoolData((prevData) => ({
        ...prevData,
        profileImage: profileImageUrl,
      }));
      setImageFile(null);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <MainContentPage>
        <Container fluid className="px-0">
          <div className="text-center py-4">Loading...</div>
        </Container>
      </MainContentPage>
    );
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2 text-muted"></span>
            <span className="text-dark">Profile</span>
          </nav>
        </div>

        <div
          style={{ backgroundColor: "#0B3D7B" }}
          className="text-white p-3 rounded-top d-flex justify-content-between align-items-center"
        >
          <h2 className="mb-0">{isEditing ? "Edit Profile" : "Profile"}</h2>
          {!isEditing && (
            <Button variant="outline-light" onClick={handleEditToggle}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="bg-white p-4 rounded-bottom">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow-sm p-4 border-0" style={{ backgroundColor: "#F5F7FA" }}>
                {isEditing ? (
                  <>
                    <div className="text-center position-relative mb-4">
                      <Image
                        src={imageFile ? URL.createObjectURL(imageFile) : schoolData.profileImage || ""}
                        roundedCircle
                        width={100}
                        height={100}
                        className="mb-3"
                        onError={(e) => {
                          e.target.src = "";
                          e.target.style.display = "none";
                        }}
                      />
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="position-absolute top-0 start-50 translate-middle-x"
                        style={{ opacity: 0, width: "100px", height: "100px", cursor: "pointer" }}
                        id="profileImage"
                      />
                      {(!imageFile && !schoolData.profileImage) && (
                        <label
                          htmlFor="profileImage"
                          className="position-absolute top-50 start-50 translate-middle text-muted"
                          style={{ cursor: "pointer" }}
                        >
                          <Person size={100} /> {/* Replace User with Person */}
                        </label>
                      )}
                    </div>
                    <Form>
                      <Form.Group controlId="formSchoolName" className="mb-3">
                        <Form.Label>School Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="SchoolName"
                          value={schoolData.SchoolName}
                          onChange={handleChange}
                          placeholder="Enter school name"
                          className="border-0 p-2"
                          style={{ backgroundColor: "#FFFFFF" }}
                        />
                      </Form.Group>
                      <Form.Group controlId="formEmail" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={schoolData.email}
                          onChange={handleChange}
                          placeholder="Enter email"
                          className="border-0 p-2"
                          style={{ backgroundColor: "#FFFFFF" }}
                        />
                      </Form.Group>
                      <Form.Group controlId="formSchoolAddress" className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          name="SchoolAddres"
                          value={schoolData.SchoolAddres}
                          onChange={handleChange}
                          placeholder="Enter school address"
                          className="border-0 p-2"
                          style={{ backgroundColor: "#FFFFFF" }}
                        />
                      </Form.Group>
                      <div className="d-flex gap-2 justify-content-end">
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          style={{ backgroundColor: "#0057FF", border: "none", padding: "8px 16px", borderRadius: "8px" }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline-secondary"
                          onClick={handleEditToggle}
                          style={{ borderColor: "#0057FF", color: "#0057FF", padding: "8px 16px", borderRadius: "8px" }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </>
                ) : (
                  <>
                    <div className="text-center position-relative mb-4">
                      <Image
                        src={schoolData.profileImage || ""}
                        roundedCircle
                        width={100}
                        height={100}
                        className="mb-3"
                        onError={(e) => {
                          e.target.src = "";
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                      />
                      {!schoolData.profileImage && (
                        <Person size={100} className="text-muted position-absolute top-50 start-50 translate-middle" /> 
                      )}
                    </div>
                    <div className="text-center">
                      <p><strong>School Name:</strong> {schoolData.SchoolName || "N/A"}</p>
                      <p><strong>Email:</strong> {schoolData.email || "N/A"}</p>
                      <p><strong>Address:</strong> {schoolData.SchoolAddres || "N/A"}</p>
                    </div>
                    <div className="text-center mt-4">
                      <Button
                        variant="primary"
                        onClick={handleEditToggle}
                        style={{ backgroundColor: "#0057FF", border: "none", padding: "8px 16px", borderRadius: "8px" }}
                      >
                        Edit Profile
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Container>

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

          .card {
            border: none;
            border-radius: 15px;
          }

          .position-relative .position-absolute {
            z-index: 1;
          }

          .position-absolute.user-icon {
            display: none;
          }

          @media (max-width: 768px) {
            .card {
              margin: 0 1rem;
            }
            .position-relative {
              position: relative;
            }
            .position-absolute {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .d-flex {
              flex-direction: column;
              gap: 1rem;
            }
            .justify-content-end {
              justify-content: center;
            }
          }

          @media (max-width: 576px) {
            .card {
              margin: 0 0.5rem;
            }
            .card-body {
              padding: 1rem;
            }
            .position-relative {
              position: relative;
            }
            .position-absolute {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .d-flex {
              flex-direction: column;
              gap: 1rem;
            }
            .justify-content-end {
              justify-content: center;
            }
          }
        `}
      </style>
      <ToastContainer />
    </MainContentPage>
  );
};

export default Profile;