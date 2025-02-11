const cron = require('node-cron');
const Audio = require('../models/Audio.js');
const { deleteFromGCS } = require('./gcsHelpers.js');

// Schedule job to run every minute (for testing, you can adjust this during development)
cron.schedule('* * * * *', async () => {  // Runs every minute
  console.log('🔍 Checking for soft-deleted audio files to delete...');

  try {
    const now = Date.now();
    // Find audio files that have been marked for deletion and their time has come
    const filesToDelete = await Audio.find({
      'toBeDeleted.deleteAfter': { $lte: now } // Files marked for deletion and time passed
    });

    for (const audio of filesToDelete) {
      for (const file of audio.toBeDeleted) {
        console.log(`🗑️ Deleting soft-deleted file: ${file.fileUrl}`);
        await deleteFromGCS(file.fileUrl); // Delete from GCS
      }

      // Delete the file record in MongoDB (remove soft-deleted file entries)
      audio.toBeDeleted = []; // Clear the deletion tracking array
      audio.save(); // Save the updated document
    }
  } catch (error) {
    console.error('❌ Error deleting soft-deleted files:', error);
  }
});