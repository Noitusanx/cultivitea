const express = require('express');
const multer = require('multer');
const handlers = require('./handler');
const verifyToken = require('../middleware/index');

const router = express.Router();
const upload = multer();

// Predict
router.post('/predict', upload.single('image'), handlers.postPredict);
router.get('/predict/histories', handlers.getPredictHistories);

// Discussion
router.post('/discussions', verifyToken, handlers.createDiscussion);
router.get('/discussions', handlers.getAllDiscussions);
router.get('/discussions/:id', handlers.getDiscussion);

// Comment
router.post('/discussions/:id/comments', verifyToken, handlers.createComment);
router.get('/discussions/:id/comments', handlers.getComments);

// Education
router.get('/educations', handlers.getEducations);

// Auth
router.post('/signup', handlers.signUp);
router.post('/signin', handlers.signIn);
router.post('/logout', handlers.logOut);
router.post('/reset-password', handlers.resetPassword);

module.exports = router;