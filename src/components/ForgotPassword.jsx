import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

import '../assets/styles/LoginSignup.css';
import email_icon from '../assets/email.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-signup-container">
            <div className="form-wrapper">
                <h2>Forgot Password</h2>
                <p className="description">Enter your email to reset your password.</p>

                <form onSubmit={handleForgotPassword}>
                    <div className="inputs">
                        <div className="input-group">
                            <img src={email_icon} alt="Email Icon" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="error">{error}</p>}
                    {resetEmailSent && <p className="success">Password reset email sent. Check your inbox.</p>}

                    <button type="submit" className="btn-submit">
                        Reset Password
                    </button>
                </form>

                <p className="toggle-text">
                    Remember your password?{' '}
                    <span onClick={() => navigate('/login')}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;