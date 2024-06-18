// store data in firestore
const { firestore, admin } = require('../config/firebase'); 
const crypto = require('crypto');


// store data prediction in firestore
async function storeData(uid, data) {
  try {
    const teaPlantDocRef = firestore.collection('users').doc(uid).collection('teaPlants').doc(data.teaPlantId);
    await teaPlantDocRef.set(data);
    return { success: true, message: 'Tea Plant created successfully' }; 
  } catch (error) {
    return { success: false, error: 'Failed to store data: ' + error.message };
  }
}

async function getPredictHistories(uid) { 
  try {
    const predictionsCollection = firestore.collection('users').doc(uid).collection('teaPlants');
    const querySnapshot = await predictionsCollection.get();
    const histories = querySnapshot.docs.map(doc => doc.data());
    return histories;
  } catch (error) {
    throw new Error('Failed to get data: ' + error.message);
  }
}

async function uploadPredictionImageToStorage(image) {
  const storage = admin.storage();
  const bucket = storage.bucket();

  const fileName = `predictionImages/${crypto.randomUUID()}_${image.originalname}`;

  const file = bucket.file(fileName);
  await file.save(image.buffer);

  await file.makePublic();

  const [url] = await file.getSignedUrl({ action: 'read', expires: '1-01-2500'});

  return url;
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


// store data discussion in firestore
const saveDiscussion = async (discussionData) => {
  try {
    const discussionRef = firestore.collection('discussions').doc(discussionData.discussionId);
    await discussionRef.set(discussionData);
    return { status: 'success', message: 'Discussion created successfully' };
  } catch (error) {
    throw new Error('Error saving discussion data: ' + error.message);
  }
};

const getAllDiscussions = async () => {
  try {
    const discussionsSnapshot = await firestore.collection('discussions').get();
    const discussions = discussionsSnapshot.docs.map(doc => doc.data());
    return discussions;
  } catch (error) {
    throw new Error('Error getting all discussions: ' + error.message);
  }
};

const getDiscussionById = async (discussionId) => {
  try {
    const discussionDoc = await firestore.collection('discussions').doc(discussionId).get();
    if (!discussionDoc.exists) {
      return null;
    }
    return discussionDoc.data();
  } catch (error) {
    throw new Error('Error getting discussion by ID: ' + error.message);
  }
};

const updateDiscussion = async (discussionId, updatedData) => {
  try {
    const discussionRef = firestore.collection('discussions').doc(discussionId);
    await discussionRef.update(updatedData);
    return { status: 'success', message: 'Discussion updated successfully' };
  } catch (error) {
    throw new Error('Error updating discussion: ' + error.message);
  }
};

const deleteDiscussion = async (discussionId) => {
  try {
    const discussionRef = firestore.collection('discussions').doc(discussionId);
    const commentsSnapshot = await discussionRef.collection('comments').get();

    commentsSnapshot.forEach(async (commentDoc) => {
      await commentDoc.ref.delete();
    });

    await discussionRef.delete();
    return { status: 'success', message: 'Discussion deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting discussion: ' + error.message);
  }
};



// store data comment in firestore
const saveComment = async (discussionId, commentData) => {
  try {
    const commentRef = firestore.collection('discussions').doc(discussionId).collection('comments').doc(commentData.commentId);
    await commentRef.set(commentData);
    return { status: 'success', message: 'Comment created successfully' };
  } catch (error) {
    throw new Error('Error saving comment: ' + error.message);
  }
};

const getAllComments = async (discussionId) => {
  try {
    const commentsSnapshot = await firestore.collection('discussions').doc(discussionId).collection('comments').get();
    const comments = commentsSnapshot.docs.map(doc => doc.data());
    return comments;
  } catch (error) {
    throw new Error('Error getting all comments: ' + error.message);
  }
};

const getCommentById = async (discussionId, commentId) => {
  try {
    const commentDoc = await firestore.collection('discussions').doc(discussionId).collection('comments').doc(commentId).get();
    if (!commentDoc.exists) {
      return null;
    }
    return commentDoc.data();
  } catch (error) {
    throw new Error('Error getting comment by ID: ' + error.message);
  }
};

const deleteComment = async (discussionId, commentId) => {
  try {
    await firestore.collection('discussions').doc(discussionId).collection('comments').doc(commentId).delete();
  } catch (error) {
    throw new Error('Error deleting comment: ' + error.message);
  }
};

// store data profile in firestore
const getProfileById = async (userId) => {
  try {
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data();
  } catch (error) {
    throw new Error('Error getting user by ID: ' + error.message);
  }
};

const updateProfileById = async (userId, updatedData) => {
  try {
    const userRef = firestore.collection('users').doc(userId);
    await userRef.update(updatedData);
    return { status: 'success', message: 'Profile updated successfully' };
  } catch (error) {
    throw new Error('Error updating profile: ' + error.message);
  }
}

const deleteProfileById = async (uid) => {
  try {
    await firestore.collection('users').doc(uid).delete();

    await admin.auth().deleteUser(uid);

    return { status: 'success', message: 'User profile and authentication deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting user profile: ' + error.message);
  }
}


const uploadUserImageToStorage = async (file, uid) => {
  if (!file) {
    return '';
  }

  const storage = admin.storage();
  const bucket = storage.bucket();

  const fileName = `profileImages/${uid}-${Date.now()}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  await fileUpload.save(file.buffer);

  await fileUpload.makePublic();

  const [signedUrl] = await fileUpload.getSignedUrl({
    action: 'read',
    expires: '01-01-2500',
  });

  return signedUrl;
};

const removeUndefinedFields = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
};



// If firebase Auth doens't work
// const getUserByEmail = async (email) => {
//   try {
//     const userQuerySnapshot = await firestore.collection('users').where('email', '==', email).get();
//     if (userQuerySnapshot.empty) {
//       return null;
//     }
//     const userDoc = userQuerySnapshot.docs[0];
//     return { ...userDoc.data(), uid: userDoc.id };
//   } catch (error) {
//     console.error("Error getting user by email:", error);
//     throw new Error("Error getting user by email");
//   }
// };


module.exports = {storeData, saveUserData, saveDiscussion, getAllDiscussions, getDiscussionById, updateDiscussion, deleteDiscussion, saveComment, getAllComments, getCommentById, deleteComment, getProfileById, updateProfileById, deleteProfileById, getPredictHistories, uploadPredictionImageToStorage, uploadUserImageToStorage, removeUndefinedFields};
