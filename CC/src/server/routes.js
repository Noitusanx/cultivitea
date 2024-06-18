const express = require('express');
const multer = require('multer');
const auth = require('./handlers/authHandler');
const predict = require('./handlers/predictHandler');
const discussion = require('./handlers/discussionHandler');
const comment = require('./handlers/commentHandler');
const profile = require('./handlers/profileHandler');
const verifyToken = require('../middleware/index');

const router = express.Router();
const upload = multer();

// Auth
router.post('/signup', auth.signUp);
router.post('/signin', auth.signIn);
router.post('/logout', auth.logOut);


// Predict
router.post('/predict', upload.single('image'), verifyToken, predict.postPredict);
router.get('/predict/histories', verifyToken, predict.getPredictHistoriesHandler);

// Discussion
router.post('/discussions', verifyToken, discussion.createDiscussion);
router.get('/discussions', discussion.getAllDiscussionsHandler);
router.get('/discussions/:discussionId', discussion.getDiscussionHandler);
router.put('/discussions/edit/:discussionId', verifyToken, discussion.updateDiscussionHandler);
router.delete('/discussions/:discussionId', verifyToken, discussion.deleteDiscussionHandler);

// Comment
router.post('/discussions/:discussionId/comments', verifyToken, comment.createComment);
router.get('/discussions/:discussionId/comments', comment.getCommentsHandler);
router.delete('/discussions/:discussionId/comments/:commentId', verifyToken, comment.deleteCommentHandler);

// Profile
router.get('/profile/:uid', verifyToken, profile.getProfileByIdHandler);
router.put('/profile/edit/:uid', upload.single('image'), verifyToken, profile.updateProfileByIdHandler);
router.delete('/profile/:uid', verifyToken, profile.deleteProfileByIdHandler);

// Example routes if firebase authentication doesn't work
// router.delete('/profile/:uid', verifyToken.authenticateJWT, profile.deleteProfileByIdHandler);


module.exports = router;