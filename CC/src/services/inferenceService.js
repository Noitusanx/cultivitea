// prepocessing image, predict image, and return the result

const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');


async function predictClassification(model, imageBuffer) {
  try {
    const tensor = tf.node
      .decodeJpeg(imageBuffer)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();

    const prediction = model.predict(tensor);
    const score = await prediction.data();
    
    console.log("Scores: ", score);

    const labels = ['Tea Algal Leaf', 'Tea Anthracnose', 'Tea Bird Eye Spot', 'Tea Brown Blight', 'Tea Healthy', 'Tea Red Leaf Spot']

    const predictedIndex = score.indexOf(Math.max(...score));
    const result = labels[predictedIndex];
    const accuracy = Math.max(...score) * 100;

    console.log("Predicted Result: ", result);
    console.log("Accuracy: ", accuracy);

    const suggestion = result !== 'Tea Healthy' ? 'Segera periksa tanaman Anda!' : 'Tanaman Anda sehat!';

    return { result, suggestion, accuracy };
  } catch (error) {
    console.error("Error in predictClassification: ", error);
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
  }
}




module.exports = predictClassification;
