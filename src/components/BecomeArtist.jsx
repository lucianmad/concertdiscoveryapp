import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/BecomeArtist.css';
import { auth, firestore } from '../firebaseConfig';
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";

const BecomeArtist = () => {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [artistName, setArtistName] = useState('');
    const [status, setStatus] = useState('');
    const [showBackButton, setShowBackButton] = useState(false);
    const navigate = useNavigate();
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    const handleFacebookLogin = () => {
        FB.login((response) => {
            if (response.status === 'connected') {
                const { userID, accessToken } = response.authResponse;

                FB.api('/me', { fields: 'name,email' }, (userData) => {
                    console.log('Facebook user data:', userData);

                    (async () => {
                        try {
                            await updateUserArtistStatus({
                                artistName: artistName,
                                id: userID,
                                email: userData.email,
                            });

                            setUser((prevUser) => {
                                const updatedUser = {
                                    ...prevUser,
                                    isArtist: true,
                                    username: artistName,
                                };
                                localStorage.setItem('user', JSON.stringify(updatedUser));
                                return updatedUser;
                            });

                            navigate('/artist-profile');
                        } catch (error) {
                            console.error('Error linking artist status:', error);
                        }
                    })();
                });
            } else {
                console.error('Facebook login failed:', response);
            }
        }, { scope: 'email' });
    };

    const updateUserArtistStatus = async (userData) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userProfilePicture = userDocSnap.data().profilePicture || defaultProfilePicture;

                    await updateDoc(userDocRef, {
                        isArtist: true,
                        username: artistName,
                    });

                    const artistDocRef = doc(firestore, 'artists', user.uid);
                    await setDoc(artistDocRef, {
                        artistName: artistName,
                        userId: user.uid,
                        email: userData.email,
                        profilePicture: userProfilePicture,
                        createdAt: new Date(),
                    });

                    console.log('Firestore document updated and artist profile created successfully');
                } else {
                    console.error('User document not found in Firestore');
                }
            }

            const response = await fetch('https://artistprofile-4gbyv5twhq-uc.a.run.app', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    artistName: artistName,
                    userId: userData.id,
                    email: userData.email,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Artist status linked:', data);

            setStatus('Your artist status has been verified!');
            setShowBackButton(true);
        } catch (error) {
            console.error('Error linking artist status:', error);
            setStatus('Error linking your artist status. Please try again.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Submitting...');
        handleFacebookLogin();
    };

    const handleBackToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="become-artist-container">
            <h1>Become an Artist</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="artistName">Artist Name:</label>
                    <input
                        type="text"
                        id="artistName"
                        name="artistName"
                        value={artistName}
                        onChange={(e) => setArtistName(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-submit">Verify with Facebook</button>
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

export default BecomeArtist;
