import React, { useEffect, useState } from 'react';
import {collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc} from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/AcceptedRequests.css';
import { onAuthStateChanged } from 'firebase/auth';

const AcceptedRequests = () => {
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postDescription, setPostDescription] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchAcceptedRequests(user.uid);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchAcceptedRequests = async (userId) => {
        try {
            const managerQuery = query(
                collection(firestore, 'pendingRequests'),
                where('userId', '==', userId),
                where('status', '==', 'accepted')
            );

            const artistQuery = query(
                collection(firestore, 'pendingRequests'),
                where('artistId', '==', userId),
                where('status', '==', 'accepted')
            );

            const [managerSnapshot, artistSnapshot] = await Promise.all([
                getDocs(managerQuery),
                getDocs(artistQuery),
            ]);

            const managerRequests = managerSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                role: 'manager',
            }));
            const artistRequests = artistSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                role: 'artist',
            }));

            const allRequests = [...managerRequests, ...artistRequests];
            const uniqueRequests = allRequests.filter(
                (request, index, self) => index === self.findIndex((r) => r.id === request.id)
            );

            const requestsWithEventDetails = await Promise.all(
                uniqueRequests.map(async (request) => {
                    const eventDoc = await getDoc(doc(firestore, 'events', request.eventId));

                    const postQuery = query(
                        collection(firestore, 'posts'),
                        where('eventId', '==', request.eventId),
                        where('artistId', '==', userId)
                    );
                    const postSnapshot = await getDocs(postQuery);
                    const isPublished = !postSnapshot.empty;

                    return {
                        ...request,
                        event: eventDoc.exists() ? eventDoc.data() : null,
                        isPublished,
                    };
                })
            );

            setAcceptedRequests(requestsWithEventDetails);
        } catch (error) {
            console.error('Error fetching accepted requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishPost = async () => {
        const user = auth.currentUser;
        if (user && selectedEvent) {
            try {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const artistName = userData.username || "Anonymous Artist";
                    const artistProfilePicture = userData.profilePicture || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";

                    await addDoc(collection(firestore, 'posts'), {
                        eventId: selectedEvent.eventId,
                        eventName: selectedEvent.eventName,
                        description: postDescription,
                        artistId: user.uid,
                        artistName: artistName,
                        artistProfilePicture: artistProfilePicture,
                        eventPhotoUrl: selectedEvent.eventPhotoUrl || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png",
                        timestamp: new Date(),
                    });

                    const pendingRequestRef = doc(firestore, 'pendingRequests', selectedEvent.requestId);
                    await updateDoc(pendingRequestRef, {
                        published: true,
                    });

                    setShowPostModal(false);
                    setPostDescription('');
                    setSelectedEvent(null);
                    await fetchAcceptedRequests(user.uid);
                } else {
                    alert('User data not found. Please try again.');
                }
            } catch (error) {
                console.error('Error publishing post:', error);
                alert('Failed to publish post.');
            }
        }
    };

    const openPostModal = (requestId, eventId, eventName, eventPhotoUrl) => {
        if (!requestId || !eventId || !eventName) {
            console.error("Missing required fields for selectedEvent:", { requestId, eventId, eventName });
            alert("Failed to open post modal. Missing required event details.");
            return;
        }

        setSelectedEvent({
            requestId,
            eventId,
            eventName,
            eventPhotoUrl: eventPhotoUrl || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png",
        });
        setShowPostModal(true);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="accepted-requests-page">
            <h1>Accepted Requests</h1>
            {acceptedRequests.length === 0 ? (
                <p>No accepted requests.</p>
            ) : (
                <ul>
                    {acceptedRequests.map((request) => (
                        <li key={request.id} className="request-item">
                            {request.event && (
                                <>
                                    <img
                                        src={request.event.photoUrl || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png"}
                                        alt="Event"
                                        className="event-photo"
                                    />
                                    <div className="event-details">
                                        <h2>{request.event.name}</h2>
                                        <p><strong>Location:</strong> {request.event.location}</p>
                                        <p><strong>Date:</strong> {request.event.date}</p>
                                        <p><strong>Description:</strong> {request.event.description}</p>
                                        {request.role === 'artist' && (
                                            request.isPublished ? (
                                                <p className="published-message">You have published this upcoming concert</p>
                                            ) : (
                                                <button
                                                    onClick={() => openPostModal(request.id, request.eventId, request.event.name, request.event.photoUrl)}
                                                    className="publish-post-button"
                                                >
                                                    Publish Post
                                                </button>
                                            )
                                        )}
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {showPostModal && (
                <div className="post-modal">
                    <div className="post-modal-content">
                        <h2>Publish a Post</h2>
                        <textarea
                            placeholder="Write your post here..."
                            value={postDescription}
                            onChange={(e) => setPostDescription(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={handlePublishPost}>Publish</button>
                            <button onClick={() => setShowPostModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcceptedRequests;