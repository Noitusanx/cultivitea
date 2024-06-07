// store data in firestore
const Firestore = require('@google-cloud/firestore');
const db = new Firestore();
const predictionsCollection = db.collection('predictions');
const usersCollection = db.collection('users');
const discussionsCollection = db.collection('discussions');
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

    // Delete all comments
    commentsSnapshot.forEach(async (commentDoc) => {
      await commentDoc.ref.delete();
    });

    await discussionRef.delete();
    return { status: 'success', message: 'Discussion deleted successfully' };
  } catch (error) {
    throw new Error('Error deleting discussion: ' + error.message);
  }
};

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



module.exports = {predictionsCollection, storeData, saveUserData, usersCollection, saveDiscussion, discussionsCollection, getAllDiscussions, getDiscussionById, updateDiscussion, deleteDiscussion, saveComment, getAllComments, getCommentById, deleteComment};
