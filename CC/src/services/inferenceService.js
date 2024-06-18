// // prepocessing image, predict image, and return the result

const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, imageBuffer) {
  try {
    const tensor = tf.node
      .decodeJpeg(imageBuffer)
      .div(tf.scalar(255.0))
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();

    const prediction = model.predict(tensor);
    const score = await prediction.data();


    const labels = ['Algal Spot', 'Brown Blight', 'Gray Blight', 'Healthy', 'Helopeltis', 'Red Spot'];

    const predictedIndex = score.indexOf(Math.max(...score));
    const result = labels[predictedIndex];

    const suggestion = result !== 'Healthy' ? 'Segera periksa tanaman Anda!' : 'Tanaman Anda sehat!';

    return { result, suggestion };
  } catch (error) {
    console.error("Error in predictClassification: ", error);
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
  }
}

module.exports = predictClassification;



