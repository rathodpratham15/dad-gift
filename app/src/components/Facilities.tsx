import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as Icons from "@fortawesome/free-solid-svg-icons";

interface Facility {
    name: string;
    value: string;
    icon?: string;
}

interface FacilitiesProps {
    facilities: Facility[];
}

const Facilities: React.FC<FacilitiesProps> = ({ facilities }) => {
    const renderIcon = (icon?: string) => {
        if (!icon) return <span className="facility-icon">?</span>;
        if (icon.startsWith("http")) {
            return <img src={icon} alt="Facility Icon" className="facility-icon" />;
        }
        const faIcon = Icons[icon.replace("fa-", "") as keyof typeof Icons] as IconDefinition | undefined;
        return faIcon ? <FontAwesomeIcon icon={faIcon} className="facility-icon" /> : <span className="facility-icon">?</span>;
    };

    return (
        <div className="facilities-list">
            {facilities.map((facility, index) => (
                <div key={index} className="facility-card">
                    {renderIcon(facility.icon)}
                    <span className="facility-value">{facility.value}</span>
                    <span className="facility-name">{facility.name}</span>
                </div>
            ))}
        </div>
    );
};

export default Facilities;