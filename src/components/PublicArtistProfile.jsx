import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import {doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, setDoc} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import '../assets/styles/PublicArtistProfile.css';

const PublicArtistProfile = () => {
    const { userId } = useParams();
    const [artist, setArtist] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isManager, setIsManager] = useState(false);
    const [artistPosts, setArtistPosts] = useState([]);
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    const handleImComing = async (postId, attendees) => {
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to RSVP to events.');
            return;
        }

        try {
            const postRef = doc(firestore, 'posts', postId);
            const updatedAttendees = attendees?.includes(user.uid)
                ? attendees.filter((id) => id !== user.uid)
                : [...(attendees || []), user.uid];

            await updateDoc(postRef, { attendees: updatedAttendees });

            setArtistPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId ? { ...post, attendees: updatedAttendees } : post
                )
            );
        } catch (error) {
            console.error('Error updating attendees:', error);
            alert('Failed to update your RSVP status.');
        }
    };

    const handleAddToFavorites = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', userId);
                await setDoc(favoriteDocRef, {
                    addedAt: new Date(),
                });
                setIsFavorite(true);
            } catch (error) {
                console.error('Error adding to favorites:', error);
            }
        } else {
            alert('You must be logged in to add artists to favorites.');
        }
    };

    const handleRemoveFromFavorites = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', userId);
                await deleteDoc(favoriteDocRef);
                setIsFavorite(false);
            } catch (error) {
                console.error('Error removing from favorites:', error);
            }
        } else {
            alert('You must be logged in to remove artists from favorites.');
        }
    };

    const fetchData = async (user) => {
        if (!userId) return;

        try {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setIsManager(userData.isManager || false);
            }

            const artistDocRef = doc(firestore, 'artists', userId);
            const artistDocSnap = await getDoc(artistDocRef);

            if (artistDocSnap.exists()) {
                const artistData = artistDocSnap.data();

                const artistUserDocRef = doc(firestore, 'users', userId);
                const artistUserDocSnap = await getDoc(artistUserDocRef);
                const artistProfilePicture = artistUserDocSnap.exists()
                    ? artistUserDocSnap.data().profilePicture || defaultProfilePicture
                    : defaultProfilePicture;

                setArtist({
                    ...artistData,
                    profilePicture: artistProfilePicture,
                    publicDescription: artistUserDocSnap.data().publicDescription || "",
                });

                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', userId);
                const favoriteDocSnap = await getDoc(favoriteDocRef);
                setIsFavorite(favoriteDocSnap.exists());

                const postsQuery = query(
                    collection(firestore, 'posts'),
                    where('artistId', '==', userId)
                );
                const postsSnapshot = await getDocs(postsQuery);
                const postsData = postsSnapshot.docs.map((doc) => {
                    const postData = doc.data();
                    console.log('Post Data:', postData);
                    return {
                        id: doc.id,
                        ...postData,
                        artistProfilePicture: postData.artistProfilePicture || artistProfilePicture,
                    };
                });
                setArtistPosts(postsData);
            } else {
                setArtist(null);
            }
        } catch (error) {
            setArtist(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchData(user);
            } else {
                setArtist(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!artist) {
        return <p>Artist not found.</p>;
    }

    return (
        <div className="profile-page-artist">
            <div className="profile-main">
                <h1>Artist Profile</h1>
                <div className="profile-info">
                    <img
                        src={artist.profilePicture || defaultProfilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <h2 className="username">{artist.artistName}</h2>
                </div>
                <p>{artist.publicDescription}</p>

                {isFavorite ? (
                    <button
                        onClick={handleRemoveFromFavorites}
                        className="remove-favorite-button"
                    >
                        Remove from Favorites
                    </button>
                ) : (
                    <button
                        onClick={handleAddToFavorites}
                        className="favorite-button"
                    >
                        Add to Favorites
                    </button>
                )}

                <div className="posts-section">
                    <h3>Posts</h3>
                    <ul className="posts-list">
                        {artistPosts.map((post) => (
                            <li key={post.id} className="post-item">
                                <div className="post-header">
                                    <img
                                        src={post.artistProfilePicture || defaultProfilePicture}
                                        alt="Artist"
                                        className="artist-profile-picture"
                                        onError={(e) => {
                                            e.target.src = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";
                                        }}
                                    />
                                    <div className="post-header-info">
                                        <h3>{post.artistName}</h3>
                                        <p className="post-timestamp">
                                            {new Date(post.timestamp?.toDate()).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="post-content">
                                    <h4>{post.eventName}</h4>
                                    <p>{post.description}</p>
                                    {post.eventPhotoUrl && (
                                        <img
                                            src={post.eventPhotoUrl}
                                            alt="Event"
                                            className="event-photo"
                                        />
                                    )}
                                    <button
                                        onClick={() => handleImComing(post.id, post.attendees)}
                                        className={`im-coming-button ${post.attendees?.includes(auth.currentUser?.uid) ? 'not-coming' : ''}`}
                                    >
                                        {post.attendees?.includes(auth.currentUser?.uid) ? "I'm Not Coming Anymore" : "I'm Coming"}
                                    </button>
                                    <p className="attendees-count">
                                        <strong>Attendees:</strong> {post.attendees ? post.attendees.length : 0}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PublicArtistProfile;