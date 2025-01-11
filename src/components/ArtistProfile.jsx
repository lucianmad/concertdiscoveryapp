import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import '../assets/styles/ArtistProfile.css';
import '../assets/styles/Profile.css';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ArtistProfile = () => {
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";
    const [username, setUsername] = useState("Anonymous");
    const [profilePicture, setProfilePicture] = useState(defaultProfilePicture);
    const [publicDescription, setPublicDescription] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUsername(userData.username || "Anonymous");
                    setProfilePicture(userData.profilePicture || defaultProfilePicture);
                    setPublicDescription(userData.publicDescription || "");
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSaveDescription = async () => {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
                publicDescription: publicDescription,
            });
            setIsEditing(false);
        }
    };

    const handleEditDescription = () => {
        setIsEditing(true); // Enter edit mode
    };

    const handlePendingRequests = () => {
        navigate('/pending-requests');
    };

    const handleAcceptedRequests = () => {
        navigate('/accepted-requests');
    };

    const handleDeclinedRequests = () => {
        navigate('/declined-requests');
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="profile-page">
            <div className="profile-menu">
                <ul>
                    <li><Link to="/favorites">Your Favorite Artists</Link></li>
                    <li><Link to="/change-profile-picture">Change Profile Picture</Link></li>
                    <li><button onClick={handlePendingRequests} className="menu-button">Pending Requests</button></li>
                    <li><button onClick={handleAcceptedRequests} className="menu-button">Accepted Requests</button></li>
                    <li><button onClick={handleDeclinedRequests} className="menu-button">Declined Requests</button></li>
                </ul>
            </div>
            <div className="profile-main">
                <h1>Artist Profile</h1>
                <div className="profile-info">
                    <img
                        src={profilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <h2 className="username">{username}</h2>
                </div>
                <div className="description-section">
                    {isEditing ? (
                        <>
                            <textarea
                                value={publicDescription}
                                onChange={(e) => setPublicDescription(e.target.value)}
                                placeholder="Add a public description..."
                                className="description-textarea"
                            />
                            <button onClick={handleSaveDescription} className="save-button">
                                Save Description
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="description-view">{publicDescription || "No description added yet."}</p>
                            <button onClick={handleEditDescription} className="edit-button">
                                Edit Description
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArtistProfile;