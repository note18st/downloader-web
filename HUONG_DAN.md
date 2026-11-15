# Hướng dẫn sử dụng — Trình tải M3

Trang web chính: **https://downloader-m3-gateway.phamhoainam.workers.dev/**

Trang dự phòng: https://note18st.github.io/downloader-web/

Phiên bản: **V1.1.0** (15/11/2026)

## Mở đầu 30 giây

1. Mở trang web, đăng nhập bằng **mã truy cập cá nhân GitHub** (xem "Cách đăng nhập" bên dưới).
2. Dán liên kết cần tải vào ô đầu trang (có nút **Dán** để dán nhanh).
3. Chọn kiểu tải (để **Tự nhận diện** nếu không chắc) và chất lượng.
4. Bấm **Bắt đầu tải xuống**, vào mục **Tác vụ** xem tiến độ.
5. Tải xong, bấm **Mở trên Google Drive** trên thẻ tác vụ để mở thẳng kết quả.

## Cách đăng nhập bằng mã truy cập cá nhân

1. Trên điện thoại, mở https://github.com/settings/personal-access-tokens/new
   rồi bấm **Generate new token**.
2. Đặt tên tùy ý (ví dụ "tai-xuong"), thời hạn nên chọn dài để đỡ tạo lại.
3. Chọn kho **downloader-core**, cấp quyền **Contents: Read and write**
   và **Metadata: Read-only**.
4. Bấm Generate, sao chép mã (bắt đầu bằng `github_pat_…`).
5. Trên trang tải xuống, mở mục **Đăng nhập bằng mã truy cập cá nhân**,
   dán mã vào ô rồi bấm **Đăng nhập**. Mã chỉ gửi một lần, không lưu lại.
6. Phiên tự hết hạn sau 24 giờ — hết hạn thì tạo mã mới và đăng nhập lại.

## Kiểu tải nào cho liên kết nào

| Bạn có liên kết gì | Chọn kiểu tải | Ví dụ |
| --- | --- | --- |
| Video trên mạng xã hội / nền tảng | Tự nhận diện hoặc Video nền tảng | YouTube, Facebook, TikTok, X |
| Trang ảnh / album ảnh | Ảnh / bộ sưu tập | Danbooru, ArtStation |
| Liên kết thẳng tới một tệp | Tự nhận diện hoặc Tệp trực tiếp | tệp .mp4, .zip, .pdf |
| Luồng phát M3U8 / MPD (thường lấy từ trang phát phim) | Tự nhận diện hoặc M3U8 / MPD | liên kết `.m3u8`, `.mpd` |

## Tùy chọn chất lượng

- **Tốt nhất có sẵn**: lấy bản cao nhất nguồn có.
- **Tối đa 1080p / 720p**: không lấy bản cao hơn mức chọn (tiết kiệm dung lượng).
- **Chỉ âm thanh**: bỏ hình, chỉ lấy tiếng (MP3/M4A tốt nhất có sẵn).
- Ô **Tải phụ đề nếu nguồn có** nằm trong mục **Tùy chọn nâng cao** trên trang chủ.
- Chất lượng chọn lần trước được ghi nhớ; đổi mặc định trong mục **Cài đặt**.

## Bốn khu vực chính

- **Trang chủ**: dán liên kết, chọn kiểu tải và chất lượng, bấm bắt đầu.
- **Tác vụ**: trạng thái, tiến trình, hủy và thử lại cho từng lượt tải.
- **Tệp đã lưu**: danh sách kết quả với nút **Mở trên Google Drive** và **Sao chép liên kết**.
- **Cài đặt**: giao diện sáng/tối/tự động, chất lượng mặc định, thông tin hệ thống.

## Sau khi tải xong

- Trên thẻ tác vụ hoàn tất có nút **Mở trên Google Drive** (tác vụ một tệp thì mở thẳng tệp,
  nhiều tệp thì mở thư mục chứa kết quả) và nút **Sao chép liên kết** (chép liên kết Drive
  vào bộ nhớ tạm).
- Tệp luôn nằm trong thư mục `Downloads/<mã tác vụ>` trên Google Drive của bạn.
- Tệp mặc định **riêng tư**: chỉ bạn (chủ tài khoản Drive) xem được. Muốn cho người khác
  xem thì bấm chia sẻ trực tiếp trên Google Drive.
- Muốn lấy lại kết quả tác vụ cũ: vào mục **Tệp đã lưu**, thẻ tác vụ cũ vẫn còn nút mở Drive.

## Hủy và thử lại

- Nhấn **Hủy** trên thẻ tác vụ đang chạy — máy tải tự dừng trong vài giây.
- Tác vụ lỗi hoặc đã hủy có nút **Thử lại** — gửi lại đúng liên kết cũ bằng một chạm.
- Tác vụ lỗi hiện thông báo tiếng Việt nêu rõ lý do.
- Lỗi "từ chối theo vị trí mạng" nghĩa là nguồn chỉ nhận kết nối từ một số quốc gia —
  máy tải của hệ thống đặt ở nước ngoài nên không tải được nguồn đó (đã kiểm chứng,
  không phải lỗi hệ thống).

## Giới hạn mỗi lượt

- Tối đa **5 GiB** mỗi lượt tải, chạy tối đa **120 phút**.
- Tối đa 10 tác vụ đang chạy, gửi tối đa 3 lượt mỗi phút.
- Trang cần đăng nhập (Instagram, Pixiv…) chưa hỗ trợ do chưa cấu hình cookies.
- Nguồn chặn theo vùng địa lý (như một số máy chủ phát phim) không tải được —
  xem mục "Hủy và thử lại".

## Giao diện và tự động cập nhật

- Giao diện tự chạy theo **sáng / tối** của hệ thống; đổi trong **Cài đặt** hoặc nút
  hình mặt trăng trên thanh đầu trang.
- Trang được thiết kế cho điện thoại: phóng to hai ngón tay như bình thường.
- Khi mã nguồn giao diện (kho `downloader-web`) thay đổi, hệ thống tự triển khai
  bản mới lên Cloudflare trong khoảng 15 phút, không cần thao tác tay.

## Bảo mật

- Đừng dán mã truy cập GitHub, khóa hay cookies vào chat hay trang web lạ.
- Nếu lỡ lộ mã: vào https://github.com/settings/personal-access-tokens để thu hồi ngay.
- Trang web không lưu mã; khóa vận hành nằm trong Cloudflare Worker (riêng tư).
