const { storeData, getPredictHistories, uploadPredictionImageToStorage } = require('../../services/storeData');
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
      throw new InputError('Invalid input: No image provided');
    }

    const imageUrl = await uploadPredictionImageToStorage(image);

    const model = await loadModel();
    const { result, suggestion } = await predictClassification(model, image.buffer);

    const teaPlantId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const predictionResult = {
      teaPlantId,
      imageUrl,
      result,
      suggestion,
      createdAt,
    };

    const storeResult = await storeData(uid, predictionResult);

    if (!storeResult.success) {
      throw new Error(storeResult.error);
    }

    res.status(201).json({
      error: false,
      message: 'Model is predicted successfully',
      data: predictionResult,
    });
  } catch (error) {
    if (error instanceof InputError) {
      res.status(400).json({ 
        error: true, 
        message: error.message 
      });
    } else {
      next(error);
    }
  }
}

async function getPredictHistoriesHandler(req, res, next) { 
  try {
    const uid = req.user.uid;
    const histories = await getPredictHistories(uid);

    // Sort histories by createdAt in ascending order (earliest first)
    histories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const predictionHistories = histories.map(item => ({
      history: item,
    }));
    
    res.status(200).json({ 
      error: false, 
      message: "Predictions history retrieved successfully", 
      data: predictionHistories 
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { postPredict, getPredictHistories, getPredictHistoriesHandler };
