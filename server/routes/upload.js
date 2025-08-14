// routes/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer config with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pics', // optional folder in your Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('file'), (req, res) => {
    console.log("📦 File received:", req.file);
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  res.json({ url: req.file.path }); // Cloudinary image URL
});

module.exports = router;
