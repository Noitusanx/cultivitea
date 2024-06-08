const { storeData, getPredictHistories, uploadPredictionImageToStorage, } = require('../../services/storeData');
const InputError = require('../../exceptions/InputError');
const loadModel = require('../../services/loadModel');
const crypto = require('crypto');
const predictClassification = require('../../services/inferenceService');

// new predict handler
async function postPredict(req, res, next) {
    try {
      const uid = req.user.uid;
      const { file: image } = req;
      if (!image) {
        throw new InputError('No image provided');
      }
  
      const imageUrl = await uploadPredictionImageToStorage(image)
  
      const model = await loadModel();
      const { result, suggestion } = await predictClassification(model, image.buffer);
  
      const teaPlantId = crypto.randomUUID();
      const createdAt = new Date().toISOString();
  
      const data = {
        teaPlantId,
        imageUrl,
        result,
        suggestion,
        createdAt,
      };
  
      const storeResult = await storeData(uid, data);
  
      if (!storeResult.success) {
        throw new Error(storeResult.error);
      }
  
      res.status(201).json({
        status: 'success',
        message: 'Model is predicted successfully',
        data,
      });
    } catch (error) {
      console.error('Error occurred:', error);
      if (error instanceof InputError) {
        res.status(400).json({ status: 'fail', message: error.message });
      } else {
        next(error);
      }
    }
  }
  
  async function getPredictHistoriesHandler(req, res, next) { 
    try {
      const uid = req.user.uid;
      const histories = await getPredictHistories(uid);
      const data = histories.map(item => ({
        id: item.teaPlantId,
        history: item,
      }));
      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  }

  module.exports = {postPredict, getPredictHistories, getPredictHistoriesHandler};