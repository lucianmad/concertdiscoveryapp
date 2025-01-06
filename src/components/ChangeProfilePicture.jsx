import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/ChangeProfilePicture.css';

const ChangeProfilePicture = ({ onUpdateProfilePicture }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setImageUrl('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                onUpdateProfilePicture(reader.result);
                navigate('/profile');
            };
            reader.readAsDataURL(selectedFile);
        } else if (imageUrl) {
            onUpdateProfilePicture(imageUrl);
            navigate('/profile');
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
            </form>
        </div>
    );
};

export default ChangeProfilePicture;
