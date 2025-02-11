const { Storage } = require('@google-cloud/storage');
const dotenv = require('dotenv');

dotenv.config();

const storage = new Storage({ keyFilename: process.env.GCS_KEY_FILE });
const bucketName = process.env.GCS_BUCKET;
// const bucket = storage.bucket(bucketName);



// Function to delete a file from GCS
async function deleteFromGCS(fileUrl) {
  // Extract the path of the file (e.g., "audio/filename.mp3" from the URL)
  const fileName = fileUrl.split('audio-hosting-bucket/')[1]; // Remove the base URL part
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  try {
    await file.delete();
    console.log(`File ${fileName} deleted from GCS.`);
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
  }
}


module.exports = { deleteFromGCS };
