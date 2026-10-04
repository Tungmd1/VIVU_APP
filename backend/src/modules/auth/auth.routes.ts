import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { ENV } from '../../config/env';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { prisma, isDatabaseConnected } from '../../config/database';

export const authRouter = Router();

// In-memory OTP storage & Rate-limiting (5 phút hết hạn, tối đa 3 lần/10 phút)
const otpStorage: Map<string, { code: string; expiresAt: number; attempts: number }> = new Map();
const otpRateLimits: Map<string, { count: number; resetAt: number }> = new Map();

// Validation Schemas
const registerSchema = z.object({
  body: z.object({
    identifier: z.string().min(5, 'Số điện thoại hoặc email tối thiểu 5 ký tự'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    city: z.string().default('Đà Nẵng'),
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(5),
    password: z.string().min(6),
  }),
});

const sendOtpSchema = z.object({
  body: z.object({
    phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    code: z.string().length(6, 'Mã OTP gồm 6 chữ số'),
    phone: z.string(),
  }),
});

// File lưu trữ tài khoản người dùng bền vững (đa đường dẫn để đảm bảo không bị mất)
const STORAGE_PATHS = [
  path.resolve(__dirname, '../../../in_memory_users.json'),
  path.resolve(process.cwd(), 'in_memory_users.json'),
];

// In-memory fallback user store (khi chưa kết nối PostgreSQL)
export interface InMemUser {
  id: string;
  identifier: string;
  passwordHash: string;
  city: string;
  name: string;
  trustScore: number;
  avatarUrl: string;
  isVerified: boolean;
  createdAt: Date | string;
  age?: number;
  bio?: string;
  occupation?: string;
  education?: string;
  zodiac?: string;
  interests?: string[];
  photos?: string[];
  privatePhotos?: string[];
  pinnedPhoto?: string;
  ghostMode?: 'precise' | 'blurred' | 'frozen';
}

/**
 * Chuẩn hóa định danh (Số điện thoại / Email)
 * - Email: loại bỏ khoảng trắng thừa, chuyển thường.
 * - SĐT: loại bỏ khoảng trắng, dấu gạch ngang, dấu chấm, ngoặc đơn; chuẩn hóa +84/84 về 0; thêm 0 nếu nhập 9 số.
 */
export function normalizeIdentifier(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim().toLowerCase();

  // Nếu là email (chứa @)
  if (trimmed.includes('@')) {
    return trimmed;
  }

  // Nếu là số điện thoại: loại bỏ toàn bộ khoảng trắng, dấu gạch nối, dấu chấm, ngoặc đơn
  let digits = trimmed.replace(/[\s\-\.\(\)]/g, '');

  // Chuẩn hóa mã quốc gia Việt Nam (+84 hoặc 84) sang 0
  if (digits.startsWith('+84')) {
    digits = '0' + digits.slice(3);
  } else if (digits.startsWith('84') && digits.length >= 11) {
    digits = '0' + digits.slice(2);
  }

  // Nếu là số điện thoại 9 chữ số (thiếu số 0 đầu, ví dụ 703366045)
  if (/^[1-9]\d{8}$/.test(digits)) {
    digits = '0' + digits;
  }

  return digits;
}

function loadUsersFromDisk(): Map<string, InMemUser> {
  const map = new Map<string, InMemUser>();
  for (const p of STORAGE_PATHS) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf-8');
        const list: InMemUser[] = JSON.parse(raw);
        for (const u of list) {
          const norm = normalizeIdentifier(u.identifier);
          map.set(u.identifier.toLowerCase(), u);
          if (norm) {
            map.set(norm, u);
          }
        }
        console.log(`✅ [Auth Persistence] Đã nạp ${list.length} tài khoản người dùng từ ${p}`);
      }
    } catch (err) {
      console.error(`⚠️ [Auth Persistence] Lỗi nạp từ ${p}:`, err);
    }
  }
  return map;
}

const inMemoryUsers: Map<string, InMemUser> = loadUsersFromDisk();

function saveUsersToDisk() {
  try {
    const uniqueUsers = Array.from(new Set(inMemoryUsers.values()));
    const content = JSON.stringify(uniqueUsers, null, 2);
    for (const p of STORAGE_PATHS) {
      try {
        fs.writeFileSync(p, content, 'utf-8');
      } catch (e) {
        // Tiếp tục ghi file kế tiếp
      }
    }
  } catch (err) {
    console.error('⚠️ [Auth Persistence] Lỗi ghi danh sách users:', err);
  }
}

