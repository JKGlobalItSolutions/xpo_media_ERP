import { Routes, Route, Navigate } from "react-router-dom";
import { PublicRoute } from "./PublicRouter";
import { PrivateRoute } from "./PrivateRouter";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Home";
import MainContentPage from "../components/MainContent/MainContentPage";
import Administration from "../pages/Administration";
import AdministrationRoute from "./SubRouters/AdministrationRoute";

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
    
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default MainRouter;