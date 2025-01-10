import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import '../assets/styles/LoginSignup.css';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDocRef = doc(firestore, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const { username, profilePicture, isArtist, isManager } = docSnap.data();
                const userData = {
                    email: user.email,
                    username: username || "No username set",
                    profilePicture,
                    isArtist: isArtist || false,
                    isManager: isManager || false,
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                navigate('/');
            } else {
                setError('User data not found.');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-signup-container">
            <div className="form-wrapper">
                <h2>Login</h2>
                <p className="description">Please login to your account.</p>

                <form onSubmit={handleLogin}>
                    <div className="inputs">
                        <div className="input-group">
                            <img src={email_icon} alt="Email Icon" />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <img src={password_icon} alt="Password Icon" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="error">{error}</p>}

                    <button type="submit" className="btn-submit">
                        Login
                    </button>
                </form>

                <p className="toggle-text">
                    Don't have an account?{' '}
                    <span onClick={() => navigate('/signup')}>Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;