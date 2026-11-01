import { Router } from 'express';
import { notificationService } from '../services/notificationService.js';

const router = Router();

// GET /api/notifications/:userId - Lấy danh sách thông báo của người dùng
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const notifs = notificationService.getNotifications(userId);
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/:id/read - Đánh dấu 1 thông báo là đã đọc
router.post('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    const ok = notificationService.markNotificationRead(id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/notifications/read-all - Đánh dấu tất cả thông báo của người dùng là đã đọc
router.post('/read-all', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
    const count = notificationService.markAllNotificationsRead(userId);
    res.json({ success: true, updatedCount: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/notifications/:id - Xóa thông báo
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const ok = notificationService.deleteNotification(id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
