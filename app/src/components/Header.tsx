// /* eslint-disable @typescript-eslint/no-unused-vars */
// import React, { useState, useEffect } from "react";
// import { Home, Building, Info, Phone, Menu, X, User, LogOut, Shield } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "../styles/Header.css";

// interface HeaderProps {
//     isAdmin: boolean;
//     onLogout: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ isAdmin, onLogout }) => {
//     const [menuOpen, setMenuOpen] = useState(false);
//     const [scrolled, setScrolled] = useState(false);
//     const [loggedIn, setLoggedIn] = useState(false);
//     const navigate = useNavigate();
//     const location = useLocation();

//     useEffect(() => {
//         const handleScroll = () => setScrolled(window.scrollY > 20);

//         const token = localStorage.getItem("token");
//         setLoggedIn(!!token); // Update loggedIn state
//         console.log("Token:", token); // Debugging

//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, [onLogout]);

//     const toggleMenu = () => setMenuOpen(!menuOpen);

//     const handleLogout = () => {
//         localStorage.clear(); // Clear token
//         setLoggedIn(false); // Update loggedIn state
//         onLogout(); // Trigger logout callback
//         setMenuOpen(false); // Close the hamburger menu
//         navigate("/login"); // Redirect to login
//     };

//     const handleMenuAction = (path: string) => {
//         console.log("Navigating to:", path); // Debug log
//         const token = localStorage.getItem("token");
//         const role = localStorage.getItem("role");

//         if (!token && path === "/user-dashboard") {
//             alert("Please log in to access the User Dashboard.");
//             navigate("/login");
//         } else if (role !== "admin" && path === "/admin-dashboard") {
//             alert("Access denied: Admins only.");
//         } else {
//             navigate(path);
//         }
//         setMenuOpen(false); // Close the menu after navigation
//     };


//     // Check if current page is login or signup
//     const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

//     const navItems = [
//         { href: "/home", icon: Home, text: "Home" },
//         { href: "/properties", icon: Building, text: "Properties" },
//         { href: "/about", icon: Info, text: "About" },
//         { href: "/contact", icon: Phone, text: "Contact" },
//     ];

//     return (
//         <header className={`unique-header ${scrolled ? "unique-header-scrolled" : ""}`}>
//             <nav className="unique-nav-container">
//                 <div className="unique-nav-brand">
//                     <a href="/home" className="unique-nav-logo">
//                         <svg
//                             width="40"
//                             height="40"
//                             viewBox="0 0 40 40"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <rect width="40" height="40" rx="8" fill="#3B82F6" />
//                             <path d="M20 8L32 28H8L20 8Z" fill="white" />
//                         </svg>
//                         <span>Real Estate</span>
//                     </a>
//                 </div>
//                 {/* Main Navigation Items */}
//                 <div className="unique-nav-main">
//                     {navItems.map((item) => (
//                         <a key={item.text} href={item.href} className="unique-nav-link">
//                             <item.icon className="unique-nav-icon" />
//                             {item.text}
//                         </a>
//                     ))}
//                 </div>
//                 {/* Hamburger Menu Toggle */}
//                 {!isAuthPage && ( // Hide on login and signup pages
//                     <button
//                         className="unique-nav-toggle"
//                         onClick={toggleMenu}
//                         aria-label="Toggle navigation menu"
//                     >
//                         {menuOpen ? <X /> : <Menu />}
//                     </button>
//                 )}
//                 {/* Hamburger Menu */}
//                 {menuOpen && (
//                     <div className="unique-hamburger-menu">
//                         <ul className="hamburger-menu-list">
//                             {!isAdmin && (
//                                 <li
//                                     onClick={() => handleMenuAction("/user-dashboard")}
//                                     className="menu-item"
//                                 >
//                                     <User className="menu-icon" />
//                                     User Dashboard
//                                 </li>
//                             )}
//                             {isAdmin && (
//                                 <>
//                                     <li
//                                         onClick={() => handleMenuAction("/admin")}
//                                         className="menu-item"
//                                     >
//                                         <Shield className="menu-icon" />
//                                         Admin Page
//                                     </li>
//                                     <li
//                                         onClick={() => handleMenuAction("/admin-dashboard")}
//                                         className="menu-item"
//                                     >
//                                         <User className="menu-icon" />
//                                         Admin Dashboard
//                                     </li>
//                                 </>
//                             )}
//                             <li onClick={handleLogout} className="menu-item">
//                                 <LogOut className="menu-icon" />
//                                 Logout
//                             </li>
//                         </ul>
//                     </div>
//                 )}
//             </nav>
//         </header>
//     );
// };

// export default Header;

import React, { useState, useEffect } from "react";
import { Home, Building, Info, Phone, Menu, X, User, LogOut, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

interface HeaderProps {
    isAdmin: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        onLogout();
        navigate("/login");
    };

    const handleMenuAction = (path: string) => {
        const role = localStorage.getItem("role");
        if ((path === "/admin" || path === "/admin-dashboard") && role !== "admin") {
            alert("Access Denied: Admins Only");
            return;
        }
        navigate(path);
        setMenuOpen(false);
    };

    const navItems = [
        { href: "/home", icon: Home, text: "Home" },
        { href: "/properties", icon: Building, text: "Properties" },
        { href: "/about", icon: Info, text: "About" },
        { href: "/contact", icon: Phone, text: "Contact" },
    ];

    return (
        <header className={`unique-header ${scrolled ? "unique-header-scrolled" : ""}`}>
            <nav className="unique-nav-container">
                <div className="unique-nav-brand">
                    <a href="/home" className="unique-nav-logo">
                        <span>Real Estate</span>
                    </a>
                </div>
                <div className="unique-nav-main">
                    {navItems.map((item) => (
                        <a key={item.text} href={item.href} className="unique-nav-link">
                            <item.icon className="unique-nav-icon" />
                            {item.text}
                        </a>
                    ))}
                </div>
                <button
                    className="unique-nav-toggle"
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>
                {menuOpen && (
                    <div className="unique-hamburger-menu">
                        <ul className="hamburger-menu-list">
                            <li onClick={() => handleMenuAction("/user-dashboard")} className="menu-item">
                                <User className="menu-icon" />
                                User Dashboard
                            </li>
                            {isAdmin && (
                                <>
                                    <li onClick={() => handleMenuAction("/admin")} className="menu-item">
                                        <Shield className="menu-icon" />
                                        Admin Page
                                    </li>
                                    <li onClick={() => handleMenuAction("/admin-dashboard")} className="menu-item">
                                        <Shield className="menu-icon" />
                                        Admin Dashboard
                                    </li>
                                </>
                            )}
                            <li onClick={handleLogout} className="menu-item">
                                <LogOut className="menu-icon" />
                                Logout
                            </li>
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
