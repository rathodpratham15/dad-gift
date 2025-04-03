/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDashboard.css";

interface Property {
    _id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
}

interface SearchHistory {
    _id: string;
    query: string;
    timestamp: string;
}

const UserDashboard: React.FC = () => {
    const [favorites, setFavorites] = useState<Property[]>([]);
    const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const [favoritesResponse, searchHistoryResponse] = await Promise.all([
                    axios.get("http://localhost:3002/api/user/favorites", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:3002/api/user/search-history", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setFavorites(favoritesResponse.data || []);
                setSearchHistory(searchHistoryResponse.data || []);
            } catch (err: any) {
                console.error("Error fetching user data:", err);
                setError("Failed to load user data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleRemoveFavorite = async (propertyId: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:3002/api/user/favorites/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(favorites.filter((fav) => fav._id !== propertyId));
            alert("Property removed from favorites!");
        } catch (err) {
            console.error("Error removing favorite:", err);
            alert("Failed to remove property from favorites.");
        }
    };

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    if (error) {
        return <div className="dashboard-error">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">User Dashboard</h1>

            {/* Favorite Properties */}
            <section className="favorites-section">
                <h2 className="section-title">Favorite Properties</h2>
                {favorites.length > 0 ? (
                    <div className="favorites-grid">
                        {favorites.map((property) => (
                            <div key={property._id} className="property-card">
                                <img
                                    src={`http://localhost:3002${property.images[0]}`}
                                    alt={property.title}
                                    className="property-image"
                                    loading="lazy"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/250x180?text=Image+Not+Found")}
                                />
                                <div className="property-info">
                                    <h3>{property.title}</h3>
                                    <p>Price: ${property.price.toLocaleString()}</p>
                                    <p>Location: {property.location}</p>
                                    <button
                                        onClick={() => handleRemoveFavorite(property._id)}
                                        className="remove-favorite-button"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => navigate(`/properties/${property._id}`)}
                                        className="view-details-button"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-favorites">No favorite properties yet.</p>
                )}
            </section>

            {/* Search History */}
            <section className="search-history-section">
                <h2 className="section-title">Search History</h2>
                {searchHistory.length > 0 ? (
                    <ul className="search-history-list">
                        {searchHistory.map((entry) => (
                            <li key={entry._id} className="search-history-item">
                                <span>{entry.query}</span>
                                <span className="timestamp">
                                    {new Date(entry.timestamp).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-history">No search history available.</p>
                )}
            </section>
        </div>
    );
};

export default UserDashboard;