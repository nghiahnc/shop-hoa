# Mộc Hoa — nghiệm thu Neon + Vercel

Ngày 16/10/2026. Trạng thái: hoàn tất triển khai và kiểm thử public.

## URL và tài nguyên

| Mục | Giá trị |
| --- | --- |
| Public | https://shop-hoa-nine.vercel.app |
| Vercel project | https://vercel.com/nghia138/shop-hoa |
| Deployment cuối | dpl_8G6FBwWmg6dot599nLW2L9o5a436 |
| Version URL | https://shop-bguepf7en-nghia138.vercel.app |
| Neon project | sparkling-snow-16548102 (shop-hoa) |
| Database / branch | shop_hoa / production (br-plain-poetry-b4y51l29) |
| Runtime | Next.js 16.4.1, Node.js 24, Vercel cle1 |
| Database region | aws-us-east-2, PostgreSQL 18 |
| Dữ liệu sau dọn thử | 13 sản phẩm, 27 khách, 125 đơn, 3 tài khoản |

## Thay đổi

- Sao lưu bằng pg_dump; restore schema, dữ liệu, sequences bằng kết nối direct, không owner/ACL. Không reseed. Toàn bộ bảng khớp count/digest ngay sau restore; 10 bảng nghiệp vụ vẫn khớp database gốc sau kiểm thử. TLS 1.3 xác minh đầy đủ.
- Giữ pg/transaction; pooled URL cho app; pool tối đa 5 kết nối trên Vercel, idle 5 giây, attachDatabasePool. Migration dùng DATABASE_URL_UNPOOLED.
- Giữ cơ chế mật khẩu và vai trò hiện có (bcrypt, NextAuth/JWT); cookie HTTPS Secure/HttpOnly. Google chưa bật.
- Điền sẵn khách/admin, đăng ký với email mới, giao hàng và sản phẩm. SKU mới theo danh sách hiện có; form giữ nội dung khi lỗi. Đã thử tạo hai sản phẩm liên tiếp qua giao diện. Các thao tác cần người dùng bấm nút xác nhận.
- Upload JPG/PNG/WebP tối đa 5 MB vào bucket Neon private hoa-uploads. Trình duyệt upload trực tiếp bằng presigned POST; prepare/finish kiểm quyền admin và chữ ký, kích thước, nội dung. API giữ imagePath; ảnh đọc qua /api/media/[filename].
- Secrets production theo danh sách cho phép; env, bản sao lưu và migration không được upload. 11 file JS public đã quét, không có giá trị secret.
- Stripe sandbox có endpoint riêng, secret riêng, bốn sự kiện Checkout. Metadata MH ngăn xử lý nhầm shop; giữ idempotency.

## Bằng chứng

| Kiểm tra | Kết quả / log |
| --- | --- |
| npm run build | PASS; build.log (`build.log`, lưu cục bộ) |
| Build Vercel và deploy cuối | READY; deploy-final.log (`deploy-final.log`, lưu cục bộ) |
| Kiểm thử trên nhánh Neon tạm | PASS; qa-http.log (`qa-http.log`, lưu cục bộ) |
| Trang public, đăng nhập đúng/sai, cookie, phân quyền, đăng ký, COD, hủy/hoàn tồn, quản trị | PASS; final-http.log (`final-http.log`, lưu cục bộ) |
| Request lặp/đồng thời | 12 request đồng thời đều 200 trong mỗi lượt kiểm thử |
| Webhook | Chữ ký sai bị từ chối, trùng không trừ tồn lại, shop khác được bỏ qua |
| Stripe sandbox thật | MH-7F073BE7: complete/paid, 1 biến động sale / 1 dòng hàng; stripe-proof.json (`stripe-proof.json`, lưu cục bộ) |
| Upload 5 MB / ảnh giả / quá cỡ / token sửa | PASS local QA và public; public-upload.log (`public-upload.log`, lưu cục bộ) |
| Ảnh sau redeploy | 5.000.000 byte khớp hoàn toàn, private bucket trả 403 khi không có chữ ký; upload-persistence.json (`upload-persistence.json`, lưu cục bộ) |
| Database và dữ liệu gốc | PASS; db-final.log (`db-final.log`, lưu cục bộ), data-final.json (`data-final.json`, lưu cục bộ) |
| Logs deployment cuối | 0 request HTTP >=500 trong cửa sổ truy vấn; final-server-errors.log (`final-server-errors.log`, lưu cục bộ) |

Kết quả HTTP cuối:

```text
PASS public pages; correct/wrong login; customer/admin access; HTTPS cookie flags
PASS two new registrations and duplicate-email rejection
PASS COD order, own history, cancel/restock and admin fulfillment
PASS repeated product creation and editing with supplied demo values
PASS signed webhook, invalid-signature rejection, idempotency and shop isolation
PASS 12 repeated/concurrent public requests (all 200)
Cleaned only records created by this test.
```

Đã dọn sản phẩm, đơn, tài khoản đăng ký, Stripe customer và ảnh tạo trong thử nghiệm; đã xóa nhánh QA và env của nhánh. Giữ event Stripe thật để xử lý an toàn các lần gửi lại. Phiên đăng nhập thông thường có thể còn tới khi hết hạn. Sequences tiếp tục tăng để không tái dùng ID đã thử với Stripe.

## Chi phí và giới hạn

Tài khoản kiểm tra thực tế: Neon organization free, Vercel team hobby. Không bật gói trả phí, R2 hay Cloudflare Workers cho hai shop này.

- [Neon Free](https://neon.com/docs/introduction/plans): 100 CU-hour/project/tháng, 1 GB PostgreSQL/project (tổng tài khoản 20 GB), 5 GB public transfer/project/tháng; Object Storage 5 GB/project. Compute tự nghỉ sau 5 phút; hai project được tạo với 0.25 CU.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby): 4 giờ active CPU, 360 GB-hour memory, 1 triệu Function invocation và 100 GB Fast Data Transfer; tài nguyên team dùng chung với các project khác, gồm cafe. Dùng cá nhân/phi thương mại; hết hạn mức có thể phải chờ reset.
- [Giới hạn body Vercel](https://vercel.com/docs/functions/limitations): 4.5 MB. Luồng direct upload và redirect ảnh tránh chuyển file 5 MB qua Function. Miễn phí trong hạn mức, không phải sử dụng vô hạn.

## Vấn đề đã xử lý và vận hành local

- pg_restore trên Windows ban đầu thiếu root CA: bổ sung bộ CA tin cậy từ Node; giữ verify-full.
- Digest ban đầu khác do cách hiển thị timestamptz theo timezone: chuẩn hóa UTC trước đối chiếu; dữ liệu khớp.
- Neon Free từ chối tham số suspend-timeout dù là 300 giây: bỏ override và giữ mặc định Free. Không nâng gói.
- Không còn lỗi chặn nghiệm thu. Một số thao tác UI chờ điều hướng cần đọc lại sau khi request hoàn tất; trạng thái cuối đã được kiểm chứng.
- Local đang chạy http://127.0.0.1:3001 và dùng chung Neon production. Database local cũ, .backups/pre-neon.env và .backups/pre-neon.dump vẫn giữ. npm run db:migrate dùng direct; không chạy seed để demo dữ liệu đã chuyển.
- Tài khoản demo: demo@mochoa.local / Demo1234!; admin@mochoa.local / Admin1234!. Có thể chọn trực tiếp trên /login.





> Bản GitHub chỉ giữ ảnh/báo cáo đã rà soát; các log và tệp bằng chứng ghi là ‘lưu cục bộ’ không được công khai.
