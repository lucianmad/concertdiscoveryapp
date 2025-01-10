import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/PendingRequests.css';

const PendingRequests = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingRequests = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(
                    collection(firestore, 'pendingRequests'),
                    where('userId', '==', user.uid),
                    where('status', '==', 'pending')
                );
                const querySnapshot = await getDocs(q);
                const requests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setPendingRequests(requests);
            }
            setLoading(false);
        };

        fetchPendingRequests();
    }, []);

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
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingRequests;