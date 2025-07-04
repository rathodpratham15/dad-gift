/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/PropertyDetails.css";
import axios from "axios";
import Facilities from "../components/Facilities";
import WhatsAppButton from "../components/WhatsAppButton";
import { MapContainer, TileLayer, Marker, MapContainerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, LatLngTuple } from "leaflet";

const API = import.meta.env.VITE_API_URL;

interface Property {
    _id: string;
    title: string;
    type: string;
    price: number;
    rentPerMonth?: number;
    location: string;
    coordinates?: { type: string; coordinates: [number, number] };
    coordinatesWarning?: boolean;
    description: string;
    images: string[];
    facilities?: { name: string; value: string; icon?: string }[];
    views: number;
}

interface MapComponentProps extends Omit<MapContainerProps, 'center'> {
    center: LatLngExpression;
    properties: Property[];
}

const MapComponent: React.FC<MapComponentProps> = ({ center, properties }) => (
    <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {properties.map((prop) =>
            prop.coordinates?.coordinates && (
                <Marker key={prop._id} position={[prop.coordinates.coordinates[1], prop.coordinates.coordinates[0]]} />
            )
        )}
    </MapContainer>
);

const PropertyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [similarByLocation, setSimilarByLocation] = useState<Property[]>([]);
    const [similarByPrice, setSimilarByPrice] = useState<Property[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");
    const [radius, setRadius] = useState<number>(5);

    useEffect(() => {
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            setError("Invalid property ID format.");
            setLoading(false);
            navigate("/properties");
            return;
        }

        const fetchPropertyDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const propertyResponse = await axios.get(`${API}/api/properties/${id}`);
                const propertyData = propertyResponse.data;

                if (!propertyData.coordinates?.coordinates && !propertyData.coordinatesWarning) {
                    throw new Error("Property is missing coordinates.");
                }

                setProperty(propertyData);

                const similarResponse = await axios.get(`${API}/api/properties/${id}/similar?radius=${radius}`);
                setSimilarByLocation(similarResponse.data.similarByLocation || []);
                setSimilarByPrice(similarResponse.data.similarByPrice || []);

                if (isLoggedIn) {
                    try {
                        await axios.post(
                            `${API}/api/analytics`,
                            { propertyId: id },
                            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                        );
                    } catch (analyticsError) {
                        // Analytics is not critical - don't break the page if it fails
                        if (axios.isAxiosError(analyticsError) && analyticsError.response?.status === 401) {
                            // Token is invalid, clear it silently
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                        }
                        // Don't throw or log - analytics failure shouldn't affect property loading
                    }
                }
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setError(
                        error.response?.data?.message ||
                        "Failed to load property details. It may not exist or the server is unreachable."
                    );
                } else {
                    setError("Failed to load property details. It may not exist or the server is unreachable.");
                }
                setProperty(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyDetails();
    }, [id, navigate, isLoggedIn, radius]);

    const handleAddToFavorites = async () => {
        if (!isLoggedIn) {
            alert("Please login to mark a property as favorite.");
            navigate("/login");
            return;
        }
        if (!property) return;
        try {
            await axios.post(
                `${API}/api/user/favorites`,
                { propertyId: property._id },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            alert("Property added to favorites!");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409) {
                    alert("Property is already in your favorites.");
                } else if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    alert("Session expired. Please login again.");
                    navigate("/login");
                } else {
                    alert("Failed to add property to favorites.");
                }
            } else {
                alert("Failed to add property to favorites.");
            }
        }
    };

    const handleNextImage = () => {
        if (property && property.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
        }
    };

    const handlePreviousImage = () => {
        if (property && property.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
        }
    };

    const getDirections = () => {
        if (!property || !property.coordinates?.coordinates) return;
        const coords = property.coordinates.coordinates;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;
                const propLat = coords[1];
                const propLon = coords[0];
                const osmUrl = `https://www.openstreetmap.org/directions?engine=graphhopper_car&route=${userLat},${userLon};${propLat},${propLon}#map=12/${propLat}/${propLon}`;
                window.open(osmUrl, "_blank");
            },
            () => {
                const [lon, lat] = coords;
                const fallbackUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`;
                alert(`Unable to fetch location. You can view this property here:\n${fallbackUrl}`);
                window.open(fallbackUrl, "_blank");
            }
        );
    };

    const openMapLocation = (coordinates: [number, number]) => {
        const [lon, lat] = coordinates;
        const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`;
        window.open(url, "_blank");
    };

    if (loading) {
        return <div className="property-details-container"><div className="loading-spinner">Loading...</div></div>;
    }

    if (error || !property) {
        return (
            <div className="property-details-container">
                <div className="error-message">{error || "Property data is unavailable."}</div>
                <button onClick={() => navigate("/properties")} className="back-to-listings-button">Back to Listings</button>
            </div>
        );
    }

    const mapCenter: LatLngTuple = property.coordinates?.coordinates
        ? [property.coordinates.coordinates[1], property.coordinates.coordinates[0]]
        : [0, 0];

    const whatsappMessage = `Hi! I'm interested in this property:\n\n🏡 ${property.title}\n💰 Price: ₹${property.price.toLocaleString()}\n📍 Location: ${property.location}\n\nFacilities:\n${property.facilities?.map((f) => `• ${f.name}: ${f.value}`).join("\n")}\n\n📷 Photo: ${API}${property.images[0]}`;

    return (
        <div className="property-details-container">
            {/* Hero Section with Property Title */}
            <div className="property-hero-section">
                <h1 className="property-hero-title">{property.title}</h1>
                <p className="property-hero-price">₹{property.price.toLocaleString()}</p>
                <div className="property-hero-location">
                    <span>📍</span>
                    {property.location}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="property-main-content">
                {/* Image Section */}
                <div className="property-images-section">
                    <div className="property-images-carousel">
                        <button onClick={handlePreviousImage} className="carousel-control prev">◀</button>
                        <img
                            src={`${API}${property.images[currentImageIndex]}`}
                            alt={`Property image ${currentImageIndex + 1}`}
                            className="property-details-image"
                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/400x400?text=Image+Not+Found")}
                        />
                        <button onClick={handleNextImage} className="carousel-control next">▶</button>
                    </div>
                </div>

                {/* Property Details Section */}
                <div className="property-details-section">
                    {/* Property Info Grid */}
                    <div className="property-info-grid">
                        <div className="property-info-item">
                            <div className="property-info-label">Type</div>
                            <div className="property-info-value">{property.type}</div>
                        </div>
                        <div className="property-info-item">
                            <div className="property-info-label">Rent Per Month</div>
                            <div className="property-info-value">
                                {property.rentPerMonth ? `₹${property.rentPerMonth.toLocaleString()}` : "N/A"}
                            </div>
                        </div>
                        <div className="property-info-item">
                            <div className="property-info-label">Views</div>
                            <div className="property-info-value">{property.views}</div>
                        </div>
                        <div className="property-info-item">
                            <div className="property-info-label">Property ID</div>
                            <div className="property-info-value">#{property._id.slice(-6).toUpperCase()}</div>
                        </div>
                    </div>

                    {/* Facilities Section */}
                    {(property.facilities?.length ?? 0) > 0 && (
                        <div className="facilities-section">
                            <h3 className="facilities-title">Facilities & Amenities</h3>
                            <Facilities facilities={property.facilities || []} />
                        </div>
                    )}

                    {/* Description */}
                    {property.description && (
                        <div className="property-description">
                            <strong>Description:</strong> {property.description}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="property-actions">
                        <button onClick={() => navigate("/properties")} className="back-to-listings-button">
                            ← Back
                        </button>
                        <button onClick={handleAddToFavorites} className="favorite-button">
                            ♥ Favorite
                        </button>
                        {property.coordinates?.coordinates && (
                            <button onClick={getDirections} className="directions-button">
                                🧭 Directions
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Section as Card */}
            <div className="map-section-card">
                <h2 className="map-section-title">
                    Property Location
                </h2>
                {property.coordinates ? (
                    <>
                        <div className="map-container">
                            <MapComponent
                                center={mapCenter}
                                properties={[
                                    ...new Map(
                                        [property, ...similarByLocation, ...similarByPrice].map((p) => [p._id, p])
                                    ).values(),
                                ]}
                            />
                        </div>
                        <div className="radius-select">
                            <label htmlFor="radius">Show properties within:</label>
                            <select
                                id="radius"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                            >
                                <option value={1}>1 km</option>
                                <option value={2}>2 km</option>
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <div className="no-coordinates-card">
                        Location information is not available for this property
                    </div>
                )}
            </div>

            {/* Similar Properties Section as Card */}
            {similarByLocation.length > 0 && (
                <div className="similar-properties-card">
                    <h2 className="similar-properties-title">
                        Properties Nearby
                    </h2>
                    <div className="similar-properties-grid">
                        {similarByLocation.map((similarProperty) => (
                            <div
                                key={similarProperty._id}
                                className="similar-property-item"
                                onClick={() => navigate(`/properties/${similarProperty._id}`)}
                            >
                                <img
                                    src={`${API}${similarProperty.images[0]}`}
                                    alt={similarProperty.title}
                                    className="similar-property-image"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/250x180?text=Image+Not+Found")}
                                />
                                <div className="similar-property-content">
                                    <h3>{similarProperty.title}</h3>
                                    <div className="similar-property-info">
                                        <p><strong>Price:</strong> ₹{similarProperty.price.toLocaleString()}</p>
                                        <p><strong>Location:</strong> {similarProperty.location}</p>
                                    </div>
                                    <div className="similar-property-actions">
                                        <button
                                            className="view-property-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/properties/${similarProperty._id}`);
                                            }}
                                        >
                                            View Details
                                        </button>
                                        {similarProperty.coordinates?.coordinates && (
                                            <button
                                                className="view-map-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMapLocation(similarProperty.coordinates!.coordinates);
                                                }}
                                            >
                                                📍 Map
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Similar by Price Section as Card */}
            {similarByPrice.length > 0 && (
                <div className="similar-properties-card">
                    <h2 className="similar-properties-title">
                        Similar Price Range (₹{(property.price * 0.9).toLocaleString()} - ₹{(property.price * 1.1).toLocaleString()})
                    </h2>
                    <div className="similar-properties-grid">
                        {similarByPrice.map((similarProperty) => (
                            <div
                                key={similarProperty._id}
                                className="similar-property-item"
                                onClick={() => navigate(`/properties/${similarProperty._id}`)}
                            >
                                <img
                                    src={`${API}${similarProperty.images[0]}`}
                                    alt={similarProperty.title}
                                    className="similar-property-image"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/250x180?text=Image+Not+Found")}
                                />
                                <div className="similar-property-content">
                                    <h3>{similarProperty.title}</h3>
                                    <div className="similar-property-info">
                                        <p><strong>Price:</strong> ₹{similarProperty.price.toLocaleString()}</p>
                                        <p><strong>Location:</strong> {similarProperty.location}</p>
                                    </div>
                                    <div className="similar-property-actions">
                                        <button
                                            className="view-property-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/properties/${similarProperty._id}`);
                                            }}
                                        >
                                            View Details
                                        </button>
                                        {similarProperty.coordinates?.coordinates && (
                                            <button
                                                className="view-map-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openMapLocation(similarProperty.coordinates!.coordinates);
                                                }}
                                            >
                                                📍 Map
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <WhatsAppButton message={whatsappMessage} />
        </div>
    );
};

export default PropertyDetails;
