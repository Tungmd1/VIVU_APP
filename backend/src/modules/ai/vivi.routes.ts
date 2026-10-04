import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../../middlewares/validate.middleware';
import { SearchService } from '../search/search.service';
import { ViViAIService } from './vivi.service';

export const viviRouter = Router();

const icebreakerSchema = z.object({
  body: z.object({
    targetUserName: z.string().min(1),
    sharedInterests: z.array(z.string()).default([]),
    candidateCity: z.string().default('Đà Nẵng'),
    contextType: z.enum(['cafe', 'food', 'travel', 'general']).default('general'),
  }),
});

const smartRepliesSchema = z.object({
  body: z.object({
    lastMessage: z.string().min(1),
  }),
});

// 1. Sinh câu mở đầu bắt chuyện thông minh (AI Icebreaker)
viviRouter.post(
  '/icebreaker',
  validateRequest(icebreakerSchema),
  async (req: Request, res: Response) => {
    const result = await ViViAIService.generateSmartIcebreaker(req.body);
    res.json({
      success: true,
      data: result,
    });
  }
);

// 2. Gợi ý 3 câu trả lời nhanh ngữ cảnh (Smart Contextual Replies)
viviRouter.post(
  '/smart-replies',
  validateRequest(smartRepliesSchema),
  async (req: Request, res: Response) => {
    const { lastMessage } = req.body;
    const replies = ViViAIService.generateSmartReplies(lastMessage);
    res.json({
      success: true,
      data: replies,
    });
  }
);

// 3. Tìm kiếm ngữ nghĩa lai (Hybrid Semantic Search)
viviRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || '';
  const city = (req.query.city as string) || 'Đà Nẵng';

  const results = await SearchService.hybridSearch(query, category, city);
  res.json({
    success: true,
    total: results.length,
    data: results,
  });
});

// 4. Trò chuyện & Hỏi đáp trực tiếp cùng ViVi
viviRouter.post('/ask', async (req: Request, res: Response) => {
  const question = (req.body.question as string) || '';
  const city = (req.body.city as string) || 'Đà Nẵng';

  if (!question.trim()) {
    res.status(400).json({ success: false, message: 'Câu hỏi không được để trống.' });
    return;
  }

  const reply = await ViViAIService.askViVi(question, city);
  res.json({
    success: true,
    data: {
      reply,
    },
  });
});

// 5. Gợi ý địa điểm xung quanh
viviRouter.post('/scan-places', async (req: Request, res: Response) => {
  const query = (req.body.query as string) || 'địa điểm vui chơi';
  const city = (req.body.city as string) || 'Đà Nẵng';

  const defaultPlaces = [
    { name: "Sơn Trà Marina", address: "Hồ Xanh, Bán đảo Sơn Trà", reason: "View ngắm biển cực chill, phong cách Santorini." },
    { name: "Cộng Cà Phê", address: "96 Bạch Đằng", reason: "Ngồi lề đường ngắm sông Hàn và nhịp sống về đêm." },
    { name: "Chợ Đêm Helio", address: "Khu Đông Nam đài tưởng niệm", reason: "Thiên đường ẩm thực đường phố, không khí sôi động." },
    { name: "Nối Cafe", address: "K113/18 Nguyễn Chí Thanh", reason: "Không gian cổ điển, yên tĩnh thích hợp trò chuyện sâu." },
    { name: "Bãi biển Mỹ Khê", address: "Võ Nguyên Giáp, Sơn Trà", reason: "Bãi biển đẹp, không gian mở cho các hoạt động thể thao & dạo mát." },
  ];

  const filtered = defaultPlaces.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.reason.toLowerCase().includes(query.toLowerCase())
  );

  res.json({
    success: true,
    data: filtered.length > 0 ? filtered : defaultPlaces.slice(0, 3),
  });
});
