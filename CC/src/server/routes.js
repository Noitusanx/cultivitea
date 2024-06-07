const express = require('express');
const multer = require('multer');
const handlers = require('./handler');
const verifyToken = require('../middleware/index');

const router = express.Router();

const upload = multer();

// Auth
router.post('/signup', handlers.signUp);
router.post('/signin', handlers.signIn);
router.post('/logout', handlers.logOut);
router.post('/reset-password', handlers.resetPassword);

// Predict
router.post('/predict', upload.single('image'), handlers.postPredict);
router.get('/predict/histories', handlers.getPredictHistories);

// Discussion
router.post('/discussions', verifyToken, handlers.createDiscussion);
router.get('/discussions', handlers.getAllDiscussionsHandler);

router.get('/discussions/:discussionId', handlers.getDiscussionHandler);
router.put('/discussions/edit/:discussionId', verifyToken, handlers.updateDiscussionHandler);
router.delete('/discussions/:discussionId', verifyToken, handlers.deleteDiscussionHandler);


// Comment
router.post('/discussions/:discussionId/comments', verifyToken, handlers.createComment);
router.get('/discussions/:discussionId/comments', handlers.getCommentsHandler);
router.delete('/discussions/:discussionId/comments/:commentId', verifyToken, handlers.deleteCommentHandler);


module.exports = router;