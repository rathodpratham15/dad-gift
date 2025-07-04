import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import { facilityIcons } from "../utils/facilityIcons";

interface Facility {
    name: string;
    value: string;
    icon?: string;
}

interface FacilitiesProps {
    facilities: Facility[];
}

const Facilities: React.FC<FacilitiesProps> = ({ facilities }) => {
    const renderIcon = (iconKey?: string, facilityName?: string) => {
        if (!iconKey) {
            // Fallback to icon based on facility name if icon is missing
            const nameLower = facilityName?.toLowerCase() || "";
            if (nameLower.includes("bedroom") || nameLower.includes("bed")) {
                iconKey = "bedroom";
            } else if (nameLower.includes("bathroom") || nameLower.includes("bath")) {
                iconKey = "bathroom";
            } else if (nameLower.includes("kitchen")) {
                iconKey = "kitchen";
            } else if (nameLower.includes("parking") || nameLower.includes("garage")) {
                iconKey = "garage";
            } else if (nameLower.includes("pool") || nameLower.includes("swimming")) {
                iconKey = "pool";
            } else if (nameLower.includes("gym") || nameLower.includes("fitness")) {
                iconKey = "gym";
            } else if (nameLower.includes("wifi") || nameLower.includes("internet")) {
                iconKey = "wifi";
            } else if (nameLower.includes("security")) {
                iconKey = "security";
            } else if (nameLower.includes("elevator") || nameLower.includes("lift")) {
                iconKey = "elevator";
            } else if (nameLower.includes("balcony") || nameLower.includes("terrace")) {
                iconKey = "balcony";
            } else {
                return <span className="facility-icon">?</span>;
            }
        }
        
        // First, try to get the icon URL/FontAwesome code from our facilityIcons mapping
        const iconValue = facilityIcons[iconKey] || iconKey;
        
        // If it's a URL (for bedroom, bathroom)
        if (iconValue.startsWith("http")) {
            return <img src={iconValue} alt="Facility Icon" className="facility-icon" />;
        }
        
        // If it's a FontAwesome icon
        if (iconValue.startsWith("fa-")) {
            const faIcon = Icons[iconValue.replace("fa-", "") as keyof typeof Icons] as IconDefinition | undefined;
            return faIcon ? <FontAwesomeIcon icon={faIcon} className="facility-icon" /> : <span className="facility-icon">?</span>;
        }
        
        // Fallback for direct URLs (legacy support)
        if (iconKey.startsWith("http")) {
            return <img src={iconKey} alt="Facility Icon" className="facility-icon" />;
        }
        
        // Fallback for direct FontAwesome (legacy support)
        if (iconKey.startsWith("fa-")) {
            const faIcon = Icons[iconKey.replace("fa-", "") as keyof typeof Icons] as IconDefinition | undefined;
            return faIcon ? <FontAwesomeIcon icon={faIcon} className="facility-icon" /> : <span className="facility-icon">?</span>;
        }
        
        return <span className="facility-icon">?</span>;
    };

    return (
        <div className="facilities-list">
            {facilities.map((facility, index) => (
                <div key={index} className="facility-card">
                    {renderIcon(facility.icon, facility.name)}
                    <span className="facility-value">{facility.value}</span>
                    <span className="facility-name">{facility.name}</span>
                </div>
            ))}
        </div>
    );
};

export default Facilities;