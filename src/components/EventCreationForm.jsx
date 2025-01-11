import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/EventCreationForm.css';

const EventCreationForm = () => {
    const [eventName, setEventName] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setLoading(true);

        const eventData = {
            name: eventName,
            location: eventLocation,
            date: eventDate,
            description: eventDescription,
            userId: auth.currentUser.uid,
            artistIds: []
        };

        console.log("Event Data:", eventData);

        try {
            await addDoc(collection(firestore, 'events'), eventData);
            alert('Event created successfully!');
            setEventName('');
            setEventLocation('');
            setEventDate('');
            setEventDescription('');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-creation-form">
            <h1>Create Event</h1>
            <form onSubmit={handleCreateEvent}>
                <input
                    type="text"
                    placeholder="Event Name"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Location"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating Event...' : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default EventCreationForm;