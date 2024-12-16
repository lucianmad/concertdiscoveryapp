import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './components/Login';  // Assuming Login component is in ./components/Login
import SignUp from './components/SignUp';  // Assuming SignUp component is in ./components/SignUp
import Home from './components/Home'; // Assuming Home component is in ./components/Home
import './assets/styles/App.css';

const App = () => {
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        setUser(null); // Log the user out
    };

    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <h1 className="logo">
                        <Link to="/">Concert Discovery</Link>
                    </h1>
                    <nav>
                        <ul className="nav-links">
                            {user ? (
                                <>
                                    <li className="user-email">Welcome, {user}</li>
                                    <li>
                                        <button className="btn-logout" onClick={handleLogout}>
                                            Logout
                                        </button>
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
                        <Route path="/" element={<Home user={user} />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />  {}
                        <Route path="/signup" element={<SignUp setUser={setUser} />} />  {}
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
