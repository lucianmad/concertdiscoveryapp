import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Home from './components/Home';
import ChangeProfilePicture from './components/ChangeProfilePicture';
import BecomeArtist from './components/BecomeArtist';
import ArtistProfile from './components/ArtistProfile';
import BecomeManager from './components/BecomeManager';
import DeleteAccount from './components/DeleteAccount';
import SearchResults from './components/SearchResults';
import PublicArtistProfile from './components/PublicArtistProfile';
import Favorites from './components/Favorites';
import ManagerProfile from './components/ManagerProfile';
import PendingRequests from './components/PendingRequests';
import AcceptedRequests from './components/AcceptedRequests';
import DeclinedRequests from './components/DeclinedRequests';
import EventCreationForm from './components/EventCreationForm';
import './assets/styles/App.css';
import { FaUser, FaCog, FaSignOutAlt, FaSearch } from 'react-icons/fa';

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

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const userDocRef = doc(firestore, 'users', authUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUser({
                        ...userData,
                        isArtist: userData.isArtist || false,
                        isManager: userData.isManager || false,
                    });
                }
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <div className="app-container">
                <Header user={user} setUser={setUser} />
                <main className="app-content">
                    <Routes>
                        <Route path="/" element={<Home user={user} />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/signup" element={<SignUp setUser={setUser} />} />
                        <Route
                            path="/search"
                            element={user ? <SearchResults /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/artist/:userId"
                            element={user ? <PublicArtistProfile /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/favorites"
                            element={user ? <Favorites /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/profile"
                            element={
                                user ? (
                                    <Profile
                                        username={user?.username}
                                        profilePicture={user?.profilePicture}
                                        isArtist={user?.isArtist || false}
                                        isManager={user?.isManager || false}
                                    />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />
                        <Route
                            path="/change-profile-picture"
                            element={
                                user ? (
                                    <ChangeProfilePicture
                                        onUpdateProfilePicture={(newPicture) => {
                                            const updatedUser = { ...user, profilePicture: newPicture };
                                            setUser(updatedUser);
                                        }}
                                    />
                                ) : (
                                    <Navigate to="/login" />
                                )
                            }
                        />
                        <Route
                            path="/become-artist"
                            element={user ? <BecomeArtist user={user} setUser={setUser} /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/artist-profile"
                            element={user ? <ArtistProfile /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/become-manager"
                            element={user ? <BecomeManager /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/manager-profile"
                            element={user ? <ManagerProfile /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/settings"
                            element={user ? <Settings /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/delete-account"
                            element={user ? <DeleteAccount /> : <Navigate to="/login" />}
                        />
                        {/* Add new routes here */}
                        <Route
                            path="/pending-requests"
                            element={user ? <PendingRequests /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/accepted-requests"
                            element={user ? <AcceptedRequests /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/declined-requests"
                            element={user ? <DeclinedRequests /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/create-event"
                            element={user ? <EventCreationForm /> : <Navigate to="/login" />}
                        />
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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

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

    const handleSearch = async (e) => {
        e.preventDefault();
        const lowercaseQuery = searchQuery.toLowerCase();
        navigate(`/search?query=${lowercaseQuery}`);
        setShowResults(false);
    };

    const fetchSearchResults = async (queryText) => {
        if (queryText.trim() === '') {
            setSearchResults([]);
            return;
        }

        try {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('isArtist', '==', true));
            const querySnapshot = await getDocs(q);

            const results = querySnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((user) =>
                    user.username.toLowerCase().includes(queryText.toLowerCase())
                );

            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() !== '' && user) {
            fetchSearchResults(searchQuery);
            setShowResults(true);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    }, [searchQuery, user]);

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
            {user && (
                <form className="search-bar" onSubmit={handleSearch}>
                    <div className="search-input-container">
                        <input
                            type="text"
                            placeholder="Search artists..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowResults(true)}
                        />
                        <button type="submit" className="search-button">
                            <FaSearch size={16} />
                        </button>
                    </div>
                    {showResults && searchResults.length > 0 && (
                        <div className="search-results-dropdown">
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    className="search-result-item"
                                    onClick={() => {
                                        setSearchQuery(''); // Clear the search input
                                        setShowResults(false); // Hide the results dropdown
                                        navigate(`/artist/${user.id}`); // Navigate to the artist's profile
                                    }}
                                >
                                    <img
                                        src={user.profilePicture || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png"}
                                        alt={user.username}
                                        className="search-result-image"
                                    />
                                    <span>{user.username}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </form>
            )}
            <nav>
                <ul className="nav-links">
                    {user ? (
                        <li className="user-menu" ref={dropdownRef}>
                            <button onClick={toggleDropdown} className="user-btn">
                                {user.username}
                            </button>
                            <ul className={`dropdown-menu ${dropdownVisible ? 'show' : ''}`}>
                                <li>
                                    <Link
                                        to={user.isArtist ? "/artist-profile" : "/profile"}
                                        onClick={closeDropdown}
                                        className="dropdown-item"
                                    >
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