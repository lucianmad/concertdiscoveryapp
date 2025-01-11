import React, { useEffect, useState } from 'react';
import {collection, query, where, getDocs, doc, updateDoc} from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/PendingRequests.css';

const PendingRequests = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingRequests = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const managerQuery = query(
                    collection(firestore, 'pendingRequests'),
                    where('userId', '==', user.uid),
                    where('status', '==', 'pending')
                );

                const artistQuery = query(
                    collection(firestore, 'pendingRequests'),
                    where('artistId', '==', user.uid),
                    where('status', '==', 'pending')
                );

                const [managerSnapshot, artistSnapshot] = await Promise.all([
                    getDocs(managerQuery),
                    getDocs(artistQuery),
                ]);

                // Combine the results
                const managerRequests = managerSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    role: 'manager'
                }));
                const artistRequests = artistSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    role: 'artist'
                }));

                const allRequests = [...managerRequests, ...artistRequests];
                const uniqueRequests = allRequests.filter(
                    (request, index, self) => index === self.findIndex((r) => r.id === request.id)
                );

                setPendingRequests(uniqueRequests);
            } catch (error) {
                console.error('Error fetching pending requests:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const handleAcceptRequest = async (requestId) => {
        try {
            const requestRef = doc(firestore, 'pendingRequests', requestId);
            await updateDoc(requestRef, { status: 'accepted' });
            alert('Request accepted successfully!');
            // Refresh the list of pending requests
            fetchPendingRequests();
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request.');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const requestRef = doc(firestore, 'pendingRequests', requestId);
            await updateDoc(requestRef, { status: 'rejected' });
            alert('Request declined successfully!');
            fetchPendingRequests();
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
                            <p>Event ID: {request.eventId}</p>
                            <p>Artist ID: {request.artistId}</p>
                            <p>Role: {request.role}</p>
                            {request.role === 'artist' && (
                                <div>
                                    <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
                                    <button onClick={() => handleDeclineRequest(request.id)}>Decline</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingRequests;