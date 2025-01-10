import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
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
            const user = auth.currentUser;
            if (!user) {
                throw new Error('You must be logged in to submit this form.');
            }

            const applicationsRef = collection(firestore, 'managerApplications');
            await addDoc(applicationsRef, {
                userId: user.uid,
                fullName: formData.fullName,
                organizationName: formData.organizationName,
                email: formData.email,
                timestamp: new Date(),
                status: "pending",
            });

            setStatus("Your application has been submitted! An admin will review it shortly.");
            setShowBackButton(true);
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