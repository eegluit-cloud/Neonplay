const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFile, isS3Configured } = require('../lib/s3');

// File filter — accept images only
const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

// Use memory storage when S3 is available, disk storage as local fallback
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const storage = isS3Configured() ? multer.memoryStorage() : diskStorage;

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload endpoint
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Try S3 upload first
        if (isS3Configured()) {
            const s3Url = await uploadFile(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype,
                'promotions'
            );
            if (s3Url) {
                return res.json({ message: 'File uploaded successfully', imageUrl: s3Url });
            }
        }

        // Fallback: local file (disk storage was used)
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ message: 'File uploaded successfully', imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

module.exports = router;
