import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/AcceptedRequests.css';

const AcceptedRequests = () => {
    const [acceptedRequests, setAcceptedRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcceptedRequests = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(
                    collection(firestore, 'pendingRequests'),
                    where('userId', '==', user.uid),
                    where('status', '==', 'accepted')
                );
                const querySnapshot = await getDocs(q);
                const requests = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setAcceptedRequests(requests);
            }
            setLoading(false);
        };

        fetchAcceptedRequests();
    }, []);

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
                            <p>Event ID: {request.eventId}</p>
                            <p>Artist ID: {request.artistId}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AcceptedRequests;