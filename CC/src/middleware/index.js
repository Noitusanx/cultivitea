const { admin } = require("../config/firebase");
const firestore = admin.firestore();

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

module.exports = verifyToken;
