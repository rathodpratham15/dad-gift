import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WhatsAppButton from "../components/WhatsAppButton";
import "../styles/Home.css";
import Onboarding from "../components/Onboarding";

interface City {
  name: string;
  image: string;
}

interface Banner {
  image: string;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
}

interface HomeConfig {
  banner: Banner;
  cities: City[];
}

const API = import.meta.env.VITE_API_URL;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API}/api/home`);
        setConfig(res.data);
      } catch (err) {
        console.error("Failed to fetch homepage config:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleNavigate = (path: string) => navigate(path);
  const handleCityClick = (city: string) => navigate(`/properties?city=${city}`);

  if (loading) {
    return <div className="loading-spinner">Loading homepage...</div>;
  }

  if (!config) {
    return (
      <div className="error-message">
        Failed to load homepage content.
      </div>
    );
  }

  return (
    <div>
      {/* Banner Section */}
      <Onboarding />
      <div className="unique-hero-section">
        <div className="unique-hero-content">
          <div className="unique-hero-text">
            <h1>{config.banner.heading}</h1>
            <p>{config.banner.subheading}</p>
            <div className="unique-hero-buttons">
              <button
                onClick={() => handleNavigate(config.banner.ctaLink)}
                className="unique-primary-button"
              >
                {config.banner.ctaText}
              </button>
            </div>
          </div>
          <div className="unique-hero-image">
            <img
              src={`${API}${config.banner.image}`}
              alt="Hero Banner"
              onError={(e) =>
              (e.currentTarget.src =
                "https://via.placeholder.com/500x300?text=Banner+Image+Not+Found")
              }
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
              src="https://c2d018d8ab71db2688205d1528e82501.cdn.bubble.io/cdn-cgi/image/w=128,h=128,f=auto,dpr=2,fit=contain/f1675908634239x704583542981828100/calendar%20%281%29.png"
              alt="Calendar icon"
              className="achievement-icon"
            />
            <h2 className="achievement-number">2000+</h2>
            <p className="achievement-text">Successful Apartment Tours</p>
          </div>
          <div className="achievement-item">
            <img
              src="https://c2d018d8ab71db2688205d1528e82501.cdn.bubble.io/cdn-cgi/image/w=128,h=128,f=auto,dpr=2,fit=contain/f1675908617352x523246597456362700/house.png"
              alt="House icon"
              className="achievement-icon"
            />
            <h2 className="achievement-number">280+</h2>
            <p className="achievement-text">Apartments Rented</p>
          </div>
          <div className="achievement-item">
            <img
              src="https://c2d018d8ab71db2688205d1528e82501.cdn.bubble.io/cdn-cgi/image/w=128,h=128,f=auto,dpr=2,fit=contain/f1675908321200x309829908910547840/dance.png"
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
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M15 15L21 21"/>
              </svg>
            </div>
            <h3>Search</h3>
            <p>Looking for apartments in Maharashtra? Search & select from our list of housing options.</p>
          </div>
          <div className="process-arrow">→</div>
          <div className="process-step">
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <path d="M16 2v4"/>
                <path d="M8 2v4"/>
                <path d="M3 10h18"/>
              </svg>
            </div>
            <h3>View</h3>
            <p>Shortlist apartments you are interested in and get all your questions answered by scheduling a live tour of these properties with us!</p>
          </div>
          <div className="process-arrow">→</div>
          <div className="process-step">
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <h3>Apply</h3>
            <p>Fast-track your application process by using our advanced software to apply to different properties, manage your documents, review and sign leases.</p>
          </div>
          <div className="process-arrow">→</div>
          <div className="process-step">
            <div className="icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <path d="M9 22V12h6v10"/>
              </svg>
            </div>
            <h3>Move-in</h3>
            <p>Use our dashboard to keep a tab on your payments, communication from your landlord/management, and receive your move-in instructions.</p>
          </div>
        </div>
        <div className="find-home-button">
          <button onClick={() => handleNavigate("/properties")} className="find-home">
            Find my Home
          </button>
        </div>
      </div>

      {/* Dynamic Cities Section */}
      <div className="cities-section">
        <h1 className="cities-title">Search by Cities...</h1>
        <div className="cities-grid">
          {config.cities.map((city) => (
            <div
              key={city.name}
              className="city-card"
              onClick={() => handleCityClick(city.name)}
            >
              <div className="city-image-container">
                <img
                  src={city.image ? `${API}${city.image}` : `https://source.unsplash.com/800x600/?${city.name},city,realestate`}
                  alt={`Houses in ${city.name}`}
                  className="city-image"
                  onError={(e) => {
                    e.currentTarget.src = `https://source.unsplash.com/800x600/?${city.name},city,realestate`;
                  }}
                />
                <div className="city-overlay">
                  <h3 className="city-title">Houses in {city.name}</h3>
                  <p className="city-description">Discover premium properties</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WhatsAppButton message="Hi! I'm interested in a property" />
    </div>
  );
};

export default Home;
