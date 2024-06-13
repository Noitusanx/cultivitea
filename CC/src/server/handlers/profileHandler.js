const { getProfileById, updateProfileById, deleteProfileById, uploadUserImageToStorage, removeUndefinedFields } = require('../../services/storeData');

// Profile handler
const getProfileByIdHandler = async (req, res, next) => {
    const { uid } = req.params;

    try {
        const profile = await getProfileById(uid);

        if (!profile) {
            return res.status(404).json({ 
                error: true, 
                message: 'User not found', 
                userCredential: null 
            });
        }

        res.status(200).json({ 
            error: false, 
            message: 'User profile retrieved successfully', 
            userCredential: profile 
        });
    } catch (error) {
        next(error);
    }
};

const updateProfileByIdHandler = async (req, res, next) => {
    const { uid } = req.params;
    const { username, phoneNumber, dateOfBirth } = req.body;
  
    try {
      const authenticatedUid = req.user.uid;
  
      if (uid !== authenticatedUid) {
        return res.status(403).json({ 
          error: true, 
          message: 'You are not authorized to update this profile',
          userCredential: null
        });
      }
  
      const currentProfile = await getProfileById(uid);
      if (!currentProfile) {
        return res.status(404).json({ 
          error: true, 
          message: 'Profile not found',
          userCredential: null
        });
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
  
      const updatedProfile = await getProfileById(uid);
  
      const userCredential = {
        username: updatedProfile.username,
        uid: updatedProfile.uid,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
        dateOfBirth: updatedProfile.dateOfBirth,
        imageUrl: updatedProfile.imageUrl,
      };
  
      res.status(200).json({ 
        error: false, 
        message: 'User profile updated successfully', 
        updatedProfile: updatedData,
        userCredential: userCredential
      });
    } catch (error) {
      next(error);
    }
  };
  




const deleteProfileByIdHandler = async (req, res, next) => {
    const { uid } = req.params;

    try {
        const authenticatedUid = req.user.uid;
        if (uid !== authenticatedUid) {
            return res.status(403).json({ 
                error: true, 
                message: 'You are not authorized to delete this profile',
                userCredential: null 
            });
        }

        await deleteProfileById(uid);
        res.status(200).json({ 
            error: false, 
            message: 'User profile deleted successfully', 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfileByIdHandler,
    updateProfileById,
    deleteProfileById,
    updateProfileByIdHandler,
    deleteProfileByIdHandler
};
