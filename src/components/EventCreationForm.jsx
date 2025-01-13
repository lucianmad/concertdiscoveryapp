import React, { useState } from 'react';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { firestore, auth, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../assets/styles/EventCreationForm.css';

const EventCreationForm = () => {
    const [eventName, setEventName] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventPhoto, setEventPhoto] = useState(null);
    const [photoName, setPhotoName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!auth.currentUser) {
            alert('You must be logged in to create an event.');
            setLoading(false);
            return;
        }

        const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
        const userData = userDoc.data();

        console.log('User Data:', userData);

        if (!userData?.isManager) {
            alert('Only managers can create events.');
            setLoading(false);
            return;
        }

        let photoUrl = null;
        try {
            if (eventPhoto) {
                const storageRef = ref(storage, `events/${eventPhoto.name}`);
                await uploadBytes(storageRef, eventPhoto);
                photoUrl = await getDownloadURL(storageRef);
            }
        } catch (error) {
            console.error('Error uploading event photo:', error);
        }

        const eventData = {
            name: eventName,
            location: eventLocation,
            date: eventDate,
            description: eventDescription,
            userId: auth.currentUser.uid,
            artistIds: [],
            photoUrl: photoUrl,
        };

        try {
            await addDoc(collection(firestore, 'events'), eventData);
            alert('Event created successfully!');
            setEventName('');
            setEventLocation('');
            setEventDate('');
            setEventDescription('');
            setEventPhoto(null);
            setPhotoName('');
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEventPhoto(file);
            setPhotoName(file.name);
        }
    };

    return (
        <div className="event-creation-form">
            <h1>Create Event</h1>
            <form onSubmit={handleCreateEvent} className="change-profile-picture-form">
                <div className="form-group">
                    <label htmlFor="event-name">Event Name:</label>
                    <input
                        type="text"
                        id="event-name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="event-location">Location:</label>
                    <input
                        type="text"
                        id="event-location"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="event-date">Date:</label>
                    <input
                        type="date"
                        id="event-date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="event-description">Description:</label>
                    <textarea
                        id="event-description"
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="file-upload">Upload Event Photo:</label>
                    <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    {photoName && <p className="file-name">Selected file: {photoName}</p>}
                </div>
                <button type="submit" disabled={loading} className="btn-submit">
                    {loading ? 'Creating Event...' : 'Create Event'}
                </button>
            </form>
        </div>
    );
};

export default EventCreationForm;