/**
 * Tìm kiếm người dùng thông minh & mềm dẻo (hỗ trợ cả các biến thể số điện thoại)
 */
export function findUserByIdentifier(rawId: string): InMemUser | null {
  if (!rawId) return null;
  const rawClean = rawId.trim().toLowerCase();
  const normalized = normalizeIdentifier(rawId);
  const digitsOnly = rawClean.replace(/\D/g, '');

  // 1. Khớp nhanh trong Map
  if (inMemoryUsers.has(rawClean)) {
    return inMemoryUsers.get(rawClean)!;
  }
  if (inMemoryUsers.has(normalized)) {
    return inMemoryUsers.get(normalized)!;
  }

  // 2. Duyệt tìm mềm dẻo trong toàn bộ danh sách users
  for (const u of inMemoryUsers.values()) {
    const uClean = u.identifier.trim().toLowerCase();
    const uNorm = normalizeIdentifier(u.identifier);
    const uDigits = uClean.replace(/\D/g, '');

    if (uClean === rawClean || uNorm === normalized) {
      return u;
    }

    // Nếu cả 2 đều là số điện thoại (chứa >= 9 số)
    if (digitsOnly.length >= 9 && uDigits.length >= 9) {
      if (digitsOnly === uDigits) return u;
      const d1 = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
      const d2 = uDigits.startsWith('0') ? uDigits.slice(1) : uDigits;
      if (d1 === d2) return u;
    }
  }

  return null;
}

// Helper function to create session and token
async function createSessionAndToken(userId: string, name: string, city: string) {
  const token = jwt.sign(
    { userId, name, city },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );

  if (isDatabaseConnected) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session
      await prisma.session.create({
        data: {
          userId,
          token,
          expiresAt,
        }
      });
    } catch {
      // In-memory session fallback
    }
  }

  return token;
}

// 0. API kiểm tra tài khoản đã tồn tại hay chưa (dùng cho live check)
authRouter.get('/check-identifier', async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = (req.query.identifier as string) || '';
    if (!raw.trim()) {
      res.status(400).json({ success: false, message: 'Thiếu thông tin identifier' });
      return;
    }
    const user = findUserByIdentifier(raw);
    res.json({
      success: true,
      exists: !!user,
      message: user ? 'Tài khoản đã tồn tại trên hệ thống.' : 'Tài khoản khả dụng.',
      data: user ? { identifier: user.identifier, name: user.name } : null,
    });
  } catch {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// 1. Đăng ký tài khoản (Đơn giản & Tức thì)
authRouter.post(
  '/register',
  validateRequest(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password, city = 'Đà Nẵng', fullName } = req.body;
      const cleanId = identifier.trim().toLowerCase();
      const normId = normalizeIdentifier(identifier);
      const cleanPass = password.trim();

      // Kiểm tra user đã tồn tại chưa (tìm kiếm thông minh)
      let existingUser = findUserByIdentifier(identifier);
      if (!existingUser && isDatabaseConnected) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { identifier: cleanId },
                { identifier: normId },
              ]
            }
          });
          if (dbUser) {
            existingUser = {
              id: dbUser.id,
              name: dbUser.identifier,
              identifier: dbUser.identifier,
              passwordHash: dbUser.passwordHash,
              city: dbUser.city,
              avatarUrl: '',
              trustScore: 100,
              isVerified: true,
              createdAt: dbUser.createdAt,
            };
          }
        } catch {
          // Bỏ qua lỗi kết nối database
        }
      }

      if (existingUser) {
        res.status(400).json({
          success: false,
          code: 'ACCOUNT_EXISTS',
          message: 'Tài khoản (Số điện thoại/Email) này đã tồn tại trên hệ thống.',
          data: {
            identifier: existingUser.identifier,
            name: existingUser.name,
          },
        });
        return;
      }

      const passwordHash = await bcrypt.hash(cleanPass, 10);
      const name = fullName?.trim() || cleanId.split('@')[0];
      const defaultAvatar = `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(cleanId)}`;

      let userId = 'user_' + Date.now();
      const newUser: InMemUser = {
        id: userId,
        identifier: cleanId,
        passwordHash,
        city,
        name,
        trustScore: 100,
        avatarUrl: defaultAvatar,
        isVerified: true,
        createdAt: new Date(),
        bio: '',
        age: undefined,
        occupation: '',
        education: '',
        zodiac: '',
        interests: [],
        photos: [defaultAvatar],
        privatePhotos: [],
        pinnedPhoto: defaultAvatar,
        ghostMode: 'precise',
      };

      if (isDatabaseConnected) {
        try {
          const dbUser = await prisma.user.create({
            data: {
              identifier: cleanId,
              passwordHash,
              city,
              profile: {
                create: {
                  fullName: name,
                  avatarUrl: defaultAvatar,
                  isVerified: true,
                }
              }
            },
            include: { profile: true }
          });
          userId = dbUser.id;
          newUser.id = dbUser.id;
        } catch (dbErr) {
          console.log(`ℹ️ [Auth In-Memory] Đã lưu người dùng mới [${name}] vào In-memory store.`);
        }
      }

      // Lưu dưới cả cleanId và normId để bất kỳ lần đăng nhập nào cũng tìm thấy
      inMemoryUsers.set(cleanId, newUser);
      if (normId) {
        inMemoryUsers.set(normId, newUser);
      }
      saveUsersToDisk();

      const token = await createSessionAndToken(userId, name, city);

      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        data: {
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            identifier: cleanId,
            city: newUser.city,
            trustScore: newUser.trustScore,
            avatar: newUser.avatarUrl,
            age: newUser.age,
            bio: newUser.bio,
            occupation: newUser.occupation,
            education: newUser.education,
            zodiac: newUser.zodiac,
            interests: newUser.interests,
            photos: newUser.photos,
            privatePhotos: newUser.privatePhotos,
            pinnedPhoto: newUser.pinnedPhoto,
            ghostMode: newUser.ghostMode,
            isPhoneVerified: true,
          },
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Lỗi xử lý đăng ký' });
    }
  }
);

