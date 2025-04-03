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
        setMenuOpen(false);
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
                <button
                    className="unique-nav-toggle"
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    {menuOpen ? <X /> : <Menu />}
                </button>
                <div className={`unique-hamburger-menu ${menuOpen ? "open" : "closed"}`}>
                    <ul className="hamburger-menu-list">
                        {navItems.map((item) => (
                            <li
                                key={item.text}
                                onClick={() => handleMenuAction(item.href)}
                                className="menu-item"
                            >
                                <item.icon className="menu-icon" />
                                {item.text}
                            </li>
                        ))}
                        <li
                            onClick={() => handleMenuAction("/user-dashboard")}
                            className="menu-item"
                        >
                            <User className="menu-icon" />
                            User Dashboard
                        </li>
                        {isAdmin && (
                            <>
                                <li onClick={() => handleMenuAction("/admin")} className="menu-item">
                                    <Shield className="menu-icon" />
                                    Admin Page
                                </li>
                                <li
                                    onClick={() => handleMenuAction("/admin-dashboard")}
                                    className="menu-item"
                                >
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
                <div className="unique-nav-main">
                    {navItems.map((item) => (
                        <a key={item.text} href={item.href} className="unique-nav-link">
                            <item.icon className="unique-nav-icon" />
                            {item.text}
                        </a>
                    ))}
                </div>
            </nav>
        </header>
    );
};

export default Header;