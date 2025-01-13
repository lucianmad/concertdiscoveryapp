import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/PendingRequests.css';
import { onAuthStateChanged } from 'firebase/auth';

const PendingRequests = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchPendingRequests(user.uid);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchPendingRequests = async (userId) => {
        try {
            const managerQuery = query(
                collection(firestore, 'pendingRequests'),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            );

            const artistQuery = query(
                collection(firestore, 'pendingRequests'),
                where('artistId', '==', userId),
                where('status', '==', 'pending')
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
                    return {
                        ...request,
                        event: eventDoc.exists() ? eventDoc.data() : null,
                    };
                })
            );

            setPendingRequests(requestsWithEventDetails);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const requestRef = doc(firestore, 'pendingRequests', requestId);
            await updateDoc(requestRef, { status: 'accepted' });
            fetchPendingRequests(auth.currentUser.uid);
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request.');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const requestRef = doc(firestore, 'pendingRequests', requestId);
            await updateDoc(requestRef, { status: 'rejected' });
            fetchPendingRequests(auth.currentUser.uid);
        } catch (error) {
            console.error('Error declining request:', error);
            alert('Failed to decline request.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="pending-requests-page">
            <h1>Pending Requests</h1>
            {pendingRequests.length === 0 ? (
                <p>No pending requests.</p>
            ) : (
                <ul>
                    {pendingRequests.map((request) => (
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
                                            <div className="request-actions">
                                                <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
                                                <button onClick={() => handleDeclineRequest(request.id)}>Decline</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingRequests;