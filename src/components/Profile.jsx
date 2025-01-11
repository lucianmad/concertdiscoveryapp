import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../assets/styles/Profile.css';

const Profile = ({ username, profilePicture }) => {
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isArtist, setIsArtist] = useState(false);
    const [isManager, setIsManager] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setIsArtist(userData.isArtist || false);
                    setIsManager(userData.isManager || false);

                    if (userData.isArtist) {
                        navigate('/artist-profile');
                    } else if (userData.isManager) {
                        navigate('/manager-profile');
                    } else {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="profile-page">
            <div className="profile-menu">
                <ul>
                    <li><Link to="/favorites" className="menu-link">Your Favorite Artists</Link></li>
                    <li><Link to="/change-profile-picture" className="menu-link">Change Profile Picture</Link></li>
                    <li><Link to="/become-artist" className="menu-link">Become an Artist</Link></li>
                    <li><Link to="/become-manager" className="menu-link">Become a Manager</Link></li>
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