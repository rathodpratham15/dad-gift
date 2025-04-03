import React from "react";

interface WhatsAppButtonProps {
    message: string;
    phone?: string;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    message,
    phone = "919594975764",
    position = "bottom-right"
}) => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    // Position styles based on prop
    const getPositionStyles = () => {
        switch (position) {
            case "bottom-left":
                return { bottom: 20, left: 20 };
            case "top-right":
                return { top: 20, right: 20 };
            case "top-left":
                return { top: 20, left: 20 };
            case "bottom-right":
            default:
                return { bottom: 20, right: 20 };
        }
    };

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
            title="Chat on WhatsApp"
            style={{
                position: "fixed",
                ...getPositionStyles(),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#25D366",
                color: "#fff",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                textDecoration: "none",
                transition: "all 0.3s ease",
                zIndex: 1000,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.boxShadow = "0 6px 14px rgba(0, 0, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="28"
                height="28"
                fill="#FFFFFF"
            >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L.1 24l6.1-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5zM12 22c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.8 1 1-3.7-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10z" />
            </svg>
        </a>
    );
};

export default WhatsAppButton;