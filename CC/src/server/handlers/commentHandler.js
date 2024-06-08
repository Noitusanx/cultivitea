const { saveComment, deleteComment, getAllComments, getCommentById, getDiscussionById} = require('../../services/storeData');
const crypto = require('crypto');

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

  module.exports = {createComment, getCommentsHandler, deleteCommentHandler};