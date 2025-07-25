import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import PropertyListings from "./pages/PropertyLisitngs";
import PropertyDetails from "./pages/PropertyDetails";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import AdminPage from "./pages/AdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import AddToHomeScreen from "./components/AddToHomeScreen";
import ChatBot from "./components/Chatbot";
import Splash from "./components/Splash";
import Onboarding from "./components/Onboarding";
import AuthEntry from "./components/AuthEntry";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
// import useNotifications from "./hooks/useNotifications";

const API = import.meta.env.VITE_API_URL;

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const updateAdminStatus = () => {
    const role = localStorage.getItem("role");
    setIsAdmin(role === "admin");
  };

  useEffect(() => {
    updateAdminStatus();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`${API}/api/user/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAdmin(response.data.role === "admin");
        } catch (err) {
          // If token is invalid/expired, clear it and don't log error in console
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            setIsAdmin(false);
          } else {
            console.error("Error fetching role:", err);
          }
        }
      }
    };
    fetchRole();
  }, []);

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark", theme === "dark");
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Header isAdmin={isAdmin} onLogout={updateAdminStatus} />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<AuthEntry />} />
          <Route path="/login" element={<Login onLogin={updateAdminStatus} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/properties" element={<PropertyListings />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute isAdmin={isAdmin}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute isAdmin={isAdmin}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <AddToHomeScreen />
        <ChatBot />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
