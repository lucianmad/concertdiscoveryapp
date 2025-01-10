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
                const q = query(
                    collection(firestore, 'pendingRequests'),
                    where('userId', '==', user.uid),
                    where('status', '==', 'rejected')
                );
                const querySnapshot = await getDocs(q);
                const requests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setDeclinedRequests(requests);
            }
            setLoading(false);
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
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DeclinedRequests;