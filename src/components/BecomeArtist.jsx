import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/BecomeArtist.css';
import { auth, firestore } from '../firebaseConfig';
import {doc, updateDoc} from "firebase/firestore";

const BecomeArtist = ({ user, setUser }) => {
    const [artistName, setArtistName] = useState('');
    const [status, setStatus] = useState('');
    const [showBackButton, setShowBackButton] = useState(false);
    const navigate = useNavigate();

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
                await updateDoc(userDocRef, {
                    isArtist: true,
                    username: artistName,
                });
                console.log('Firestore document updated successfully');
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