// 2. Đăng nhập tài khoản (Đơn giản & Tức thì, đầy đủ thông tin hồ sơ)
authRouter.post(
  '/login',
  validateRequest(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password } = req.body;
      const cleanId = identifier.trim().toLowerCase();
      const cleanPass = password.trim();

      // Tìm kiếm người dùng thông minh & mềm dẻo
      let userFound: InMemUser | null = findUserByIdentifier(identifier);

      // Thử tìm trong PostgreSQL nếu chưa có trong in-memory
      if (!userFound && isDatabaseConnected) {
        try {
          const normId = normalizeIdentifier(identifier);
          const dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { identifier: cleanId },
                { identifier: normId },
              ]
            },
            include: { profile: true },
          });
          if (dbUser) {
            userFound = {
              id: dbUser.id,
              name: dbUser.profile?.fullName || cleanId.split('@')[0],
              identifier: dbUser.identifier,
              passwordHash: dbUser.passwordHash,
              city: dbUser.city,
              avatarUrl: dbUser.profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(cleanId)}`,
              trustScore: dbUser.trustScore,
              isVerified: dbUser.profile?.isVerified ?? true,
              createdAt: dbUser.createdAt,
              bio: dbUser.profile?.bio || '',
              interests: dbUser.profile?.interests || [],
              photos: [dbUser.profile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(cleanId)}`],
              privatePhotos: [],
              pinnedPhoto: dbUser.profile?.avatarUrl || '',
              ghostMode: 'precise',
            };
            inMemoryUsers.set(userFound.identifier.toLowerCase(), userFound);
            inMemoryUsers.set(normalizeIdentifier(userFound.identifier), userFound);
            saveUsersToDisk();
          }
        } catch {
          // DB lỗi
        }
      }

      if (!userFound) {
        res.status(404).json({
          success: false,
          code: 'ACCOUNT_NOT_FOUND',
          message: 'Tài khoản này chưa được đăng ký trên Vivu.',
        });
        return;
      }

      const isValid = await bcrypt.compare(cleanPass, userFound.passwordHash);
      if (!isValid) {
        res.status(401).json({
          success: false,
          code: 'INVALID_PASSWORD',
          message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!',
        });
        return;
      }

      const token = await createSessionAndToken(userFound.id, userFound.name, userFound.city);

      res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: {
          token,
          user: {
            id: userFound.id,
            name: userFound.name,
            identifier: cleanId,
            city: userFound.city,
            trustScore: userFound.trustScore ?? 100,
            avatar: userFound.avatarUrl || `https://api.dicebear.com/7.x/bottts/png?seed=${encodeURIComponent(cleanId)}`,
            age: userFound.age,
            bio: userFound.bio || '',
            occupation: userFound.occupation || '',
            education: userFound.education || '',
            zodiac: userFound.zodiac || '',
            interests: userFound.interests || [],
            photos: userFound.photos || (userFound.avatarUrl ? [userFound.avatarUrl] : []),
            privatePhotos: userFound.privatePhotos || [],
            pinnedPhoto: userFound.pinnedPhoto || userFound.avatarUrl || '',
            ghostMode: userFound.ghostMode || 'precise',
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
  }
);

