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
    const { uid } = req.params; // UID dari parameter URL
    const { username, phoneNumber, dateOfBirth } = req.body;
  
    try {
      const authenticatedUid = req.user.uid; // UID dari token autentikasi
  
      if (uid !== authenticatedUid) {
        return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this profile' });
      }
  
      let imageUrl = req.body.imageUrl;
  
      if (req.file) {
        imageUrl = await uploadUserImageToStorage(req.file, uid);
      }
  
      const updatedData = removeUndefinedFields({
        username: username,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        imageUrl: imageUrl || '',
      });
  
      await updateProfileById(uid, updatedData);
      res.status(200).json({ status: 'success', message: 'User profile updated', data: updatedData });
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