const { getProfileById, updateProfileById, deleteProfileById, uploadUserImageToStorage, removeUndefinedFields} = require('../../services/storeData');

// Profile handler
const getProfileByIdHandler = async (req, res, next) => {
    const { uid } = req.params;
  
    try {
      const profile = await getProfileById(uid);
  
      if (!profile) {
        return res.status(404).json({ status: 'fail', message: 'User not found' });
      }
  
      res.status(200).json({ status: 'success', message: 'User profile fetched', data: profile });
    } catch (error) {
      next(error);
    }
  };
  
  
  const updateProfileByIdHandler = async (req, res, next) => {
    const { uid } = req.params;
    const { username, phoneNumber, dateOfBirth} = req.body;
  
    try {
      const authenticatedUid = req.user.uid;
  
      if (uid !== authenticatedUid) {
        return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this profile' });
      }
  
      const currentProfile = await getProfileById(uid);
      if (!currentProfile) {
        return res.status(404).json({ status: 'fail', message: 'Profile not found' });
      }
  
      let imageUrl = currentProfile.imageUrl;
  
      if (req.file) {
        imageUrl = await uploadUserImageToStorage(req.file, uid);
      }
  
      const updatedData = removeUndefinedFields({
        username: username !== undefined ? username : currentProfile.username,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : currentProfile.phoneNumber,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : currentProfile.dateOfBirth,
        imageUrl: req.file ? imageUrl : currentProfile.imageUrl,
      });
  
      await updateProfileById(uid, updatedData);
  
      const responseData = removeUndefinedFields({
        username: username !== undefined ? username : undefined,
        phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
        imageUrl: req.file ? imageUrl : undefined,
      });
  
      res.status(200).json({ status: 'success', message: 'User profile updated', data: responseData });
    } catch (error) {
      next(error);
    }
  };
  
  
  const deleteProfileByIdHandler = async (req, res, next) => {
    const { uid } = req.params;
  
    try {
      const authenticatedUid = req.user.uid;
      if (uid !== authenticatedUid) {
        return res.status(403).json({ status: 'fail', message: 'You are not authorized to delete this profile' });
      }
  
      await deleteProfileById(uid);
      res.status(200).json({ status: 'success', message: 'User profile deleted' });
    } catch (error) {
      next(error);
  }
  }

  module.exports = {getProfileByIdHandler, updateProfileById, deleteProfileById, updateProfileByIdHandler, deleteProfileByIdHandler};