"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"
import { auth } from "../../Firebase/config"
import { signOut } from "firebase/auth"

// Import icons from your assets folder
import dashboardIcon from "../../images/Sidebar-icons/dashboard.png"
import adminIcon from "../../images/Sidebar-icons/admin.png"
import admissionIcon from "../../images/Sidebar-icons/admission.png"
import transactionIcon from "../../images/Sidebar-icons/transaction.png"
import transportIcon from "../../images/Sidebar-icons/transport.png"
import collectionIcon from "../../images/Sidebar-icons/collection.png"
import paymentIcon from "../../images/Sidebar-icons/payment.png"
import debitIcon from "../../images/Sidebar-icons/debit.png"
import settingIcon from "../../images/Sidebar-icons/setting.png"
import logoutIcon from "../../images/Sidebar-icons/logout.png"
import logo from "../../images/Logo/logo.jpg"

// Logout Confirmation Modal Component
function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Confirm Logout</h2>
        <p className="modal-message">Are you sure you want to logout?</p>
        <div className="modal-buttons">
          <button className="modal-button confirm" onClick={onConfirm}>
            Yes
          </button>
          <button className="modal-button cancel" onClick={onClose}>
            No
          </button>
        </div>
      </div>
      <style>
        {`
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
            text-align: center;
          }

          .modal-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #333;
          }

          .modal-message {
            margin-bottom: 1.5rem;
            color: #666;
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

          .modal-button:hover {
            opacity: 0.9;
          }

          .modal-button.confirm {
            background-color: #0B3D7B;
            color: white;
          }

          .modal-button.cancel {
            background-color: #6c757d;
            color: white;
          }
        `}
      </style>
    </div>
  )
}

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState(location.pathname)
  const [expandedItem, setExpandedItem] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  //const [sidebarOpen, setSidebarOpen] = useState(!isMobile) // Removed -  Now using isOpen prop

  useEffect(() => {
    const activeParent = menuItems.find(
      (item) => item.subItems && item.subItems.some((subItem) => location.pathname.startsWith(subItem.path)),
    )
    if (activeParent) {
      setExpandedItem(activeParent.id)
    }
  }, [location.pathname])

  //useEffect(() => {
  //  if (!isMobile) {
  //    setSidebarOpen(true)
  //  }
  //}, [isMobile]) // Removed - Now using isOpen prop

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth)
      setShowLogoutModal(false)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
      setShowLogoutModal(false)
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const menuItems = [
    {
      id: 1,
      title: "Dashboard",
      icon: dashboardIcon,
      path: "/home",
      subItems: [],
    },
    {
      id: 2,
      title: "Administration",
      icon: adminIcon,
      path: "/admin",
      subItems: [
        { id: "2-1", title: "• Standard/Course Setup", path: "/admin/standard-setup" },
        { id: "2-2", title: "• Fee Head Setup", path: "/admin/fee-setup" },
        { id: "2-3", title: "• Tuition Fee Setup", path: "/admin/tuition-setup" },
        { id: "2-4", title: "• Subject Head", path: "/admin/Subject-Head" },
        { id: "2-5", title: "• Course Head", path: "/admin/Course-Head" },
        { id: "2-6", title: "• Community and Caste Setup", path: "/admin/community-setup" },
        { id: "2-7", title: "• Parent Occupation Setup", path: "/admin/occupation-setup" },
        { id: "2-8", title: "• Receipt Setup", path: "/admin/receipt-setup" },
        { id: "2-9", title: "• Payment Setup", path: "/admin/payment-setup" },
        { id: "2-10", title: "• Staff Master", path: "/admin/staff-master" },
        { id: "2-11", title: "• Flash Screen", path: "/admin/Flash-Screen" },
        { id: "2-12", title: "• Password Setup", path: "/admin/password-setup" },
        { id: "2-13", title: "• Certificate Preparation", path: "/admin/certificate" },
        { id: "2-14", title: "• Password Setup", path: "/admin/Password-Setup" },
        { id: "2-14", title: "• Supplier Setup", path: "/admin/supplier-Setup" },
        
      ],
    },
    {
      id: 3,
      title: "Admission Master",
      icon: admissionIcon,
      path: "/admission",
      subItems: [
        { id: "3-1", title: "• External master Setup/Enquiry", path: "/admission/enquiry" },
        { id: "3-1", title: "• Admission Form", path: "/admission/AdmissionForm" },
        { id: "3-2", title: "• Barcode Design", path: "/admission/Bar-code-Design" },
        { id: "3-3", title: "• Student Detail", path: "/admission/StudentDetails" },
        { id: "3-3", title: "• Student Details Report", path: "/admission/Student-Details-Report" },
        { id: "3-3", title: "• Transfer Certificate", path: "/admission/Transfer-Certificate" },
        { id: "3-3", title: "• Demand Report", path: "/admission/Demand-Report" },
        { id: "3-3", title: "• Section Replace", path: "/admission/Section-Replace" },
        { id: "3-3", title: "• Arrear / Fee Updating", path: "/admission/Arrear-FeeUpdating" },
        { id: "3-3", title: "• Bill Cancel", path: "/admission/Bill-Cancel" },
      ],
    },
    {
      id: 4,
      title: "Book",
      icon: admissionIcon,
      path: "/book",
      subItems: [
        { id: "4-1", title: "• Item/Book Master", path: "/book/item-book-master" },
        { id: "4-2", title: "• Category Head", path: "/book/category-head" },
        { id: "4-3", title: "• Customer / Staff Master", path: "/book/customer-staff-master" },
        { id: "4-4", title: "• Book Master", path: "/book/Book-Master" },
        { id: "4-5", title: "• Book Setup Class Wise", path: "/book/Book-setup-class-wise" },
      ],
    },
    {
      id: 5,
      title: "Transaction",
      icon: transactionIcon,
      path: "/transaction",
      subItems: [
        { id: "5-1", title: "• Billing Entry", path: "/transaction/billing-entry" },
        { id: "5-2", title: "• Other Fee / Miscellaneous Fee", path: "/transaction/other-fee" },
        { id: "5-3", title: "• Individual Paid", path: "/transaction/individual-paid" },
        { id: "5-4", title: "• Payment Entry", path: "/transaction/payment-entry" },
        { id: "5-5", title: "• Receipt Entry", path: "/transaction/receipt-entry" },
        { id: "5-6", title: "• Duplicate Bill", path: "/transaction/duplicate-bill" },
        { id: "5-7", title: "• Staff Phone Update", path: "/transaction/staff-update" },
        { id: "5-8", title: "• Student Phone Replace", path: "/transaction/student-phone-replace" },
        { id: "5-9", title: "• Attendance Entry", path: "/transaction/attendance-entry" },
        { id: "5-10", title: "• SMS Send", path: "/transaction/sms-send" },
      ],
    },
    {
      id: 6,
      title: "Transport",
      icon: transportIcon,
      path: "/transport",
      subItems: [
        { id: "6-1", title: "• Bus / Van Fee Head Setup", path: "/transport/bus-van-fee" },
        { id: "6-2", title: "• Place Setup", path: "/transport/place-setup" },
        { id: "6-3", title: "• Bus Fee Setup", path: "/transport/bus-fee-setup" },
        { id: "6-4", title: "• New Bus Bill", path: "/transport/new-bus-bill" },
        { id: "6-5", title: "• Day Bus Fee Collection", path: "/transport/day-bus-fee" },
        { id: "6-6", title: "• Period Bus Fee Collection Report", path: "/transport/period-bus-collection" },
        { id: "6-7", title: "• Bus Fee Balance Report", path: "/transport/bus-balance-report" },
        { id: "6-8", title: "• Placewise List", path: "/transport/place-wise-report" },
      ],
    },
    {
      id: 7,
      title: "Collection Report",
      icon: collectionIcon,
      path: "/collection-report",
      subItems: [
        { id: "7-1", title: "• Tution Fee", path: "/collection-report/tution-fee" },
        { id: "7-2", title: "• Miscellaneous Fee Collection", path: "/collection-report/Miscellaneous-Fee-Collection" },
        { id: "7-3", title: "• Concession A/C", path: "/collection-report/Concession-AC" },
        { id: "7-4", title: "• Bill Wise Details", path: "/collection-report/Bill-Wise-Details" },
        { id: "7-5", title: "• Receipt Details", path: "/collection-report/Receipt-Details" },
        { id: "7-6", title: "• Routwise Balance Report", path: "/collection-report/Routwise-Balance-Report" },
      ],
    },
    {
      id: 8,
      title: "Payment Reports",
      icon: paymentIcon,
      path: "/payment-report",
      subItems: [],
    },
    {
      id: 9,
      title: "Debit/Credit Report",
      icon: debitIcon,
      path: "/debit-credit-report",
      subItems: [
        { id: "9-1", title: "• Day D/C Report ( Day Book )", path: "/debit-credit-report/day-dc-report" },
        { id: "9-2", title: "• Period D/C Report ( Ledger )", path: "/debit-credit-report/period-dc-report" },
        { id: "9-3", title: "• Bank Ledger", path: "/debit-credit-report/bank-ledger" },
        { id: "9-4", title: "• Balance List", path: "/debit-credit-report/balance-list" },
        { id: "9-5", title: "• Consolidated Strength", path: "/debit-credit-report/consolidated-strength" },
        { id: "9-6", title: "• Promotion / Higher Class Process", path: "/debit-credit-report/Promotion-Higher" },
        { id: "9-7", title: "• Cash Expenses", path: "/debit-credit-report/Cash-Expenses" },
        { id: "9-8", title: "• Bank Expenses", path: "/debit-credit-report/Bank-Expenses" },
        { id: "9-9", title: "• Trail Balance", path: "/debit-credit-report/Trail-Balance" },
        { id: "9-10", title: "• Backup Data", path: "/debit-credit-report/Backup-Data" },
      ],
    },
    {
      id: 10,
      title: "Library Management",
      icon: settingIcon,
      path: "/library",
      subItems: [
        { id: "10-1", title: "• Book Management", path: "/library/book-management" },
        { id: "10-2", title: "• Add New Book details", path: "/library/add-new-book" },
        { id: "10-3", title: "• Book Entry", path: "/library/book-entry" },
        { id: "10-4", title: "• Members Management", path: "/library/members-management" },
      ],
    },
    {
      id: 11,
      title: "Settings",
      icon: settingIcon,
      path: "/settings",
      subItems: [
        { id: "11-1", title: "• General Settings", path: "/settings/general" },
        { id: "11-2", title: "• User Settings", path: "/settings/user" },
      ],
    },
    {
      id: 12,
      title: "Logout",
      icon: logoutIcon,
      path: "/logout",
      subItems: [],
      onClick: handleLogoutClick,
    },
  ]

  const sidebarStyle = {
    backgroundColor: "#0B3D7B",
    minHeight: "100vh",
    width: "280px",
    position: "fixed",
    left: isMobile ? (isOpen ? "0" : "-280px") : "0",
    top: 0,
    bottom: 0,
    transition: "left 0.3s ease-in-out",
    zIndex: 1000,
  }

  const menuItemStyle = {
    backgroundColor: "transparent",
    border: "none",
    width: "100%",
    textAlign: "left",
    padding: "16px 20px",
    color: "white",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    position: "relative",
    fontSize: "16px",
  }

  const activeMenuItemStyle = {
    ...menuItemStyle,
    backgroundColor: "#1D1616",
  }

  const subMenuStyle = {
    paddingLeft: "56px",
    backgroundColor: "#1D1616",
    display: "flex",
    alignItems: "center",
    color: "white",
    padding: "12px 20px",
    border: "none",
    width: "100%",
    textAlign: "left",
    transition: "all 0.3s ease",
    fontSize: "15px",
  }

  const activeSubMenuStyle = {
    ...subMenuStyle,
    color: "#146FDF",
  }

  const iconStyle = {
    filter: "brightness(0) invert(1)",
  }

  const activeIconStyle = {
    ...iconStyle,
    filter: "none",
  }

  const toggleButtonStyle = {
    backgroundColor: "transparent",
    border: "none",
    color: "white",
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "16px",
    padding: "5px",
  }

  const handleNavigation = (path, itemId) => {
    setActiveItem(path)
    if (expandedItem === itemId) {
      setExpandedItem(null)
    } else {
      setExpandedItem(itemId)
    }
    const menuItem = menuItems.find((item) => item.id === itemId)
    if (menuItem && menuItem.onClick) {
      menuItem.onClick()
    } else if (!menuItems.find((item) => item.id === itemId)?.subItems?.length) {
      navigate(path)
      if (isMobile) {
        toggleSidebar()
      }
    }
  }

  const handleSubItemClick = (path) => {
    setActiveItem(path)
    navigate(path)
    if (isMobile) {
      toggleSidebar()
    }
  }

  const toggleSubmenu = (itemId, event) => {
    event.stopPropagation()
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  const isItemActive = (item) => {
    return (
      activeItem.startsWith(item.path) ||
      (item.subItems && item.subItems.some((subItem) => activeItem.startsWith(subItem.path)))
    )
  }

  return (
    <>
      <div style={sidebarStyle}>
        <div className="d-flex align-items-center my-3 my-lg-0 justify-content-center  p-lg-4 gap-3">
          <img
            src={logo || "/placeholder.svg"}
            alt="XPO Media Logo"
            className="img-fluid rounded-circle"
            style={{ maxWidth: "70px" }}
          />
          <span className="text-white fs-4 fw-semibold">XPO Media</span>
        </div>

        <nav className="mt-3">
          {menuItems.map((item) => (
            <div key={item.id} className="sidebar-item">
              <button
                onClick={() => handleNavigation(item.path, item.id)}
                style={isItemActive(item) ? activeMenuItemStyle : menuItemStyle}
                className="menu-item"
              >
                <img
                  src={item.icon || "/placeholder.svg"}
                  className="col-1"
                  alt={item.title}
                  style={isItemActive(item) ? activeIconStyle : iconStyle}
                />
                <span>{item.title}</span>
                {item.subItems && item.subItems.length > 0 && (
                  <button onClick={(e) => toggleSubmenu(item.id, e)} style={toggleButtonStyle}>
                    {expandedItem === item.id ? "-" : "+"}
                  </button>
                )}
              </button>
              {item.subItems && item.subItems.length > 0 && expandedItem === item.id && (
                <div className="sub-menu">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleSubItemClick(subItem.path)}
                      style={activeItem.startsWith(subItem.path) ? activeSubMenuStyle : subMenuStyle}
                      className="sub-menu-item ms-4"
                    >
                      {subItem.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <style>
          {`
            .sidebar-item {
              display: flex;
              flex-direction: column;
            }

            .menu-item:hover {
              background-color: #1D1616 !important;
              color: #146FDF !important;
            }

            .menu-item:hover img {
              filter: none !important;
            }

            .sub-menu-item:hover {
              background-color: #1D1616 !important;
              color: #146FDF !important;
            }

            nav {
              overflow-y: auto;
              max-height: calc(100vh - 100px);
              padding-bottom: 20px;
            }

            nav::-webkit-scrollbar {
              width: 6px;
            }

            nav::-webkit-scrollbar-track {
              background: transparent;
            }

            nav::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
            }

            nav::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }

            .sub-menu {
              overflow: hidden;
              transition: max-height 0.3s ease-in-out;
              background-color: #1D1616;
            }
          `}
        </style>
      </div>
      <LogoutModal isOpen={showLogoutModal} onClose={handleLogoutCancel} onConfirm={handleLogoutConfirm} />
    </>
  )
}

export default Sidebar

