const { Storage } = require('@google-cloud/storage');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = new Storage();
const bucketName = 'thejago-store-uploads';
const bucket = storage.bucket(bucketName);

// Configure Multer to store files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * Upload file to Google Cloud Storage
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    const extension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${extension}`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on('error', (err) => {
      reject(err);
    });

    blobStream.on('finish', () => {
      // The public URL can be used directly because we made the bucket public
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToGCS };
