const express = require('express');
const router = express.Router();
const Audio = require('../models/Audio');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToGCS } = require('../middleware/audioUpload.js');

// 📌 Upload Audio File and Meta data
router.post('/upload', protect, upload.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload to Google Cloud Storage
    const fileUrl = await uploadToGCS(req.file);

    const { title, category, description } = req.body;
    const newAudio = new Audio({
      user: req.user.id,
      title,
      category,
      description,
      fileUrl
    });

    await newAudio.save();
    res.status(201).json(newAudio);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 📌 Get all uploaded files (User sees own files, Admin sees all including soft-deleted)
router.get('/', protect, async (req, res) => {
  try {
    let query = req.user.role === 'admin' ? {} : { user: req.user.id, deletedAt: null };

    // If the user is not an admin, we filter out files that are marked for deletion (deletedAt is not null)
    const audios = await Audio.find(query);
    res.json(audios);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// 📌 Get a single audio file (only owner or admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'File not found' });

    if (req.user.role !== 'admin' && req.user.id !== String(audio.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(audio);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, upload.single('audioFile'), async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) {
      return res.status(404).json({ message: 'Audio file not found' });
    }

    // Users can only update their own files (Admins can update any)
    if (req.user.role !== 'admin' && audio.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this audio file' });
    }

    // Soft delete the old file (instead of immediate removal)
    if (audio.fileUrl) {
      console.log(`Marking old file for deletion: ${audio.fileUrl}`);
      audio.oldFileUrl = audio.fileUrl;
    }

    // Upload the new file to GCS only if there's a new file
    let newFileUrl = audio.fileUrl; // Keep the existing URL if no new file is uploaded
    if (req.file) {
      newFileUrl = await uploadToGCS(req.file);
    }

    // Update the existing audio record with new file details
    audio.description = req.body.description || audio.description;
    audio.category = req.body.category || audio.category;
    audio.fileUrl = newFileUrl;

    await audio.save();

    res.status(200).json({ message: 'Audio file updated successfully', audio });

  } catch (error) {
    console.error('Error updating audio file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// 📌 Delete an audio file (only owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'File not found' });

    // Users can only delete their own files (Admins can delete any file)
    if (req.user.role !== 'admin' && req.user.id !== String(audio.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark the file as deleted in MongoDB (Set deletedAt date)
    audio.deletedAt = Date.now();
    await audio.save();

    // Return success response without actually deleting the file yet
    res.json({ message: 'Audio file marked for deletion. It will be deleted permanently after 1 minute.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore a replaced or soft-deleted audio file
router.put('/:id/restore', protect, async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);
    if (!audio) return res.status(404).json({ message: 'File not found' });

    if (req.user.role !== 'admin' && req.user.id !== String(audio.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Case 1: Restore a soft-deleted file
    if (audio.deletedAt) {
      audio.deletedAt = null; // Remove the deletedAt field
      await audio.save();
      return res.json({ message: `Audio file restored. ${audio.oldFileUrl}` });
    }

    // Case 2: Restore a replaced file
    if (audio.oldFileUrl && !audio.deletedAt) {
      // Swap old and current file
      const tempFileUrl = audio.fileUrl;
      audio.fileUrl = audio.oldFileUrl;
      audio.oldFileUrl = tempFileUrl;

      await audio.save();
      return res.json({ message: `Replaced audio file restored. Current file name : ${audio.fileUrl}` });
    }

    res.status(400).json({ message: 'No file to restore.' });

  } catch (error) {
    console.error('Error restoring file:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// 📌 Get all files pending deletion
router.get('/pending-deletion', protect, admin, async (req, res) => {
  try {
    const pendingFiles = await Audio.find({
      deletedAt: { $ne: null, $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json(pendingFiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;