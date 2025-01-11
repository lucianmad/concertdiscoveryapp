import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import '../assets/styles/ArtistProfile.css';

const PublicArtistProfile = () => {
    const { userId } = useParams();
    const [artist, setArtist] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showEventModal, setShowEventModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [isManager, setIsManager] = useState(false);
    const defaultProfilePicture = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (user) {
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
                        setArtist({
                            ...artistData,
                            profilePicture: artistData.profilePicture || defaultProfilePicture,
                        });

                        const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', userId);
                        const favoriteDocSnap = await getDoc(favoriteDocRef);
                        setIsFavorite(favoriteDocSnap.exists());
                    } else {
                        setArtist(null);
                    }
                } catch (error) {
                    setArtist(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleAddToFavorites = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const artistId = userId;
                const artistDocRef = doc(firestore, 'artists', artistId);
                const artistDocSnap = await getDoc(artistDocRef);

                if (artistDocSnap.exists()) {
                    const artistData = artistDocSnap.data();
                    const profilePicture = artistData.profilePicture || defaultProfilePicture;

                    const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', artistId);
                    await setDoc(favoriteDocRef, {
                        addedAt: new Date(),
                        profilePicture: profilePicture,
                    });
                    setIsFavorite(true);
                }
            } catch (error) {
                alert('Failed to add artist to favorites.');
            }
        } else {
            alert('You must be logged in to add artists to favorites.');
        }
    };

    const handleRemoveFromFavorites = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const artistId = userId;
                const favoriteDocRef = doc(firestore, 'favorites', user.uid, 'artists', artistId);
                await deleteDoc(favoriteDocRef);
                setIsFavorite(false);
            } catch (error) {
                alert('Failed to remove artist from favorites.');
            }
        } else {
            alert('You must be logged in to remove artists from favorites.');
        }
    };

    const fetchManagerEvents = async () => {
        const user = auth.currentUser;
        if (user) {
            const q = query(collection(firestore, 'events'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setEvents(eventsData);
        }
    };

    const handleAddToEvent = async () => {
        if (!selectedEventId) {
            alert('Please select an event.');
            return;
        }

        try {
            console.log("Fetching event document...");
            const eventRef = doc(firestore, 'events', selectedEventId);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                alert('Event not found.');
                return;
            }

            console.log("Event document fetched successfully:", eventDoc.data());

            const eventData = eventDoc.data();
            const updatedArtistIds = [...eventData.artistIds];

            if (updatedArtistIds.includes(userId)) {
                alert('Artist is already added to this event.');
                return;
            }

            console.log("Adding artist to event...");
            updatedArtistIds.push(userId);
            await updateDoc(eventRef, { artistIds: updatedArtistIds });

            console.log("Artist added to event. Creating pending request...");
            await addDoc(collection(firestore, 'pendingRequests'), {
                userId: auth.currentUser.uid,
                artistId: userId,
                eventId: selectedEventId,
                status: 'pending',
                timestamp: new Date(),
            });

            console.log("Pending request created successfully.");
            //alert('Artist added to event successfully!');
            setShowEventModal(false);
        } catch (error) {
            console.error('Error adding artist to event:', error);
            //alert('Failed to add artist to event.');
        }
    };

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
                        src={artist.profilePicture || defaultProfilePicture}
                        alt="Profile"
                        className="profile-picture"
                    />
                    <h2 className="username">{artist.artistName}</h2>
                </div>
                <p>This is a public artist profile.</p>

                {isFavorite ? (
                    <button
                        className="remove-favorite-button"
                        onClick={handleRemoveFromFavorites}
                    >
                        Remove from Favorites
                    </button>
                ) : (
                    <button
                        className="favorite-button"
                        onClick={handleAddToFavorites}
                    >
                        Add to Favorites
                    </button>
                )}

                {isManager && (
                    <>
                        <button
                            className="add-to-event-button"
                            onClick={() => { setShowEventModal(true); fetchManagerEvents(); }}
                        >
                            Add to Event
                        </button>

                        {showEventModal && (
                            <div className="event-modal">
                                <div className="event-modal-content">
                                    <h2>Select an Event</h2>
                                    <select
                                        value={selectedEventId}
                                        onChange={(e) => setSelectedEventId(e.target.value)}
                                    >
                                        <option value="">Select an event</option>
                                        {events.map((event) => (
                                            <option key={event.id} value={event.id}>
                                                {event.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={handleAddToEvent}>Add</button>
                                    <button onClick={() => setShowEventModal(false)} className="cancel-button">Cancel</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PublicArtistProfile;