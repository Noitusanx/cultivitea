const { admin } = require("../config/firebase");
const firestore = admin.firestore();
require('dotenv').config();

// Requirements if firebase authentication doens't work
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const idToken = req.cookies.access_token;
    if (!idToken) {
        return res.status(403).json({ 
            error: true, 
            message: 'No token provided', 
            userCredential: null 
        });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const userDoc = await firestore.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ 
                error: true, 
                message: 'User not found',
                userCredential: null 
            });
        }

        req.user = { ...userDoc.data(), uid };
        next();
    } catch (error) {
        return res.status(403).json({ 
            error: true, 
            message: 'Unauthorized', 
            userCredential: null 
        });
    }
};

// If firebase auth doens't work
// function generateToken(user) {
//     return jwt.sign({ uid: user.uid, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
// }

// function authenticateJWT(req, res, next) {
//     const token = req.cookies.access_token;
//     if (!token) {
//         return res.status(401).json({ error: true, message: "Access token is missing or invalid" });
//     }
//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({ error: true, message: "Token is not valid" });
//         }
//         req.user = user;
//         next();
//     });
// }


module.exports = verifyToken
