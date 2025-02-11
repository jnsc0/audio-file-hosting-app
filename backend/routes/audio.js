const express = require('express');
const router = express.Router();
const Audio = require('../models/Audio');
const { protect, admin } = require('../middleware/auth');
const { upload, uploadToGCS } = require('../middleware/audioupload');
const {deleteFromGCS} = require('../middleware/gcsHelpers.js');

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

// 📌 Get all uploaded files (User sees own files, Admin sees all)
router.get('/', protect, async (req, res) => {
  try {
    const audios = req.user.role === 'admin' ? await Audio.find() : await Audio.find({ user: req.user.id });
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

//put api
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

    // Delete the old file from GCS if it exists
    if (audio.fileUrl) {
      console.log(`Deleting old file from GCS: ${audio.fileUrl}`);
      await deleteFromGCS(audio.fileUrl); // Delete the old file from GCS
    }

    // Update the audio metadata and upload the new file
    const newFileUrl = await uploadToGCS(req.file); // Function to upload new file to GCS
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

    if (req.user.role !== 'admin' && req.user.id !== String(audio.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete from Google Cloud Storage
    await deleteFromGCS(audio.fileUrl);

    await audio.deleteOne();
    res.json({ message: 'Audio file deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
