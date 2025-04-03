/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/UserDashboard.css";

interface Property {
    _id: string;
    title: string;
    type: string;
    price: number;
    location: string;
    images: string[]; // Updated for multiple images
}

const UserDashboard: React.FC = () => {
    const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [profile, setProfile] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not logged in.");
                setLoading(false);
                return;
            }

            try {
                const [profileResponse, favoritesResponse, historyResponse] = await Promise.all([
                    axios.get("http://localhost:3002/api/user/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:3002/api/user/favorites", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:3002/api/user/search-history", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setProfile(profileResponse.data);
                setFavoriteProperties(Array.isArray(favoritesResponse.data) ? favoritesResponse.data : []);
                setSearchHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
            } catch (err: any) {
                console.error("Error fetching user data:", err.message);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You are not logged in.");
                return;
            }

            await axios.put(
                "http://localhost:3002/api/user/profile",
                profile,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error.message);
            alert("Failed to update profile.");
        }
    };

    const handleRemoveFavorite = async (propertyId: string) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You are not logged in.");
                return;
            }

            await axios.delete(`http://localhost:3002/api/user/favorites/${propertyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFavoriteProperties((prev) => prev.filter((property) => property._id !== propertyId));
        } catch (error: any) {
            console.error("Error removing favorite:", error.message);
            alert("Failed to remove favorite property.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="user-dashboard-container">
            <h1 className="dashboard-title">User Dashboard</h1>

            {/* Profile Section */}
            <section className="dashboard-section">
                <h2>Profile Information</h2>
                <div className="profile-form">
                    <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Name"
                        className="profile-input"
                    />
                    <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Email"
                        className="profile-input"
                    />
                    <button onClick={handleProfileUpdate} className="profile-button">
                        Update Profile
                    </button>
                </div>
            </section>

            {/* Favorites Section */}
            <section className="dashboard-section">
                <h2>Favorite Properties</h2>
                <div className="favorite-properties">
                    {favoriteProperties.length > 0 ? (
                        favoriteProperties.map((property) => (
                            <div key={property._id} className="property-card">
                                <img
                                    src={`http://localhost:3002${property.images[0]}`} // Fixed image display
                                    alt={property.title}
                                    className="property-image"
                                />
                                <h3>{property.title}</h3>
                                <p>{property.location}</p>
                                <p>${property.price.toLocaleString()}</p>
                                <button
                                    onClick={() => handleRemoveFavorite(property._id)}
                                    className="remove-favorite-button"
                                >
                                    Remove from Favorites
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No favorite properties found.</p>
                    )}
                </div>
            </section>

            {/* Search History */}
            <section className="dashboard-section">
                <h2>Search History</h2>
                <ul className="search-history">
                    {searchHistory.length > 0 ? (
                        searchHistory.map((query, index) => <li key={index}>{query}</li>)
                    ) : (
                        <p>No search history found.</p>
                    )}
                </ul>
            </section>
        </div>
    );
};

export default UserDashboard;
