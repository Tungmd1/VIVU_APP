// Script kiểm thử tự động toàn diện Vòng đời Kết bạn (Full-Cycle Friendship E2E)
// Bao gồm: Tìm kiếm mã VU-XXXX, Tự kết bạn (chặn), Gửi, Huỷ, Từ chối, Chặn gửi trùng, Chấp nhận, Đồng bộ 2 chiều và Map 3D

import http from 'http';
import fs from 'fs';

function requestJson(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port || 5000,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ THẤT BẠI: ${message}`);
    throw new Error(message);
  } else {
    console.log(`   ✅ ${message}`);
  }
}

async function runFriendshipE2ETest() {
  console.log('================================================================');
  console.log('🤝 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG CHỨC NĂNG KẾT BẠN TOÀN DIỆN (E2E)');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Kiểm tra tài khoản test1 và test2
  console.log('--- PHẦN 1: KHỞI TẠO & KIỂM TRA TÀI KHOẢN ---');
  const profilesRes = await requestJson(`${BASE_URL}/gps/profiles`);
  assert(profilesRes.status === 200, 'Backend API hoạt động bình thường');

  const users = profilesRes.body?.data || [];
  const u1 = users.find(u => (u.full_name || u.name).toLowerCase().includes('test1'));
  const u2 = users.find(u => (u.full_name || u.name).toLowerCase().includes('test2'));

  assert(Boolean(u1 && u2), `Đã tìm thấy cả 2 tài khoản: test1 (${u1?.id}) và test2 (${u2?.id})`);
  console.log(`   * Tài khoản 1: ${u1.name} | Mã: ${u1.user_code}`);
  console.log(`   * Tài khoản 2: ${u2.name} | Mã: ${u2.user_code}`);

  // Đưa về trạng thái ban đầu để kiểm thử sạch sẽ
  await requestJson(`${BASE_URL}/friends/unfriend`, { method: 'POST' }, { userIdA: u1.id, userIdB: u2.id });
  
  // 2. Kiểm thử tìm kiếm
  console.log('\n--- PHẦN 2: KIỂM THỬ TÌM KIẾM NGƯỜI DÙNG ---');
  // 2.1 Tìm kiếm theo mã số người dùng VU-XXXX
  const searchByCode = await requestJson(`${BASE_URL}/friends/search?q=${encodeURIComponent(u2.user_code)}&currentUserId=${u1.id}`);
  assert(searchByCode.status === 200 && searchByCode.body?.data?.length > 0, `Tìm kiếm theo mã ${u2.user_code} thành công`);
  assert(searchByCode.body.data[0].id === u2.id, 'Người được tìm thấy chính xác là test2');
  assert(searchByCode.body.data[0].relationshipStatus === 'none', 'Trạng thái ban đầu giữa 2 bên là "none"');

  // 2.2 Tìm kiếm theo tên
  const searchByName = await requestJson(`${BASE_URL}/friends/search?q=test2&currentUserId=${u1.id}`);
  assert(searchByName.status === 200 && searchByName.body?.data?.some(u => u.id === u2.id), 'Tìm kiếm theo tên "test2" thành công');

  // 2.3 Chặn tự tìm kiếm chính mình
  const searchSelf = await requestJson(`${BASE_URL}/friends/search?q=${encodeURIComponent(u1.name)}&currentUserId=${u1.id}`);
  assert(!searchSelf.body?.data?.some(u => u.id === u1.id), 'Không hiển thị chính mình trong kết quả tìm kiếm');

  // 3. Kiểm thử Edge Cases khi gửi lời mời
  console.log('\n--- PHẦN 3: KIỂM THỬ CÁC TRƯỜNG HỢP BIÊN (EDGE CASES) ---');
  // 3.1 Không thể tự kết bạn với chính mình
  const selfReq = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id, receiverId: u1.id });
  assert(selfReq.status === 400, 'Chặn thành công hành vi tự gửi lời mời kết bạn cho chính mình');

  // 3.2 Gửi thiếu trường senderId/receiverId
  const emptyReq = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id });
  assert(emptyReq.status === 400, 'Bắt buộc phải có cả senderId và receiverId');

  // 4. Kiểm thử vòng đời: Gửi -> Thu hồi (Cancel Request)
  console.log('\n--- PHẦN 4: VÒNG ĐỜI THU HỒI LỜI MỜI (CANCEL REQUEST) ---');
  const send1 = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id, receiverId: u2.id });
  assert(send1.status === 201 && send1.body?.data?.id, 'test1 gửi lời mời kết bạn thành công cho test2');
  const reqId1 = send1.body.data.id;

  // Kiểm tra trạng thái pending
  const statusCheck1 = await requestJson(`${BASE_URL}/friends/status?userIdA=${u1.id}&userIdB=${u2.id}`);
  assert(statusCheck1.body?.data?.status === 'pending_sent', 'test1 nhìn thấy trạng thái "pending_sent"');

  const statusCheck2 = await requestJson(`${BASE_URL}/friends/status?userIdA=${u2.id}&userIdB=${u1.id}`);
  assert(statusCheck2.body?.data?.status === 'pending_received', 'test2 nhìn thấy trạng thái "pending_received"');

  // test1 thu hồi lời mời
  const cancelRes = await requestJson(`${BASE_URL}/friends/cancel`, { method: 'POST' }, { requestId: reqId1, currentUserId: u1.id });
  assert(cancelRes.status === 200 && cancelRes.body?.success, 'test1 thu hồi lời mời kết bạn thành công');

  const statusAfterCancel = await requestJson(`${BASE_URL}/friends/status?userIdA=${u1.id}&userIdB=${u2.id}`);
  assert(statusAfterCancel.body?.data?.status === 'none', 'Trạng thái chuyển về "none" sau khi thu hồi');

  // 5. Kiểm thử vòng đời: Gửi -> Từ chối (Reject Request)
  console.log('\n--- PHẦN 5: VÒNG ĐỜI TỪ CHỐI LỜI MỜI (REJECT REQUEST) ---');
  const send2 = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id, receiverId: u2.id });
  const reqId2 = send2.body.data.id;
  assert(send2.status === 201, 'test1 gửi lời mời lần 2 cho test2');

  // test2 từ chối lời mời
  const rejectRes = await requestJson(`${BASE_URL}/friends/reject`, { method: 'POST' }, { requestId: reqId2, currentUserId: u2.id });
  assert(rejectRes.status === 200 && rejectRes.body?.success, 'test2 từ chối lời mời kết bạn thành công');

  const statusAfterReject = await requestJson(`${BASE_URL}/friends/status?userIdA=${u1.id}&userIdB=${u2.id}`);
  assert(statusAfterReject.body?.data?.status === 'none', 'Trạng thái chuyển về "none" sau khi từ chối');

  // 6. Kiểm thử chặn gửi trùng lời mời (Duplicate Request Prevention)
  console.log('\n--- PHẦN 6: CHỐNG GỬI TRÙNG LỜI MỜI (ANTI-DUPLICATE) ---');
  const send3 = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id, receiverId: u2.id });
  const reqId3 = send3.body.data.id;
  assert(send3.status === 201, 'test1 gửi lời mời lần 3');

  const sendDup = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id, receiverId: u2.id });
  assert(sendDup.status === 400 && sendDup.body?.message?.includes('Lời mời'), 'Chặn thành công việc gửi lặp lại lời mời đang chờ');

  // 7. Vòng đời thành công: Nhận thông báo & Chấp nhận kết bạn (Happy Path)
  console.log('\n--- PHẦN 7: CHẤP NHẬN KẾT BẠN (HAPPY PATH ACCEPTANCE) ---');
  // 7.1 test2 kéo danh sách lời mời đã nhận
  const reqsList = await requestJson(`${BASE_URL}/friends/requests/${u2.id}`);
  assert(reqsList.status === 200 && Array.isArray(reqsList.body?.data?.received), 'test2 kéo danh sách lời mời thành công');
  const incomingReq = reqsList.body.data.received.find(r => r.id === reqId3);
  assert(Boolean(incomingReq), 'test2 nhận được chính xác lời mời từ test1');
  assert(incomingReq.senderUserCode === u1.user_code, 'Lời mời có đính kèm chuẩn mã người gửi ' + u1.user_code);

  // 7.2 test2 bấm Chấp nhận
  const acceptRes = await requestJson(`${BASE_URL}/friends/accept`, { method: 'POST' }, { requestId: reqId3, currentUserId: u2.id });
  assert(acceptRes.status === 200 && acceptRes.body?.data?.friendshipId, 'test2 chấp nhận lời mời thành công');
  console.log(`   * Mã định danh quan hệ bạn bè tạo lập: ${acceptRes.body.data.friendshipId}`);

  // 7.3 Kiểm tra trạng thái quan hệ 2 chiều
  const statusAfterAccept1 = await requestJson(`${BASE_URL}/friends/status?userIdA=${u1.id}&userIdB=${u2.id}`);
  const statusAfterAccept2 = await requestJson(`${BASE_URL}/friends/status?userIdA=${u2.id}&userIdB=${u1.id}`);
  assert(statusAfterAccept1.body?.data?.status === 'friends', 'Phía test1 ghi nhận quan hệ: "friends"');
  assert(statusAfterAccept2.body?.data?.status === 'friends', 'Phía test2 ghi nhận quan hệ: "friends"');

  // 7.4 Không thể gửi lại lời mời khi đã là bạn bè
  const sendAfterFriend = await requestJson(`${BASE_URL}/friends/request`, { method: 'POST' }, { senderId: u1.id, receiverId: u2.id });
  assert(sendAfterFriend.status === 400 && sendAfterFriend.body?.message?.includes('đã là bạn bè'), 'Chặn gửi lời mời khi hai bên đã là bạn bè');

  // 8. Kiểm tra đồng bộ Danh sách Bạn bè & Toạ độ GPS (Tab "Bạn Bè")
  console.log('\n--- PHẦN 8: ĐỒNG BỘ DANH SÁCH BẠN BÈ & KHÔNG GIAN MAPBOX ---');
  // Cả 2 máy gửi nhịp heartbeat thời gian thực
  await requestJson(`${BASE_URL}/gps/update`, { method: 'POST' }, {
    userId: u1.id,
    lat: 16.03878,
    lng: 108.21923,
    name: u1.name,
    avatar: u1.avatar_url,
    userCode: u1.user_code,
    customStatus: 'Đang vivu dạo phố'
  });
  await requestJson(`${BASE_URL}/gps/update`, { method: 'POST' }, {
    userId: u2.id,
    lat: 16.03869,
    lng: 108.21927,
    name: u2.name,
    avatar: u2.avatar_url,
    userCode: u2.user_code,
    customStatus: 'Đang vivu dạo phố'
  });

  const fList1 = await requestJson(`${BASE_URL}/friends/list/${u1.id}`);
  assert(fList1.status === 200 && Array.isArray(fList1.body?.data), 'test1 kéo danh sách bạn bè thành công');
  const friendOf1 = fList1.body.data.find(f => f.id === u2.id);
  assert(Boolean(friendOf1), 'test2 xuất hiện trong danh sách bạn bè của test1');
  assert(friendOf1.isOnline === true, 'test2 hiển thị trạng thái trực tuyến (isOnline: true)');
  assert(friendOf1.lat != null && friendOf1.lng != null, `test2 có toạ độ định vị trên bản đồ: (${friendOf1.lat}, ${friendOf1.lng})`);

  const fList2 = await requestJson(`${BASE_URL}/friends/list/${u2.id}`);
  const friendOf2 = fList2.body?.data?.find(f => f.id === u1.id);
  assert(Boolean(friendOf2), 'test1 xuất hiện trong danh sách bạn bè của test2');
  assert(friendOf2.isOnline === true, 'test1 hiển thị trạng thái trực tuyến (isOnline: true)');
  assert(friendOf2.lat != null && friendOf2.lng != null, `test1 có toạ độ định vị trên bản đồ: (${friendOf2.lat}, ${friendOf2.lng})`);

  // 9. Kiểm tra lưu trữ đĩa cứng bền vững
  console.log('\n--- PHẦN 9: KIỂM TRA LƯU TRỮ ĐĨA CỨNG (DATABASE PERSISTENCE) ---');
  const dbData = JSON.parse(fs.readFileSync('C:\\Đức Tùng\\DACN\\vivudemo1\\backend\\data\\vivu_database.json', 'utf8'));
  const savedFriendship = dbData.friendships?.find(f => 
    (f.user_a_id === u1.id && f.user_b_id === u2.id) || (f.user_a_id === u2.id && f.user_b_id === u1.id)
  );
  assert(Boolean(savedFriendship && savedFriendship.status === 'active'), 'Bản ghi quan hệ bạn bè đã được ghi nguyên tử vào vivu_database.json');

  console.log('\n================================================================');
  console.log('🎉 TẤT CẢ 9 PHẦN KIỂM THỬ KẾT BẠN ĐÃ ĐẠT 100% THÀNH CÔNG!');
  console.log(`🤝 TRẠNG THÁI CUỐI: test1 (${u1.name}) VÀ test2 (${u2.name}) ĐÃ LÀ BẠN BÈ.`);
  console.log('================================================================\n');
}

runFriendshipE2ETest().catch(err => {
  console.error('\n❌ KẾT QUẢ KIỂM THỬ THẤT BẠI:', err.message);
  process.exit(1);
});
