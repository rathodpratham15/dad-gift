// src/pages/PropertyListings.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/PropertyListings.css";
import axios from "axios";
import Facilities from "../components/Facilities";
import WhatsAppButton from "../components/WhatsAppButton";
import AddToHomeScreenButton from "./../components/AddToHomeScreen";

interface Property {
    _id: string;
    title: string;
    type: string;
    price: number;
    rentPerMonth?: number;
    location: string;
    description: string;
    images: string[];
    facilities?: { name: string; value: string; icon?: string }[];
    views: number;
}

const PropertyListings: React.FC = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [minPrice, setMinPrice] = useState<string>("");
    const [maxPrice, setMaxPrice] = useState<string>("");
    const [propertyType, setPropertyType] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get("city");

    const propertiesPerPage = 12;

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            setError(null);

            try {
                const params: any = { page, limit: propertiesPerPage };
                if (searchQuery) params.query = searchQuery;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;
                if (propertyType) params.propertyType = propertyType;
                if (city) params.city = city;

                const response = await axios.get("http://localhost:3002/api/properties", {
                    params,
                });

                setProperties(response.data.properties || []);
                setTotalPages(Math.ceil((response.data.total || 0) / propertiesPerPage));
            } catch (err) {
                console.error("Error fetching properties:", err);
                setError("Failed to load properties. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [searchQuery, minPrice, maxPrice, propertyType, page, city]);

    return (
        <div className="relative">
            <div className="unique-property-listings-container">
                <h1 className="unique-property-title">
                    {city ? `Properties in ${city}` : "Find Your Dream Property"}
                </h1>

                {/* Search & Filter Section */}
                <div className="unique-search-bar">
                    <input
                        type="text"
                        placeholder="Search properties by title or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="unique-search-input"
                    />
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="unique-search-input"
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="unique-search-input"
                    />
                    <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="unique-search-select"
                    >
                        <option value="">All Types</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Condo">Condo</option>
                    </select>
                    <button className="unique-search-button" onClick={() => setPage(1)}>
                        Apply Filters
                    </button>
                </div>

                {error && <div className="unique-error-message">{error}</div>}

                {loading ? (
                    <div className="unique-loading-text">Loading...</div>
                ) : (
                    <div className="unique-property-grid">
                        {properties.length > 0 ? (
                            properties.map((property) => (
                                <Link to={`/properties/${property._id}`} key={property._id}>
                                    <div className="unique-property-card">
                                        {property.images && property.images.length > 0 ? (
                                            <img
                                                src={`http://localhost:3002${property.images[0]}`}
                                                alt={property.title}
                                                className="unique-property-card-img"
                                            />
                                        ) : (
                                            <div className="unique-placeholder-img">No Image Available</div>
                                        )}
                                        <div className="unique-property-card-content">
                                            <h2 className="unique-property-card-title">{property.title}</h2>
                                            <p className="unique-property-card-price">
                                                ${property.price.toLocaleString()}
                                            </p>
                                            <p className="unique-property-card-rent">
                                                Rent: {property.rentPerMonth ? `$${property.rentPerMonth.toLocaleString()}` : "N/A"}
                                            </p>
                                            <p className="unique-property-card-location">{property.location}</p>
                                            <p className="unique-property-card-views">Views: {property.views}</p>
                                            {property.facilities && property.facilities.length > 0 && (
                                                <div className="unique-property-card-facilities">
                                                    <Facilities facilities={property.facilities} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="unique-no-results">No properties found.</div>
                        )}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="unique-pagination-controls">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={`page-${index}`}
                                onClick={() => setPage(index + 1)}
                                className={page === index + 1 ? "active" : ""}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Buttons */}
            <AddToHomeScreenButton />
            <WhatsAppButton message="Hi! I'm interested in a property"/>
        </div>
    );
};

export default PropertyListings;