import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../assets/styles/ArtistProfile.css';

const PublicArtistProfile = () => {
    const { userId } = useParams();
    const [artist, setArtist] = useState(null);
    const [loading, setLoading] = useState(true);
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const artistDocRef = doc(firestore, 'artists', userId);
                const artistDocSnap = await getDoc(artistDocRef);

                if (artistDocSnap.exists()) {
                    const artistData = artistDocSnap.data();

                    const userDocRef = doc(firestore, 'users', userId);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setArtist({
                            ...artistData,
                            profilePicture: userData.profilePicture || defaultProfilePicture,
                        });
                    } else {
                        setArtist(artistData);
                    }
                } else {
                    console.log('No such artist!');
                }
            } catch (error) {
                console.error('Error fetching artist:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtist();
    }, [userId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!artist) {
        return <p>Artist not found.</p>;
    }

    return (
        <div className="profile-page">
            <div className="profile-main">
                <h1>Artist Profile</h1>
                <div className="profile-info">
                    <img
                        src={artist.profilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <h2 className="username">{artist.artistName}</h2>
                </div>
                <p>This is a public artist profile.</p>
            </div>
        </div>
    );
};

export default PublicArtistProfile;