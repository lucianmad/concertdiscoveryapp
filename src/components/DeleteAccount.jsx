import React from 'react';
import '../assets/styles/DeleteAccount.css';

const DeleteAccount = () => {
    const handleDeleteRequest = () => {
        alert('Your account deletion request has been received. We will process it shortly.');
    };

    return (
        <div className="delete-account-container">
            <div className="delete-account-header">
                <h1>Delete Account</h1>
            </div>
            <div className="delete-account-content">
                <h2>Are you sure you want to delete your account?</h2>
                <p>
                    By deleting your account, all your data will be permanently removed from our servers.
                    This action cannot be undone.
                </p>
                <div className="delete-account-buttons">
                    <button onClick={handleDeleteRequest} className="delete-button">Delete My Account</button>
                    <button className="cancel-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