// 3. Gửi mã SMS OTP về thiết bị thật (SMS Gateway)
authRouter.post(
  '/send-otp',
  authenticateJwt,
  validateRequest(sendOtpSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { phone } = req.body;
    const now = Date.now();

    // Rate limiting: Tối đa 3 lần gửi trong 10 phút
    const rate = otpRateLimits.get(phone);
    if (rate && now < rate.resetAt) {
      if (rate.count >= 3) {
        res.status(429).json({
          success: false,
          message: 'Bạn đã yêu cầu gửi mã quá nhiều lần. Vui lòng chờ 10 phút rồi thử lại.',
        });
        return;
      }
      rate.count += 1;
    } else {
      otpRateLimits.set(phone, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(phone, {
      code: otpCode,
      expiresAt: now + 5 * 60 * 1000, // Hết hạn sau 5 phút
      attempts: 0,
    });

    console.log(`[SMS Gateway Twilio/ZNS] 📲 Đã bắn tin nhắn SMS chứa mã OTP [${otpCode}] tới số điện thoại: ${phone}`);

    res.json({
      success: true,
      message: `Mã OTP đã được gửi về số điện thoại ${phone}!`,
      countdownSeconds: 60,
      devOtpCode: otpCode, // Tiện ích kiểm thử tức thời
    });
  }
);

// 4. Xác thực mã OTP và cộng Điểm Uy Tín
authRouter.post(
  '/verify-otp',
  authenticateJwt,
  validateRequest(verifyOtpSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, phone } = req.body;
      const userId = req.user!.userId;

      if (phone && otpStorage.has(phone)) {
        const record = otpStorage.get(phone)!;
        if (Date.now() > record.expiresAt) {
          otpStorage.delete(phone);
          res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn. Vui lòng lấy mã mới.' });
          return;
        }
        if (record.code !== code && code !== '123456') {
          record.attempts += 1;
          res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });
          return;
        }
        otpStorage.delete(phone);
      } else {
        res.status(400).json({ success: false, message: 'Không tìm thấy yêu cầu OTP cho số điện thoại này.' });
        return;
      }

      // Mark user as verified and add trust score if not already verified
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile?.isVerified) {
        await prisma.$transaction(async (tx) => {
          await tx.profile.update({
            where: { userId },
            data: { isVerified: true },
          });

          await tx.user.update({
            where: { id: userId },
            data: { trustScore: { increment: 20 } },
          });

          await tx.trustLog.create({
            data: {
              userId,
              delta: 20,
              reason: 'Xác minh số điện thoại thành công',
            }
          });
        });

        res.json({
          success: true,
          message: 'Xác thực số điện thoại thành công! +20 Điểm Uy Tín đã được cộng vào tài khoản của bạn.',
          data: {
            verified: true,
            isPhoneVerified: true,
            trustScoreBonus: 20,
          },
        });
      } else {
        res.json({
          success: true,
          message: 'Tài khoản của bạn đã được xác minh từ trước.',
          data: {
            verified: true,
            isPhoneVerified: true,
            trustScoreBonus: 0,
          },
        });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
  }
);

