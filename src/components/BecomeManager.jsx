import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/BecomeManager.css';

const BecomeManager = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        organizationName: "",
        email: "",
    });
    const [status, setStatus] = useState("");
    const [showBackButton, setShowBackButton] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Submitting...");

        try {
            const response = await fetch("https://sendemail-4gbyv5twhq-uc.a.run.app", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus("Your application has been submitted!");
                setShowBackButton(true);
            } else {
                setStatus("Failed to submit. Please try again later.");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setStatus("Error occurred. Please try again.");
        }
    };

    const handleBackToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="become-manager-container">
            <h1>Become a Manager</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name:</label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="organizationName">Organization Name:</label>
                    <input
                        type="text"
                        id="organizationName"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email (Org Domain):</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="btn-submit">Submit</button>
            </form>

            {status && <p className="form-message">{status}</p>}

            {showBackButton && (
                <button
                    className="btn-back-to-profile"
                    onClick={handleBackToProfile}
                >
                    Back to Profile
                </button>
            )}

        </div>
    );
};

export default BecomeManager;
