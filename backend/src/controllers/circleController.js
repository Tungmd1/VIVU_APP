import { dbService } from '../services/dbService.js';
import { notificationService } from '../services/notificationService.js';
import { emitToUser } from '../services/socketService.js';

export const circleController = {
  /**
   * Lấy danh sách nhóm (có lọc theo người dùng nếu có userId)
   */
  async getAllCircles(req, res, next) {
    try {
      const userId = req.query.userId || req.headers['x-user-id'] || null;
      const circles = await dbService.getCircles(userId);
      res.json({ success: true, data: circles });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Lấy chi tiết 1 nhóm kèm thông tin hồ sơ của các thành viên
   */
  async getCircleById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.query.userId || req.headers['x-user-id'] || null;
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID nhóm là bắt buộc' });
      }

      const circle = await dbService.getCircleById(id);
      if (!circle) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhóm' });
      }

      // Đính kèm hồ sơ các thành viên để giao diện hiển thị tên & avatar
      const profiles = await dbService.getProfiles();
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      const enrichedMembers = (circle.members || []).map(m => {
        const prof = profilesMap.get(m.user_id) || {};
        return {
          ...m,
          name: prof.full_name || prof.name || 'Người dùng VIVU',
          avatar: prof.avatar_url || prof.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(m.user_id)}`,
          userCode: prof.user_code || prof.userCode || '',
          online: prof.is_online || false
        };
      });

      const isOwner = circle.owner_id === userId;
      const myMembership = (circle.members || []).find(m => m.user_id === userId);
      const userRole = isOwner ? 'owner' : (myMembership?.role || 'none');
      const userStatus = isOwner ? 'accepted' : (myMembership?.status || 'none');

      res.json({
        success: true,
        data: {
          ...circle,
          members: enrichedMembers,
          isOwner,
          userRole,
          userStatus
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Tạo nhóm mới:
   * - Người tạo là Trưởng nhóm (owner) và tự động accepted.
   * - Bạn bè được mời ở trạng thái pending và nhận thông báo mời nhóm qua Socket.IO.
   * - Tạo phòng chat nhóm để hiển thị ngay trong danh sách tin nhắn.
   */
  async createCircle(req, res, next) {
    try {
      const { name, description, image, member_ids, memberIds, owner_id, ownerId, creatorName, creatorAvatar } = req.body;
      const effectiveOwnerId = ownerId || owner_id || req.headers['x-user-id'];
      
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Tên nhóm là bắt buộc' });
      }
      if (!effectiveOwnerId) {
        return res.status(400).json({ success: false, message: 'ID người tạo nhóm là bắt buộc' });
      }

      const invitedList = Array.isArray(memberIds) ? memberIds : (Array.isArray(member_ids) ? member_ids : []);

      const newCircle = await dbService.createCircle({
        name: name.trim(),
        description: description || '',
        image: image || null,
        privacy: 'private', // Mặc định private sau khi loại bỏ công khai/riêng tư khỏi UI
        ownerId: effectiveOwnerId,
        memberIds: invitedList // Thêm trực tiếp thành viên vào nhóm
      });

      // 1. Tạo thông báo & phát realtime cho từng thành viên được thêm vào nhóm
      invitedList.forEach(fid => {
        if (fid && fid !== effectiveOwnerId) {
          notificationService.createGroupInviteNotification({
            toUserId: fid,
            fromUserId: effectiveOwnerId,
            circleId: newCircle.id,
            circleName: newCircle.name,
            circleAvatar: newCircle.image,
            inviterName: creatorName || 'Bạn bè'
          });

          // Phát socket event để client của bạn bè cập nhật danh sách nhóm & tin nhắn
          emitToUser(fid, 'circle:member_joined', {
            circle: newCircle,
            joinedUserId: fid,
            addedBy: effectiveOwnerId
          });
        }
      });

      // 2. Thêm tin nhắn khởi tạo phòng chat nhóm
      try {
        await dbService.saveMessage({
          id: `msg-sys-${Date.now()}`,
          conversation_id: newCircle.id,
          sender: effectiveOwnerId,
          sender_name: creatorName || 'Trưởng nhóm',
          text: invitedList.length > 0 
            ? `${creatorName || 'Trưởng nhóm'} đã tạo nhóm và thêm ${invitedList.length} thành viên`
            : `${creatorName || 'Trưởng nhóm'} đã tạo nhóm "${newCircle.name}"`,
          is_system: true,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('[Circle Controller] Error adding welcome message:', e.message);
      }

      res.status(201).json({ success: true, data: newCircle });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Thêm thành viên trực tiếp vào nhóm
   */
  async addMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { memberIds, member_ids, inviterName } = req.body;
      const requesterId = req.headers['x-user-id'] || req.body.requesterId;
      const toAdd = Array.isArray(memberIds) ? memberIds : (Array.isArray(member_ids) ? member_ids : []);

      if (toAdd.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách thành viên cần thêm không được rỗng' });
      }

      const { circle, newlyAdded } = await dbService.addMembersToCircle(id, {
        memberIds: toAdd,
        requesterId
      });

      // Gửi thông báo cho từng người được thêm
      newlyAdded.forEach(fid => {
        notificationService.createGroupInviteNotification({
          toUserId: fid,
          fromUserId: requesterId,
          circleId: circle.id,
          circleName: circle.name,
          circleAvatar: circle.image,
          inviterName: inviterName || 'Một thành viên'
        });

        emitToUser(fid, 'circle:member_joined', {
          circle,
          joinedUserId: fid,
          addedBy: requesterId
        });
      });

      // Tạo tin nhắn hệ thống
      if (newlyAdded.length > 0) {
        try {
          await dbService.saveMessage({
            id: `msg-sys-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            conversation_id: circle.id,
            sender: requesterId,
            sender_name: inviterName || 'Thành viên',
            text: `${inviterName || 'Một thành viên'} đã thêm ${newlyAdded.length} thành viên vào nhóm`,
            is_system: true,
            created_at: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[Circle Controller] System message error:', e.message);
        }
      }

      // Thông báo cập nhật danh sách cho tất cả thành viên trong nhóm
      (circle.member_ids || []).forEach(mid => {
        emitToUser(mid, 'circle:members_updated', { circle });
      });

      res.json({ success: true, data: circle, addedCount: newlyAdded.length });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Cập nhật thông tin nhóm (Tên, ảnh đại diện, mô tả, quyền riêng tư)
   */
  async updateCircle(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, image, privacy } = req.body;
      const requesterId = req.headers['x-user-id'] || req.body.requesterId || req.body.userId;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID nhóm là bắt buộc' });
      }

      const updated = await dbService.updateCircle(id, {
        name,
        description,
        image,
        privacy,
        requesterId
      });

      // Phát realtime cập nhật nhóm tới tất cả thành viên
      (updated.member_ids || []).forEach(memberId => {
        emitToUser(memberId, 'circle:updated', { circle: updated });
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  /**
   * Mời thêm bạn bè vào nhóm
   */
  async inviteMembers(req, res, next) {
    try {
      const { id } = req.params;
      const { memberIds, member_ids, inviterName } = req.body;
      const requesterId = req.headers['x-user-id'] || req.body.requesterId || req.body.userId;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID nhóm là bắt buộc' });
      }

      const invitedList = Array.isArray(memberIds) ? memberIds : (Array.isArray(member_ids) ? member_ids : []);
      if (invitedList.length === 0) {
        return res.status(400).json({ success: false, message: 'Danh sách thành viên mời không được rỗng' });
      }

      const { circle, newInvited } = await dbService.inviteToCircle(id, {
        memberIds: invitedList,
        requesterId
      });

      // Gửi thông báo lời mời cho từng người mới được mời
      newInvited.forEach(fid => {
        notificationService.createGroupInviteNotification({
          toUserId: fid,
          fromUserId: requesterId,
          circleId: circle.id,
          circleName: circle.name,
          circleAvatar: circle.image,
          inviterName: inviterName || 'Một thành viên'
        });

        emitToUser(fid, 'circle:invite', {
          circle,
          inviterId: requesterId,
          inviterName
        });
      });

      // Thông báo cập nhật danh sách cho các thành viên trong nhóm
      (circle.member_ids || []).forEach(mid => {
        emitToUser(mid, 'circle:members_updated', { circle });
      });

      res.json({ success: true, data: circle, newInvitedCount: newInvited.length });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Phản hồi lời mời tham gia nhóm: Chấp nhận (accept) hoặc Từ chối (decline)
   */
  async respondInvite(req, res, next) {
    try {
      const { id } = req.params;
      const { action, userName } = req.body;
      const userId = req.headers['x-user-id'] || req.body.userId;

      if (!id || !userId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin ID nhóm hoặc User' });
      }
      if (action !== 'accept' && action !== 'decline') {
        return res.status(400).json({ success: false, message: 'Hành động phải là accept hoặc decline' });
      }

      const { circle, status } = await dbService.respondToCircleInvite(id, { userId, action });

      // Giải quyết thông báo
      notificationService.handleGroupInviteResolved({
        userId,
        circleId: id,
        status
      });

      if (action === 'accept') {
        // Ghi tin nhắn hệ thống vào phòng chat
        const joinText = `${userName || 'Thành viên mới'} đã tham gia nhóm`;
        try {
          const sysMsg = await dbService.saveMessage({
            id: `msg-sys-${Date.now()}`,
            conversation_id: circle.id,
            sender: userId,
            sender_name: userName || 'Hệ thống',
            text: joinText,
            is_system: true,
            created_at: new Date().toISOString()
          });

          // Phát tin nhắn realtime cho tất cả thành viên
          (circle.member_ids || []).forEach(mid => {
            emitToUser(mid, 'chat:receive', sysMsg);
            emitToUser(mid, 'circle:member_joined', { circle, newMemberId: userId, userName });
          });
        } catch (e) {
          console.warn('[Circle Controller] Error saving join message:', e.message);
        }
      }

      res.json({ success: true, data: circle, status });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Rời khỏi nhóm
   */
  async leaveCircle(req, res, next) {
    try {
      const { id } = req.params;
      const { newOwnerId, userName } = req.body;
      const userId = req.headers['x-user-id'] || req.body.userId;

      if (!id || !userId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin ID nhóm hoặc User' });
      }

      const result = await dbService.leaveCircle(id, { userId, newOwnerId });

      if (result.deleted) {
        // Nhóm đã bị giải tán vì không còn ai
        emitToUser(userId, 'circle:disbanded', { circleId: id });
        return res.json({ success: true, message: 'Đã rời nhóm và giải tán nhóm thành công', data: result });
      }

      // Thông báo cho các thành viên còn lại
      const circle = await dbService.getCircleById(id);
      if (circle) {
        const leaveText = `${userName || 'Một thành viên'} đã rời khỏi nhóm`;
        try {
          const sysMsg = await dbService.saveMessage({
            id: `msg-sys-${Date.now()}`,
            conversation_id: id,
            sender: userId,
            sender_name: userName || 'Hệ thống',
            text: leaveText,
            is_system: true,
            created_at: new Date().toISOString()
          });

          (circle.member_ids || []).forEach(mid => {
            emitToUser(mid, 'chat:receive', sysMsg);
            emitToUser(mid, 'circle:member_left', { circleId: id, leftUserId: userId, newOwnerId: circle.owner_id });
          });
        } catch (e) {
          console.warn('[Circle Controller] Error saving leave message:', e.message);
        }
      }

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Xóa thành viên khỏi nhóm (Chỉ Trưởng nhóm mới có quyền)
   */
  async kickMember(req, res, next) {
    try {
      const { id } = req.params;
      const { targetUserId, targetUserName } = req.body;
      const requesterId = req.headers['x-user-id'] || req.body.requesterId || req.body.userId;

      if (!id || !targetUserId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin ID nhóm hoặc Thành viên bị xóa' });
      }

      const result = await dbService.kickFromCircle(id, { targetUserId, requesterId });

      // Phát realtime cho người bị xóa
      emitToUser(targetUserId, 'circle:kicked', { circleId: id });

      // Phát tin nhắn hệ thống cho các thành viên còn lại
      const circle = await dbService.getCircleById(id);
      if (circle) {
        const kickText = `${targetUserName || 'Thành viên'} đã bị mời ra khỏi nhóm`;
        try {
          const sysMsg = await dbService.saveMessage({
            id: `msg-sys-${Date.now()}`,
            conversation_id: id,
            sender: requesterId,
            sender_name: 'Trưởng nhóm',
            text: kickText,
            is_system: true,
            created_at: new Date().toISOString()
          });

          (circle.member_ids || []).forEach(mid => {
            emitToUser(mid, 'chat:receive', sysMsg);
            emitToUser(mid, 'circle:member_kicked', { circleId: id, targetUserId });
          });
        } catch (e) {
          console.warn('[Circle Controller] Error saving kick message:', e.message);
        }
      }

      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  },

  /**
   * Giải tán nhóm (Chỉ Trưởng nhóm mới có quyền)
   */
  async deleteCircle(req, res, next) {
    try {
      const { id } = req.params;
      const requesterId = req.headers['x-user-id'] || req.query.userId || req.body?.userId;

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID nhóm là bắt buộc' });
      }

      const circle = await dbService.getCircleById(id);
      if (!circle) {
        return res.json({ success: true, message: 'Nhóm đã được xóa trước đó' });
      }

      const result = await dbService.deleteCircle(id, requesterId);

      // Phát sự kiện giải tán nhóm cho tất cả các thành viên
      (circle.member_ids || []).forEach(mid => {
        emitToUser(mid, 'circle:disbanded', { circleId: id, circleName: circle.name });
      });

      res.json({ success: true, data: result });
    } catch (err) {
      if (err.statusCode === 403) {
        return res.status(403).json({ success: false, message: err.message });
      }
      next(err);
    }
  }
};
