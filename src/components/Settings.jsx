import React, { useState } from 'react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import '../assets/styles/Settings.css'

const Settings = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const auth = getAuth();

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword.length < 8) {
            setMessage('New password must be 8 characters or longer.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage('New password and confirmation don’t match.');
            return;
        }

        const user = auth.currentUser;

        if (user) {
            try {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);

                await updatePassword(user, newPassword);
                setMessage('Password changed successfully!');
            } catch (error) {
                console.error('Error:', error);
                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    setMessage('Current password is incorrect.');
                } else if (error.code === 'auth/too-many-requests') {
                    setMessage('Too many failed attempts. Please try again later.');
                } else {
                    setMessage('Failed to update password. Please try again.');
                }
            }
        } else {
            setMessage('No user is currently signed in.');
        }
    };

    return (
        <div className="settings-container">
            <h1>Settings Page</h1>

            <div className="password-change-form">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password:</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-change-password">Change Password</button>
                </form>
                {message && <p className="form-message">{message}</p>}
            </div>
        </div>
    );
};

export default Settings;
