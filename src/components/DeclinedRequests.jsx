import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/DeclinedRequests.css';
import { onAuthStateChanged } from 'firebase/auth';

const DeclinedRequests = () => {
    const [declinedRequests, setDeclinedRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchDeclinedRequests(user.uid);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchDeclinedRequests = async (userId) => {
        try {
            const managerQuery = query(
                collection(firestore, 'pendingRequests'),
                where('userId', '==', userId),
                where('status', '==', 'rejected')
            );

            const artistQuery = query(
                collection(firestore, 'pendingRequests'),
                where('artistId', '==', userId),
                where('status', '==', 'rejected')
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

            setDeclinedRequests(requestsWithEventDetails);
        } catch (error) {
            console.error('Error fetching declined requests:', error);
        } finally {
            setLoading(false);
        }
    };

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

export default DeclinedRequests;