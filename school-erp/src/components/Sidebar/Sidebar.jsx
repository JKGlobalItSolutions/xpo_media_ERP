import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "bootstrap/dist/css/bootstrap.min.css"

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

function Sidebar({ isOpen, toggleSidebar, isMobile }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeItem, setActiveItem] = useState(location.pathname)
  const [expandedItem, setExpandedItem] = useState(null)

  useEffect(() => {
    const activeParent = menuItems.find(
      (item) => item.subItems && item.subItems.some((subItem) => location.pathname.startsWith(subItem.path)),
    )
    if (activeParent) {
      setExpandedItem(activeParent.id)
    }
  }, [location.pathname])

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
        // { id: "2-4", title: "• Subject Head", path: "/admin/subject-head" },
        // { id: "2-5", title: "• Course Head", path: "/admin/course-head" },
        { id: "2-6", title: "• Community and Caste Setup", path: "/admin/community-setup" },
        { id: "2-7", title: "• Parent Occupation Setup", path: "/admin/occupation-setup" },
        { id: "2-8", title: "• Receipt Setup", path: "/admin/receipt-setup" },
        { id: "2-9", title: "• Payment Setup", path: "/admin/payment-setup" },
        // { id: "2-10", title: "• Staff Master", path: "/admin/staff-master" },
        // { id: "2-11", title: "• Flash Screen", path: "/admin/flash-screen" },
        // { id: "2-12", title: "• Password Setup", path: "/admin/password-setup" },
        { id: "2-13", title: "• Certificate Preparation", path: "/admin/certificate" },
      ],
    },
    {
      id: 3,
      title: "Admission Master",
      icon: admissionIcon,
      path: "/jaga",
      subItems: [
        { id: "3-1", title: "• External master Setup/Enquiry", path: "/admission/enquiry" },
        { id: "3-1", title: "• Admission Form", path: "/jaga/new-admission" },
        { id: "3-2", title: "• Barcode Design", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Student Detail Edit", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Student Details Report", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Transfer Certificate", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Demand Report", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Section Replace", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Arrear / Fee Updating", path: "/jaga/admission-list" },
        { id: "3-3", title: "• Bill Cancel", path: "/jaga/admission-list" },``
      ],
    },
    {
      id: 4,
      title: "Transaction",
      icon: transactionIcon,
      path: "/transaction",
      subItems: [
        { id: "4-1", title: "• Fee Collection", path: "/transaction/fee-collection" },
        { id: "4-2", title: "• Payment Entry", path: "/transaction/payment-entry" },
      ],
    },
    {
      id: 5,
      title: "Transport",
      icon: transportIcon,
      path: "/transport",
      subItems: [
        { id: "5-1", title: "• Route Setup", path: "/transport/route-setup" },
        { id: "5-2", title: "• Vehicle Setup", path: "/transport/vehicle-setup" },
      ],
    },
    {
      id: 6,
      title: "Collection Report",
      icon: collectionIcon,
      path: "/collection-report",
      subItems: [
        { id: "6-1", title: "• Daily Collection", path: "/collection-report/daily" },
        { id: "6-2", title: "• Monthly Collection", path: "/collection-report/monthly" },
      ],
    },
    {
      id: 7,
      title: "Payment Reports",
      icon: paymentIcon,
      path: "/payment-reports",
      subItems: [
        { id: "7-1", title: "• Daily Payments", path: "/payment-reports/daily" },
        { id: "7-2", title: "• Monthly Payments", path: "/payment-reports/monthly" },
      ],
    },
    {
      id: 8,
      title: "Debit/Credit Report",
      icon: debitIcon,
      path: "/debit-credit-report",
      subItems: [
        { id: "8-1", title: "• Debit Report", path: "/debit-credit-report/debit" },
        { id: "8-2", title: "• Credit Report", path: "/debit-credit-report/credit" },
      ],
    },
    {
      id: 9,
      title: "Settings",
      icon: settingIcon,
      path: "/settings",
      subItems: [
        { id: "9-1", title: "• General Settings", path: "/settings/general" },
        { id: "9-2", title: "• User Settings", path: "/settings/user" },
      ],
    },
    {
      id: 10,
      title: "Logout",
      icon: logoutIcon,
      path: "/logout",
      subItems: [],
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
    if (!menuItems.find((item) => item.id === itemId)?.subItems?.length) {
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
              {item.subItems.length > 0 && (
                <button onClick={(e) => toggleSubmenu(item.id, e)} style={toggleButtonStyle}>
                  {expandedItem === item.id ? "-" : "+"}
                </button>
              )}
            </button>
            {item.subItems.length > 0 && expandedItem === item.id && (
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
  )
}

export default Sidebar

