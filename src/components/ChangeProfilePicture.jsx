import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import '../assets/styles/ChangeProfilePicture.css';

const ChangeProfilePicture = ({ onUpdateProfilePicture }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [status, setStatus] = useState(''); // Added status for user feedback
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setImageUrl('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let newProfilePicture = null;

            if (selectedFile) {
                const fileRef = ref(storage, `profile_pictures/${selectedFile.name}`);
                await uploadBytes(fileRef, selectedFile);
                newProfilePicture = await getDownloadURL(fileRef);
            } else if (imageUrl) {
                newProfilePicture = imageUrl;
            } else {
                setStatus('Please upload a file or enter an image URL.');
                return;
            }

            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                setStatus('User is not authenticated.');
                return;
            }

            const userUID = currentUser.uid;

            const userDocRef = doc(firestore, 'users', userUID);
            await updateDoc(userDocRef, { profilePicture: newProfilePicture });

            const user = JSON.parse(localStorage.getItem('user'));
            const updatedUser = { ...user, profilePicture: newProfilePicture };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            onUpdateProfilePicture(newProfilePicture);

            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile picture:', error);
            setStatus('Error updating profile picture. Please try again.');
        }
    };

    return (
        <div className="change-profile-picture-page">
            <h1>Change Profile Picture</h1>
            <form onSubmit={handleSubmit} className="change-profile-picture-form">
                <div className="form-group">
                    <label htmlFor="file-upload">Upload a Photo:</label>
                    <input
                        type="file"
                        id="file-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image-url">Or Enter an Image URL:</label>
                    <input
                        type="text"
                        id="image-url"
                        value={imageUrl}
                        onChange={(e) => {
                            setImageUrl(e.target.value);
                            setSelectedFile(null);
                        }}
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
                <button type="submit" className="btn-submit">Update Picture</button>
                {status && <p className="form-message">{status}</p>}
            </form>
        </div>
    );
};

export default ChangeProfilePicture;
