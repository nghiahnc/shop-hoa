# Mộc Hoa — kiểm tra trang chủ 15/10/2026

## Kết quả chung

- `npm run build` thành công, gồm TypeScript và toàn bộ route hiện có.
- Browser QA ở 375×812, 768×1024, 1024×900, 1440×900: không tràn ngang; header 72px trên mobile, 80px desktop/tablet. Ảnh khám phá chuyển thành một cột trên mobile.
- Menu: focus ban đầu ở nút đóng; Tab/Shift+Tab quay vòng trong dialog; Escape đóng và trả focus; cuộn nền được khóa và khôi phục.
- Toàn bộ chín ảnh trong nội dung tải thành công sau khi cuộn; các khối reveal hiện đầy đủ. Đã kiểm tra ảnh toàn trang desktop và mobile.
- Hero tải eager với fetchPriority high. Không thêm package animation. Hover phóng ảnh tối đa 3%.
- Reduced motion được kiểm tra trong mã: CSS tắt animation/transition và trạng thái reveal ẩn; hook bỏ qua IntersectionObserver nếu bật giảm chuyển động. Không đổi thiết lập hệ điều hành để thử nghiệm. HTML chỉ dùng cuộn native khi trang chủ hiện diện, không ảnh hưởng route khác.
- Kiểm tra render với tồn 0 và tồn 3: nút hết hàng bị khóa, sản phẩm còn hàng cho phép thêm. Không thay đổi tồn kho/database để kiểm tra.
- Các route sản phẩm, chi tiết, đăng nhập, đăng ký, giỏ trả HTTP 200. Khi chưa đăng nhập, checkout và đơn hàng chuyển đúng về đăng nhập. Các trang này dùng UI hiện có.
- Đã dọn sản phẩm thêm thử, không đặt đơn hoặc gọi thanh toán. API, database, các trang khác và shop-cafe không được chỉnh sửa.

## Ảnh nghiệm thu

- `desktop.jpg`, `desktop-full.jpg`: 1440×900, đầu trang và toàn trang.
- `mobile.jpg`, `mobile-full.jpg`: 375×812, đầu trang và toàn trang.
- Ảnh chụp trên dev server có biểu tượng Next.js Dev Tools, không xuất hiện trong production.

## Kiểm tra riêng

- Thêm Bó hồng phấn Dịu Dàng từ trang chủ: giỏ tăng 0 → 1; thông báo thêm thành công; trang giỏ hiển thị đúng 420.000 ₫.
- Ô Sinh nhật mở đúng bộ lọc, chọn giá trị “Sinh nhật” và hiển thị hai sản phẩm; cả bốn URL theo dịp trả HTTP 200.
- Chữ xanh lá trên nền ngà đạt 10,66:1; chữ hồng trầm 5,63:1; chữ phụ 5,78:1.
- Kiểm tra tại localhost:3001 với phiên khách. Trên 127.0.0.1 ban đầu gặp cảnh báo JWT vì cookie Auth.js từ ứng dụng khác trên cùng hostname; không thay đổi cơ chế xác thực ngoài phạm vi giao diện. Bản kiểm tra và bàn giao dùng localhost.
