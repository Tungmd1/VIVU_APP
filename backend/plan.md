# Kế hoạch sửa lỗi và hoàn thiện chức năng VIVU

## Mục tiêu

Rà soát các lỗi hiện có, thống nhất quy tắc giữa bản đồ, giọt nước, bảng tin, hồ sơ và nhắn tin; hoàn thiện các luồng đăng trạng thái, kết bạn, cụng ly và gọi điện. Ưu tiên tính ổn định trên điện thoại, quyền riêng tư vị trí và khả năng khôi phục khi mất mạng hoặc quyền truy cập.

## 1. Gửi ảnh và video trong tin nhắn

- Sửa luồng gửi ảnh/video trong hội thoại cá nhân và nhóm: chọn tệp, xem trước, tải lên, gửi, hiển thị trạng thái tiến trình/lỗi và thử gửi lại.
- Kiểm tra quyền truy cập tệp, định dạng/kích thước được hỗ trợ, kết nối mạng yếu, gửi nhiều tệp và thao tác trên trình duyệt điện thoại.
- Tin chỉ được đánh dấu đã gửi khi máy chủ xác nhận; lỗi tải lên không được làm treo hoặc thoát ứng dụng.

**Hoàn tất khi:** ảnh/video gửi và nhận được ở cả chat cá nhân lẫn nhóm; lỗi có thông báo và có thể thử lại; giao diện không văng trên điện thoại.

## 2. Viết lại chia sẻ vị trí và vị trí trực tiếp

- Thay luồng phụ thuộc Google Maps bằng định vị trình duyệt/thiết bị (Geolocation API) và Mapbox trong web app để hiển thị bản đồ, vị trí và tuyến di chuyển.
- Xin quyền vị trí đúng lúc, giải thích khi người dùng từ chối hoặc thiết bị không hỗ trợ; không gửi vị trí nền khi chưa được cho phép.
- Với vị trí tĩnh, cho phép xác nhận vị trí trước khi gửi.
- Với vị trí trực tiếp, chỉ chia sẻ trong khoảng thời gian người dùng chọn; có nút dừng chia sẻ rõ ràng và trạng thái đang chia sẻ.
- Cập nhật marker theo tọa độ thực nhận được; làm mượt chuyển động giọt nước, đồng thời thể hiện tốc độ, quãng đường và thời gian cập nhật. Hiển thị độ chính xác/thời điểm cập nhật để tránh tạo cảm giác vị trí chính xác hơn dữ liệu GPS.
- Giảm tần suất cập nhật khi đứng yên hoặc pin yếu; xử lý mất tín hiệu, quyền bị thu hồi và định vị không khả dụng.

**Hoàn tất khi:** vị trí tĩnh và trực tiếp hoạt động trong web app mà không cần mở Google Maps; marker theo vị trí cập nhật; dừng chia sẻ chấm dứt việc gửi tọa độ.

## 3. Sửa lưu trữ tin nổi bật trong hồ sơ

- Sửa thao tác chọn tin trong kho lưu trữ và ghim vào mục Tin nổi bật trên hồ sơ.
- Đồng bộ trạng thái ghim/bỏ ghim sau khi tải lại, xử lý tin đã xóa/hết hạn và phản hồi lỗi lưu dữ liệu.

**Hoàn tất khi:** chọn, ghim, bỏ ghim và xem lại tin nổi bật hoạt động nhất quán trên hồ sơ.

## 4. Cụng ly: tốc độ, quyền riêng tư và hiển thị

- Rà soát vòng đời phát hiện bạn bè ở gần và tối ưu cập nhật vị trí để giảm độ trễ phát hiện; mục tiêu phản hồi trong vài giây khi có dữ liệu vị trí mới và đủ điều kiện, thay vì chờ hơn một phút.
- Chỉ bạn bè đã kết nối, có bật chia sẻ vị trí phù hợp và đang ở gần nhau mới đủ điều kiện nhận đề xuất cụng ly. Người lạ không được đề xuất hoặc kích hoạt cụng ly.
- Hiển thị đề xuất sau khi hai người thỏa điều kiện liên tục ít nhất 3 giây; tránh đề xuất lặp liên tục và cho phép bỏ qua.
- Sau khi xác nhận, ghi nhận sự kiện “đang VIVU cùng nhau” vào bảng tin với nội dung và đối tượng hiển thị rõ ràng. Giọt nước chỉ dùng trạng thái/điểm đánh dấu ngắn gọn, không thay cho bài đăng bảng tin.
- Trạng thái nổi bật trên giọt nước tự ẩn sau 5 phút; sự kiện bảng tin tuân theo thời hạn hiển thị của bảng tin và cài đặt quyền riêng tư.
- Tìm nguyên nhân ứng dụng bị thoát sau cụng ly và các thao tác khác trên điện thoại; rà soát lỗi JavaScript, promise chưa xử lý, vòng đời giao diện, bộ nhớ, quyền vị trí và điều hướng. Sửa nguyên nhân gốc, bổ sung xử lý lỗi để thao tác lỗi không làm tải lại/đóng trang.

