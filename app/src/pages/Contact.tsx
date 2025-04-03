import React from "react";
import "../styles/Contact.css";
// import { Building } from 'lucide-react';



const Contact: React.FC = () => {
    return (
        <div className="enhanced-contact-container">
            <h1 className="enhanced-contact-title">Get in Touch</h1>
            <p className="enhanced-contact-subtitle">
                We're here to help you with all your real estate needs. Contact us today!
            </p>
            <div className="enhanced-contact-grid">
                {/* Contact Form */}
                <form className="enhanced-contact-form">
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="enhanced-contact-input"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Your Email"
                        className="enhanced-contact-input"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Your Phone"
                        className="enhanced-contact-input"
                        required
                    />
                    <textarea
                        placeholder="Your Message"
                        className="enhanced-contact-textarea"
                        rows={5}
                        required
                    ></textarea>
                    <button className="enhanced-contact-button">Send Message</button>
                </form>

                {/* Contact Details */}
                <div className="enhanced-contact-details">
                    <div className="enhanced-contact-detail-item">
                        <h3>Office Address</h3>
                        <p>Shop No.3, Shree Ganesh Real Estate Consultants <br />
                            Below Casa Pieadade Building, <br />
                            Opposite Shiv Sena Shaka, <br />
                            Charai, Thane West, 400601
                        </p>
                          
                    </div>
                    <div className="enhanced-contact-detail-item">
                        <h3>Phone</h3>
                        <p>+91 9820145764</p>
                    </div>
                    <div className="enhanced-contact-detail-item">
                        <h3>Email</h3>
                        <p>shreeganesh909@gmail.com</p>
                    </div>
                    <iframe
                        title="Map"
                        className="enhanced-contact-map"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.9626860883714!2d72.97209297545855!3d19.19683204816771!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b923445f6d2f%3A0xb38dbacbdf3bc1aa!2sCasa%20Piedade%2C%20Opp.%20Shivsena%20Shakha%2C%20Charai%2C%20Thane%20West%2C%20Thane%2C%20Maharashtra%20400601%2C%20India!5e0!3m2!1sen!2sus!4v1735378472484!5m2!1sen!2sus"
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
