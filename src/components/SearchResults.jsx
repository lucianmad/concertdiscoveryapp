import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { firestore } from '../firebaseConfig';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import '../assets/styles/SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('query');
    const [results, setResults] = useState([]);
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const artistsRef = collection(firestore, 'artists');
                const q = query(artistsRef, where('artistName', '>=', searchQuery), where('artistName', '<=', searchQuery + '\uf8ff'));
                const querySnapshot = await getDocs(q);

                const artists = [];
                for (const document of querySnapshot.docs) {
                    const artistData = document.data();

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

                setResults(artists);
            } catch (error) {
                console.error('Error fetching artists:', error);
            }
        };

        if (searchQuery) {
            fetchArtists();
        }
    }, [searchQuery]);

    return (
        <div className="search-results">
            <h2>Search Results for "{searchQuery}"</h2>
            <div className="results-container">
                {results.map((artist) => (
                    <Link to={`/artist/${artist.userId}`} key={artist.id} className="artist-card">
                        <img
                            src={artist.profilePicture}
                            alt={artist.artistName}
                            className="artist-profile-picture"
                        />
                        <span className="artist-name">{artist.artistName}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;