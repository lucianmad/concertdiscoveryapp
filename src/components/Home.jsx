import React from 'react';

import '../assets/styles/Home.css'

const Home = ({ user }) => {
    return (
        <div className="home-container">
            <main className="feed">
                {user ? (
                    <div>
                        <h2>Welcome, {user}!</h2>
                        <p>Your feed is currently empty.</p>
                    </div>
                ) : (
                    <div className="guest-view">
                        <h2>Discover Upcoming Concerts</h2>
                        <p>Log in or sign up to see personalized content from your favorite artists.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
