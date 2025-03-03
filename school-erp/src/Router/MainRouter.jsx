import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute } from "./PublicRouter";
import { PrivateRoute } from "./PrivateRouter";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/MainPages/Home";
import MainContentPage from "../components/MainContent/MainContentPage";
import AdministrationRoute from "./SubRouters/AdministrationRoute";
import AdministrationMaster from "./SubRouters/AdmissionMaster";
import TransactionRoute from "./SubRouters/TransactionRoute";
import TransportRoute from "./SubRouters/TransportRoute";
import CollectionReportRoute from "./SubRouters/CollectionReportRoute";
import PaymentReport from "../pages/MainPages/PaymentReport";
import PaymentReportRoute from "./SubRouters/PaymentReportRoute";
import DebitCardReportRoute from "./SubRouters/DebitCardReportRoute";
import LibraryManagementRoute from "./SubRouters/LibraryManagementRoute";
import BookRoutes from "./SubRouters/BookRoutes";
import Settings from "../pages/MainPages/Settings";


function MainRouter() {
  return (
    <Routes>
      {/* Redirect root to login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Private Routes */}
      <Route
        path="/home"
        element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PublicRoute>
            <Settings />
          </PublicRoute>
        }
      />
      <Route
        path="/main"
        element={
          <PrivateRoute>
            <MainContentPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <PublicRoute>
            <AdministrationRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/admission/*"
        element={
          <PublicRoute>
            <AdministrationMaster />
          </PublicRoute>
        }
      />
      <Route
        path="/transaction/*"
        element={
          <PublicRoute>
            <TransactionRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/transport/*"
        element={
          <PublicRoute>
            <TransportRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/Collection-report/*"
        element={
          <PublicRoute>
            <CollectionReportRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/payment-report/*"
        element={
          <PublicRoute>
            <PaymentReportRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/payment-report/"
        element={
          <PublicRoute>
            <PaymentReport />
          </PublicRoute>
        }
      />
      <Route
        path="/debit-credit-report/*"
        element={
          <PublicRoute>
            <DebitCardReportRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/library/*"
        element={
          <PublicRoute>
            <LibraryManagementRoute />
          </PublicRoute>
        }
      />
      <Route
        path="/book/*"
        element={
          <PublicRoute>
            <BookRoutes />
          </PublicRoute>
        }
      />
    
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default MainRouter;