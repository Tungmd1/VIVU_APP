import { Request, Response, Router } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { redisCache } from '../../config/redis';
import { prisma } from '../../config/database';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';

export const feedRouter = Router();

const BEACONS_FILE = path.join(__dirname, '../../../in_memory_beacons.json');

function loadBeacons(): any[] {
  try {
    if (fs.existsSync(BEACONS_FILE)) {
      const data = fs.readFileSync(BEACONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading beacons:', err);
  }
  return [];
}

function saveBeacons(beacons: any[]) {
  try {
    fs.writeFileSync(BEACONS_FILE, JSON.stringify(beacons, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing beacons:', err);
  }
}

// 0. API NOW BEACON (Bong bóng nguyện vọng trên bản đồ)
feedRouter.get('/beacons', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const now = Date.now();
    let beacons = loadBeacons();

    // Lọc các beacon chưa hết hạn
    beacons = beacons.filter((b) => !b.expiresAt || b.expiresAt > now);

    if (category && category !== 'all') {
      beacons = beacons.filter((b) => b.category === category);
    }

    res.json({ success: true, data: beacons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách nguyện vọng' });
  }
});

feedRouter.post('/beacons', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      userName,
      userAvatar,
      userAge,
      userOccupation,
      userInterests,
      batteryLevel,
      statusMode,
      latitude,
      longitude,
      category,
      emoji,
      content,
      ttlHours,
      imageUrl,
    } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: 'Nội dung nguyện vọng không được để trống' });
      return;
    }

    const duration = ttlHours ? Number(ttlHours) : 3;
    const now = Date.now();
    const expiresAt = now + duration * 60 * 60 * 1000;

    const newBeacon = {
      id: `beacon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: userId || `u_${Date.now()}`,
      userName: userName || 'Người dùng Vivu',
      userAvatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      userAge: userAge ? Number(userAge) : undefined,
      userOccupation: userOccupation || undefined,
      userInterests: Array.isArray(userInterests) ? userInterests : [],
      batteryLevel: batteryLevel ? Number(batteryLevel) : 85,
      statusMode: statusMode || 'chilling',
      latitude: latitude ? Number(latitude) : 16.0544,
      longitude: longitude ? Number(longitude) : 108.2022,
      category: category || 'cafe',
      emoji: emoji || '☕',
      content: content.trim(),
      imageUrl: imageUrl || undefined,
      createdAt: now,
      expiresAt,
      ttlHours: duration,
      likesCount: 0,
    };

    let beacons = loadBeacons();
    // Thay thế beacon cũ của cùng user (nếu có)
    if (userId) {
      beacons = beacons.filter((b) => b.userId !== userId);
    }
    beacons.unshift(newBeacon);
    saveBeacons(beacons);

    res.status(201).json({ success: true, data: newBeacon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi phát tín hiệu nguyện vọng' });
  }
});

feedRouter.post('/beacons/ai-voice', async (req: Request, res: Response) => {
  try {
    const { audioBase64 } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ success: false, message: 'Thiếu file ghi âm.' });
    }

    // Xử lý chuyển đổi giọng nói thành văn bản và phân loại nguyện vọng
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate smart AI understanding of random voice inputs
    const mockResponses = [
      { content: "Trời mưa buồn quá, có ai đi uống cafe tâm sự không?", emoji: "🌧️", category: "cafe" },
      { content: "Thèm ăn khuya quá, khu vực Hải Châu có quán nào ngon không mọi người?", emoji: "🍜", category: "food" },
      { content: "Đang stress quá, cần người chạy bộ chung quanh bờ hồ.", emoji: "🏃", category: "sport" },
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    res.json({
      success: true,
      data: randomResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi AI phân tích giọng nói' });
  }
});

feedRouter.delete('/beacons/:id', async (req: Request, res: Response) => {
  try {
    const beaconId = req.params.id;
    let beacons = loadBeacons();
    beacons = beacons.filter((b) => b.id !== beaconId);
    saveBeacons(beacons);
    res.json({ success: true, message: 'Đã hủy tín hiệu' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa tín hiệu' });
  }
});

feedRouter.post('/beacons/:id/react', async (req: Request, res: Response) => {
  try {
    const beaconId = req.params.id;
    let beacons = loadBeacons();
    const beacon = beacons.find((b) => b.id === beaconId);
    if (beacon) {
      beacon.likesCount = (beacon.likesCount || 0) + 1;
      saveBeacons(beacons);
      res.json({ success: true, data: { likesCount: beacon.likesCount } });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy nguyện vọng' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi gửi cảm xúc' });
  }
});


const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Nội dung bài viết không được để trống'),
    images: z.array(z.string()).default([]),
    videoUrl: z.string().optional(),
    videoDuration: z.number().optional(),
    hashtags: z.array(z.string()).default([]),
    location: z.string().optional(),
    time: z.string().optional(),
    slots: z.string().optional(),
    taggedVenue: z
      .object({
        id: z.string(),
        name: z.string(),
        address: z.string(),
        platformSource: z.string().optional(),
      })
      .optional(),
    taggedCompanions: z.any().optional(),
    isRecruitment: z.boolean().optional(),
    isWish: z.boolean().optional(),
    recruitmentSlots: z.number().optional(),
    recruitmentBudget: z.string().optional(),
    displayDuration: z.number().optional(),
  }),
});

// Cache-aside pattern for 10k CCU
feedRouter.get('/', async (req: Request, res: Response) => {
  const category = (req.query.category as string) || 'all';
  const cacheKey = `feed:home:${category}`;

  const cached = await redisCache.get(cacheKey);
  if (cached) {
    res.json({
      success: true,
      fromCache: true,
      data: JSON.parse(cached),
    });
    return;
  }

  let dbPosts: any[] = [];
  try {
    dbPosts = await prisma.post.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        author: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Prisma Error fetching posts:", error);
  }

  // Format cho frontend
  const posts = dbPosts.map(p => ({
    id: p.id,
    author: {
      id: p.author?.id || 'u_me',
      name: p.author?.fullName || p.author?.identifier || 'Người dùng',
      avatar: p.author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      location: p.city || 'Đà Nẵng',
      trustScore: p.author?.trustScore || 90,
    },
    timeAgo: 'Mới đây', // Có thể dùng date-fns để tính toán
    content: p.content,
    images: p.images,
    hashtags: p.hashtags,
    likes: p.likesCount,
    commentsCount: p.commentsCount,
    sharesCount: 0,
    taggedVenue: p.venueName ? {
      name: p.venueName,
      address: p.city,
      latitude: p.locationLat,
      longitude: p.locationLng
    } : undefined,
    isRecruitment: p.isRecruitment,
    isWish: p.isWish,
    recruitmentSlots: p.slots,
    recruitmentJoined: 1,
    activitySnippet: p.targetTime ? {
      location: p.venueName || p.city,
      time: p.targetTime,
      slots: p.slots ? `${p.slots} người` : undefined,
      budget: p.budget,
    } : undefined,
  }));

  await redisCache.set(cacheKey, JSON.stringify(posts), 60);

  res.json({
    success: true,
    fromCache: false,
    data: posts,
  });
});

feedRouter.post(
  '/posts',
  authenticateJwt,
  validateRequest(createPostSchema),
  async (req: Request, res: Response) => {
    const {
      content,
      images,
      videoUrl,
      videoDuration,
      hashtags,
      location,
      time,
      slots,
      taggedVenue,
      taggedCompanions,
      isRecruitment,
      isWish,
      recruitmentSlots,
      recruitmentBudget,
      displayDuration,
    } = req.body;

    // Resolve author (fallback to first user if auth doesn't provide valid DB user)
    let authorId = req.user?.userId;
    const authorExists = await prisma.user.findUnique({ where: { id: authorId } });
    if (!authorExists) {
      const fallbackUser = await prisma.user.findFirst();
      authorId = fallbackUser?.id;
    }
    
    if (!authorId) {
      return res.status(400).json({ success: false, message: 'No valid user found to author post' });
    }

    const expiresAt = displayDuration && displayDuration > 0 
      ? new Date(Date.now() + displayDuration * 60000) 
      : null;

    let savedPost = null;
    try {
      savedPost = await prisma.post.create({
        data: {
          authorId,
          content: content || '',
          images: images || [],
          hashtags: hashtags || [],
          isRecruitment: !!isRecruitment,
          isWish: !!isWish,
          expiresAt,
          locationLat: taggedVenue?.latitude || null,
          locationLng: taggedVenue?.longitude || null,
          venueName: taggedVenue?.name || location || null,
          targetTime: time || null,
          budget: recruitmentBudget || null,
          slots: recruitmentSlots ? parseInt(recruitmentSlots) : null
        },
        include: { author: true }
      });
    } catch (err) {
      console.error("Prisma error saving post", err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    const newPost = {
      id: savedPost.id,
      author: {
        id: savedPost.authorId,
        name: savedPost.author?.identifier || 'Người dùng',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        location: location || 'Đà Nẵng',
      },
      timeAgo: 'Vừa xong',
      content: savedPost.content,
      images: savedPost.images,
      hashtags: savedPost.hashtags,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      taggedVenue,
      isRecruitment: savedPost.isRecruitment,
      isWish: savedPost.isWish,
      recruitmentSlots: savedPost.slots,
      recruitmentJoined: 1,
      activitySnippet: savedPost.targetTime
        ? {
            location: savedPost.venueName || location,
            time: savedPost.targetTime,
            slots: savedPost.slots ? `${savedPost.slots} người` : undefined,
            budget: savedPost.budget,
          }
        : undefined,
    };

    // Invalidate cache
    await redisCache.del('feed:home:all');

    res.status(201).json({
      success: true,
      message: 'Đăng bài viết thành công!',
      data: newPost,
    });
  }
);

// Tương tác: Like bài viết
feedRouter.post('/posts/:id/like', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    
    // Đơn giản hóa MVP: chỉ tăng likesCount
    const updated = await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });

    res.json({ success: true, likesCount: updated.likesCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Tương tác: Lấy danh sách bình luận
feedRouter.get('/posts/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { author: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: {
          id: c.author.id,
          name: c.author.profile?.fullName,
          avatarUrl: c.author.profile?.avatarUrl,
        }
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Tương tác: Viết bình luận
feedRouter.post('/posts/:id/comments', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const authorId = req.user!.userId;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ success: false, message: 'Nội dung bình luận không được trống.' });
      return;
    }

    const comment = await prisma.$transaction(async (tx) => {
      const cmt = await tx.comment.create({
        data: { postId, authorId, content },
        include: { author: { include: { profile: true } } }
      });
      
      await tx.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      });

      return cmt;
    });

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          name: comment.author.profile?.fullName,
          avatarUrl: comment.author.profile?.avatarUrl,
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// Lưu bài viết (Saved Items)
feedRouter.post('/posts/:id/save', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = String(req.params.id);
    const userId = req.user!.userId;

    const existing = await prisma.savedItem.findUnique({
      where: { userId_targetType_targetId: { userId, targetType: 'POST', targetId: postId } }
    });

    if (existing) {
      await prisma.savedItem.delete({ where: { id: existing.id } });
      res.json({ success: true, message: 'Đã bỏ lưu bài viết', saved: false });
    } else {
      await prisma.savedItem.create({
        data: { userId, targetType: 'POST', targetId: postId }
      });
      res.json({ success: true, message: 'Đã lưu bài viết', saved: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});
