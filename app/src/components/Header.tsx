import React, { useState, useEffect, useRef } from "react";
import {
    Home,
    Building,
    Info,
    Phone,
    Menu,
    X,
    User,
    LogOut,
    Shield,
    Moon,
    Sun,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css";

interface HeaderProps {
    isAdmin: boolean;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );
    const drawerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const navItems = [
        { href: "/home", icon: Home, text: "Home" },
        { href: "/properties", icon: Building, text: "Properties" },
        { href: "/about", icon: Info, text: "About" },
        { href: "/contact", icon: Phone, text: "Contact" },
    ];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                drawerRef.current &&
                !drawerRef.current.contains(e.target as Node)
            ) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    useEffect(() => {
        document.body.classList.toggle("dark", isDarkMode);
    }, [isDarkMode]);

    const handleThemeToggle = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
        document.body.classList.toggle("dark", newTheme);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setMenuOpen(false);
        onLogout();
        navigate("/login");
    };

    const handleMenuAction = (path: string) => {
        const role = localStorage.getItem("role");
        if (
            (path === "/admin" || path === "/admin-dashboard") &&
            role !== "admin"
        ) {
            alert("Access Denied: Admins Only");
            return;
        }
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <header className={`unique-header ${scrolled ? "unique-header-scrolled" : ""}`}>
            <nav className="unique-nav-container">
                <a href="/home" className="unique-nav-logo">Real Estate</a>

                <div className="unique-nav-main">
                    {navItems.map((item) => (
                        <a key={item.text} href={item.href} className="unique-nav-link">
                            <item.icon className="unique-nav-icon" />
                            {item.text}
                        </a>
                    ))}
                </div>

                <div className="unique-nav-controls">
                    <button className="dark-mode-toggle" onClick={handleThemeToggle}>
                        {isDarkMode ? <Sun /> : <Moon />}
                    </button>
                    <button className="unique-nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {menuOpen && <div className="unique-backdrop" onClick={() => setMenuOpen(false)} />}

                <div
                    ref={drawerRef}
                    className={`unique-hamburger-drawer ${menuOpen ? "open" : ""}`}
                >
                    <ul className="hamburger-menu-list">
                        {isMobile && (
                            <>
                                <li className="menu-section-title">Main</li>
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
                            </>
                        )}
                        <li className="menu-section-title">User</li>

                        {token && (
                            <li
                                onClick={() => handleMenuAction("/user-dashboard")}
                                className="menu-item"
                            >
                                <User className="menu-icon" />
                                User Dashboard
                            </li>
                        )}

                        {token ? (
                            <li onClick={handleLogout} className="menu-item">
                                <LogOut className="menu-icon" />
                                Logout
                            </li>
                        ) : (
                            <li
                                onClick={() => handleMenuAction("/login")}
                                className="menu-item"
                            >
                                <User className="menu-icon" />
                                Login
                            </li>
                        )}

                        {isAdmin && token && (
                            <>
                                <li className="menu-section-title">Admin</li>
                                <li
                                    onClick={() => handleMenuAction("/admin")}
                                    className="menu-item"
                                >
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
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
