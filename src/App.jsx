import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Settings from "./components/Settings";
import Home from './components/Home';
import './assets/styles/App.css';

const App = () => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setDropdownVisible(false);
    };

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev);
    };

    const closeDropdown = () => {
        setDropdownVisible(false);
    };

    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <h1 className="logo">
                        <Link to="/" onClick={closeDropdown}>Concert Discovery</Link>
                    </h1>
                    <nav>
                        <ul className="nav-links">
                            {user ? (
                                <>
                                    <li className="user-menu">
                                        <button onClick={toggleDropdown} className="user-btn">
                                            {user.username} ▼
                                        </button>
                                        {dropdownVisible && (
                                            <ul className="dropdown-menu">
                                                <li>
                                                    <Link to="/profile" onClick={closeDropdown}>Profile</Link>
                                                </li>
                                                <li>
                                                    <Link to="/settings" onClick={closeDropdown}>Settings</Link>
                                                </li>
                                                <li>
                                                    <button className="btn-logout" onClick={() => {handleLogout(); closeDropdown();}}>
                                                        Logout
                                                    </button>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <NavBarButton
                                            label="Login"
                                            navigateTo="/login"
                                            variant="login"
                                        />
                                    </li>
                                    <li>
                                        <NavBarButton
                                            label="Sign Up"
                                            navigateTo="/signup"
                                            variant="signup"
                                        />
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>
                </header>

                <main className="app-content">
                    <Routes>
                        <Route path="/" element={<Home user={user}/>}/>
                        <Route path="/login" element={<Login setUser={setUser}/>}/> {}
                        <Route path="/signup" element={<SignUp setUser={setUser} />} />  {}
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />

                    </Routes>
                </main>

                <footer className="app-footer">
                    <p>&copy; 2024 Concert Discovery. All rights reserved.</p>
                </footer>
            </div>
        </Router>
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
