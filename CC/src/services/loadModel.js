<<<<<<< HEAD
// Load the model from the URL provided in the .env file

require('dotenv').config()

const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    return tf.loadLayersModel(process.env.MODEL_URL);
}

module.exports = loadModel;
=======
// Load the model from the URL provided in the .env file

require('dotenv').config()

const tf = require('@tensorflow/tfjs-node');

async function loadModel() {
    return tf.loadLayersModel(process.env.MODEL_URL);
}

module.exports = loadModel;
>>>>>>> 3ec16a9 (feat: backup if firebase auth doesn't work)
