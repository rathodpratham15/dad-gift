import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Onboarding.css";

const slides = [
    {
        title: "Welcome to Real Estate!",
        description: "Find your perfect home or roommate with ease.",
        image: "https://cdn-icons-png.flaticon.com/512/619/619153.png",
    },
    {
        title: "Smart Property Search",
        description: "Filter by city, price, type and explore listings.",
        image: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
    },
    {
        title: "User Dashboard",
        description: "Login to save favorites, track views, and more.",
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
];

const Onboarding: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const shouldShow = localStorage.getItem("has_seen_onboarding");
        if (!shouldShow || shouldShow === "false") {
            setVisible(true);
        }
    }, []);

    const nextSlide = () => {
        if (current < slides.length - 1) {
            setCurrent((prev) => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const skip = () => completeOnboarding();

    const completeOnboarding = () => {
        localStorage.setItem("has_seen_onboarding", "true");
        localStorage.setItem("onboarding_complete", "true");
        localStorage.setItem("show_onboarding", "false");
        setVisible(false);
        navigate("/auth");
    };

    if (!visible) return null;

    const slide = slides[current];
    const progress = ((current + 1) / slides.length) * 100;

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-container">
                <img src={slide.image} alt={slide.title} className="onboarding-image" />
                <h2 className="onboarding-title">{slide.title}</h2>
                <p className="onboarding-description">{slide.description}</p>

                <div className="onboarding-progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="onboarding-buttons">
                    <button onClick={skip} className="onboarding-skip">Skip</button>
                    <button onClick={nextSlide} className="onboarding-next">
                        {current === slides.length - 1 ? "Done" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
