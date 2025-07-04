import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import "../styles/AdminPage.css";
import { FaTrash, FaCheckCircle, FaLightbulb, FaUpload, FaPlus } from 'react-icons/fa';
import { facilityIcons } from "../utils/facilityIcons";

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
    const [rentPerMonth, setRentPerMonth] = useState('');
    const [location, setLocation] = useState('');
    const [area, setArea] = useState('');
    const [description, setDescription] = useState('');
    const [reraNumber, setReraNumber] = useState('');
    const [propertyAge, setPropertyAge] = useState('');
    const [constructionStatus, setConstructionStatus] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [facilities, setFacilities] = useState<{ name: string; icon: string; value: string; count?: string }[]>([
        { name: '', value: '', icon: '', count: '' }
    ]);

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
        setFacilities([...facilities, { name: '', icon: 'bedroom', value: '', count: '' }]);
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
        setRentPerMonth('');
        setLocation('');
        setArea('');
        setDescription('');
        setReraNumber('');
        setPropertyAge('');
        setConstructionStatus([]);
        setImageUrls([]);
        setMessage('');
        setFacilities([{ name: '', icon: 'bedroom', value: '', count: '' }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const finalType = type === 'Other' ? customType : type;
        
        // Validate required fields
        if (!title || !finalType || !price || !location || !area || !description || imageUrls.length === 0) {
            setMessage('Please fill in all required fields: title, type, price, location, area, description, and at least one image.');
            return;
        }

        // Validate location doesn't contain numbers
        if (/\d/.test(location)) {
            setMessage('Location should not contain numbers. Please enter a proper location name.');
            return;
        }

        // Simple geocoding function (you might want to use a proper geocoding service)
        const getCoordinatesFromLocation = async () => {
            try {
                // This is a simple fallback - for production, use Google Geocoding API or similar
                // For now, we'll set default coordinates (you can replace with actual geocoding)
                const defaultCoordinates = [-74.0059, 40.7128]; // New York City as default
                
                return {
                    type: "Point",
                    coordinates: defaultCoordinates
                };
            } catch (error) {
                console.error('Error geocoding location:', error);
                // Fallback coordinates
                return {
                    type: "Point", 
                    coordinates: [-74.0059, 40.7128]
                };
            }
        };

        try {
            setMessage('Adding property...');
            
            // Get coordinates for the location
            const coordinates = await getCoordinatesFromLocation();
            
            const propertyData = {
                title,
                type: finalType,
                price: parseFloat(price),
                rentPerMonth: rentPerMonth ? parseFloat(rentPerMonth) : null,
                location,
                coordinates, // Now including coordinates
                area: parseFloat(area),
                description,
                images: imageUrls,
                facilities: facilities.filter(f => f.name.trim()).map(f => ({
                    name: f.name,
                    value: f.count ? `${f.count}` : 'Available',
                    icon: f.icon || null
                })),
                propertyAge: propertyAge || null,
                reraNumber: reraNumber || null,
                constructionStatus
            };

            console.log('Sending property data:', propertyData); // Debug log

            const response = await fetch(`${API}/api/properties`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(propertyData),
            });

            const responseData = await response.json();
            console.log('Response:', responseData); // Debug log

            if (response.ok) {
                setMessage('Property added successfully!');
                resetForm();
            } else {
                // Show the actual error message from the backend
                const errorMessage = responseData.message || 'Error adding property';
                setMessage(`Error: ${errorMessage}`);
                console.error('Backend error:', responseData);
            }
        } catch (error) {
            console.error('Error adding property:', error);
            setMessage('Error adding property: ' + (error as Error).message);
        }
    };

    const calculateProgress = () => {
        const requiredFields = [title, type || customType, price, location, area, description];
        const filledFields = requiredFields.filter(field => field && field.trim() !== '').length;
        const hasImages = imageUrls.length > 0;
        return Math.round((filledFields + (hasImages ? 1 : 0)) / (requiredFields.length + 1) * 100);
    };

    // Function to render icon preview
    const renderIconPreview = (iconKey: string) => {
        if (!iconKey) return null;
        
        const iconUrl = facilityIcons[iconKey];
        if (!iconUrl) return null;
        
        if (iconUrl.startsWith('http')) {
            return (
                <img 
                    src={iconUrl} 
                    alt={iconKey} 
                    className="facility-icon-preview"
                    style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
            );
        } else if (iconUrl.startsWith('fa-')) {
            // Map FontAwesome icons to emojis for preview
            const iconEmojis: { [key: string]: string } = {
                'fa-utensils': '🍽️',
                'fa-car': '🚗',
                'fa-swimming-pool': '🏊',
                'fa-dumbbell': '🏋️',
                'fa-washing-machine': '🧺',
                'fa-paw': '🐾',
                'fa-leaf': '🌿',
                'fa-building': '🏢',
                'fa-elevator': '🛗',
                'fa-shield-alt': '🛡️',
                'fa-wifi': '📶',
                'fa-snowflake': '❄️',
                'fa-fire': '🔥',
                'fa-couch': '🛋️',
                'fa-home': '🏠',
                'fa-child': '🧒',
                'fa-book': '📚',
                'fa-spa': '💆',
                'fa-table-tennis': '🏓',
                'fa-basketball-ball': '🏀',
                'fa-film': '🎬',
                'fa-shopping-cart': '🛒',
                'fa-hospital': '🏥',
                'fa-school': '🏫',
                'fa-subway': '🚇',
                'fa-bus': '🚌',
                'fa-plane': '✈️'
            };
            
            const emoji = iconEmojis[iconUrl] || '🏠';
            return (
                <span className="facility-icon-preview" style={{ fontSize: '16px' }}>
                    {emoji}
                </span>
            );
        }
        return null;
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
                                    placeholder="Price (required)"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="enhanced-admin-input"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Rent Per Month (optional)"
                                    value={rentPerMonth}
                                    onChange={(e) => setRentPerMonth(e.target.value)}
                                    className="enhanced-admin-input"
                                />
                            </div>

                            <div className="input-row">
                                <input
                                    type="text"
                                    placeholder="Location (no numbers - required)"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
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

                            <div className="input-row">
                                <input
                                    type="number"
                                    placeholder="Area in sq ft (required)"
                                    value={area}
                                    onChange={(e) => setArea(e.target.value)}
                                    className="enhanced-admin-input input-full-width"
                                    required
                                />
                            </div>

                            <textarea
                                placeholder="Property Description (required)"
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
                            
                            {/* Facilities List */}
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
                                        <option value="">Select Icon</option>
                                        <optgroup label="Basic Facilities">
                                            <option value="bedroom">Bedroom</option>
                                            <option value="bathroom">Bathroom</option>
                                            <option value="kitchen">Kitchen</option>
                                            <option value="balcony">Balcony</option>
                                            <option value="garden">Garden</option>
                                        </optgroup>
                                        <optgroup label="Parking & Storage">
                                            <option value="garage">Garage</option>
                                            <option value="parking">Parking</option>
                                            <option value="laundry">Laundry</option>
                                        </optgroup>
                                        <optgroup label="Amenities">
                                            <option value="pool">Swimming Pool</option>
                                            <option value="gym">Gym</option>
                                            <option value="spa">Spa</option>
                                            <option value="playground">Playground</option>
                                            <option value="library">Library</option>
                                            <option value="cinema">Cinema</option>
                                        </optgroup>
                                        <optgroup label="Services">
                                            <option value="elevator">Elevator</option>
                                            <option value="security">Security</option>
                                            <option value="wifi">WiFi</option>
                                            <option value="ac">Air Conditioning</option>
                                            <option value="heating">Heating</option>
                                        </optgroup>
                                        <optgroup label="Furnishing">
                                            <option value="furnished">Furnished</option>
                                            <option value="unfurnished">Unfurnished</option>
                                        </optgroup>
                                        <optgroup label="Recreation">
                                            <option value="tennis">Tennis Court</option>
                                            <option value="basketball">Basketball Court</option>
                                        </optgroup>
                                        <optgroup label="Nearby">
                                            <option value="shopping">Shopping Mall</option>
                                            <option value="restaurant">Restaurant</option>
                                            <option value="hospital">Hospital</option>
                                            <option value="school">School</option>
                                            <option value="metro">Metro Station</option>
                                            <option value="bus">Bus Stop</option>
                                            <option value="airport">Airport</option>
                                        </optgroup>
                                        <optgroup label="Pets">
                                            <option value="pets">Pet Friendly</option>
                                        </optgroup>
                                    </select>
                                    <div className="icon-preview-container">
                                        {renderIconPreview(facility.icon)}
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Count"
                                        value={facility.count || ""}
                                        onChange={(e) => handleFacilityChange(index, "count", e.target.value)}
                                        className="enhanced-admin-input"
                                        min="0"
                                        style={{ maxWidth: '100px' }}
                                    />
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
                            background: message.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: message.includes('successfully') ? '#059669' : '#dc2626',
                            textAlign: 'center',
                            fontWeight: '500'
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
