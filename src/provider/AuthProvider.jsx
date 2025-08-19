import { createContext, useEffect, useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateEmail, updatePassword, updateProfile } from "firebase/auth"
import auth from "../firebase/firebase.config";
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

const AuthProvider = ({children}) => {

    const [user, setUser] = useState();
    const [status, setStatus] = useState(true);
    const googleProvider = new GoogleAuthProvider();

    const handleCreateUser = (email, password) => {
        setStatus(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };
 
    const handleEmailLogin = (email, password) => {
        setStatus(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const handleGoogleLogin = () => {
        setStatus(true);
        return signInWithPopup(auth, googleProvider);
    }

    const updateUser = (userName, email, password, url) => {
        return updateEmail(auth.currentUser, email)
            .then(
                updateProfile(auth.currentUser, {
                    displayName: userName,
                    photoURL: url
                })
                    .then(
                        updatePassword(user, password))
            )
    }

    const logOut = () => {
        setStatus(true);
        return signOut(auth);
    }
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setStatus(false);
            
            // if (user) {
            //     const userInfo = { email: user.email };
            //     axiosPublic.post('/jwt', userInfo)
            //         .then(res => {
            //             if (res.data.accessToken) {
            //                 localStorage.setItem('accessToken', res.data.accessToken);
            //             }
            //         })
            // }
            // else {
            //     localStorage.removeItem('access-token');
            //     setStatus(false);
            // }
        });

        return (() => {
            unsubscribe();
        })
    }, []);

    const authInfo = { user, status, setUser, handleCreateUser, handleEmailLogin, logOut, handleGoogleLogin, updateUser };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AuthProvider;