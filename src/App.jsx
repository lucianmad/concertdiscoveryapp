import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Settings from "./components/Settings";
import Home from './components/Home';
import './assets/styles/App.css';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';


const App = () => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    return (
        <Router>
            <div className="app-container">
                <Header user={user} setUser={setUser} />
                <main className="app-content">
                    <Routes>
                        <Route path="/" element={<Home user={user} />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/signup" element={<SignUp setUser={setUser} />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Home user={user} />} /> {/* Fallback route */}
                    </Routes>
                </main>
                <footer className="app-footer">
                    <p>&copy; 2024 Concert Discovery. All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
};

const Header = ({ user, setUser }) => {
    const navigate = useNavigate();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setDropdownVisible(false);
        navigate('/');
    };

    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev);
    };

    const closeDropdown = () => {
        setDropdownVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="app-header">
            <h1 className="logo">
                <Link to="/" onClick={closeDropdown}>Concert Discovery</Link>
            </h1>
            <nav>
                <ul className="nav-links">
                    {user ? (
                        <li className="user-menu" ref={dropdownRef}>
                            <button onClick={toggleDropdown} className="user-btn">
                                {user.username}
                            </button>
                            <ul className={`dropdown-menu ${dropdownVisible ? 'show' : ''}`}>
                                <li>
                                    <Link to="/profile" onClick={closeDropdown} className="dropdown-item">
                                        <FaUser size={20} />
                                        <span>Profile</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/settings" onClick={closeDropdown} className="dropdown-item">
                                        <FaCog size={20} />
                                        <span>Settings</span>
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <FaSignOutAlt size={20} />
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </ul>
                        </li>
                    ) : (
                        <>
                            <li>
                                <NavBarButton label="Login" navigateTo="/login" variant="login" />
                            </li>
                            <li>
                                <NavBarButton label="Sign Up" navigateTo="/signup" variant="signup" />
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

const NavBarButton = ({ label, navigateTo, variant }) => {
    const navigate = useNavigate();

    const buttonClass =
        variant === 'login'
            ? 'btn-login'
            : variant === 'signup'
                ? 'btn-signup'
                : 'btn-default';

    return (
        <button className={buttonClass} onClick={() => navigate(navigateTo)}>
            {label}
        </button>
    );
};

export default App;