**Hoàn tất khi:** chỉ bạn bè đủ điều kiện thấy đề xuất sau 3 giây; sự kiện hiển thị đúng nơi; dấu trên giọt nước tự ẩn sau 5 phút; thao tác không làm thoát web app.

## 5. Thống nhất đăng trạng thái, giọt nước và Story

### Quy tắc chung

- Tạo một luồng đăng trạng thái thống nhất dùng chung cho tâm trạng, ảnh/video, ảnh chibi, gắn chibi và Story. Các dạng nội dung là lựa chọn trong cùng luồng, tránh tạo nhiều cơ chế đăng/xóa/hết hạn xung đột.
- Mỗi bài đăng có nội dung, tệp đính kèm, đối tượng xem, thời điểm đăng và thời điểm hết hạn. Một lựa chọn thời hạn duy nhất được áp dụng nhất quán cho các dạng nội dung được hỗ trợ.
- Giọt nước là cách thể hiện trạng thái trên bản đồ; bảng tin là nơi xem bài đăng; hồ sơ/kho lưu trữ là nơi quản lý nội dung lưu được. Xóa, hết hạn, lưu trữ và ghim phải có quy tắc nhất quán giữa các bề mặt.
- Tự ẩn nội dung khi đến hạn ở bản đồ và các danh sách liên quan, không chỉ ẩn trên một màn hình. Bài hết hạn có thể vào kho lưu trữ nếu loại nội dung và cài đặt cho phép.
- Trạng thái tạo bài (đang tải, thành công, thất bại) phải rõ ràng; không tạo bài trùng khi người dùng bấm nhiều lần hoặc gửi lại.

### Điều chỉnh giao diện

- Gộp chức năng đăng tâm trạng hiện ở nút dấu cộng vào luồng đăng trạng thái chung. Giữ chức năng thay đổi giọt nước ở mục Giọt nước.
- Hoàn thiện các công cụ ở nút dấu cộng: cải thiện bộ lọc, độ nét camera, bố cục để điều khiển không chồng lấn và hỗ trợ màn hình điện thoại.
- Thời hạn đăng và lựa chọn thời gian hiển thị phải dùng chung một thiết lập, được áp dụng cho tâm trạng, ảnh chibi, gắn chibi và Story.

**Hoàn tất khi:** tạo, xem, hết hạn, lưu trữ và xóa các dạng trạng thái theo cùng quy tắc; nội dung tự ẩn đúng thời điểm trên bản đồ và các danh sách; giao diện dấu cộng dùng được trên điện thoại.

## 6. Gọi thoại và gọi video

- Xây dựng luồng gọi thoại và video: bắt đầu/nhận/từ chối/kết thúc cuộc gọi, trạng thái kết nối, xin quyền microphone/camera, tắt/bật mic và camera, chuyển camera nếu thiết bị hỗ trợ.
- Xử lý cuộc gọi bị từ chối, mất mạng, thiết bị không có camera/microphone, quyền bị từ chối và rời trang; hiển thị trạng thái dễ hiểu.
- Thêm tùy chọn bộ lọc khi gọi video. Ưu tiên hiệu ứng nhẹ, có thể tắt, tương thích điện thoại và không làm giảm khả năng gọi cơ bản.
- Chọn và tích hợp hạ tầng truyền thông phù hợp với kiến trúc hiện tại; không giả định WebRTC đơn lẻ đủ cho kết nối xuyên mạng nếu chưa có signaling/STUN/TURN.

**Hoàn tất khi:** hai người có thể thiết lập và kết thúc cuộc gọi thoại/video; quyền thiết bị và lỗi mạng được xử lý; bộ lọc là tùy chọn và có thể tắt.

## 7. Viết lại kết bạn

