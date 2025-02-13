const cron = require('node-cron');
const Audio = require('../models/Audio');
const { deleteFromGCS } = require('./gcsDelete');

// Run every minute to check for files older than 1 minute
cron.schedule('* * * * *', async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 30 * 1000); // 1 minute ago
    console.log('🔍 Checking for soft-deleted audio files to delete...');
    const filesToDelete = await Audio.find({ deletedAt: { $lte: oneMinuteAgo } });
    

    for (let file of filesToDelete) {
      // Delete from GCS
      await deleteFromGCS(file.fileUrl);
      console.log(`File ${file.filename} deleted from GCS after 1 minute.`);
      // Delete from MongoDB
      await file.deleteOne();
      console.log(`File ${file.filename} deleted from both MongoDB and GCS after 1 minute.`);
    }
  } catch (error) {
    console.error('Error during scheduled cleanup:', error);
  }
});
