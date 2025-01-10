import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebaseConfig';
import {collection, doc, getDoc, getDocs, deleteDoc} from 'firebase/firestore';
import '../assets/styles/Favorites.css';
import {Link} from "react-router-dom";

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const favoritesRef = collection(firestore, 'favorites', user.uid, 'artists');
                    const querySnapshot = await getDocs(favoritesRef);

                    const favoriteArtists = [];
                    for (const document of querySnapshot.docs) {
                        const artistId = document.id;
                        const artistDocRef = doc(firestore, 'artists', artistId);
                        const artistDocSnap = await getDoc(artistDocRef);

                        if (artistDocSnap.exists()) {
                            const artistData = artistDocSnap.data();
                            favoriteArtists.push({
                                id: artistId,
                                ...artistData,
                            });
                        }
                    }

                    setFavorites(favoriteArtists);
                } catch (error) {
                    console.error('Error fetching favorites:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFavorites();
    }, []);

    const handleRemoveFromFavorites = async (artistId) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', artistId);
                await deleteDoc(favoriteDocRef);
                setFavorites(favorites.filter((artist) => artist.id !== artistId));
            } catch (error) {
                console.error('Error removing from favorites:', error);
                alert('Failed to remove artist from favorites.');
            }
        } else {
            alert('You must be logged in to remove artists from favorites.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="favorites-page">
            <h1>Your Favorite Artists</h1>
            {favorites.length === 0 ? (
                <p>You have no favorite artists yet.</p>
            ) : (
                <div className="favorites-container">
                    {favorites.map((artist) => (
                        <div key={artist.id} className="artist-card">
                            <Link to={`/artist/${artist.id}`} className="artist-link">
                                <img
                                    src={artist.profilePicture || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png"}
                                    alt={artist.artistName}
                                    className="artist-profile-picture"
                                />
                                <span className="artist-name">{artist.artistName}</span>
                            </Link>
                            <button
                                className="remove-favorite-button"
                                onClick={() => handleRemoveFromFavorites(artist.id)}
                            >
                                Remove from Favorites
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;