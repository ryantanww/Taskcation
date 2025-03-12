import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

// Import bundled model files – adjust paths as necessary.
const modelJson = require('../../assets/baselineModel/model.json');
const modelWeights = [require('../../assets/baselineModel/group1-shard1of1.bin')];

const grades = ['A', 'B', 'C', 'D', 'E', 'F'];
const priorityLevels = ['Low', 'Medium', 'High', 'Urgent'];
let model = null;

/**
 * Loads the pre-trained model from bundled resources.
 */
export const loadModel = async () => {
    await tf.ready();
    try {
        model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
        console.log('ML model loaded successfully.');
    } catch (error) {
        console.error('Error loading ML model: ', error);
    }
};

/**
 * Returns a predicted priority level for the provided grade.
 * If the grade is 'N/A', returns null (i.e. no suggestion).
 *
 * @param {string} grade - The letter grade (e.g., 'A', 'B', etc.)
 * @returns {string|null} - Predicted priority level ('low', 'medium', 'high', 'urgent') or null.
 */
export const predictPriority = (grade) => {
    if (grade === 'N/A') {
        return null;
    }
    if (!model) {
        console.warn('ML model not loaded yet.');
        return null;
    }
    // One-hot encode the grade.
    const inputArray = grades.map(g => (g === grade ? 1 : 0));
    const inputTensor = tf.tensor2d([inputArray]);
    const prediction = model.predict(inputTensor);
    const predIndex = prediction.argMax(1).dataSync()[0];
    return priorityLevels[predIndex];
};