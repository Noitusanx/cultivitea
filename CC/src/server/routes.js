const express = require('express');
const multer = require('multer');
const handlers = require('./handler');

const router = express.Router();
const upload = multer();

// Multer configuration for video upload
const uploadVideo = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'video/mp4') {
            return cb(new Error('Only MP4 file is allowed'));
        }
        cb(null, true);
    },
});

// Predict
router.post('/predict', upload.single('image'), handlers.postPredict);
router.get('/predict/histories', handlers.getPredictHistories);

// Discussion
router.post('/discussions', handlers.createDiscussion);
router.get('/discussions', handlers.getAllDiscussions);
router.get('/discussions/:id', handlers.getDiscussion);
router.post('/discussions/:id/comments', handlers.createComment);
router.get('/discussions/:id/comments', handlers.getComments);

// Education
router.post('/educations', uploadVideo.single('video'), handlers.createEducation);
router.get('/educations', handlers.getEducations);

// Auth
router.post('/signup', handlers.signUp);
router.post('/signin', handlers.signIn);
router.post('/logout', handlers.logOut);
router.post('/reset-password', handlers.resetPassword);

module.exports = router;