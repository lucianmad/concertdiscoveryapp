import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import '../assets/styles/Home.css';

const Home = ({ user }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFollowedArtists = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const favoritesRef = collection(firestore, 'favorites', user.uid, 'artists');
                const favoritesSnapshot = await getDocs(favoritesRef);
                const followedArtists = favoritesSnapshot.docs.map((doc) => doc.id);
                return followedArtists;
            } catch (error) {
                console.error('Error fetching followed artists:', error);
                return [];
            }
        } else {
            return [];
        }
    };

    const fetchPosts = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const followedArtists = await fetchFollowedArtists();

                if (followedArtists.length > 0) {
                    const postsQuery = query(
                        collection(firestore, 'posts'),
                        where('artistId', 'in', followedArtists)
                    );
                    const postsSnapshot = await getDocs(postsQuery);
                    const postsData = postsSnapshot.docs.map((doc) => {
                        const postData = doc.data();
                        console.log('Post Data:', postData);
                        return {
                            id: doc.id,
                            ...postData,
                            artistProfilePicture: postData.artistProfilePicture || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png", // Ensure this field is included
                        };
                    });

                    postsData.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

                    setPosts(postsData);
                } else {
                    setPosts([]);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const handleImComing = async (postId, attendees = []) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const postRef = doc(firestore, 'posts', postId);
                const postDoc = await getDoc(postRef);

                if (postDoc.exists()) {
                    const postData = postDoc.data();
                    const updatedAttendees = attendees || [];

                    if (updatedAttendees.includes(user.uid)) {
                        updatedAttendees.splice(updatedAttendees.indexOf(user.uid), 1);
                    } else {
                        updatedAttendees.push(user.uid);
                    }

                    await updateDoc(postRef, {
                        attendees: updatedAttendees,
                    });

                    await fetchPosts();
                } else {
                    alert('Post not found.');
                }
            } catch (error) {
                console.error('Error updating attendees:', error);
                alert('Failed to update attendance.');
            }
        } else {
            alert('You must be logged in to attend an event.');
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [user]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="home-container">
            <main className="feed">
                {user ? (
                    <div>
                        <h2 className="feed-title">See what your favorite artists posted</h2>
                        {posts.length === 0 ? (
                            <p className="no-posts-message">No posts to display. Follow artists to see their posts.</p>
                        ) : (
                            <ul>
                                {posts.map((post) => (
                                    <li key={post.id} className="post-item-home">
                                        <div className="post-header">
                                            <img
                                                src={post.artistProfilePicture || "https://cdn-icons-png.flaticon.com/512/11039/11039534.png"}
                                                alt="Artist"
                                                className="artist-profile-picture"
                                                onError={(e) => {
                                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/11039/11039534.png";}}
                                            />
                                            <div className="post-header-info">
                                                <h3>{post.artistName}</h3>
                                                <p className="post-timestamp">
                                                    {new Date(post.timestamp?.toDate()).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="post-content">
                                            <h4>{post.eventName}</h4>
                                            <p>{post.description}</p>
                                            {post.eventPhotoUrl && (
                                                <img
                                                    src={post.eventPhotoUrl}
                                                    alt="Event"
                                                    className="event-photo"
                                                />
                                            )}
                                            <button
                                                onClick={() => handleImComing(post.id, post.attendees)}
                                                className={`im-coming-button ${post.attendees?.includes(auth.currentUser?.uid) ? 'not-coming' : ''}`}
                                            >
                                                {post.attendees?.includes(auth.currentUser?.uid) ? "I'm Not Coming Anymore" : "I'm Coming"}
                                            </button>
                                            <p className="attendees-count">
                                                <strong>Attendees:</strong> {post.attendees ? post.attendees.length : 0}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
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