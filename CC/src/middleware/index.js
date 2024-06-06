// Middleware if the user has already authenticated

const { admin } = require("../config/firebase");
const firestore = admin.firestore();

const verifyToken = async (req, res, next) => {
    const idToken = req.cookies.access_token;
    if (!idToken) {
        console.error('No token provided');
        return res.status(403).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        const userDoc = await firestore.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            console.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = { ...userDoc.data(), uid };
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Unauthorized' });
    }
};

module.exports = verifyToken;