- Thiết kế lại luồng kết bạn và trạng thái yêu cầu: gửi, nhận, chấp nhận, từ chối, hủy, chặn và chống gửi yêu cầu trùng.
- Tạo mục Gợi ý kết bạn riêng. Có thể đề xuất người ở gần qua GPS chỉ khi người dùng chủ động bật chia sẻ vị trí và đồng ý xuất hiện trong gợi ý; cung cấp cách tắt và không tiết lộ tọa độ chính xác cho người chưa kết bạn.
- Hỗ trợ quét QR để mở hồ sơ/gửi yêu cầu kết bạn. Trước khi triển khai, kiểm tra khả năng tạo/đọc QR trên trình duyệt và thiết bị mục tiêu; nếu thiếu quyền camera/API hoặc không đáp ứng bảo mật, ghi rõ giới hạn và đề xuất bỏ qua QR, giữ phương án mã mời.
- Sửa kết bạn bằng mã mời: tạo mã có hạn dùng/giới hạn sử dụng phù hợp, kiểm tra hợp lệ, xử lý mã sai/hết hạn và cho phép chia sẻ thuận tiện.
- Cho phép gửi yêu cầu kết bạn khi nhấn giọt nước của người lạ trên bản đồ, nhưng không tự động kết bạn hoặc để lộ vị trí chính xác.

**Hoàn tất khi:** các trạng thái yêu cầu kết bạn nhất quán; gợi ý gần đây tôn trọng quyền riêng tư; mã mời hoạt động; khả năng QR được xác minh trước khi chốt triển khai.

## 8. Quy tắc hộp thư và hoàn thiện nhắn tin

- Tin nhắn từ người chưa kết bạn luôn vào mục Người lạ. Chỉ chuyển cuộc trò chuyện sang Trang chính khi người nhận phản hồi bằng tin nhắn hoặc biểu tượng tương tác theo quy tắc sản phẩm; việc chuyển phải đồng bộ trên các thiết bị.
- Khi hai người đã kết bạn, cuộc trò chuyện mặc định nằm ở Trang chính.
- Cho phép tùy chỉnh nền, biểu tượng và biệt danh trong chat cá nhân/nhóm; xác định phạm vi áp dụng (chỉ mình tôi hay mọi thành viên) trước khi lưu và hiển thị rõ phạm vi.
- Bổ sung bộ biểu tượng/sticker và voice chat/ghi âm giọng nói trong chat theo thiết kế phù hợp. Phân biệt voice message với gọi thoại trực tiếp.
- Rà soát lại logic chat để thống nhất tin nhắn cá nhân/nhóm, gửi tệp, trạng thái gửi/đã nhận/đã xem, thông báo, phân loại Người lạ/Trang chính và thử gửi lại.

**Hoàn tất khi:** luồng Người lạ/Trang chính chuyển đúng quy tắc; chat cá nhân/nhóm chia sẻ cùng trạng thái và quy tắc gửi; tùy chỉnh hiển thị đúng phạm vi.

## 9. Đồng bộ giao diện và chuyển động

- Rà soát màu sắc, trạng thái và kiểu nút trên toàn ứng dụng; thống nhất màu chính, phụ, nguy hiểm, trạng thái vô hiệu hóa, hover/focus và độ tương phản.
- Loại bỏ hiệu ứng pháo hoa/nổ khi hoàn tất thao tác. Dùng chuyển động giao diện nhẹ, có mục đích và nhất quán; ưu tiên thư viện/hiệu ứng Three.js hoặc công cụ chuyển động đã có trong dự án sau khi kiểm tra mức độ phù hợp.
- Tôn trọng cài đặt giảm chuyển động của hệ điều hành; giữ hiệu năng và khả năng thao tác trên điện thoại, cung cấp trạng thái thành công bằng văn bản/biểu tượng bên cạnh animation.

**Hoàn tất khi:** nút có quy tắc màu thống nhất; không còn pháo hoa khi thành công; animation không cản thao tác và có phương án giảm/tắt.

## Thứ tự triển khai đề xuất

1. Rà soát lỗi thoát web app trên điện thoại, lỗi gửi ảnh/video và lỗi lưu tin nổi bật; các lỗi này chặn luồng sử dụng hiện tại.
2. Chuẩn hóa mô hình trạng thái và thời hạn nội dung; thống nhất đăng trạng thái, giọt nước, bảng tin, Story và kho lưu trữ.
3. Viết lại luồng định vị/Mapbox, quy tắc chia sẻ vị trí trực tiếp và quyền riêng tư.
4. Sửa phát hiện gần nhau, điều kiện và cách hiển thị cụng ly.
5. Hoàn thiện hộp thư, gửi tệp, phân loại người lạ và các tùy chỉnh chat.
6. Thiết kế lại kết bạn, gợi ý gần đây, mã mời và xác minh QR.
7. Xây dựng gọi thoại/video, sau đó bổ sung bộ lọc.
8. Chuẩn hóa giao diện, animation, khả năng tiếp cận và kiểm tra các luồng trên điện thoại.

## Nguyên tắc kiểm tra khi triển khai

