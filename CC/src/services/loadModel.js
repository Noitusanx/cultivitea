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
    return tf.loadGraphModel(process.env.MODEL_URL);
}

module.exports = loadModel;
>>>>>>> 6ca4c64f9c7e943f7cc8bee7a21203745d31c941
