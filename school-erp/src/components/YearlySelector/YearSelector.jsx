"use client"

import { useState, useEffect } from "react"
import { doc, setDoc, getDoc, deleteField } from "firebase/firestore"
import { db } from "../../Firebase/config"
import { useAuthContext } from "../../Context/AuthContext"
import { useNavigate } from "react-router-dom"

function YearSelector() {
  const [academicYears, setAcademicYears] = useState([])
  const [selectedYear, setSelectedYear] = useState("")
  const [startYear, setStartYear] = useState("")
  const [endYear, setEndYear] = useState("")
  const [schoolName, setSchoolName] = useState("")
  const [showAddYear, setShowAddYear] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showAddYearConfirmDialog, setShowAddYearConfirmDialog] = useState(false)
  const [yearError, setYearError] = useState("")
  const [schoolNameError, setSchoolNameError] = useState("")
  const [newYearToAdd, setNewYearToAdd] = useState("")
  const [isSchoolNameEditable, setIsSchoolNameEditable] = useState(true)
  const { user, updateCurrentAcademicYear, refreshAcademicYear, forceLogout } = useAuthContext()
  const navigate = useNavigate()

  // Check if user is authenticated
  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (!user) {
      console.log("User not authenticated, redirecting to login from YearSelector")
      navigate("/login", { replace: true })
      return
    }

    fetchAcademicYears()
    fetchSchoolName()
  }, [user, navigate])

  // Auto-calculate end year when start year changes
  useEffect(() => {
    if (startYear && !isNaN(parseInt(startYear)) && startYear.length === 4) {
      const calculatedEndYear = (parseInt(startYear) + 1).toString()
      setEndYear(calculatedEndYear)
    }
  }, [startYear])

  const fetchSchoolName = async () => {
    if (!user) return
    
    try {
      const userDoc = await getDoc(doc(db, "Schools", user.uid))
      if (userDoc.exists()) {
        if (userDoc.data().SchoolName) {
          setSchoolName(userDoc.data().SchoolName)
          setIsSchoolNameEditable(false)
        } else {
          setSchoolName("")
          setIsSchoolNameEditable(true)
        }
      } else {
        // If document doesn't exist, school name is editable
        setSchoolName("")
        setIsSchoolNameEditable(true)
      }
    } catch (error) {
      console.error("Error fetching school name:", error)
      setSchoolName("")
      setIsSchoolNameEditable(true)
    }
  }

  const fetchAcademicYears = async () => {
    if (!user) return
    
    try {
      const userDoc = await getDoc(doc(db, "Schools", user.uid))
      if (userDoc.exists() && userDoc.data().academicYears) {
        setAcademicYears(userDoc.data().academicYears)
        
        // Don't auto-select any year initially
        setSelectedYear("")
      } else {
        setAcademicYears([])
      }
    } catch (error) {
      console.error("Error fetching academic years:", error)
      setAcademicYears([])
    }
  }

  const handleContinueClick = () => {
    if (!selectedYear) return
    setShowConfirmDialog(true)
  }

  const handleYearSelect = async () => {
    if (!selectedYear) return

    try {
      console.log("Setting academic year in Firestore:", selectedYear)
      
      // Update the user's current academic year in Firestore
      await setDoc(
        doc(db, "Schools", user.uid),
        {
          currentAcademicYear: selectedYear,
          updatedAt: new Date()
        },
        { merge: true },
      )

      // Update context
      console.log("Updating context with academic year:", selectedYear)
      await updateCurrentAcademicYear(selectedYear)
      
      // Close confirmation dialog
      setShowConfirmDialog(false)
      
      // DIRECT NAVIGATION: Use window.location for a hard redirect
      console.log("Redirecting to /home using window.location")
      window.location.href = "/home"
    } catch (error) {
      console.error("Error setting academic year:", error)
    }
  }

  const validateYears = () => {
    setYearError("")
    
    // Check if years are provided
    if (!startYear || !endYear) {
      setYearError("Both years are required")
      return false
    }
    
    // Check if years are valid numbers
    if (isNaN(parseInt(startYear)) || isNaN(parseInt(endYear))) {
      setYearError("Years must be valid numbers")
      return false
    }
    
    // Check if years have 4 digits
    if (startYear.length !== 4 || endYear.length !== 4) {
      setYearError("Years must be 4 digits")
      return false
    }
    
    // Check if end year is greater than start year
    if (parseInt(endYear) <= parseInt(startYear)) {
      setYearError("End year must be greater than start year")
      return false
    }
    
    // Check if years are consecutive
    if (parseInt(endYear) !== parseInt(startYear) + 1) {
      setYearError("Years should be consecutive (e.g., 2024-2025)")
      return false
    }
    
    return true
  }

  const validateSchoolName = () => {
    setSchoolNameError("")
    
    if (!schoolName.trim()) {
      setSchoolNameError("School name is required")
      return false
    }
    
    return true
  }

  const handleAddYearClick = () => {
    if (!validateYears()) return
    if (!validateSchoolName()) return
    
    const newYear = `${startYear}-${endYear}`
    setNewYearToAdd(newYear)
    setShowAddYearConfirmDialog(true)
  }

  const handleAddYear = async () => {
    if (!newYearToAdd || !schoolName.trim()) return
    
    try {
      console.log("Adding new academic year:", newYearToAdd)
      
      const userRef = doc(db, "Schools", user.uid)
      const userDoc = await getDoc(userRef)

      let updatedYears = []
      if (userDoc.exists() && userDoc.data().academicYears) {
        updatedYears = [...userDoc.data().academicYears]

        // Check if year already exists
        if (updatedYears.includes(newYearToAdd)) {
          setYearError("This academic year already exists")
          setShowAddYearConfirmDialog(false)
          return
        }
      }

      // Add the new year
      updatedYears.push(newYearToAdd)

      // Update Firestore with school info
      await setDoc(
        userRef,
        {
          academicYears: updatedYears,
          currentAcademicYear: newYearToAdd,
          SchoolName: schoolName,
          email: user.email,
          updatedAt: new Date()
        },
        { merge: true },
      )

      // Also store school info in the academic year document
      const academicYearRef = doc(db, "Schools", user.uid, "AcademicYears", newYearToAdd)
      await setDoc(
        academicYearRef,
        {
          SchoolName: schoolName,
          email: user.email,
          createdAt: new Date()
        },
        { merge: true },
      )

      // Update context
      console.log("Updating context with new academic year:", newYearToAdd)
      await updateCurrentAcademicYear(newYearToAdd)

      // Reset state
      setAcademicYears([...updatedYears])
      setSelectedYear(newYearToAdd)
      setStartYear("")
      setEndYear("")
      setShowAddYear(false)
      setYearError("")
      setSchoolNameError("")
      setShowAddYearConfirmDialog(false)
      setIsSchoolNameEditable(false)

      // DIRECT NAVIGATION: Use window.location for a hard redirect
      console.log("Redirecting to /home using window.location")
      window.location.href = "/home"
    } catch (error) {
      console.error("Error adding academic year:", error)
    }
  }

  // Handle showing the add year form
  const handleShowAddYear = () => {
    setShowAddYear(true)
    // Fetch the latest school name again to ensure it's up to date
    fetchSchoolName()
  }

  // Handle resetting school data (for when database is deleted)
  const handleResetSchoolData = async () => {
    try {
      // Reset school name and make it editable
      setSchoolName("")
      setIsSchoolNameEditable(true)
      
      // Update Firestore to remove SchoolName field
      const userRef = doc(db, "Schools", user.uid)
      await setDoc(
        userRef,
        {
          SchoolName: deleteField(),
          academicYears: [],
          currentAcademicYear: deleteField()
        },
        { merge: true },
      )
      
      // Reset state
      setAcademicYears([])
      setSelectedYear("")
      
      // Force logout to ensure clean state
      forceLogout()
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Error resetting school data:", error)
    }
  }

  // Confirmation Dialog Component
  const ConfirmYearDialog = () => {
    if (!showConfirmDialog) return null
    
    return (
      <div className="confirm-dialog-overlay">
        <div className="confirm-dialog">
          <h3>Confirm Academic Year</h3>
          <p>Are you sure you want to continue with the academic year:</p>
          <div className="selected-year-display">{selectedYear}</div>
          <div className="confirm-dialog-buttons">
            <button 
              className="cancel-btn" 
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </button>
            <button 
              className="confirm-btn" 
              onClick={handleYearSelect}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Add Year Confirmation Dialog Component
  const AddYearConfirmDialog = () => {
    if (!showAddYearConfirmDialog) return null
    
    return (
      <div className="confirm-dialog-overlay">
        <div className="confirm-dialog">
          <h3>Confirm New Academic Year</h3>
          <p>Are you sure you want to add and select this academic year:</p>
          <div className="selected-year-display">{newYearToAdd}</div>
          <div className="school-name-display">
            <strong>School Name:</strong> {schoolName}
          </div>
          <div className="confirm-dialog-buttons">
            <button 
              className="cancel-btn" 
              onClick={() => setShowAddYearConfirmDialog(false)}
            >
              Cancel
            </button>
            <button 
              className="confirm-btn" 
              onClick={handleAddYear}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="year-selector-container">
      <div className="year-selector-card">
        <h2>Select Academic Year</h2>
        <p>Please select an academic year to continue</p>

        {!showAddYear ? (
          <>
            {/* Display school name if available */}
            {schoolName && (
              <div className="school-name-header">
                <h3>School: {schoolName}</h3>
                <button
                  className="reset-data-btn"
                  onClick={handleResetSchoolData}
                  title="Reset school data (use if database was deleted)"
                >
                  Reset Data
                </button>
              </div>
            )}

            {academicYears.length > 0 ? (
              <div className="year-list">
                {academicYears.map((year) => (
                  <div
                    key={year}
                    className={`year-item ${selectedYear === year ? "selected" : ""}`}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-years">No academic years found. Please add one.</p>
            )}

            <div className="button-group">
              <button className="add-year-btn" onClick={handleShowAddYear}>
                Add New Academic Year
              </button>

              {selectedYear && (
                <button className="continue-btn" onClick={handleContinueClick}>
                  Continue
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="add-year-form">
            {/* School Name Input */}
            <div className="school-input-wrapper">
              <label htmlFor="schoolName">School Name</label>
              <input
                type="text"
                id="schoolName"
                placeholder="Enter your school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="school-input"
                readOnly={!isSchoolNameEditable} // Make it read-only if school name already exists
              />
              {!isSchoolNameEditable && (
                <div className="school-name-note">School name is already set and cannot be changed</div>
              )}
              {schoolNameError && <div className="input-error">{schoolNameError}</div>}
            </div>

            <div className="year-input-group">
              <div className="year-input-wrapper">
                <label htmlFor="startYear">Start Year</label>
                <input
                  type="number"
                  id="startYear"
                  placeholder="2024"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="year-input"
                  min="2000"
                  max="2100"
                />
              </div>
              <div className="year-separator">-</div>
              <div className="year-input-wrapper">
                <label htmlFor="endYear">End Year</label>
                <input
                  type="number"
                  id="endYear"
                  placeholder="2025"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="year-input"
                  min="2000"
                  max="2100"
                />
              </div>
            </div>
            
            {yearError && <div className="year-error">{yearError}</div>}
            
            <div className="year-preview">
              Format: <span className="year-format">{startYear && endYear ? `${startYear}-${endYear}` : "YYYY-YYYY"}</span>
            </div>
            
            <div className="button-group">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowAddYear(false)
                  setStartYear("")
                  setEndYear("")
                  setYearError("")
                  setSchoolNameError("")
                }}
              >
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddYearClick}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmYearDialog />
      <AddYearConfirmDialog />

      <style jsx>{`
        .year-selector-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(180deg, #1470E1 0%, #0B3D7B 100%);
          padding: 20px;
        }
        
        .year-selector-card {
          background: white;
          border-radius: 10px;
          padding: 30px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          color: #0B3D7B;
          margin-bottom: 10px;
          text-align: center;
        }
        
        p {
          color: #666;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .school-name-header {
          background-color: #f8f9fa;
          border-left: 4px solid #0B3D7B;
          padding: 10px 15px;
          margin-bottom: 20px;
          border-radius: 5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .school-name-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        
        .reset-data-btn {
          background-color: #dc3545;
          color: white;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 3px;
        }
        
        .year-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .year-item {
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .year-item:hover {
          background-color: #f5f5f5;
        }
        
        .year-item.selected {
          background-color: #0B3D7B;
          color: white;
          border-color: #0B3D7B;
        }
        
        .button-group {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        
        .add-year-btn {
          background-color: #6c757d;
          color: white;
        }
        
        .continue-btn {
          background-color: #0B3D7B;
          color: white;
        }
        
        .cancel-btn {
          background-color: #6c757d;
          color: white;
        }
        
        .save-btn, .confirm-btn {
          background-color: #0B3D7B;
          color: white;
        }
        
        .school-input-wrapper {
          margin-bottom: 20px;
        }
        
        .school-input-wrapper label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-size: 14px;
        }
        
        .school-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        
        .school-input[readonly] {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }
        
        .school-name-note {
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
          font-style: italic;
        }
        
        .year-input-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .year-input-wrapper {
          flex: 1;
        }
        
        .year-input-wrapper label {
          display: block;
          margin-bottom: 5px;
          color: #555;
          font-size: 14px;
        }
        
        .year-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
        }
        
        .year-separator {
          font-size: 24px;
          font-weight: bold;
          margin: 0 10px;
          padding-top: 25px;
          color: #0B3D7B;
        }
        
        .year-error, .input-error {
          color: #dc3545;
          font-size: 14px;
          margin-top: 5px;
          margin-bottom: 15px;
          text-align: left;
        }
        
        .year-preview {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          margin-bottom: 15px;
          color: #666;
        }
        
        .year-format {
          font-weight: bold;
          color: #0B3D7B;
        }
        
        .no-years {
          color: #dc3545;
          font-style: italic;
        }
        
        /* Confirmation Dialog Styles */
        .confirm-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .confirm-dialog {
          background: white;
          border-radius: 10px;
          padding: 25px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        
        .confirm-dialog h3 {
          color: #0B3D7B;
          margin-bottom: 15px;
        }
        
        .selected-year-display {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 12px;
          margin: 15px 0;
          font-size: 18px;
          font-weight: bold;
          color: #0B3D7B;
        }
        
        .school-name-display {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 12px;
          margin: 15px 0;
          font-size: 16px;
          color: #333;
        }
        
        .confirm-dialog-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }
        
        .confirm-dialog-buttons button {
          min-width: 100px;
        }
        
        /* Responsive adjustments */
        @media (max-width: 576px) {
          .year-selector-card {
            padding: 20px;
          }
          
          .button-group {
            flex-direction: column;
            gap: 10px;
          }
          
          button {
            width: 100%;
          }
          
          .confirm-dialog-buttons {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  )
}

export default YearSelector
