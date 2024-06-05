const predictClassification = require('../services/inferenceService');
const { storeData, predictionsCollection, saveUserData} = require('../services/storeData');
const crypto = require('crypto');
const InputError = require('../exceptions/InputError');
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
const discussions = [];

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
    comments: [],
  };
  discussions.push(newDiscussion);

  res.status(201).json({ status: 'success', message: 'Discussion created', data: newDiscussion });
}


async function getAllDiscussions(req, res, next) {
  res.status(200).json({ status: 'success', message: 'Get all discussions', data: discussions });
}


async function getDiscussion(req, res, next) {
  const { discussionId } = req.params;

  const discussion = discussions.find(discussion => discussion.discussionId === discussionId);

  if (!discussion) {
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  res.status(200).json({ status: 'success', message: 'Get a discussion', data: discussion });

}


async function editDiscussion(req, res, next) {
  const { discussionId } = req.params;
  const { title, content } = req.body;

  if (!req.user || !req.user.uid) {
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const uid = req.user.uid;
  const discussion = discussions.find(discussion => discussion.discussionId === discussionId);

  if (!discussion) {
    console.error('Discussion not found');
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  if (discussion.creatorUid !== uid) {
    console.error('User not authorized');
    return res.status(403).json({ status: 'fail', message: 'You are not authorized' });
  }

  discussion.title = title;
  discussion.content = content;

  res.status(200).json({ status: 'success', message: 'Discussion updated successfully' });
}


async function deleteDiscussion(req, res, next) {
  const { discussionId } = req.params;

  if (!req.user || !req.user.uid) {
    console.error('User not authenticated');
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const uid = req.user.uid;
  const discussionIndex = discussions.findIndex(discussion => discussion.discussionId === discussionId);
  const discussion = discussions[discussionIndex];

  if (discussionIndex === -1) {
    console.error('Discussion not found');
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }


  if (discussion.creatorUid !== uid) {
    console.error('User not authorized');
    return res.status(403).json({ status: 'fail', message: 'You are not authorized' });
  }

  discussions.splice(discussionIndex, 1);

  res.status(200).json({ status: 'success', message: 'Discussion deleted successfully' });
}



// Comment handler
async function createComment(req, res, next) {
  const { discussionId } = req.params;
  const { content} = req.body;
  const createdAt = new Date().toISOString();

  const discussion = discussions.find(discussion => discussion.discussionId === discussionId);

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

  discussion.comments.push(newComment);

  res.status(201).json({ status: 'success', message: 'Comment created', data: newComment });
}

async function getComments(req, res, next) {
  const { discussionId } = req.params;

  const discussion = discussions.find(discussion => discussion.discussionId === discussionId);

  if (!discussion) {
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  res.status(200).json({ status: 'success', message: 'Get all comments', data: discussion.comments });
}

async function deleteComment(req, res, next) {
  const { discussionId, commentId } = req.params;

  if (!req.user || !req.user.uid) {
    console.error('User not authenticated');
    return res.status(400).json({ status: 'fail', message: 'User not authenticated' });
  }

  const uid = req.user.uid;

  const discussion = discussions.find(discussion => discussion.discussionId === discussionId);

  if (!discussion) {
    console.error('Discussion not found');
    return res.status(404).json({ status: 'fail', message: 'Discussion not found' });
  }

  const commentIndex = discussion.comments.findIndex(comment => comment.commentId === commentId);
  const comment = discussion.comments[commentIndex];

  if (commentIndex === -1) {
    console.error('Comment not found');
    return res.status(404).json({ status: 'fail', message: 'Comment not found' });
  }


  if (comment.creatorUid !== uid) {
    console.error('User not authorized');
    return res.status(403).json({ status: 'fail', message: 'You are not authorized' });
  }

  discussion.comments.splice(commentIndex, 1);

  res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
}



// Predict handler
async function postPredict(req, res, next) {
  try {
    const { file: image } = req;
    const { model } = req.app.locals;

    if (!image) {
      throw new InputError('No image provided');
    }

    const { resultScore, result, suggestion } = await predictClassification(model, image.buffer);
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
      message: resultScore > 99 
        ? 'Model is predicted successfully' 
        : 'Model is predicted successfully but under threshold. Please use the correct picture',
      data,
    });
  } catch (error) {
    if (error instanceof InputError) {
      res.status(400).json({ status: 'fail', message: error.message });
    } else {
      next(error);
    }
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


  
module.exports = {signUp, signIn, logOut, resetPassword, postPredict, getPredictHistories, createDiscussion, getAllDiscussions, getDiscussion, editDiscussion, deleteDiscussion, createComment, getComments, deleteComment};