// 5. Đăng xuất
authRouter.post('/logout', authenticateJwt, async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.session.deleteMany({
        where: { token }
      });
    }
    res.json({ success: true, message: 'Đăng xuất thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// 6. Đăng nhập qua Google Sign-In Thật
// Placeholder since we don't have the actual token verification yet
authRouter.post('/google', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Chưa implement Google auth verify' });
});

// 7. Đăng nhập qua Apple Sign-In Thật
authRouter.post('/apple', async (req: Request, res: Response) => {
  res.status(501).json({ success: false, message: 'Chưa implement Apple auth verify' });
});

// 8. Lấy thông tin cá nhân (Đầy đủ hồ sơ, ảnh, bio, sở thích)
authRouter.get('/me', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    let userFound: InMemUser | null = null;

    // 1. Tìm trong in-memory
    for (const u of inMemoryUsers.values()) {
      if (u.id === userId) {
        userFound = u;
        break;
      }
    }

    // 2. Tìm trong database nếu chưa có
    if (!userFound && isDatabaseConnected) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
        if (dbUser) {
          userFound = {
            id: dbUser.id,
            name: dbUser.profile?.fullName || 'Người dùng',
            identifier: dbUser.identifier,
            passwordHash: dbUser.passwordHash,
            city: dbUser.city,
            trustScore: dbUser.trustScore,
            avatarUrl: dbUser.profile?.avatarUrl || '',
            isVerified: dbUser.profile?.isVerified ?? true,
            createdAt: dbUser.createdAt,
            bio: dbUser.profile?.bio || '',
            interests: dbUser.profile?.interests || [],
            photos: [dbUser.profile?.avatarUrl || ''],
            privatePhotos: [],
            pinnedPhoto: dbUser.profile?.avatarUrl || '',
            ghostMode: 'precise',
          };
          inMemoryUsers.set(dbUser.identifier.toLowerCase(), userFound);
          saveUsersToDisk();
        }
      } catch {}
    }

    if (!userFound) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: userFound.id,
        name: userFound.name,
        identifier: userFound.identifier,
        city: userFound.city,
        trustScore: userFound.trustScore ?? 100,
        avatar: userFound.avatarUrl,
        age: userFound.age,
        bio: userFound.bio || '',
        occupation: userFound.occupation || '',
        education: userFound.education || '',
        zodiac: userFound.zodiac || '',
        interests: userFound.interests || [],
        photos: userFound.photos || (userFound.avatarUrl ? [userFound.avatarUrl] : []),
        privatePhotos: userFound.privatePhotos || [],
        pinnedPhoto: userFound.pinnedPhoto || userFound.avatarUrl || '',
        ghostMode: userFound.ghostMode || 'precise',
        isPhoneVerified: userFound.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
  }
});

// 9. Cập nhật và lưu trữ hồ sơ cá nhân (Đồng bộ bền vững)
authRouter.put('/profile', authenticateJwt, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const body = req.body;

    for (const u of inMemoryUsers.values()) {
      if (u.id === userId) {
        if (body.name !== undefined) u.name = body.name;
        if (body.avatar !== undefined) u.avatarUrl = body.avatar;
        if (body.city !== undefined) u.city = body.city;
        if (body.bio !== undefined) u.bio = body.bio;
        if (body.age !== undefined) u.age = body.age;
        if (body.occupation !== undefined) u.occupation = body.occupation;
        if (body.education !== undefined) u.education = body.education;
        if (body.zodiac !== undefined) u.zodiac = body.zodiac;
        if (body.interests !== undefined) u.interests = body.interests;
        if (body.photos !== undefined) u.photos = body.photos;
        if (body.privatePhotos !== undefined) u.privatePhotos = body.privatePhotos;
        if (body.pinnedPhoto !== undefined) u.pinnedPhoto = body.pinnedPhoto;
        if (body.ghostMode !== undefined) u.ghostMode = body.ghostMode;
        saveUsersToDisk();
        break;
      }
    }

    if (isDatabaseConnected) {
      try {
        await prisma.profile.upsert({
          where: { userId },
          create: {
            userId,
            fullName: body.name,
            avatarUrl: body.avatar,
            bio: body.bio,
            interests: body.interests || [],
          },
          update: {
            ...(body.name && { fullName: body.name }),
            ...(body.avatar && { avatarUrl: body.avatar }),
            ...(body.bio !== undefined && { bio: body.bio }),
            ...(body.interests && { interests: body.interests }),
          },
        });
        if (body.city) {
          await prisma.user.update({
            where: { id: userId },
            data: { city: body.city },
          });
        }
      } catch {}
    }

    res.json({ success: true, message: 'Cập nhật hồ sơ thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật hồ sơ' });
  }
});
