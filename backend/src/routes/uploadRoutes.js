import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, '../../uploads');

// Đảm bảo thư mục lưu trữ vật lý tồn tại
const chatDir = path.join(uploadsRoot, 'chat');
const highlightsDir = path.join(uploadsRoot, 'highlights');
const storiesDir = path.join(uploadsRoot, 'stories');
if (!fs.existsSync(chatDir)) fs.mkdirSync(chatDir, { recursive: true });
if (!fs.existsSync(highlightsDir)) fs.mkdirSync(highlightsDir, { recursive: true });
if (!fs.existsSync(storiesDir)) fs.mkdirSync(storiesDir, { recursive: true });

// Cấu hình Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.query.category || req.body.category || 'chat';
    let targetDir = chatDir;
    if (category === 'highlights') targetDir = highlightsDir;
    else if (category === 'stories') targetDir = storiesDir;
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || (file.mimetype.startsWith('video/') ? '.mp4' : '.jpg');
    const safeExt = ext.replace(/[^a-z0-9.]/gi, '');
    const prefix = req.query.category || req.body.category || 'chat';
    const uniqueName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${safeExt}`;
    cb(null, uniqueName);
  }
});

// Bộ lọc định dạng tệp được phép
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v'];

  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Định dạng tệp không được hỗ trợ (${file.mimetype}). Vui lòng chọn ảnh (JPG, PNG, WebP) hoặc video (MP4, WebM).`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024 // Tối đa 30MB
  }
});

const router = Router();

// POST /api/upload/media
router.post('/media', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Dung lượng tệp vượt quá giới hạn cho phép (tối đa 30MB).' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Lỗi khi tải tệp lên máy chủ.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng đính kèm một tệp ảnh hoặc video.' });
    }

    const category = req.query.category || req.body.category || 'chat';
    const subfolder = category === 'highlights' ? 'highlights' : (category === 'stories' ? 'stories' : 'chat');
    const publicUrl = `/uploads/${subfolder}/${req.file.filename}`;
    const isVideo = req.file.mimetype.startsWith('video/');

    return res.status(201).json({
      success: true,
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: isVideo ? 'video' : 'image'
    });
  });
});

export default router;
