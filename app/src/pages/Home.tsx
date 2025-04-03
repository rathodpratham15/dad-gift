import React from "react";
import { useNavigate } from "react-router-dom";
import WhatsAppButton from "../components/WhatsAppButton";
import "../styles/Home.css";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigateToProperties = () => {
        navigate("/properties");
    };

    const handleNavigateToRoommates = () => {
        navigate("/roommates");
    };

    const handleCityClick = (city: string) => {
        navigate(`/properties?city=${city}`);
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="unique-hero-section">
                <div className="unique-hero-content">
                    <div className="unique-hero-text">
                        <h1>
                            Renting made <span className="highlight-text">quick & simple.</span>
                        </h1>
                        <p>Your Boston Housing Journey Starts Here. Simple Solutions for Renters</p>
                        <div className="unique-hero-buttons">
                            <button
                                onClick={handleNavigateToProperties}
                                className="unique-primary-button"
                            >
                                Find my Home
                            </button>
                            <button
                                onClick={handleNavigateToRoommates}
                                className="unique-secondary-button"
                            >
                                Find Roommates
                            </button>
                        </div>
                    </div>
                    <div className="unique-hero-image">
                        <img
                            src="src/images/House.png" // Replace with the actual path to your image
                            alt="Hero Illustration"
                        />
                    </div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="achievements-container">
                <h1 className="achievements-title">What we have achieved in the past one year!</h1>
                <div className="achievements-grid">
                    <div className="achievement-item">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675908634239x704583542981828100%2Fcalendar%2520%25281%2529.png?w=128&amp;h=128&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="Calendar icon"
                            className="achievement-icon"
                        />
                        <h2 className="achievement-number">2000+</h2>
                        <p className="achievement-text">Successful Apartment Tours</p>
                    </div>

                    <div className="achievement-item">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675908617352x523246597456362700%2Fhouse.png?w=128&amp;h=128&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="House icon"
                            className="achievement-icon"
                        />
                        <h2 className="achievement-number">280+</h2>
                        <p className="achievement-text">Apartments Rented</p>
                    </div>

                    <div className="achievement-item">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675908321200x309829908910547840%2Fdance.png?w=128&amp;h=128&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="Happy Renters Icon"
                            className="achievement-icon"
                        />
                        <h2 className="achievement-number">1100+</h2>
                        <p className="achievement-text">Happy Renters</p>
                    </div>
                </div>
            </div>

            {/* Process Section */}
            <div className="process-section">
                <h1 className="process-title">We take care of your entire renting process!</h1>
                <div className="process-steps">
                    <div className="process-step">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675913608569x794451685672768100%2Fsearch.png?w=64&amp;h=64&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="Search Icon"
                            className="process-icon"
                        />
                        <h2 className="process-step-title">Search</h2>
                        <p className="process-step-description">
                            Looking for apartments in Boston? Search & select from our list of housing options.
                        </p>
                    </div>
                    <div className="arrow">→</div>
                    <div className="process-step">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675913621395x875452682628402200%2Fcalendar%2520%25282%2529.png?w=64&amp;h=64&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="View Icon"
                            className="process-icon"
                        />
                        <h2 className="process-step-title">View</h2>
                        <p className="process-step-description">
                            Shortlist apartments you are interested in and get all your questions answered by scheduling a live tour of these properties with us!
                        </p>
                    </div>
                    <div className="arrow">→</div>
                    <div className="process-step">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675913742544x940341986130713600%2Fcheck-list.png?w=64&amp;h=64&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="Apply Icon"
                            className="process-icon"
                        />
                        <h2 className="process-step-title">Apply</h2>
                        <p className="process-step-description">
                            Fast-track your application process by using our advanced software to apply to different properties, manage your documents, review and sign leases.
                        </p>
                    </div>
                    <div className="arrow">→</div>
                    <div className="process-step">
                        <img
                            src="https://d1muf25xaso8hp.cloudfront.net/https%3A%2F%2Fc2d018d8ab71db2688205d1528e82501.cdn.bubble.io%2Ff1675914021662x565068316337501200%2Fhome.png?w=64&amp;h=64&amp;auto=compress&amp;dpr=2&amp;fit=max"
                            alt="Move-in Icon"
                            className="process-icon"
                        />
                        <h2 className="process-step-title">Move-in</h2>
                        <p className="process-step-description">
                            Use our dashboard to keep a tab on your payments, communication from your landlord/management, and receive your move-in instructions.
                        </p>
                    </div>
                </div>
                <div className="process-buttons">
                    <button
                        onClick={handleNavigateToProperties}
                        className="unique-primary-button"
                    >
                        Find my Home
                    </button>
                    <button
                        onClick={handleNavigateToRoommates}
                        className="unique-secondary-button"
                    >
                        Find Roommates
                    </button>
                </div>
            </div>
            {/* Search by Cities Section */}
            {/* Cities Section */}
            <div className="cities-section">
                <h1 className="cities-title">Search by Cities...</h1>
                <div className="cities-grid">
                    <div
                        className="city-card"
                        onClick={() => handleCityClick("Thane")}
                    >
                        <img
                            src="src/images/Thane.jpeg"
                            alt="Houses in Thane"
                            className="city-image"
                        />
                        <p className="city-name">Houses in Thane</p>
                    </div>
                    <div
                        className="city-card"
                        onClick={() => handleCityClick("Bandra")}
                    >
                        <img
                            src="src/images/Bandra.jpeg"
                            alt="Houses in Bandra"
                            className="city-image"
                        />
                        <p className="city-name">Houses in Bandra</p>
                    </div>
                    <div
                        className="city-card"
                        onClick={() => handleCityClick("Chembur")}
                    >
                        <img
                            src="src/images/Chembur.jpeg"
                            alt="Houses in Chembur"
                            className="city-image"
                        />
                        <p className="city-name">Houses in Chembur</p>
                    </div>
                </div>
            </div>
            <WhatsAppButton message="Hi! I'm interested in a property" />
        </div>
    );
};


export default Home;

