import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import AddToHomeScreen from "./components/AddToHomeScreen"; // ⬅️ New component
import ChatBot from "./components/Chatbot";
import axios from "axios";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  const updateAdminStatus = () => {
    const role = localStorage.getItem("role");
    console.log("User role:", role);
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
          const response = await axios.get("http://localhost:3002/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAdmin(response.data.role === "admin");
        } catch (err) {
          console.error("Error fetching role:", err);
        }
      }
    };
    fetchRole();
  }, []);

  return (
    <Router>
      <Header isAdmin={isAdmin} onLogout={updateAdminStatus} />
      <Routes>
        <Route path="/" element={<Login onLogin={updateAdminStatus} />} />
        <Route path="/login" element={<Login onLogin={updateAdminStatus} />} />
        <Route path="/signup" element={<Signup />} />
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
      </Routes>

      {/* Custom A2HS prompt */}
      <AddToHomeScreen />
      <ChatBot />
    </Router>
  );
}

export default App;




// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { useState, useEffect } from "react";
// import Header from "./components/Header";
// import Home from "./pages/Home";
// import PropertyListings from "./pages/PropertyLisitngs";
// import PropertyDetails from "./pages/PropertyDetails";
// import AboutUs from "./pages/AboutUs";
// import Contact from "./pages/Contact";
// import AdminPage from "./pages/AdminPage";
// import AdminDashboard from "./pages/AdminDashboard";
// import UserDashboard from "./pages/UserDashboard";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import ProtectedRoute from "./components/ProtectedRoute";
// import axios from "axios";

// function App() {
//   const [isAdmin, setIsAdmin] = useState(false);

//   const updateAdminStatus = () => {
//     const role = localStorage.getItem("role");
//     console.log("User role:", role); // Debug log
//     setIsAdmin(role === "admin");
//   };

//   useEffect(() => {
//     updateAdminStatus();
//   }, []);

//   useEffect(() => {
//     const fetchRole = async () => {
//       const token = localStorage.getItem("token");
//       if (token) {
//         try {
//           const response = await axios.get("http://localhost:3002/api/user/profile", {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           setIsAdmin(response.data.role === "admin");
//         } catch (err) {
//           console.error("Error fetching role:", err);
//         }
//       }
//     };
//     fetchRole();
//   }, []);

//   return (
//     <Router>
//       <Header isAdmin={isAdmin} onLogout={updateAdminStatus} />
//       <Routes>
//         <Route path="/" element={<Login onLogin={updateAdminStatus} />} />
//         <Route path="/login" element={<Login onLogin={updateAdminStatus} />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/properties" element={<PropertyListings />} />
//         <Route path="/properties/:id" element={<PropertyDetails />} />
//         <Route path="/about" element={<AboutUs />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute isAdmin={isAdmin}>
//               <AdminPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/admin-dashboard"
//           element={
//             <ProtectedRoute isAdmin={isAdmin}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/user-dashboard" element={<UserDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// ---------------
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { useState, useEffect } from "react";
// import Header from "./components/Header";
// import Home from "./pages/Home";
// import PropertyListings from "./pages/PropertyLisitngs";
// import PropertyDetails from "./pages/PropertyDetails";
// import AdminPage from "./pages/AdminPage";
// import AdminDashboard from "./pages/AdminDashboard";
// import UserDashboard from "./pages/UserDashboard";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import ProtectedRoute from "./components/ProtectedRoute";

// function App() {
//   const [isAdmin, setIsAdmin] = useState(false);

//   const updateAdminStatus = () => {
//     const role = localStorage.getItem("role");
//     setIsAdmin(role === "admin");
//   };

//   useEffect(() => {
//     updateAdminStatus();
//   }, []);

//   return (
//     <Router>
//       <Header isAdmin={isAdmin} onLogout={updateAdminStatus} />
//       <Routes>
//         <Route path="/" element={<Login onLogin={updateAdminStatus} />} />
//         <Route path="/login" element={<Login onLogin={updateAdminStatus} />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/properties" element={<PropertyListings />} />
//         <Route path="/property-details/:id" element={<PropertyDetails />} />
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute isAdmin={isAdmin}>
//               <AdminPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/admin-dashboard"
//           element={
//             <ProtectedRoute isAdmin={isAdmin}>
//               <AdminDashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/user-dashboard" element={<UserDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