- Kiểm tra mỗi luồng trên trình duyệt máy tính và điện thoại, cả trạng thái thành công lẫn lỗi mạng/quyền bị từ chối.
- Kiểm tra quyền riêng tư: người lạ không nhận được vị trí trực tiếp, nội dung riêng tư hoặc đề xuất cụng ly trái quy tắc.
- Kiểm tra trạng thái sau khi tải lại và khi đăng nhập trên thiết bị khác để phát hiện dữ liệu giao diện chưa đồng bộ.
- Ghi lại nguyên nhân lỗi thoát trang và thay đổi xử lý lỗi trước/sau khi sửa để tránh lỗi tái diễn.

## Skill hỗ trợ triển khai đề xuất

Các skill dưới đây đã có trong `.agents/skills` và/hoặc `.agent/skills`. Chỉ áp dụng skill phù hợp với phần việc đang làm; dự án hiện dùng HTML/CSS/JavaScript thuần, vì vậy không mặc định áp dụng hướng dẫn dành riêng cho React.

| Hạng mục trong kế hoạch | Skill nên dùng | Cách áp dụng |
|---|---|---|
| Animation giọt nước, chuyển trạng thái và phản hồi thao tác | `gsap-core` | Dùng tween cơ bản, easing và thời lượng ngắn để tạo chuyển động rõ ràng. |
| Chuỗi animation cho cụng ly hoặc đăng trạng thái | `gsap-timeline` | Đồng bộ các bước animation theo trình tự; tránh để animation chặn thao tác. |
| Chuyển động marker theo vị trí cập nhật | `gsap-utils`, `gsap-core` | Nội suy/giới hạn giá trị và làm mượt marker; tọa độ thực vẫn lấy từ Geolocation API, không suy diễn vị trí bằng animation. |
| Tối ưu chuyển động trên điện thoại | `gsap-performance` | Ưu tiên transform/opacity, hạn chế layout thrashing, dọn animation khi giao diện bị đóng hoặc đổi trang. |
| Hỗ trợ giảm chuyển động và tình huống giao diện | `gsap-utils`, `gsap-core` | Tôn trọng `prefers-reduced-motion`; cung cấp trạng thái thành công bằng nội dung giao diện, không phụ thuộc animation. |
| Hiệu ứng nâng cao nếu thật sự cần | `gsap-plugins` | Chỉ dùng plugin phù hợp sau khi xác nhận giấy phép, khả năng tải và chi phí hiệu năng. |

### Những skill không nên áp dụng mặc định

- `gsap-react` và `gsap-frameworks`: hiện chưa thấy React/Vue/Svelte trong cấu trúc app. Chỉ dùng nếu dự án chuyển sang framework tương ứng.
- `gsap-scrolltrigger`: các yêu cầu hiện tại không cần animation theo cuộn trang; không đưa vào chỉ để trang trí.
- `prompt-master`: không cần cho việc sửa mã nguồn trực tiếp; chỉ dùng nếu cần soạn prompt cho một công cụ AI khác.

### Năng lực cần được bổ sung hoặc xác minh riêng

Danh sách skill đã cài hiện chưa có hướng dẫn chuyên sâu cho các phần sau; cần tra tài liệu chính thức của công nghệ được chọn và ghi lại quyết định kỹ thuật trong lúc triển khai:

- Mapbox GL JS và Geolocation API: bản đồ web, quyền vị trí, theo dõi vị trí, xử lý sai số và giới hạn chạy nền trên trình duyệt di động.
- WebRTC và hạ tầng signaling/STUN/TURN: gọi thoại/video, quyền camera/microphone, kết nối qua NAT và xử lý ngắt mạng.
- Media trên trình duyệt: chọn tệp, camera, nén/hiển thị video, ghi âm voice message và quản lý quyền thiết bị.
- Thiết kế API, xác thực, lưu trữ và đồng bộ thời gian thực: gửi tệp, yêu cầu kết bạn, trạng thái tin nhắn, sự kiện cụng ly và thời hạn bài đăng.
- Bảo mật và quyền riêng tư vị trí: cấp quyền theo mục đích, thời hạn chia sẻ, thu hồi, giới hạn người nhận và không tiết lộ tọa độ chính xác cho người lạ.

Các mục trên là nhóm kiến thức cần tham khảo, chưa phải tên skill đã cài trong repo. Không nên ghi rằng Three.js đã có sẵn: danh sách skill cài đặt hiện tại là các skill GSAP, còn Three.js là thư viện chạy trong ứng dụng và cần được xác minh/cài đặt riêng nếu thực sự chọn dùng. Với chuyển động giao diện thông thường, ưu tiên GSAP/CSS nhẹ; chỉ dùng Three.js cho hiệu ứng cần render 3D.
