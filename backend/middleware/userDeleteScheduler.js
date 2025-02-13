const cron = require('node-cron');
const User = require('../models/User');

// Run every minute to check for users marked for deletion
cron.schedule('* * * * *', async () => {
  try {
    const oneMinuteAgo = new Date(Date.now() - 30 * 1000); // 1 minute ago
    console.log('🔍 Checking for soft-deleted users to delete...');
    
    // Find users marked for deletion with deletedAt older than 1 minute
    const usersToDelete = await User.find({ deletedAt: { $lte: oneMinuteAgo } });

    for (let user of usersToDelete) {
      // Permanently delete the user from MongoDB
      await user.deleteOne();
      console.log(`User ${user.username} deleted from MongoDB after 1 minute.`);
    }
  } catch (error) {
    console.error('Error during scheduled cleanup:', error);
  }
});
