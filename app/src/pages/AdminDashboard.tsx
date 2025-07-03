/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Home, Eye, MessageSquare, Search, Edit, Trash2, ChevronUp, ChevronDown, MapPin, IndianRupee, Reply, Clock } from "lucide-react";
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
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userSortField, setUserSortField] = useState<'name' | 'email' | 'createdAt'>('name');
    const [userSortDirection, setUserSortDirection] = useState<'asc' | 'desc'>('asc');
    const [propertySearchTerm, setPropertySearchTerm] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            facilities: property.facilities ? 
                (Array.isArray(property.facilities) ? 
                    property.facilities.map((f: any) => typeof f === 'string' ? f : (f.name || f.value || f.toString())).join(", ") : 
                    property.facilities.toString()
                ) : "",
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

    // Get admin info from localStorage
    const adminEmail = localStorage.getItem("userEmail") || "admin@example.com";
    const adminRole = localStorage.getItem("role") || "admin";

    // Filter and sort users
    const filteredUsers = users
        .filter(user => 
            user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const aValue = a[userSortField] || '';
            const bValue = b[userSortField] || '';
            const comparison = aValue.toString().localeCompare(bValue.toString());
            return userSortDirection === 'asc' ? comparison : -comparison;
        });

    const handleUserSort = (field: 'name' | 'email' | 'createdAt') => {
        if (userSortField === field) {
            setUserSortDirection(userSortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setUserSortField(field);
            setUserSortDirection('asc');
        }
    };

    // Filter properties
    const filteredProperties = properties.filter(property => 
        property.title?.toLowerCase().includes(propertySearchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(propertySearchTerm.toLowerCase())
    );

    return (
        <div className="admin-dashboard-container">
            {/* Top Greeting Bar */}
            <div className="admin-greeting-bar">
                <div className="greeting-content">
                    <div className="greeting-text">
                        <h1 className="greeting-title">Welcome back, Admin!</h1>
                        <p className="greeting-subtitle">
                            <User className="greeting-icon" />
                            {adminEmail} • {adminRole.toUpperCase()}
                        </p>
                    </div>
                    <div className="greeting-stats">
                        <div className="quick-stat">
                            <span className="stat-number">{users.length}</span>
                            <span className="stat-label">Users</span>
                        </div>
                        <div className="quick-stat">
                            <span className="stat-number">{properties.length}</span>
                            <span className="stat-label">Properties</span>
                        </div>
                        <div className="quick-stat">
                            <span className="stat-number">{messages.length}</span>
                            <span className="stat-label">Messages</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Analytics Section */}
            <div className="analytics-section">
                <h2 className="section-title">Dashboard Overview</h2>
                <div className="analytics-cards">
                    <div className="analytics-card">
                        <div className="card-icon">
                            <User />
                        </div>
                        <div className="card-content">
                            <h3>Total Users</h3>
                            <p>{users.length}</p>
                            <span className="card-trend">+12% this month</span>
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="card-icon">
                            <Home />
                        </div>
                        <div className="card-content">
                            <h3>Properties</h3>
                            <p>{properties.length}</p>
                            <span className="card-trend">+5% this month</span>
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="card-icon">
                            <Eye />
                        </div>
                        <div className="card-content">
                            <h3>Total Views</h3>
                            <p>{analyticsData.propertyViews}</p>
                            <span className="card-trend">+23% this month</span>
                        </div>
                    </div>
                    <div className="analytics-card">
                        <div className="card-icon">
                            <MessageSquare />
                        </div>
                        <div className="card-content">
                            <h3>Messages</h3>
                            <p>{messages.length}</p>
                            <span className="card-trend">+8% this month</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced User Management Section */}
            <div className="user-management-section">
                <div className="section-header">
                    <h2 className="section-title">User Management</h2>
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                
                {filteredUsers.length > 0 ? (
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th 
                                        className="sortable"
                                        onClick={() => handleUserSort('name')}
                                    >
                                        Name
                                        {userSortField === 'name' && (
                                            userSortDirection === 'asc' ? <ChevronUp className="sort-icon" /> : <ChevronDown className="sort-icon" />
                                        )}
                                    </th>
                                    <th 
                                        className="sortable"
                                        onClick={() => handleUserSort('email')}
                                    >
                                        Email
                                        {userSortField === 'email' && (
                                            userSortDirection === 'asc' ? <ChevronUp className="sort-icon" /> : <ChevronDown className="sort-icon" />
                                        )}
                                    </th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="user-row">
                                        <td className="user-name">
                                            <div className="user-avatar">
                                                <User className="avatar-icon" />
                                            </div>
                                            {user.name || 'N/A'}
                                        </td>
                                        <td className="user-email">{user.email}</td>
                                        <td>
                                            <span className={`role-badge ${user.role || 'user'}`}>
                                                {(user.role || 'user').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="user-actions">
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => console.log('Edit user:', user._id)}
                                                title="Edit User"
                                            >
                                                <Edit className="btn-icon" />
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => deleteUser(user._id)}
                                                title="Delete User"
                                            >
                                                <Trash2 className="btn-icon" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <User className="empty-icon" />
                        <p>No users found</p>
                        <span className="empty-description">Try adjusting your search criteria</span>
                    </div>
                )}
            </div>

            {/* Enhanced Property Management Section */}
            <div className="property-management-section">
                <div className="section-header">
                    <h2 className="section-title">Property Listings</h2>
                    <div className="search-container">
                        <Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search properties by title or location..."
                            value={propertySearchTerm}
                            onChange={(e) => setPropertySearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
                
                {filteredProperties.length > 0 ? (
                    <div className="properties-grid">
                        {filteredProperties.map((property) => (
                            <div key={property._id} className="property-card">
                                <div className="property-image-container">
                                    {property.images && property.images.length > 0 ? (
                                        <img 
                                            src={property.images[0]} 
                                            alt={property.title}
                                            className="property-image"
                                            onError={(e) => {
                                                e.currentTarget.src = '/api/placeholder/300/200';
                                            }}
                                        />
                                    ) : (
                                        <div className="property-placeholder">
                                            <Home className="placeholder-icon" />
                                        </div>
                                    )}
                                    <div className="property-badge">
                                        {property.type || 'Property'}
                                    </div>
                                </div>
                                
                                <div className="property-content">
                                    <h3 className="property-title">{property.title}</h3>
                                    
                                    <div className="property-location">
                                        <MapPin className="location-icon" />
                                        <span>{property.location || 'Location not specified'}</span>
                                    </div>
                                    
                                    <div className="property-prices">
                                        <div className="price-item">
                                            <span className="price-label">Sale Price</span>
                                            <span className="price-value">
                                                <IndianRupee className="rupee-icon" />
                                                {property.price?.toLocaleString() || 'N/A'}
                                            </span>
                                        </div>
                                        {property.rentPerMonth && (
                                            <div className="price-item">
                                                <span className="price-label">Rent/Month</span>
                                                <span className="price-value rent">
                                                    <IndianRupee className="rupee-icon" />
                                                    {property.rentPerMonth.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {property.facilities && property.facilities.length > 0 && (
                                        <div className="property-facilities">
                                            {property.facilities.slice(0, 3).map((facility: any, index: number) => {
                                                // Handle both string and object facilities
                                                const facilityText = typeof facility === 'string' ? facility : (facility.name || facility.value || facility.toString());
                                                return (
                                                    <span key={index} className="facility-tag">
                                                        {facilityText}
                                                    </span>
                                                );
                                            })}
                                            {property.facilities.length > 3 && (
                                                <span className="facility-tag more">
                                                    +{property.facilities.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="property-actions">
                                        <button 
                                            className="action-btn edit-btn"
                                            onClick={() => editProperty(property)}
                                            title="Edit Property"
                                        >
                                            <Edit className="btn-icon" />
                                            Edit
                                        </button>
                                        <button 
                                            className="action-btn delete-btn"
                                            onClick={() => deleteProperty(property._id)}
                                            title="Delete Property"
                                        >
                                            <Trash2 className="btn-icon" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Home className="empty-icon" />
                        <p>No properties found</p>
                        <span className="empty-description">Try adjusting your search criteria</span>
                    </div>
                )}
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

            {/* Enhanced Messages Section */}
            <div className="messaging-section">
                <h2 className="section-title">Recent Messages</h2>
                
                {messages.length > 0 ? (
                    <div className="messages-container">
                        {messages.slice(0, 6).map((message) => (
                            <div key={message._id} className="message-card">
                                <div className="message-header">
                                    <div className="message-avatar">
                                        <User className="avatar-icon" />
                                    </div>
                                    <div className="message-info">
                                        <h4 className="message-sender">{message.name || 'Anonymous'}</h4>
                                        <div className="message-meta">
                                            <Clock className="time-icon" />
                                            <span className="message-time">
                                                {message.createdAt ? 
                                                    new Date(message.createdAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : 
                                                    'Recently'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="message-status">
                                        <span className="status-badge unread">New</span>
                                    </div>
                                </div>
                                
                                <div className="message-content">
                                    <p className="message-preview">
                                        {message.content || message.message || 'No message content'}
                                    </p>
                                    {message.email && (
                                        <div className="message-contact">
                                            <span className="contact-label">Email:</span>
                                            <span className="contact-value">{message.email}</span>
                                        </div>
                                    )}
                                    {message.phone && (
                                        <div className="message-contact">
                                            <span className="contact-label">Phone:</span>
                                            <span className="contact-value">{message.phone}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="message-actions">
                                    <button 
                                        className="message-btn reply-btn"
                                        onClick={() => console.log(`Replying to message: ${message._id}`)}
                                        title="Reply to Message"
                                    >
                                        <Reply className="btn-icon" />
                                        Reply
                                    </button>
                                    <button 
                                        className="message-btn mark-read-btn"
                                        onClick={() => console.log(`Marking as read: ${message._id}`)}
                                        title="Mark as Read"
                                    >
                                        <Eye className="btn-icon" />
                                        Mark Read
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {messages.length > 6 && (
                            <div className="view-all-messages">
                                <button className="view-all-btn">
                                    <MessageSquare className="btn-icon" />
                                    View All {messages.length} Messages
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="empty-state">
                        <MessageSquare className="empty-icon" />
                        <p>No messages yet</p>
                        <span className="empty-description">Customer messages will appear here</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
