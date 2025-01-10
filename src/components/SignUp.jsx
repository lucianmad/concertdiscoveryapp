import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import '../assets/styles/LoginSignup.css';
import user_icon from '../assets/person.png';
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

const SignUp = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        if (e) e.preventDefault();
        setError('');
        if (!name) {
            setError('Username is required.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(firestore, 'users', user.uid), {
                username: name,
                email: user.email,
                isArtist: false,
                isManager: false,
            });

            setUser({ username: name, email: user.email, isArtist: false });

            localStorage.setItem('user', JSON.stringify({ email: user.email, username: name, isArtist: false }));

            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSignUp();
        }
    };

    return (
        <div className="login-signup-container">
            <div className="form-wrapper">
                <h2>Sign Up</h2>
                <p className="description">Create a new account.</p>

                <form onSubmit={handleSignUp}>
                    <div className="inputs">
                        <div className="input-group">
                            <img src={user_icon} alt="User Icon" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyPress={handleKeyPress}
                                required
                            />
                        </div>

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
                        Sign Up
                    </button>
                </form>

                <p className="toggle-text">
                    Already have an account?{' '}
                    <span onClick={() => navigate('/login')}>Login</span>
                </p>
            </div>
        </div>
    );
};

export default SignUp;