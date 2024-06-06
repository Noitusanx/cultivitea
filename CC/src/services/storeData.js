// store data in firestore
const Firestore = require('@google-cloud/firestore');
const db = new Firestore();
const predictionsCollection = db.collection('predictions');
const usersCollection = db.collection('users');
const { firestore } = require('../config/firebase'); 


// store data prediction in firestore
async function storeData(id, data) {
  try {
    const predictCollection = db.collection('predictions');
    await predictCollection.doc(id).set(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to store data' };
  }
}

// store data authentication in firestore
const saveUserData = async (userData) => {
  try {
    const userRef = firestore.collection('users').doc(userData.uid);
    await userRef.set(userData);
    return { status: 'success', message: 'User registered successfully' };
  } catch (error) {
    throw new Error('Error saving user data: ' + error.message);
  }
};


module.exports = {predictionsCollection, storeData, saveUserData, usersCollection};
