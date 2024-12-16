import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

import '../assets/styles/LoginSignup.css'
import email_icon from '../assets/email.png';
import password_icon from '../assets/password.png';

const Login = ({ setUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user.email);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-signup-container">
            <div className="form-wrapper">
                <h2>Login</h2>
                <p className="description">Please login to your account.</p>

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

                    <div className="input-group">
                        <img src={password_icon} alt="Password Icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {error && <p className="error">{error}</p>}

                <button className="btn-submit" onClick={handleLogin}>
                    Login
                </button>

                <p className="toggle-text">
                    Don't have an account?{' '}
                    <span onClick={() => navigate('/signup')}>Sign Up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
