/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";

const API = import.meta.env.VITE_API_URL;

const AdminDashboard: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState({
        propertyViews: 0,
        totalSales: 0,
        userEngagement: 0,
    });
    const [users, setUsers] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingProperty, setEditingProperty] = useState<any | null>(null);
    const [updatedDetails, setUpdatedDetails] = useState({
        title: "",
        price: "",
        rentPerMonth: "",
        facilities: "",
    });

    const [newImages, setNewImages] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    fetchAnalytics(),
                    fetchUsers(),
                    fetchProperties(),
                    fetchMessages(),
                ]);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${API}/api/analytics`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (response.data && Array.isArray(response.data)) {
                const totalViews = response.data.reduce((acc, item) => acc + item.totalViews, 0);
                const userEngagement = users.length;
                setAnalyticsData({ propertyViews: totalViews, totalSales: 0, userEngagement });
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API}/api/admin/users`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`${API}/api/user/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("User deleted successfully!");
            fetchUsers();
        } catch (error) {
            console.error(error);
            alert("Error deleting user.");
        }
    };

    const fetchProperties = async () => {
        try {
            const response = await axios.get(`${API}/api/properties`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setProperties(response.data.properties || []);
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    const deleteProperty = async (propertyId: string) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;
        try {
            await axios.delete(`${API}/api/properties/${propertyId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("Property deleted successfully!");
            fetchProperties();
        } catch (error) {
            console.error(error);
            alert("Error deleting property.");
        }
    };

    const editProperty = (property: any) => {
        setEditingProperty(property);
        setUpdatedDetails({
            title: property.title,
            price: property.price.toString(),
            rentPerMonth: property.rentPerMonth ? property.rentPerMonth.toString() : "",
            facilities: property.facilities ? property.facilities.join(", ") : "",
        });
    };

    const updateProperty = async () => {
        try {
            await axios.put(`${API}/api/properties/${editingProperty._id}`, updatedDetails, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("Property updated successfully!");
            setEditingProperty(null);
            fetchProperties();
        } catch (error) {
            console.error(error);
            alert("Error updating property.");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
        }
    };

    const uploadNewImages = async () => {
        if (newImages.length === 0) return alert("Please select images to upload.");
        setIsUploading(true);

        const form = new FormData();
        newImages.forEach((image) => form.append("images", image));

        try {
            const response = await axios.post(`${API}/api/properties/upload`, form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const imageUrls = response.data.filePaths;

            await axios.put(`${API}/api/properties/${editingProperty._id}`, {
                images: imageUrls,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            alert("Images updated successfully!");
            setNewImages([]);
            fetchProperties();
        } catch (error) {
            console.error("Error updating images:", error);
            alert("Failed to update images.");
        } finally {
            setIsUploading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API}/api/messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setMessages(response.data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-dashboard-container">
            <h1 className="admin-dashboard-title">Admin Dashboard</h1>

            <div className="analytics-section">
                <h2>Analytics</h2>
                <div className="analytics-cards">
                    <div className="analytics-card"><h3>Property Views</h3><p>{analyticsData.propertyViews}</p></div>
                    <div className="analytics-card"><h3>Total Sales</h3><p>{analyticsData.totalSales}</p></div>
                    <div className="analytics-card"><h3>User Engagement</h3><p>{analyticsData.userEngagement}</p></div>
                </div>
            </div>

            <div className="user-management-section">
                <h2>User Management</h2>
                {users.length > 0 ? (
                    <ul>
                        {users.map((user) => (
                            <li key={user._id} className="user-item">
                                {user.name} ({user.email})
                                <button onClick={() => deleteUser(user._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                ) : <p>No users available.</p>}
            </div>

            <div className="property-management-section">
                <h2>Property Management</h2>
                {properties.length > 0 ? (
                    <ul>
                        {properties.map((property) => (
                            <li key={property._id} className="property-item">
                                {property.title} (${property.price.toLocaleString()}) - Rent: ${property.rentPerMonth || "N/A"}
                                <button onClick={() => editProperty(property)}>Edit</button>
                                <button onClick={() => deleteProperty(property._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                ) : <p>No properties available.</p>}
            </div>

            {editingProperty && (
                <div className="edit-property-section">
                    <h2>Edit Property</h2>
                    <input type="text" value={updatedDetails.title} onChange={(e) => setUpdatedDetails({ ...updatedDetails, title: e.target.value })} placeholder="Title" />
                    <input type="number" value={updatedDetails.price} onChange={(e) => setUpdatedDetails({ ...updatedDetails, price: e.target.value })} placeholder="Price" />
                    <input type="number" value={updatedDetails.rentPerMonth} onChange={(e) => setUpdatedDetails({ ...updatedDetails, rentPerMonth: e.target.value })} placeholder="Rent Per Month" />
                    <textarea value={updatedDetails.facilities} onChange={(e) => setUpdatedDetails({ ...updatedDetails, facilities: e.target.value })} placeholder="Facilities Included" />
                    <button onClick={updateProperty}>Update</button>

                    <h3>Update Property Images</h3>
                    <input type="file" multiple onChange={handleImageChange} />
                    <button onClick={uploadNewImages} disabled={isUploading}>{isUploading ? "Uploading..." : "Upload New Images"}</button>
                    <button onClick={() => setEditingProperty(null)}>Cancel</button>
                </div>
            )}

            <div className="messaging-section">
                <h2>Messages</h2>
                {messages.length > 0 ? (
                    <ul>
                        {messages.map((message) => (
                            <li key={message._id} className="message-item">
                                <p><strong>{message.name}</strong>: {message.content}</p>
                                <button onClick={() => console.log(`Replying to message: ${message._id}`)}>Reply</button>
                            </li>
                        ))}
                    </ul>
                ) : <p>No messages available.</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;
