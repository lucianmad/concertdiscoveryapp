import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import '../assets/styles/SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('query');
    const [results, setResults] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    useEffect(() => {
        const fetchArtistsAndFavorites = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const artistsRef = collection(firestore, 'artists');
                    const querySnapshot = await getDocs(artistsRef);

                    const artists = [];
                    for (const document of querySnapshot.docs) {
                        const artistData = document.data();

                        if (artistData.artistName.toLowerCase().includes(searchQuery.toLowerCase())) {
                            const userDocRef = doc(firestore, 'users', artistData.userId);
                            const userDocSnap = await getDoc(userDocRef);

                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                artists.push({
                                    id: document.id,
                                    ...artistData,
                                    profilePicture: userData.profilePicture || defaultProfilePicture,
                                });
                            } else {
                                artists.push({
                                    id: document.id,
                                    ...artistData,
                                    profilePicture: defaultProfilePicture,
                                });
                            }
                        }
                    }

                    setResults(artists);

                    const favoritesRef = collection(firestore, 'favorites', user.uid, 'artists');
                    const favoritesSnapshot = await getDocs(favoritesRef);

                    const favoriteArtists = [];
                    favoritesSnapshot.forEach((doc) => {
                        favoriteArtists.push(doc.id);
                    });

                    setFavorites(favoriteArtists);
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (searchQuery) {
            fetchArtistsAndFavorites();
        }
    }, [searchQuery]);

    const handleAddToFavorites = async (artistId, profilePicture) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', artistId);
                await setDoc(favoriteDocRef, {
                    addedAt: new Date(),
                    profilePicture: profilePicture || defaultProfilePicture,
                });
                setFavorites([...favorites, artistId]);
            } catch (error) {
                console.error('Error adding to favorites:', error);
                alert('Failed to add artist to favorites.');
            }
        } else {
            alert('You must be logged in to add artists to favorites.');
        }
    };

    const handleRemoveFromFavorites = async (artistId) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', artistId);
                await deleteDoc(favoriteDocRef);
                setFavorites(favorites.filter((id) => id !== artistId));
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
        <div className="search-results">
            <h2>Search Results for "{searchQuery}"</h2>
            <div className="results-container">
                {results.map((artist) => (
                    <div key={artist.id} className="artist-card">
                        <Link to={`/artist/${artist.userId}`} className="artist-link">
                            <img
                                src={artist.profilePicture}
                                alt={artist.artistName}
                                className="artist-profile-picture"
                            />
                            <span className="artist-name">{artist.artistName}</span>
                        </Link>
                        {favorites.includes(artist.userId) ? (
                            <button
                                className="remove-favorite-button"
                                onClick={() => handleRemoveFromFavorites(artist.userId)}
                            >
                                Remove from Favorites
                            </button>
                        ) : (
                            <button
                                className="favorite-button"
                                onClick={() => handleAddToFavorites(artist.userId, artist.profilePicture)}
                            >
                                Add to Favorites
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;