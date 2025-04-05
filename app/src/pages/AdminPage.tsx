import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import "../styles/AdminPage.css";
import { facilityIcons } from "../utils/facilityIcons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";

const API = import.meta.env.VITE_API_URL;

const AdminPage: React.FC = () => {
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        price: "",
        rentPerMonth: "",
        location: "",
        coordinates: [0, 0] as [number, number],
        description: "",
        facilities: "",
    });
    const [facilities, setFacilities] = useState<{ name: string; value: string; icon?: string }[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "location") setLocationError(null);
    };

    const fetchCoordinates = async (location: string) => {
        if (!location) {
            setLocationError("Location is required.");
            return;
        }
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
            );
            if (response.data.length === 0) {
                throw new Error("No coordinates found for this location.");
            }
            const { lat, lon } = response.data[0];
            setFormData((prev) => ({ ...prev, coordinates: [parseFloat(lon), parseFloat(lat)] }));
            setLocationError(null);
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            setLocationError("Failed to fetch coordinates. Please check the location.");
            setFormData((prev) => ({ ...prev, coordinates: [0, 0] }));
        }
    };

    const handleLocationBlur = () => {
        fetchCoordinates(formData.location);
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setImages(Array.from(e.target.files));
    };

    const handleAddFacility = () => {
        setFacilities([...facilities, { name: "", value: "", icon: "" }]);
    };

    const handleFacilityChange = (index: number, field: string, value: string) => {
        const updatedFacilities = facilities.map((facility, i) =>
            i === index ? { ...facility, [field]: value } : facility
        );
        setFacilities(updatedFacilities);
    };

    const handleImagesUpload = async () => {
        if (images.length === 0) {
            return alert("Please select images to upload.");
        }
        setIsUploading(true);
        const uploadData = new FormData();
        images.forEach((image) => uploadData.append("images", image));
        try {
            const response = await axios.post(`${API}/api/properties/upload`, uploadData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setImageUrls(response.data.filePaths);
            alert("Images uploaded successfully!");
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Error uploading images:", axiosError.response?.data || axiosError.message);
            alert("Failed to upload images.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (imageUrls.length === 0) {
            alert("Please upload images first.");
            return;
        }
        if (!formData.location) {
            setLocationError("Location is required.");
            return;
        }
        if (formData.coordinates[0] === 0 && formData.coordinates[1] === 0) {
            await fetchCoordinates(formData.location);
            if (locationError || (formData.coordinates[0] === 0 && formData.coordinates[1] === 0)) {
                alert("Valid coordinates are required.");
                return;
            }
        }

        const formattedFacilities = facilities.map((facility) => ({
            name: facility.name.trim(),
            value: facility.value.trim(),
            icon: facility.icon || facilityIcons[facility.name] || null,
        }));

        try {
            await axios.post(
                `${API}/api/properties`,
                {
                    ...formData,
                    price: parseFloat(formData.price),
                    rentPerMonth: formData.rentPerMonth ? parseFloat(formData.rentPerMonth) : null,
                    coordinates: { type: "Point", coordinates: formData.coordinates },
                    images: imageUrls,
                    facilities: formattedFacilities,
                },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            alert("Property added successfully!");
            setFormData({ title: "", type: "", price: "", rentPerMonth: "", location: "", coordinates: [0, 0], description: "", facilities: "" });
            setFacilities([]);
            setImages([]);
            setImageUrls([]);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error("Error adding property:", axiosError.response?.data || axiosError.message);
            alert("Failed to add property.");
        }
    };

    const renderIconPreview = (icon?: string) => {
        if (!icon) return null;
        if (icon.startsWith("http")) {
            return <img src={icon} alt="Facility Icon" className="facility-icon-preview" />;
        }
        const faIcon = Icons[icon.replace("fa-", "") as keyof typeof Icons] as Icons.IconDefinition | undefined;
        return faIcon ? <FontAwesomeIcon icon={faIcon} className="facility-icon-preview" /> : null;
    };

    return (
        <div className="enhanced-admin-container">
            <h1 className="enhanced-admin-title">Admin Page</h1>
            <p className="enhanced-admin-subtitle">Manage and add properties to the platform easily.</p>
            <form className="enhanced-admin-form" onSubmit={handleSubmit}>
                <input type="text" name="title" placeholder="Property Title" value={formData.title} onChange={handleChange} className="enhanced-admin-input" />
                <select name="type" value={formData.type} onChange={handleChange} className="enhanced-admin-select">
                    <option value="">Select Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                </select>
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="enhanced-admin-input" />
                <input type="number" name="rentPerMonth" placeholder="Rent Per Month" value={formData.rentPerMonth} onChange={handleChange} className="enhanced-admin-input" />
                <input
                    type="text"
                    name="location"
                    placeholder="Location (e.g., Bandra, Mumbai)"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleLocationBlur}
                    className="enhanced-admin-input"
                />
                {locationError && <p className="enhanced-admin-error">{locationError}</p>}
                <textarea name="description" placeholder="Property Description" value={formData.description} onChange={handleChange} className="enhanced-admin-textarea"></textarea>
                <input type="text" name="facilities" placeholder="Other Facilities (comma-separated)" value={formData.facilities} onChange={handleChange} className="enhanced-admin-input" />
                <div className="enhanced-admin-file-upload-section">
                    <input type="file" multiple onChange={handleImagesChange} className="enhanced-admin-file-upload" />
                    <button type="button" onClick={handleImagesUpload} className="enhanced-admin-button enhanced-admin-button-blue" disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Upload Images"}
                    </button>
                </div>
                <h3>Facilities</h3>
                {facilities.map((facility, index) => (
                    <div key={index} className="facility-row">
                        <input
                            type="text"
                            placeholder="Facility Name"
                            value={facility.name}
                            onChange={(e) => handleFacilityChange(index, "name", e.target.value)}
                            className="enhanced-admin-input"
                        />
                        <input
                            type="text"
                            placeholder="Facility Value (e.g., 2)"
                            value={facility.value}
                            onChange={(e) => handleFacilityChange(index, "value", e.target.value)}
                            className="enhanced-admin-input"
                        />
                        <select
                            value={facility.icon || ""}
                            onChange={(e) => handleFacilityChange(index, "icon", e.target.value)}
                            className="enhanced-admin-select"
                        >
                            <option value="">Select Icon</option>
                            {Object.entries(facilityIcons).map(([name, icon]) => (
                                <option key={icon} value={icon}>{name}</option>
                            ))}
                        </select>
                        {renderIconPreview(facility.icon)}
                    </div>
                ))}
                <button type="button" onClick={handleAddFacility} className="enhanced-admin-button">Add Facility</button>
                <button type="submit" className="enhanced-admin-button enhanced-admin-button-green" disabled={isUploading || imageUrls.length === 0}>
                    Add Property
                </button>
            </form>
        </div>
    );
};

export default AdminPage;
