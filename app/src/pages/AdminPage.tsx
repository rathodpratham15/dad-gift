import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "../styles/AdminPage.css";
import { facilityIcons } from "../utils/facilityIcons";
import { FaTrash, FaCheckCircle, FaLightbulb, FaUpload, FaPlus } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

interface DecodedToken {
  role: string;
  [key: string]: unknown;
}

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [type, setType] = useState('');
    const [customType, setCustomType] = useState('');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [area, setArea] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [facilities, setFacilities] = useState<{ name: string; icon: string; value: string }[]>([]);
    const [propertyAge, setPropertyAge] = useState('');
    const [reraNumber, setReraNumber] = useState('');
    const [constructionStatus, setConstructionStatus] = useState<string[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            if (decodedToken.role !== 'admin') {
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/auth');
        }
    }, [navigate]);

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            uploadImages(files);
        }
    };

    const uploadImages = async (files: FileList) => {
        setIsUploading(true);
        const formData = new FormData();
        
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        try {
            const response = await fetch(`${API}/api/properties/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                setImageUrls(result.filePaths);
                setMessage('Images uploaded successfully!');
            } else {
                setMessage('Failed to upload images.');
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            setMessage('Failed to upload images.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddFacility = () => {
        setFacilities([...facilities, { name: '', icon: 'home', value: '' }]);
    };

    const handleFacilityChange = (index: number, field: string, value: string) => {
        const updatedFacilities = [...facilities];
        updatedFacilities[index] = { ...updatedFacilities[index], [field]: value };
        setFacilities(updatedFacilities);
    };

    const resetForm = () => {
        setTitle('');
        setType('');
        setCustomType('');
        setPrice('');
        setLocation('');
        setBedrooms('');
        setBathrooms('');
        setArea('');
        setDescription('');
        setImageUrls([]);
        setFacilities([]);
        setPropertyAge('');
        setReraNumber('');
        setConstructionStatus([]);
        setMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const finalType = type === 'Other' ? customType : type;
        
        const propertyData = {
            title,
            type: finalType,
            price: parseFloat(price),
            location,
            bedrooms: bedrooms ? parseInt(bedrooms) : null,
            bathrooms: bathrooms ? parseInt(bathrooms) : null,
            area: parseFloat(area),
            description,
            images: imageUrls,
            facilities: facilities.filter(f => f.name.trim()),
            propertyAge,
            reraNumber: reraNumber || null,
            constructionStatus
        };

        try {
            const response = await fetch(`${API}/api/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(propertyData),
            });

            if (response.ok) {
                setMessage('Property added successfully!');
                resetForm();
            } else {
                setMessage('Error adding property');
            }
        } catch (error) {
            console.error('Error adding property:', error);
            setMessage('Error adding property');
        }
    };

    const calculateProgress = () => {
        const requiredFields = [title, type || customType, price, location, area, description];
        const filledFields = requiredFields.filter(field => field.trim() !== '').length;
        const hasImages = imageUrls.length > 0;
        return Math.round((filledFields + (hasImages ? 1 : 0)) / (requiredFields.length + 1) * 100);
    };

    return (
        <div className="enhanced-admin-container">
            <div className="enhanced-admin-header">
                <h1 className="enhanced-admin-title">Admin Dashboard</h1>
                <p className="enhanced-admin-subtitle">
                    Manage and add properties to the platform easily. Create comprehensive property listings with all necessary details.
                </p>
            </div>

            <div className="admin-form-layout">
                <div className="enhanced-admin-form">
                    <form onSubmit={handleSubmit}>
                        <div className="admin-form-section">
                            <h3 className="section-title">Basic Information</h3>
                            <div className="input-row">
                                <input
                                    type="text"
                                    placeholder="Property Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="enhanced-admin-input"
                                    required
                                />
                                <select
                                    value={type}
                                    onChange={(e) => {
                                        setType(e.target.value);
                                        if (e.target.value !== 'Other') {
                                            setCustomType('');
                                        }
                                    }}
                                    className="enhanced-admin-select"
                                    required
                                >
                                    <option value="">Select Property Type</option>
                                    <option value="House">House</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Condo">Condo</option>
                                    <option value="Villa">Villa</option>
                                    <option value="Townhouse">Townhouse</option>
                                    <option value="Shop">Shop</option>
                                    <option value="Godown">Godown</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {type === 'Other' && (
                                <div className="input-row">
                                    <input
                                        type="text"
                                        placeholder="Enter custom property type"
                                        value={customType}
                                        onChange={(e) => setCustomType(e.target.value)}
                                        className="enhanced-admin-input input-full-width"
                                        required
                                    />
                                </div>
                            )}

                            <div className="input-row">
                                <input
                                    type="number"
                                    placeholder="Price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="enhanced-admin-input"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="enhanced-admin-input"
                                    required
                                />
                            </div>

                            <div className="input-row">
                                <input
                                    type="number"
                                    placeholder="Bedrooms (optional)"
                                    value={bedrooms}
                                    onChange={(e) => setBedrooms(e.target.value)}
                                    className="enhanced-admin-input"
                                />
                                <input
                                    type="number"
                                    placeholder="Bathrooms (optional)"
                                    value={bathrooms}
                                    onChange={(e) => setBathrooms(e.target.value)}
                                    className="enhanced-admin-input"
                                />
                            </div>

                            <div className="input-row">
                                <input
                                    type="number"
                                    placeholder="Area (sq ft)"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="enhanced-admin-input"
                                    required
                                />
                                <select
                                    value={propertyAge}
                                    onChange={(e) => setPropertyAge(e.target.value)}
                                    className="enhanced-admin-select"
                                >
                                    <option value="">Select Property Age</option>
                                    <option value="New Property">New Property</option>
                                    <option value="Old Property">Old Property</option>
                                </select>
                            </div>

                            <textarea
                                placeholder="Property Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="enhanced-admin-textarea input-full-width"
                                required
                            />

                            <input
                                type="text"
                                placeholder="RERA Number (if applicable)"
                                value={reraNumber}
                                onChange={(e) => setReraNumber(e.target.value)}
                                className="enhanced-admin-input input-full-width"
                            />
                        </div>

                        <div className="admin-form-section">
                            <div className="construction-status-section">
                                <h4>Construction Status</h4>
                                <div className="checkbox-group">
                                    {['Under Construction', 'Ready to Move', 'Resale Property'].map((status) => (
                                        <label key={status} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                className="checkbox-input"
                                                checked={constructionStatus.includes(status)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setConstructionStatus([...constructionStatus, status]);
                                                    } else {
                                                        setConstructionStatus(constructionStatus.filter(item => item !== status));
                                                    }
                                                }}
                                            />
                                            <span>{status}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="admin-form-section">
                            <h3 className="section-title">Property Images</h3>
                            <div className="enhanced-admin-file-upload-section">
                                <FaUpload style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '1rem' }} />
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImagesChange}
                                    className="enhanced-admin-file-upload"
                                />
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    Upload multiple images (JPG, PNG, WebP)
                                </p>
                                {isUploading && <p style={{ color: 'var(--primary-color)' }}>Uploading images...</p>}
                                {imageUrls.length > 0 && (
                                    <p style={{ color: 'var(--success-color)' }}>
                                        <FaCheckCircle style={{ marginRight: '0.5rem' }} />
                                        {imageUrls.length} image(s) uploaded successfully
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="admin-form-section">
                            <h3 className="section-title">Facilities & Amenities</h3>
                            {facilities.map((facility, index) => (
                                <div key={index} className="facility-row">
                                    <input
                                        type="text"
                                        placeholder="Facility name"
                                        value={facility.name}
                                        onChange={(e) => handleFacilityChange(index, "name", e.target.value)}
                                        className="enhanced-admin-input"
                                    />
                                    <select
                                        value={facility.icon || ""}
                                        onChange={(e) => handleFacilityChange(index, "icon", e.target.value)}
                                        className="enhanced-admin-select"
                                    >
                                        {Object.keys(facilityIcons).map((iconKey) => (
                                            <option key={iconKey} value={iconKey}>
                                                {iconKey.charAt(0).toUpperCase() + iconKey.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={facility.value === "Available"}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleFacilityChange(index, "value", "Available");
                                                } else {
                                                    handleFacilityChange(index, "value", "");
                                                }
                                            }}
                                        />
                                        <span>Available</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFacilities(facilities.filter((_, i) => i !== index));
                                        }}
                                        className="enhanced-admin-button"
                                        style={{ background: '#ef4444', padding: '0.5rem' }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={handleAddFacility}
                                className="enhanced-admin-button enhanced-admin-button-blue"
                            >
                                <FaPlus style={{ marginRight: '0.5rem' }} />
                                Add Facility
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading || imageUrls.length === 0}
                            className="enhanced-admin-button enhanced-admin-button-green"
                        >
                            {isUploading ? 'Processing...' : 'Add Property'}
                        </button>
                    </form>

                    {message && (
                        <div style={{ 
                            marginTop: '1rem', 
                            padding: '1rem',
                            borderRadius: '8px',
                            background: message.includes('success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.includes('success') ? '#059669' : '#dc2626',
                            textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="admin-sidebar">
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Form Progress</h3>
                        <div className="progress-indicator">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${calculateProgress()}%` }}
                                ></div>
                            </div>
                            <div className="progress-text">
                                {calculateProgress()}% Complete
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Quick Tips</h3>
                        <div className="tips-section">
                            <div className="tip-item">
                                <FaLightbulb className="tip-icon" />
                                <span>Use high-quality images for better visibility</span>
                            </div>
                            <div className="tip-item">
                                <FaLightbulb className="tip-icon" />
                                <span>Include detailed descriptions to attract buyers</span>
                            </div>
                            <div className="tip-item">
                                <FaLightbulb className="tip-icon" />
                                <span>Add relevant facilities to increase property value</span>
                            </div>
                            <div className="tip-item">
                                <FaLightbulb className="tip-icon" />
                                <span>Verify RERA number for legal compliance</span>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Form Status</h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <p>✓ Images: {imageUrls.length > 0 ? 'Uploaded' : 'Required'}</p>
                            <p>✓ Facilities: {facilities.length} added</p>
                            <p>✓ Construction Status: {constructionStatus.length} selected</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
