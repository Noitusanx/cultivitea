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
    let suggestion;

    switch (result) {
      case 'Algal Spot':
        suggestion = "Lakukan sanitasi lahan dengan membuang daun terinfeksi jauh dari lahan, pangkas daun yang terinfeksi, gunakan fungisida sesuai petunjuk, dan perbaiki sirkulasi udara dengan memangkas tanaman yang terlalu rapat.";
        break;
      case 'Brown Blight':
        suggestion = "Kontrol kelembapan dengan memastikan tanah tidak terlalu lembab, pangkas daun terinfeksi, dan gunakan fungisida.";
        break;
      case 'Gray Blight':
        suggestion = "Pangkas daun terinfeksi, gunakan fungisida, dan pastikan drainase lahan baik agar air tidak menggenang.";
        break;
      case 'Helopeltis':
        suggestion = "Buang bagian tanaman yang terinfeksi, gunakan insektisida, dan perkenalkan predator alami seperti semut atau kepik dengan membawa mereka ke area lahan.";
        break;
      case 'Red Spot':
        suggestion = "Buang daun terinfeksi, gunakan fungisida, dan pastikan kelembapan tanah terkontrol.";
        break;
      case 'Healthy':
        suggestion = "Tanaman teh Anda dalam kondisi sehat!";
        break;
      default:
        suggestion = "Segera periksa tanaman teh Anda!";
    }

    return { result, suggestion };


  } catch (error) {
    console.error("Error in predictClassification: ", error);
    throw new InputError('Terjadi kesalahan dalam melakukan prediksi');
  }
}

module.exports = predictClassification;



