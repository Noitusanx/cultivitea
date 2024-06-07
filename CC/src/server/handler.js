const predictClassification = require('../services/inferenceService');
const { storeData, predictionsCollection, saveUserData, saveDiscussion, updateDiscussion, getAllDiscussions, getDiscussionById, deleteDiscussion, saveComment, deleteComment, getAllComments, getCommentById} = require('../services/storeData');
const crypto = require('crypto');
const InputError = require('../exceptions/InputError');
const loadModel = require('../services/loadModel');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification,
  sendPasswordResetEmail
 } = require('../config/firebase');
const auth = getAuth();


// Auth handler
async function signUp(req, res) {
  const { username, email, password } = req.body;
  if (!email || !password || !username) {
      return res.status(422).json({
      username: "Username is required",
      email: "Email is required",
      password: "Password is required"
      });
  }
  
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = {
      username: username,
      uid: user.uid,
      email: user.email,
      };
  
      await saveUserData(userData);
      await sendEmailVerification(user);
      res.status(201).json({ message: "Verification email sent! User created successfully!" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error saving user data or sending email verification" });
  }
  }
  
  async function signIn(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
      return res.status(422).json({
          email: "Email is required",
          password: "Password is required",
      });
  }
  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => { 
          const idToken = userCredential._tokenResponse.idToken
          if (idToken) {
              res.cookie('access_token', idToken, {
                  httpOnly: true
              });
              res.status(200).json({ message: "User logged in successfully", userCredential });
          } else {
              res.status(500).json({ error: "Internal Server Error" });
          }
      })
      .catch((error) => {
          console.error(error);
          const errorMessage = error.message || "An error occurred while logging in";
          res.status(500).json({ error: errorMessage });
      });
  }
  
  async function logOut(req, res) {
      signOut(auth)
          .then(() => {
          res.clearCookie('access_token');
          res.status(200).json({ message: "User logged out successfully" });
          })
          .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Internal Server Error" });
          });
      }
  
  async function resetPassword(req, res){
    const { email } = req.body;
    if (!email ) {
      return res.status(422).json({
        email: "Email is required"
      });
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        res.status(200).json({ message: "Password reset email sent successfully!" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }



// Discussion handler
async function createDiscussion(req, res, next) {
  const { title, content } = req.body;

  const discussionId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (!req.user || !req.user.uid) {
    console.error('User not authenticated');
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const creator = req.user.username;
  const creatorUid = req.user.uid;

  if (!title || !content || !creatorUid) {
    return res.status(400).json({ status: 'fail', message: 'Field title, content, createdAt, and creator are required' });
  }

  const newDiscussion = {
    discussionId,
    creatorUid,
    creator,
    title,
    content,
    createdAt,
  };

  await saveDiscussion(newDiscussion);

  res.status(201).json({ status: 'success', message: 'Discussion created', data: newDiscussion });
}

async function getDiscussionHandler(req, res, next) {
  const { discussionId } = req.params;

  try {

    const discussion = await getDiscussionById(discussionId);


    if (!discussion) {
      return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
    }

    res.status(200).json({ status: 'success', message: 'Get a discussion', data: discussion });
  } catch (error) {
    next(error);
  }
}


async function getAllDiscussionsHandler(req, res, next) {
  try {
    const discussion = await getAllDiscussions()
    res.status(200).json({ status: 'success', message: 'Get all discussions', data: discussion});
  } catch (error) {
    next(error);
  }
}


async function getDiscussionHandler(req, res, next) {
  const { discussionId } = req.params;

  try {
    const discussion = await getDiscussionById(discussionId);


    if (!discussion) {
      return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
    }

    res.status(200).json({ status: 'success', message: 'Get a discussion', data: discussion });
  } catch (error) {
    next(error);
  }
}

async function updateDiscussionHandler(req, res, next) {
  const { discussionId } = req.params;
  const { title, content } = req.body;

  if (!req.user || !req.user.uid) {
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const uid = req.user.uid;
  const discussion = await getDiscussionById(discussionId);

  if (!discussion) {
    console.error('Discussion not found');
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  if (discussion.creatorUid !== uid) {
    console.error('User not authorized');
    return res.status(403).json({ status: 'fail', message: 'You are not authorized' });
  }

  const updatedData = {
    title,
    content,
  };

  try {
    await updateDiscussion(discussionId, updatedData);
    res.status(200).json({ status: 'success', message: 'Discussion updated successfully' });
  } catch (error) {
    next(error);
  }
}


async function deleteDiscussionHandler(req, res, next) {
  const { discussionId } = req.params;

  if (!req.user || !req.user.uid) {
    console.error('User not authenticated');
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const uid = req.user.uid;
  const discussion = await getDiscussionById(discussionId);

 

  if (!discussion) {
    console.error('Discussion not found');
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  if (discussion.creatorUid !== uid) {
    console.error('User not authorized');
    return res.status(403).json({ status: 'fail', message: 'You are not authorized' });
  }

  try {
    await deleteDiscussion(discussionId);
    res.status(200).json({ status: 'success', message: 'Discussion deleted successfully' });
  } catch (error) {
    next(error);
  }
}



// Comment handler
async function createComment(req, res, next) {
  const { discussionId } = req.params;
  const { content } = req.body;
  const createdAt = new Date().toISOString();

  const discussion = await getDiscussionById(discussionId);
  const commentId = crypto.randomUUID();

  if (!discussion) {
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  const creator = req.user.username;
  const creatorUid = req.user.uid;

  if (!content || !creator) {
    return res.status(400).json({ status: 'fail', message: 'Field content and creator are required' });
  }

  const newComment = {
    commentId,
    creatorUid,
    creator,
    content,
    createdAt,
  };

  try {
    await saveComment(discussionId, newComment);
    res.status(201).json({ status: 'success', message: 'Comment created', data: newComment });
  } catch (error) {
    next(error);
  }
}


async function getCommentsHandler(req, res, next) {
  const { discussionId } = req.params;

  const discussion = await getDiscussionById(discussionId);

  if (!discussion) {
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  try {
    const comment = await getAllComments(discussionId)
    res.status(200).json({ status: 'success', message: 'Get all comments', data: comment });
  } catch (error) {
    next(error);
  }
}


async function deleteCommentHandler(req, res, next) {
  const { discussionId, commentId } = req.params;

  if (!req.user || !req.user.uid) {
    console.error('User not authenticated');
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const uid = req.user.uid;

  const discussion = await getDiscussionById(discussionId);

  if (!discussion) {
    console.error('Discussion not found');
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  const comment = await getCommentById(discussionId, commentId);

  if (!comment) {
    console.error('Comment not found');
    return res.status(404).json({ status: 'fail', message: 'Comment not found' });
  }

  if (comment.creatorUid !== uid) {
    console.error('User not authorized');
    return res.status(403).json({ status: 'fail', message: 'You are not authorized' });
  }

  try {
    await deleteComment(discussionId, commentId);
    res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
}




// new predict handler

async function postPredict(req, res, next) {
  try {
    const { file: image } = req;
    if (!image) {
      throw new InputError('No image provided');
    }

    const model = await loadModel();
    const { result, suggestion } = await predictClassification(model, image.buffer);

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id,
      result,
      suggestion,
      createdAt,
    };


    await storeData(id, data);

    res.status(201).json({
      status: 'success',
      message: 'Model is predicted successfully',
      data,
    });
  } catch (error) {
    console.error('Error occurred:', error);
    if (error instanceof InputError) {
      res.status(400).json({ status: 'fail', message: error.message });
    } else {
      next(error);
    }
  }
}

// Profile handler
async function getProfile(req, res) {
  if (!req.user || !req.user.uid) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
  }

  try {
      const userDoc = await firestore.collection('users').doc(req.user.uid).get();
      if (!userDoc.exists) {
          return res.status(404).json({ status: 'fail', message: 'User not found' });
      }
      res.status(200).json({ status: 'success', data: userDoc.data() });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

async function getProfileById(req, res) {
  const { userId } = req.params;

  try {
      const userDoc = await firestore.collection('users').doc(userId).get();
      if (!userDoc.exists) {
          return res.status(404).json({ status: 'fail', message: 'User not found' });
      }
      res.status(200).json({ status: 'success', data: userDoc.data() });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

async function updateProfile(req, res) {
  const { username, email } = req.body;

  if (!req.user || !req.user.uid) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
  }

  try {
      const userRef = firestore.collection('users').doc(req.user.uid);
      await userRef.update({ username, email });
      res.status(200).json({ status: 'success', message: 'Profile updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

async function updateProfileById(req, res) {
  const { userId } = req.params;
  const { username, email } = req.body;

  try {
      const userRef = firestore.collection('users').doc(userId);
      await userRef.update({ username, email });
      res.status(200).json({ status: 'success', message: 'Profile updated successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

async function deleteProfile(req, res) {
  if (!req.user || !req.user.uid) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
  }

  try {
      await firestore.collection('users').doc(req.user.uid).delete();
      res.status(200).json({ status: 'success', message: 'Profile deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}

async function deleteProfileById(req, res) {
  const { userId } = req.params;

  try {
      await firestore.collection('users').doc(userId).delete();
      res.status(200).json({ status: 'success', message: 'Profile deleted successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', message: 'Internal Server Error' });
  }
}


async function getPredictHistories(req, res, next) {
  try {
    const histories = (await predictionsCollection.get()).docs.map(doc => doc.data());
    const data = histories.map(item => ({
      id: item.id,
      history: item,
    }));
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
}

  
module.exports = {signUp, signIn, logOut, resetPassword, postPredict, getPredictHistories, createDiscussion, getAllDiscussionsHandler, getDiscussionHandler, updateDiscussionHandler, deleteDiscussionHandler, createComment, getCommentsHandler, deleteCommentHandler, getProfile, updateProfile, deleteProfile, getProfileById, updateProfileById, deleteProfileById};

