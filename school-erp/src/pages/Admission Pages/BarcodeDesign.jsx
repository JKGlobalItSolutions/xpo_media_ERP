import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Spinner, Table } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../Firebase/config';
import MainContentPage from '../../components/MainContent/MainContentPage';
import { QRCodeSVG } from 'qrcode.react';
import { Edit, Eye, Trash2, Copy } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import defaultStudentPhoto from '../../images/StudentProfileIcon/studentProfile.jpeg';

const QRCodeListing = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRConfirmModal, setShowQRConfirmModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [administrationId, setAdministrationId] = useState(null);
  const [viewType, setViewType] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdministrationId();
  }, []);

  useEffect(() => {
    if (administrationId) {
      fetchStudents();
    }
  }, [administrationId]);

  const fetchAdministrationId = async () => {
    try {
      const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration");
      const adminSnapshot = await getDocs(adminRef);
      if (!adminSnapshot.empty) {
        setAdministrationId(adminSnapshot.docs[0].id);
      }
    } catch (error) {
      console.error("Error fetching Administration ID:", error);
      toast.error("Failed to fetch administration data");
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup"
      );
      const studentsSnapshot = await getDocs(studentsRef);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch student data");
      setLoading(false);
    }
  };

  const generateQRCodeData = (student) => {
    const essentialData = {
      admissionNumber: student.admissionNumber,
      studentName: student.studentName,
      standard: student.standard,
      section: student.section,
    };
    return JSON.stringify(essentialData);
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      const studentRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
        currentStudent.id
      );
      const updatedData = {
        ...currentStudent,
        qrCode: generateQRCodeData(currentStudent)
      };
      await updateDoc(studentRef, updatedData);
      setShowModal(false);
      fetchStudents();
      toast.success("Student information updated successfully");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student information");
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student's QR code?")) {
      try {
        const studentRef = doc(
          db,
          "Schools",
          auth.currentUser.uid,
          "AdmissionMaster",
          administrationId,
          "AdmissionSetup",
          studentId
        );
        await updateDoc(studentRef, { qrCode: null });
        fetchStudents();
        toast.success("QR code deleted successfully");
      } catch (error) {
        console.error("Error deleting QR code:", error);
        toast.error("Failed to delete QR code");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleNewQRCode = (student) => {
    setCurrentStudent(student);
    setShowQRConfirmModal(true);
  };

  const confirmGenerateQRCode = async () => {
    try {
      const qrCodeData = generateQRCodeData(currentStudent);
      const studentRef = doc(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
        currentStudent.id
      );
      await updateDoc(studentRef, { qrCode: qrCodeData });
      fetchStudents();
      setShowQRConfirmModal(false);
      toast.success("QR code generated successfully");
    } catch (error) {
      console.error("Error generating new QR code:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const handleCopyAdmissionNumber = (admissionNumber) => {
    navigator.clipboard.writeText(admissionNumber)
      .then(() => toast.success("Admission Number copied to clipboard"))
      .catch(() => toast.error("Failed to copy Admission Number"));
  };

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderGridView = () => (
    <Row className="g-4">
      {filteredStudents.map((student) => (
        <Col key={student.id} xs={12} sm={6} md={4} lg={3}>
          <Card className="student-card">
            <div className="edit-icon" onClick={() => handleEdit(student)}>
              <Edit size={18} />
            </div>
            <div className="avatar-container">
              <img
                src={student.studentPhoto || defaultStudentPhoto}
                alt={student.studentName}
                className="student-avatar"
              />
            </div>
            <Card.Body>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">Admission</span>
                  <span className="info-value">{student.admissionNumber}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{student.studentName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Class</span>
                  <span className="info-value">{student.standard}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Section</span>
                  <span className="info-value">{student.section}</span>
                </div>
              </div>
              <div className="qr-code-container">
                {student.qrCode ? (
                  <QRCodeSVG value={student.qrCode} size={100} level="M" />
                ) : (
                  <Button onClick={() => handleNewQRCode(student)} className="generate-btn">Generate QR Code</Button>
                )}
              </div>
              <div className="button-group">
                <Button 
                  variant="danger" 
                  className="delete-btn"
                  onClick={() => handleDelete(student.id)}
                >
                  <Trash2 size={16} className="me-1" />
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderTableView = () => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Photo</th>
          <th>Admission Number</th>
          <th>Name</th>
          <th>Class</th>
          <th>Section</th>
          <th>QR Code</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredStudents.map((student) => (
          <tr key={student.id}>
            <td>
              <img
                src={student.studentPhoto || defaultStudentPhoto}
                alt={student.studentName}
                className="student-avatar-small"
              />
            </td>
            <td>
              {student.admissionNumber}
              <Button
                variant="link"
                size="sm"
                onClick={() => handleCopyAdmissionNumber(student.admissionNumber)}
                className="ms-2"
              >
                <Copy size={16} />
              </Button>
            </td>
            <td>{student.studentName}</td>
            <td>{student.standard}</td>
            <td>{student.section}</td>
            <td>
              {student.qrCode ? (
                <QRCodeSVG value={student.qrCode} size={50} level="M" />
              ) : (
                <Button size="sm" onClick={() => handleNewQRCode(student)} className="generate-btn">Generate</Button>
              )}
            </td>
            <td>
              <Button variant="secondary" size="sm" className="me-1" onClick={() => handleEdit(student)}>
                <Edit size={16} />
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(student.id)}>
                <Trash2 size={16} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <MainContentPage>
      <Container fluid>
        <h1 className="mb-4">QR Code Listing</h1>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <Form.Control
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-50"
          />
          <div>
            <Button
              variant={viewType === 'grid' ? 'primary' : 'outline-primary'}
              onClick={() => setViewType('grid')}
              className={`me-2 ${viewType === 'grid' ? 'active-layout-btn' : ''}`}
            >
              Grid View
            </Button>
            <Button
              variant={viewType === 'table' ? 'primary' : 'outline-primary'}
              onClick={() => setViewType('table')}
              className={viewType === 'table' ? 'active-layout-btn' : ''}
            >
              Table View
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : viewType === 'grid' ? renderGridView() : renderTableView()}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Admission Number</Form.Label>
                <Form.Control
                  type="text"
                  name="admissionNumber"
                  value={currentStudent?.admissionNumber || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Student Name</Form.Label>
                <Form.Control
                  type="text"
                  name="studentName"
                  value={currentStudent?.studentName || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Standard</Form.Label>
                <Form.Control
                  type="text"
                  name="standard"
                  value={currentStudent?.standard || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Section</Form.Label>
                <Form.Control
                  type="text"
                  name="section"
                  value={currentStudent?.section || ''}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdate} className="save-btn">
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showQRConfirmModal} onHide={() => setShowQRConfirmModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Generate QR Code</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to generate a QR code for {currentStudent?.studentName}?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowQRConfirmModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmGenerateQRCode} className="generate-btn">
              Generate QR Code
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
      <ToastContainer />
      <style jsx>{`
        .student-card {
          position: relative;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .student-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .edit-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          background-color: #fff;
          border-radius: 50%;
          padding: 8px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }

        .avatar-container {
          display: flex;
          justify-content: center;
          padding: 1.5rem 0;
          background-color: #f8fafc;
        }

        .student-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          object-fit: cover;
        }

        .student-avatar-small {
          width: 40px0,0,0.1);
          object-fit: cover;
        }

        .student-avatar-small {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .info-grid {
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          color: #64748b;
          font-size: 0.875rem;
        }

        .info-value {
          color: #1e293b;
          font-weight: 500;
        }

        .qr-code-container {
          display: flex;
          justify-content: center;
          margin: 1rem 0;
          padding: 1rem;
          background-color: #f8fafc;
          border-radius: 4px;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .delete-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background-color: #dc3545;
          border-color: #dc3545;
          color: white;
        }

        .delete-btn:hover, .delete-btn:focus, .delete-btn:active {
          background-color: #c82333;
          border-color: #bd2130;
        }

        .me-1 {
          margin-right: 0.25rem;
        }

        .active-layout-btn {
          background-color: #0B3D7B;
          border-color: #0B3D7B;
          color: white;
        }

        .active-layout-btn:hover, .active-layout-btn:focus, .active-layout-btn:active {
          background-color: #082b56;
          border-color: #082b56;
          color: white;
        }

        .generate-btn, .save-btn {
          background-color: #0B3D7B;
          border-color: #0B3D7B;
          color: white;
        }

        .generate-btn:hover, .generate-btn:focus, .generate-btn:active,
        .save-btn:hover, .save-btn:focus, .save-btn:active {
          background-color: #082b56;
          border-color: #082b56;
          color: white;
        }
      `}</style>
    </MainContentPage>
  );
};

export default QRCodeListing;