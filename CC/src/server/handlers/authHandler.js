const { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification,
} = require('firebase/auth');
const { admin } = require('../../config/firebase');
const firestore = admin.firestore();
const { saveUserData} = require('../../services/storeData');
const { getAuth } = require('../../config/firebase');
const auth = getAuth();


// Auth handler
async function signUp(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(422).json({
            error: true,
            message: "Validation failed",
            details: {
                username: !username ? "Username is required" : undefined,
                email: !email ? "Email is required" : undefined,
                password: !password ? "Password is required" : undefined,
            },
            userCredential: null
        });
    }
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userData = {
            username: username,
            uid: user.uid,
            email: user.email,
            phoneNumber: "",
            dateOfBirth: "",
            imageUrl: "", 
        };
    
        await saveUserData(userData);
        await sendEmailVerification(user);
        res.status(201).json({ 
            error: false, 
            message: "Verification email sent! User created successfully!", 
            userCredential: {
                uid: userData.uid,
                email: userData.email,
                username: userData.username,
                phoneNumber: userData.phoneNumber,
                dateOfBirth: userData.dateOfBirth,
                imageUrl: userData.imageUrl
            } 
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            res.status(400).json({ 
                error: true, 
                message: "Email is already in use",
                userCredential: null
            });
        } else {
            res.status(500).json({ 
                error: true, 
                message: "Error saving user data or sending email verification",
                userCredential: null
            });
        }
    }
}

async function signIn(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({
            error: true,
            message: "Validation failed",
            details: {
                email: !email ? "Email is required" : undefined,
                password: !password ? "Password is required" : undefined,
            },
            userCredential: null
        });
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();

        if (idToken) {
            const uid = userCredential.user.uid;

            const userDoc = await firestore.collection('users').doc(uid).get();

            if (!userDoc.exists) {
                return res.status(404).json({ 
                    error: true, 
                    message: "User data not found in the database.",
                    userCredential: null
                });
            }

            const userData = userDoc.data();

            res.cookie('access_token', idToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict'
            });

            res.status(200).json({ 
                error: false, 
                message: "User logged in successfully",
                userCredential: {
                    uid: userData.uid,
                    email: userData.email,
                    username: userData.username,
                    phoneNumber: userData.phoneNumber,
                    dateOfBirth: userData.dateOfBirth,
                    imageUrl: userData.imageUrl,
                    token: idToken
                } 
            });
        } else {
            res.status(500).json({ 
                error: true, 
                message: "Internal Server Error",
                userCredential: null
            });
        }
    } catch (error) {
        res.status(401).json({ 
            error: true, 
            message: "Authentication failed. Please check your email and password.",
            userCredential: null
        });
    }
}

async function logOut(req, res) {
    signOut(auth)
        .then(() => {
        res.clearCookie('access_token');
        res.status(200).json({
            error: false, 
            message: "User logged out successfully" });
        })
        .catch((error) => {
        console.error(error);
        res.status(500).json({
            error: true, 
            message: "Internal Server Error" });
        });
}


// Requirements if firebase authentication doens't work
// const { saveUserData, getUserByEmail } = require('../../services/storeData');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid');


// If firebase auth doesn't work 
// async function signUp(req, res) {
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//         return res.status(422).json({
//             error: true,
//             message: "Validation failed",
//             details: {
//                 username: !username ? "Username is required" : undefined,
//                 email: !email ? "Email is required" : undefined,
//                 password: !password ? "Password is required" : undefined,
//             },
//             userCredential: null
//         });
//     }

//     try {
//         const existingUser = await getUserByEmail(email);
//         if (existingUser) {
//             return res.status(400).json({ 
//                 error: true, 
//                 message: "Email is already in use",
//                 userCredential: null
//             });p
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = {
//             uid: uuidv4(),
//             username,
//             email,
//             password: hashedPassword,
//             phoneNumber: "",
//             dateOfBirth: "",
//             imageUrl: "",
//         };

//         await saveUserData(user);
//         res.status(201).json({ 
//             error: false, 
//             message: "User created successfully!", 
//             userCredential: {
//                 uid: user.uid,
//                 email: user.email,
//                 username: user.username,
//                 phoneNumber: user.phoneNumber,
//                 dateOfBirth: user.dateOfBirth,
//                 imageUrl: user.imageUrl
//             } 
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ 
//             error: true, 
//             message: "Error saving user data",
//             userCredential: null
//         });
//     }
// }



// async function signIn(req, res) {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(422).json({
//             error: true,
//             message: "Validation failed",
//             details: {
//                 email: !email ? "Email is required" : undefined,
//                 password: !password ? "Password is required" : undefined,
//             },
//             userCredential: null
//         });
//     }

//     try {
//         const user = await getUserByEmail(email);
//         if (!user) {
//             return res.status(401).json({ 
//                 error: true, 
//                 message: "Authentication failed. Please check your email and password.",
//                 userCredential: null
//             });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ 
//                 error: true, 
//                 message: "Authentication failed. Please check your email and password.",
//                 userCredential: null
//             });
//         }

//         const token = jwt.sign({ uid: user.uid, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         res.cookie('access_token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'Strict'
//         });

//         res.status(200).json({ 
//             error: false, 
//             message: "User logged in successfully",
//             userCredential: {
//                 uid: user.uid,
//                 email: user.email,
//                 username: user.username,
//                 phoneNumber: user.phoneNumber,
//                 dateOfBirth: user.dateOfBirth,
//                 imageUrl: user.imageUrl,
//                 token: token
//             } 
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ 
//             error: true, 
//             message: "Internal Server Error",
//             userCredential: null
//         });
//     }
// }



// async function logOut(req, res) {
//     res.clearCookie('access_token');
//     res.status(200).json({
//         error: false, 
//         message: "User logged out successfully" 
//     });
// }


module.exports = {signUp, signIn, logOut};