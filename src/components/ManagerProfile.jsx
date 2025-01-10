import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../assets/styles/ManagerProfile.css';
import '../assets/styles/Profile.css';

const ManagerProfile = () => {
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";
    const [username, setUsername] = useState("Anonymous");
    const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUsername(userData.username || "Anonymous");
                    setProfilePicture(userData.profilePicture || defaultProfilePicture);
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    const handlePendingRequests = () => {
        navigate('/pending-requests');
    };

    const handleAcceptedRequests = () => {
        navigate('/accepted-requests');
    };

    const handleDeclinedRequests = () => {
        navigate('/declined-requests');
    };

    const handleCreateEvent = () => {
        navigate('/create-event');
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="manager-profile-page">
            <div className="profile-menu">
                <ul>
                    <li><Link to="/change-profile-picture">Change Profile Picture</Link></li>
                    <li><button onClick={handlePendingRequests} className="menu-button">Pending Requests</button></li>
                    <li><button onClick={handleAcceptedRequests} className="menu-button">Accepted Requests</button></li>
                    <li><button onClick={handleDeclinedRequests} className="menu-button">Declined Requests</button></li>
                    <li><button onClick={handleCreateEvent} className="menu-button">Create Event</button></li>
                </ul>
            </div>
            <div className="profile-main">
                <h1>Manager Profile</h1>
                <div className="profile-info">
                    <img
                        src={profilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <h2 className="username">{username}</h2>
                </div>
                <p>Welcome, Manager! Manage your requests on the left.</p>
            </div>
        </div>
    );
};

export default ManagerProfile;