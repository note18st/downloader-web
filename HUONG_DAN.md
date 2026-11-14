# Hướng dẫn sử dụng — Trình tải xuống M3

Trang web: **https://note18st.github.io/downloader-web/**

Phiên bản: **V1.0.0** (14/11/2026)

## Mở đầu 30 giây

1. Mở trang web, đăng nhập bằng **mã truy cập cá nhân GitHub** (xem "Cách đăng nhập" bên dưới).
2. Dán liên kết cần tải vào ô đầu trang.
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
| Video trên mạng xã hội / nền tảng | Tự nhận diện hoặc Video trên các nền tảng | YouTube, Facebook, TikTok, X |
| Trang ảnh / album ảnh | Ảnh / album | Danbooru, ArtStation |
| Liên kết thẳng tới một tệp | Tự nhận diện hoặc Tệp trực tiếp | tệp .mp4, .zip, .pdf |
| Luồng phát M3U8 / MPD (thường lấy từ trang phát phim) | Tự nhận diện hoặc M3U8 / MPD | liên kết `.m3u8`, `.mpd` |

## Tùy chọn chất lượng

- **Tốt nhất có sẵn**: lấy bản cao nhất nguồn có.
- **Tối đa 1080p / 720p**: không lấy bản cao hơn mức chọn (tiết kiệm dung lượng).
- **Chỉ âm thanh**: bỏ hình, chỉ lấy tiếng (MP3/M4A tốt nhất có sẵn).
- Ô **Tải phụ đề nếu nguồn có**: bật để lấy phụ đề (áp dụng cho video nền tảng và M3U8).

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
- Tác vụ lỗi hiện thông báo tiếng Việt nêu rõ lý do. Gửi lại liên kết (nút Bắt đầu tải xuống)
  là hệ thống thử lại từ đầu.
- Lỗi "từ chối theo vị trí mạng" nghĩa là nguồn chỉ nhận kết nối từ một số quốc gia —
  máy tải của hệ thống đặt ở nước ngoài nên không tải được nguồn đó (đã kiểm chứng,
  không phải lỗi hệ thống).

## Giới hạn mỗi lượt

- Tối đa **5 GiB** mỗi lượt tải, chạy tối đa **120 phút**.
- Tối đa 10 tác vụ đang chạy, gửi tối đa 3 lượt mỗi phút.
- Trang cần đăng nhập (Instagram, Pixiv…) chưa hỗ trợ do chưa cấu hình cookies.

## Bảo mật

- Đừng dán mã truy cập GitHub, khóa hay cookies vào chat hay trang web lạ.
- Nếu lỡ lộ mã: vào https://github.com/settings/personal-access-tokens để thu hồi ngay.
- Trang web không lưu mã; khóa vận hành nằm trong Cloudflare Worker (riêng tư).
