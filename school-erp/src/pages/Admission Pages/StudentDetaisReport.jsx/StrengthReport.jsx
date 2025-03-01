"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Container, Table, Spinner, Row, Col, Card, Nav, Tab } from "react-bootstrap"
import { db, auth } from "../../Firebase/config"
import { collection, getDocs } from "firebase/firestore"
import MainContentPage from "../../components/MainContent/MainContentPage"
import { Link } from "react-router-dom"

const StrengthReport = () => {
  const [activeTab, setActiveTab] = useState("detailed")
  const [loading, setLoading] = useState(true)
  const [administrationId, setAdministrationId] = useState(null)
  const [strengthData, setStrengthData] = useState({})
  const [sections, setSections] = useState([])
  const [religionCategories, setReligionCategories] = useState([])
  const [totalsByCategory, setTotalsByCategory] = useState({})
  const [grandTotal, setGrandTotal] = useState(0)
  const [summaryData, setSummaryData] = useState({
    religionWise: {},
    communityWise: {},
    genderWise: { Male: 0, Female: 0 },
  })

  useEffect(() => {
    const fetchAdministrationId = async () => {
      try {
        const adminRef = collection(db, "Schools", auth.currentUser.uid, "Administration")
        const querySnapshot = await getDocs(adminRef)

        if (!querySnapshot.empty) {
          setAdministrationId(querySnapshot.docs[0].id)
        }
      } catch (error) {
        console.error("Error fetching Administration ID:", error)
      }
    }

    fetchAdministrationId()
  }, [])

  useEffect(() => {
    if (administrationId) {
      fetchAdmissionData()
    }
  }, [administrationId])

  const fetchAdmissionData = async () => {
    try {
      setLoading(true)

      // Fetch all admission records
      const admissionsRef = collection(
        db,
        "Schools",
        auth.currentUser.uid,
        "AdmissionMaster",
        administrationId,
        "AdmissionSetup",
      )

      const admissionsSnapshot = await getDocs(admissionsRef)
      const admissionsData = admissionsSnapshot.docs.map((doc) => doc.data())

      // Process data to create strength report
      processAdmissionData(admissionsData)

      // Process data for summary
      const religionWise = {}
      const communityWise = {}
      const genderWise = { Male: 0, Female: 0 }

      admissionsData.forEach((student) => {
        // Religion summary
        const religion = student.religion || "Not Specified"
        religionWise[religion] = (religionWise[religion] || 0) + 1

        // Community summary
        const community = student.community || "Not Specified"
        communityWise[community] = (communityWise[community] || 0) + 1

        // Gender summary
        const gender = student.gender || "Not Specified"
        if (gender === "Male" || gender === "Female") {
          genderWise[gender] = (genderWise[gender] || 0) + 1
        }
      })

      setSummaryData({
        religionWise,
        communityWise,
        genderWise,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching admission data:", error)
      setLoading(false)
    }
  }

  const processAdmissionData = (admissionsData) => {
    // Extract unique sections (I-A, I-B, etc.)
    const uniqueSections = new Set()

    // Extract unique religion-community combinations
    const uniqueReligionCategories = new Set()

    // Initialize data structure
    const strengthDataObj = {}
    const categoryTotals = {}
    let total = 0

    // First pass: identify all unique sections and religion categories
    admissionsData.forEach((student) => {
      const standardSection = `${student.standard}-${student.section}`
      uniqueSections.add(standardSection)

      // Create a category key based on religion and community
      let categoryKey = ""

      if (student.religion === "Hindu") {
        categoryKey = `Hindu ${student.community}`
      } else if (student.religion === "Muslim") {
        categoryKey = `Muslim ${student.community}`
      } else if (student.religion === "Christian") {
        categoryKey = `Christian ${student.community}`
      } else {
        categoryKey = student.community || student.religion || "-"
      }

      uniqueReligionCategories.add(categoryKey)
    })

    // Convert sets to sorted arrays
    const sortedSections = Array.from(uniqueSections).sort((a, b) => {
      const [standardA, sectionA] = a.split("-")
      const [standardB, sectionB] = b.split("-")

      if (standardA === standardB) {
        return sectionA.localeCompare(sectionB)
      }

      // Use roman numeral comparison for standards
      const romanToNum = (roman) => {
        const romanNumerals = {
          I: 1,
          II: 2,
          III: 3,
          IV: 4,
          V: 5,
          VI: 6,
          VII: 7,
          VIII: 8,
          IX: 9,
          X: 10,
          XI: 11,
          XII: 12,
        }
        return romanNumerals[roman] || 0
      }

      return romanToNum(standardA) - romanToNum(standardB)
    })

    const sortedCategories = Array.from(uniqueReligionCategories).sort()

    // Initialize the data structure with all combinations
    sortedSections.forEach((section) => {
      const [standard, sectionName] = section.split("-")

      if (!strengthDataObj[standard]) {
        strengthDataObj[standard] = {}
      }

      if (!strengthDataObj[standard][sectionName]) {
        strengthDataObj[standard][sectionName] = {
          female: {},
          male: {},
          total: {},
        }

        // Initialize all categories with zero
        sortedCategories.forEach((category) => {
          strengthDataObj[standard][sectionName].female[category] = 0
          strengthDataObj[standard][sectionName].male[category] = 0
          strengthDataObj[standard][sectionName].total[category] = 0

          // Initialize category totals
          if (!categoryTotals[category]) {
            categoryTotals[category] = 0
          }
        })
      }
    })

    // Second pass: count students by section, gender, and religion-community
    admissionsData.forEach((student) => {
      const standardSection = `${student.standard}-${student.section}`
      const [standard, sectionName] = standardSection.split("-")

      // Skip if section not found in our structure
      if (!strengthDataObj[standard] || !strengthDataObj[standard][sectionName]) {
        return
      }

      // Create category key
      let categoryKey = ""

      if (student.religion === "Hindu") {
        categoryKey = `Hindu ${student.community}`
      } else if (student.religion === "Muslim") {
        categoryKey = `Muslim ${student.community}`
      } else if (student.religion === "Christian") {
        categoryKey = `Christian ${student.community}`
      } else {
        categoryKey = student.community || student.religion || "-"
      }

      // Skip if category not found
      if (!sortedCategories.includes(categoryKey)) {
        return
      }

      // Increment counts
      const gender = student.gender.toLowerCase()

      if (gender === "female") {
        strengthDataObj[standard][sectionName].female[categoryKey]++
        strengthDataObj[standard][sectionName].total[categoryKey]++
      } else if (gender === "male") {
        strengthDataObj[standard][sectionName].male[categoryKey]++
        strengthDataObj[standard][sectionName].total[categoryKey]++
      }

      // Update category totals
      categoryTotals[categoryKey]++
      total++
    })

    // Calculate row totals for each section and gender
    Object.keys(strengthDataObj).forEach((standard) => {
      Object.keys(strengthDataObj[standard]).forEach((section) => {
        // Add totals for female
        strengthDataObj[standard][section].female.Total = Object.values(
          strengthDataObj[standard][section].female,
        ).reduce((sum, count) => sum + count, 0)

        // Add totals for male
        strengthDataObj[standard][section].male.Total = Object.values(strengthDataObj[standard][section].male).reduce(
          (sum, count) => sum + count,
          0,
        )

        // Add totals for total
        strengthDataObj[standard][section].total.Total = Object.values(strengthDataObj[standard][section].total).reduce(
          (sum, count) => sum + count,
          0,
        )
      })
    })

    // Add Total to category totals
    categoryTotals.Total = total

    // Update state
    setSections(sortedSections)
    setReligionCategories([...sortedCategories, "Total"])
    setStrengthData(strengthDataObj)
    setTotalsByCategory(categoryTotals)
    setGrandTotal(total)
  }

  // Calculate standard totals
  const calculateStandardTotals = (standard) => {
    const result = {
      female: {},
      male: {},
      total: {},
    }

    // Initialize with zeros for all categories
    religionCategories.forEach((category) => {
      result.female[category] = 0
      result.male[category] = 0
      result.total[category] = 0
    })

    // Sum up all sections for this standard
    if (strengthData[standard]) {
      Object.keys(strengthData[standard]).forEach((section) => {
        religionCategories.forEach((category) => {
          result.female[category] += strengthData[standard][section].female[category] || 0
          result.male[category] += strengthData[standard][section].male[category] || 0
          result.total[category] += strengthData[standard][section].total[category] || 0
        })
      })
    }

    return result
  }

  // Calculate grand totals across all standards
  const calculateGrandTotals = () => {
    const result = {
      female: {},
      male: {},
      total: {},
    }

    // Initialize with zeros for all categories
    religionCategories.forEach((category) => {
      result.female[category] = 0
      result.male[category] = 0
      result.total[category] = 0
    })

    // Sum up all standards
    Object.keys(strengthData).forEach((standard) => {
      const standardTotals = calculateStandardTotals(standard)

      religionCategories.forEach((category) => {
        result.female[category] += standardTotals.female[category] || 0
        result.male[category] += standardTotals.male[category] || 0
        result.total[category] += standardTotals.total[category] || 0
      })
    })

    return result
  }

  // Render table header with religion categories
  const renderTableHeader = () => {
    return (
      <tr>
        <th colSpan={3} className="text-center"></th>
        {religionCategories.map((category, index) => (
          <th key={index} className="text-center">
            {category}
          </th>
        ))}
      </tr>
    )
  }

  // Render table rows for a specific standard and section
  const renderSectionRows = (standard, section) => {
    const sectionData = strengthData[standard][section]

    return (
      <>
        <tr>
          {section === Object.keys(strengthData[standard])[0] ? (
            <td rowSpan={Object.keys(strengthData[standard]).length * 3} className="align-middle text-center">
              {standard}
            </td>
          ) : null}
          <td rowSpan={3} className="align-middle text-center">
            {section}
          </td>
          <td>Female</td>
          {religionCategories.map((category, index) => (
            <td key={index} className="text-center">
              {sectionData.female[category] || 0}
            </td>
          ))}
        </tr>
        <tr>
          <td>Male</td>
          {religionCategories.map((category, index) => (
            <td key={index} className="text-center">
              {sectionData.male[category] || 0}
            </td>
          ))}
        </tr>
        <tr>
          <td>Total</td>
          {religionCategories.map((category, index) => (
            <td key={index} className="text-center">
              {sectionData.total[category] || 0}
            </td>
          ))}
        </tr>
      </>
    )
  }

  // Render standard total rows
  const renderStandardTotalRow = (standard) => {
    const totals = calculateStandardTotals(standard)

    return (
      <tr className="table-secondary">
        <td colSpan={2} className="text-center fw-bold">
          Total
        </td>
        <td className="text-center fw-bold"></td>
        {religionCategories.map((category, index) => (
          <td key={index} className="text-center fw-bold">
            {totals.total[category] || 0}
          </td>
        ))}
      </tr>
    )
  }

  // Render grand total row
  const renderGrandTotalRow = () => {
    const grandTotals = calculateGrandTotals()

    return (
      <tr className="table-dark text-white">
        <td colSpan={2} className="text-center fw-bold">
          Total
        </td>
        <td className="text-center fw-bold"></td>
        {religionCategories.map((category, index) => (
          <td key={index} className="text-center fw-bold">
            {grandTotals.total[category] || 0}
          </td>
        ))}
      </tr>
    )
  }

  // Get total count for summary tables
  const getTotalCount = (dataObj) => {
    return Object.values(dataObj).reduce((sum, count) => sum + count, 0)
  }

  // Render detailed strength report
  const renderDetailedReport = () => {
    return (
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white py-3">
          <h2 className="mb-0 text-center">STRENGTH PARTICULARS</h2>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading strength data...</p>
            </div>
          ) : Object.keys(strengthData).length === 0 ? (
            <div className="text-center py-5">
              <p>No admission data available. Please add students to generate the strength report.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered className="strength-table">
                <thead className="table-light">{renderTableHeader()}</thead>
                <tbody>
                  {Object.keys(strengthData)
                    .sort()
                    .map((standard) => (
                      <React.Fragment key={standard}>
                        {Object.keys(strengthData[standard])
                          .sort()
                          .map((section) => (
                            <React.Fragment key={`${standard}-${section}`}>
                              {renderSectionRows(standard, section)}
                            </React.Fragment>
                          ))}
                        {renderStandardTotalRow(standard)}
                      </React.Fragment>
                    ))}
                  {renderGrandTotalRow()}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    )
  }

  // Render summary report
  const renderSummaryReport = () => {
    return (
      <Container fluid className="mt-4">
        <Row>
          <Col md={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Religion-wise Strength</h5>
              </Card.Header>
              <Card.Body>
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Religion</th>
                      <th className="text-center">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summaryData.religionWise)
                      .sort()
                      .map(([religion, count]) => (
                        <tr key={religion}>
                          <td>{religion}</td>
                          <td className="text-center">{count}</td>
                        </tr>
                      ))}
                    <tr className="table-secondary">
                      <td className="fw-bold">Total</td>
                      <td className="text-center fw-bold">{getTotalCount(summaryData.religionWise)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Community-wise Strength</h5>
              </Card.Header>
              <Card.Body>
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Community</th>
                      <th className="text-center">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summaryData.communityWise)
                      .sort()
                      .map(([community, count]) => (
                        <tr key={community}>
                          <td>{community}</td>
                          <td className="text-center">{count}</td>
                        </tr>
                      ))}
                    <tr className="table-secondary">
                      <td className="fw-bold">Total</td>
                      <td className="text-center fw-bold">{getTotalCount(summaryData.communityWise)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Gender-wise Strength</h5>
              </Card.Header>
              <Card.Body>
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th>Gender</th>
                      <th className="text-center">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(summaryData.genderWise).map(([gender, count]) => (
                      <tr key={gender}>
                        <td>{gender}</td>
                        <td className="text-center">{count}</td>
                      </tr>
                    ))}
                    <tr className="table-secondary">
                      <td className="fw-bold">Total</td>
                      <td className="text-center fw-bold">{getTotalCount(summaryData.genderWise)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <MainContentPage>
      <Container fluid className="px-0">
        <div className="mb-4">
          <nav className="custom-breadcrumb py-1 py-lg-3">
            <Link to="/home">Home</Link>
            <span className="separator mx-2"></span>
            <Link to="/reports">Reports</Link>
            <span className="separator mx-2"></span>
            <span>Strength Report</span>
          </nav>
        </div>

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="detailed" className="px-4">
                Detailed Strength Report
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="summary" className="px-4">
                Summary Report
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="detailed">{renderDetailedReport()}</Tab.Pane>
            <Tab.Pane eventKey="summary">{renderSummaryReport()}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
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

          .nav-tabs .nav-link {
            color: #495057;
            border: 1px solid transparent;
            border-top-left-radius: 0.25rem;
            border-top-right-radius: 0.25rem;
          }

          .nav-tabs .nav-link.active {
            color: #0B3D7B;
            background-color: #fff;
            border-color: #dee2e6 #dee2e6 #fff;
            font-weight: 600;
          }

          .strength-table {
            font-size: 0.9rem;
          }

          .strength-table th, .strength-table td {
            vertical-align: middle;
            padding: 0.5rem;
          }

          .strength-table thead th {
            background-color: #f8f9fa;
            font-weight: 600;
          }

          @media (max-width: 992px) {
            .strength-table {
              font-size: 0.8rem;
            }

            .strength-table th, .strength-table td {
              padding: 0.3rem;
            }
          }
        `}
      </style>
    </MainContentPage>
  )
}

export default StrengthReport

