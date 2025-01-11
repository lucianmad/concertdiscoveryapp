import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/DeclinedRequests.css';

const DeclinedRequests = () => {
    const [declinedRequests, setDeclinedRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeclinedRequests = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    // Query for requests where the user is the manager (userId)
                    const managerQuery = query(
                        collection(firestore, 'pendingRequests'),
                        where('userId', '==', user.uid),
                        where('status', '==', 'rejected')
                    );

                    // Query for requests where the user is the artist (artistId)
                    const artistQuery = query(
                        collection(firestore, 'pendingRequests'),
                        where('artistId', '==', user.uid),
                        where('status', '==', 'rejected')
                    );

                    // Execute both queries
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

                    // Merge and deduplicate requests
                    const allRequests = [...managerRequests, ...artistRequests];
                    const uniqueRequests = allRequests.filter(
                        (request, index, self) => index === self.findIndex((r) => r.id === request.id)
                    );

                    setDeclinedRequests(uniqueRequests);
                } catch (error) {
                    console.error('Error fetching declined requests:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchDeclinedRequests();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="declined-requests-page">
            <h1>Declined Requests</h1>
            {declinedRequests.length === 0 ? (
                <p>No declined requests.</p>
            ) : (
                <ul>
                    {declinedRequests.map((request) => (
                        <li key={request.id} className="request-item">
                            <p>Event ID: {request.eventId}</p>
                            <p>Artist ID: {request.artistId}</p>
                            <p>Role: {request.role}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DeclinedRequests;