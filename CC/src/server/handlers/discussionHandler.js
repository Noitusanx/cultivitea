const {saveDiscussion, updateDiscussion, getAllDiscussions, getDiscussionById, deleteDiscussion} = require('../../services/storeData');
const crypto = require('crypto');

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

  module.exports = {createDiscussion, getAllDiscussionsHandler, getDiscussionHandler, updateDiscussionHandler, deleteDiscussionHandler};