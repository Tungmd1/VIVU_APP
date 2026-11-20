import test, { describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { callSignalingService, CALL_TIMEOUT_MS } from '../src/services/callSignalingService.js';

describe('VIVU WebRTC Call Signaling Suite', () => {
  let mockSockets = {};
  let emittedEvents = [];

  const createMockSocket = (userId) => {
    return {
      userId,
      emit(event, data) {
        emittedEvents.push({ target: userId, event, data });
      }
    };
  };

  const emitToUser = (targetUserId, event, data) => {
    emittedEvents.push({ target: targetUserId, event, data });
  };

  const isUserOnline = (userId) => {
    return Boolean(mockSockets[userId]);
  };

  beforeEach(() => {
    mockSockets = {
      'user-caller': createMockSocket('user-caller'),
      'user-callee': createMockSocket('user-callee')
    };
    emittedEvents = [];
  });

  afterEach(() => {
    callSignalingService.handleUserCallDisconnect('user-caller', { emitToUser });
    callSignalingService.handleUserCallDisconnect('user-callee', { emitToUser });
  });

  test('1. Báo lỗi khi người gọi tự gọi cho chính mình', () => {
    const socket = mockSockets['user-caller'];
    callSignalingService.handleCallInitiate(socket, 'user-caller', {
      targetUserId: 'user-caller',
      callType: 'video'
    }, { emitToUser, isUserOnline });

    const rejectEvent = emittedEvents.find(e => e.event === 'call:rejected');
    assert.ok(rejectEvent, 'Phải có sự kiện call:rejected');
    assert.strictEqual(rejectEvent.data.reason, 'self_call');
  });

  test('2. Báo bận/offline khi đối phương không trực tuyến', () => {
    const socket = mockSockets['user-caller'];
    callSignalingService.handleCallInitiate(socket, 'user-caller', {
      targetUserId: 'user-offline',
      callType: 'voice'
    }, { emitToUser, isUserOnline });

    const rejectEvent = emittedEvents.find(e => e.event === 'call:rejected');
    assert.ok(rejectEvent);
    assert.strictEqual(rejectEvent.data.reason, 'offline');
  });

  test('3. Bắt đầu cuộc gọi video thành công: callee nhận call:incoming và caller nhận call:ringing', () => {
    const socket = mockSockets['user-caller'];
    callSignalingService.handleCallInitiate(socket, 'user-caller', {
      targetUserId: 'user-callee',
      callType: 'video',
      callerName: 'Tùng Đức',
      callerAvatar: 'https://example.com/avatar.jpg'
    }, { emitToUser, isUserOnline });

    const incoming = emittedEvents.find(e => e.target === 'user-callee' && e.event === 'call:incoming');
    const ringing = emittedEvents.find(e => e.target === 'user-caller' && e.event === 'call:ringing');

    assert.ok(incoming, 'Callee phải nhận được call:incoming');
    assert.strictEqual(incoming.data.callerId, 'user-caller');
    assert.strictEqual(incoming.data.callType, 'video');
    assert.strictEqual(incoming.data.callerName, 'Tùng Đức');

    assert.ok(ringing, 'Caller phải nhận được call:ringing');
    assert.strictEqual(ringing.data.status, 'ringing');
  });

  test('4. Báo bận khi có người thứ 3 gọi tới người đang trong cuộc gọi', () => {
    // A gọi B
    callSignalingService.handleCallInitiate(mockSockets['user-caller'], 'user-caller', {
      targetUserId: 'user-callee'
    }, { emitToUser, isUserOnline });

    // C gọi B
    const socketC = createMockSocket('user-c');
    mockSockets['user-c'] = socketC;
    callSignalingService.handleCallInitiate(socketC, 'user-c', {
      targetUserId: 'user-callee'
    }, { emitToUser, isUserOnline });

    const busyEvent = emittedEvents.find(e => e.target === 'user-c' && e.event === 'call:rejected');
    assert.ok(busyEvent, 'Người thứ 3 phải nhận được thông báo bận');
    assert.strictEqual(busyEvent.data.reason, 'busy');
  });

  test('5. Chấp nhận cuộc gọi: call:accepted gửi cho cả 2 bên', () => {
    callSignalingService.handleCallInitiate(mockSockets['user-caller'], 'user-caller', {
      targetUserId: 'user-callee'
    }, { emitToUser, isUserOnline });

    emittedEvents = [];
    callSignalingService.handleCallAccept(mockSockets['user-callee'], 'user-callee', {}, { emitToUser });

    const acceptedForCaller = emittedEvents.find(e => e.target === 'user-caller' && e.event === 'call:accepted');
    const acceptedForCallee = emittedEvents.find(e => e.target === 'user-callee' && e.event === 'call:accepted');

    assert.ok(acceptedForCaller, 'Caller phải nhận call:accepted');
    assert.ok(acceptedForCallee, 'Callee phải nhận call:accepted');
  });

  test('6. Trao đổi tín hiệu WebRTC SDP/ICE: chuyển tiếp chính xác', () => {
    callSignalingService.handleCallInitiate(mockSockets['user-caller'], 'user-caller', {
      targetUserId: 'user-callee'
    }, { emitToUser, isUserOnline });

    emittedEvents = [];
    const testOffer = { type: 'offer', sdp: 'v=0...' };
    callSignalingService.handleCallSignal(mockSockets['user-caller'], 'user-caller', {
      targetUserId: 'user-callee',
      signal: testOffer
    }, { emitToUser });

    const signalEvent = emittedEvents.find(e => e.target === 'user-callee' && e.event === 'call:signal');
    assert.ok(signalEvent, 'Callee phải nhận được call:signal');
    assert.strictEqual(signalEvent.data.fromUserId, 'user-caller');
    assert.deepStrictEqual(signalEvent.data.signal, testOffer);
  });

  test('7. Kết thúc cuộc gọi: thông báo call:ended và giải phóng phiên', () => {
    callSignalingService.handleCallInitiate(mockSockets['user-caller'], 'user-caller', {
      targetUserId: 'user-callee'
    }, { emitToUser, isUserOnline });

    emittedEvents = [];
    callSignalingService.handleCallEnd(mockSockets['user-caller'], 'user-caller', { reason: 'hangup' }, { emitToUser });

    const endedForCallee = emittedEvents.find(e => e.target === 'user-callee' && e.event === 'call:ended');
    assert.ok(endedForCallee, 'Callee phải nhận call:ended');
    assert.strictEqual(endedForCallee.data.reason, 'hangup');

    assert.strictEqual(callSignalingService.getActiveCall('user-caller'), null);
    assert.strictEqual(callSignalingService.getActiveCall('user-callee'), null);
  });

  test('8. Cuộc gọi không phản hồi: Tự động timeout 45 giây và gửi call:ended lý do timeout cho cả 2 bên', () => {
    assert.strictEqual(CALL_TIMEOUT_MS, 45000, 'CALL_TIMEOUT_MS phải đúng 45000ms (45 giây)');

    callSignalingService.handleCallInitiate(mockSockets['user-caller'], 'user-caller', {
      targetUserId: 'user-callee',
      callType: 'voice'
    }, { emitToUser, isUserOnline });

    const session = callSignalingService.getActiveCall('user-caller');
    assert.ok(session, 'Phiên gọi phải được tạo');
    assert.strictEqual(session.status, 'ringing');
    assert.ok(session.timeoutId, 'Phiên gọi phải có timeoutId được thiết lập');

    emittedEvents = [];
    const triggered = callSignalingService._triggerTimeout('user-caller', { emitToUser });
    assert.strictEqual(triggered, true);

    const endedCaller = emittedEvents.find(e => e.target === 'user-caller' && e.event === 'call:ended');
    const endedCallee = emittedEvents.find(e => e.target === 'user-callee' && e.event === 'call:ended');

    assert.ok(endedCaller, 'Caller phải nhận call:ended do timeout');
    assert.strictEqual(endedCaller.data.reason, 'timeout');
    assert.ok(endedCallee, 'Callee phải nhận call:ended do timeout');
    assert.strictEqual(endedCallee.data.reason, 'timeout');

    // Phiên gọi phải được giải phóng hoàn toàn
    assert.strictEqual(callSignalingService.getActiveCall('user-caller'), null);
    assert.strictEqual(callSignalingService.getActiveCall('user-callee'), null);
  });
});
