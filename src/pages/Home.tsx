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
        <div className="process-steps">{/* ... */}</div>
        <div className="process-buttons">
          <button onClick={() => handleNavigate("/properties")} className="unique-primary-button">
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
              <img
                src={`${API}${city.image}`}
                alt={`Houses in ${city.name}`}
                className="city-image"
                onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/300x200?text=Image+Not+Found")
                }
              />
              <p className="city-name">Houses in {city.name}</p>
            </div>
          ))}
        </div>
      </div>

      <WhatsAppButton message="Hi! I'm interested in a property" />
    </div>
  );
};

export default Home;
