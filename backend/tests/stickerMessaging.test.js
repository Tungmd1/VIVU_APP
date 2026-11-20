import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { dbService } from '../src/services/dbService.js';

describe('VIVU Exclusive Sticker Messaging Verification Suite', () => {
  const convId = 'circle-test-sticker-room';
  const senderId = 'user-sticker-sender';

  test('1. Gửi tin nhắn Sticker không cần nhập văn bản: Lưu thành công với đầy đủ thuộc tính', async () => {
    const stickerPayload = {
      conversation_id: convId,
      sender: senderId,
      sender_name: 'Thỏ Quẩy',
      type: 'sticker',
      is_sticker: true,
      sticker: {
        id: 'rabbit_cheer',
        name: 'Đỉnh Chóp',
        packId: 'hyper_rabbit',
        image: '/stickers/rabbit/rabbit_01.png',
        soundType: 'cheer',
        particleColor: '#FFD600',
        badge: 'Quá đỉnh'
      },
      image: '/stickers/rabbit/rabbit_01.png',
      sound_type: 'cheer',
      text: '[Sticker: Đỉnh Chóp]'
    };

    const msg = await dbService.sendMessage(stickerPayload);

    assert.ok(msg.id, 'Tin nhắn phải có ID');
    assert.equal(msg.type, 'sticker', 'Type phải là sticker');
    assert.equal(msg.is_sticker, true, 'is_sticker phải là true');
    assert.ok(msg.sticker, 'Phải có object sticker');
    assert.equal(msg.sticker.id, 'rabbit_cheer');
    assert.equal(msg.sticker.image, '/stickers/rabbit/rabbit_01.png');
    assert.equal(msg.sound_type, 'cheer');
  });

  test('2. Gửi sticker chỉ với type sticker và rỗng text hoàn toàn: Không bị ném lỗi nội dung rỗng', async () => {
    const emptyTextSticker = {
      conversation_id: convId,
      sender: senderId,
      sender_name: 'Gấu Bông',
      type: 'sticker',
      is_sticker: true,
      sticker: {
        id: 'bear_heart_eyes',
        name: 'Say Đắm',
        image: '/stickers/bear/bear_02.webp'
      },
      text: ''
    };

    const msg = await dbService.sendMessage(emptyTextSticker);
    assert.equal(msg.type, 'sticker');
    assert.equal(msg.is_sticker, true);
    assert.equal(msg.sticker.id, 'bear_heart_eyes');
  });
});
