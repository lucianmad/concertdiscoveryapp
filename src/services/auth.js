import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Register a new user
export const registerWithEmail = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered:', userCredential.user);
        return userCredential.user; // Return the user object for further use
    } catch (error) {
        console.error("Error during registration:", error.message);
        throw error; // To handle the error in the component
    }
};

// Log in an existing user
export const loginWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user);
        return userCredential.user; // Return the user object for further use
    } catch (error) {
        console.error("Error during login:", error.message);
        throw error; // To handle the error in the component
    }
};
