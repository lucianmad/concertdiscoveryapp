import React from 'react';
import {Link} from "react-router-dom";
import '../assets/styles/Profile.css';

const Profile = ({ username, profilePicture }) => {
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    return (
        <div className="profile-page">
            <div className="profile-menu">
                <ul>
                    <li><Link to="/change-profile-picture">Change Profile Picture</Link></li>
                    <li>Become an Artist</li>
                    <li><Link to="/become-manager">Become a Manager</Link></li>
                </ul>
            </div>
            <div className="profile-main">
                <h1>Profile Page</h1>
                <div className="profile-info">
                    <img
                        src={profilePicture || defaultProfilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <h2 className="username">{username || "Anonymous"}</h2>
                </div>
                <p>Welcome to your profile page.</p>
            </div>
        </div>
    );
};

export default Profile;
