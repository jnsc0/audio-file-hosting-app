const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Google Cloud Storage
const storage = new Storage({ keyFilename: process.env.GCS_KEY_FILE });
const bucket = storage.bucket(process.env.GCS_BUCKET);

// Multer setup (store files temporarily before upload)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, and MP4 are allowed.'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

// Upload file to Google Cloud Storage
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `audio/${Date.now()}-${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: { contentType: file.mimetype },
    });

    blobStream.on('finish', async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    blobStream.on('error', (err) => reject(err));
    blobStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToGCS };
