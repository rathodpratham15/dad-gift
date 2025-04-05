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
    <MapContainer center={center} zoom={12} style={{ height: "400px", width: "100%" }}>
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
                    await axios.post(
                        `${API}/api/analytics`,
                        { propertyId: id },
                        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                    );
                }
            } catch (error: any) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load property details. It may not exist or the server is unreachable."
                );
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
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                alert("Property is already in your favorites.");
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

    const whatsappMessage = `Hi! I'm interested in this property:\n\n🏡 ${property.title}\n💰 Price: $${property.price.toLocaleString()}\n📍 Location: ${property.location}\n\nFacilities:\n${property.facilities?.map((f) => `• ${f.name}: ${f.value}`).join("\n")}\n\n📷 Photo: ${API}${property.images[0]}`;

    return (
        <div className="property-details-container">
            <div className="property-details-card">
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

                <div className="property-details-content">
                    <h1 className="property-details-title">{property.title}</h1>
                    <p className="property-details-price">Price: ${property.price.toLocaleString()}</p>
                    <p className="property-details-type">Type: {property.type}</p>
                    <p><strong>Rent Per Month:</strong> {property.rentPerMonth ? `$${property.rentPerMonth.toLocaleString()}` : "N/A"}</p>
                    <p className="property-details-location">Location: {property.location}</p>

                    {(property.facilities?.length ?? 0) > 0 && (
                        <>
                            <h3 className="mt-6 text-xl font-semibold text-center">Facilities</h3>
                            <Facilities facilities={property.facilities || []} />
                        </>
                    )}

                    <p className="property-details-description">Description: {property.description}</p>

                    <div className="property-details-buttons">
                        <button onClick={() => navigate("/properties")} className="back-to-listings-button">Back</button>
                        <button onClick={handleAddToFavorites} className="favorite-button">Mark as Favorite</button>
                        {property.coordinates?.coordinates && (
                            <button onClick={getDirections} className="directions-button">Get Directions</button>
                        )}
                    </div>
                </div>
            </div>

            <div className="map-section">
                <h2 className="map-title">Property Location</h2>
                {property.coordinates?.coordinates ? (
                    <MapComponent
                        center={mapCenter}
                        properties={[
                            ...new Map(
                                [property, ...similarByLocation, ...similarByPrice].map((p) => [p._id, p])
                            ).values(),
                        ]}
                    />
                ) : (
                    <div className="error-message">Map unavailable: Missing coordinates.</div>
                )}

                <div className="radius-select">
                    <label>Radius (miles): </label>
                    <select value={radius} onChange={(e) => setRadius(parseInt(e.target.value))}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                    </select>
                </div>
            </div>

            {/* Similar by Location */}
            {similarByLocation.length > 0 && (
                <div className="similar-properties-section">
                    <h2 className="similar-properties-title">
                        Other Properties in {property.location.split(",")[0]} (within {radius} miles)
                    </h2>
                    <div className="similar-properties-grid">
                        {similarByLocation.map((similar) => (
                            <div
                                key={similar._id}
                                className="similar-property-card"
                                onClick={() => navigate(`/properties/${similar._id}`)}
                            >
                                <img
                                    src={`${API}${similar.images[0]}`}
                                    alt={similar.title}
                                    className="similar-property-image"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/250x180?text=Image+Not+Found")}
                                />
                                <div className="similar-property-content">
                                    <h3>{similar.title}</h3>
                                    <p>Price: ${similar.price.toLocaleString()}</p>
                                    <p>Location: {similar.location}</p>
                                    {similar.coordinates?.coordinates ? (
                                        <button
                                            className="directions-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openMapLocation(similar.coordinates!.coordinates);
                                            }}
                                            title="View on Map"
                                        >
                                            📍 View Map
                                        </button>
                                    ) : (
                                        <p className="no-coordinates">No coordinates available</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Similar by Price */}
            {similarByPrice.length > 0 && (
                <div className="similar-properties-section">
                    <h2 className="similar-properties-title">
                        Properties in Price Range (${(property.price * 0.9).toLocaleString()} - ${(property.price * 1.1).toLocaleString()}) within {radius} miles
                    </h2>
                    <div className="similar-properties-grid">
                        {similarByPrice.map((similar) => (
                            <div
                                key={similar._id}
                                className="similar-property-card"
                                onClick={() => navigate(`/properties/${similar._id}`)}
                            >
                                <img
                                    src={`${API}${similar.images[0]}`}
                                    alt={similar.title}
                                    className="similar-property-image"
                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/250x180?text=Image+Not+Found")}
                                />
                                <div className="similar-property-content">
                                    <h3>{similar.title}</h3>
                                    <p>Price: ${similar.price.toLocaleString()}</p>
                                    <p>Location: {similar.location}</p>
                                    {similar.coordinates?.coordinates ? (
                                        <button
                                            className="directions-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openMapLocation(similar.coordinates!.coordinates);
                                            }}
                                            title="View on Map"
                                        >
                                            📍 View Map
                                        </button>
                                    ) : (
                                        <p className="no-coordinates">No coordinates available</p>
                                    )}
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
