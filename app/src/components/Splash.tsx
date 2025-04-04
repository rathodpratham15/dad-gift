import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Splash.css";

const Splash: React.FC = () => {
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
                const hasSeen = localStorage.getItem("has_seen_onboarding");
                navigate(hasSeen === "true" ? "/auth" : "/onboarding");
            }, 500); // after fade
        }, 2000); // splash duration

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
            <h1 className="splash-title">🏠 Real Estate</h1>
        </div>
    );
};

export default Splash;
