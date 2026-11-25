# Changelog

Mỗi bước dựng phần nền ghi một mục; mới nhất ở trên.

- **test: set up Vitest and test the base helpers** — Vitest + Testing Library (jsdom), test định dạng, URL danh sách, bố cục thống kê, trạng thái danh sách
- **feat(platform): add the generic resource CRUD screen and the permission matrix** — một màn CRUD cho mọi tài nguyên: danh sách, lọc, tìm kiếm, thêm, sửa, xoá, nhập và xuất; ma trận quyền chỉ đọc
- **feat: add the app shell with sign-in, layout and lazy routes** — layout và menu theo quyền, đăng nhập (kèm tài khoản demo), trang chủ, 404 và trang lỗi, route tải lười, chọn ngôn ngữ và giao diện sáng/tối
- **feat: add shared helpers and UI building blocks** — định dạng số/tiền/ngày, `useListQuery` (trang, lọc, sắp xếp đồng bộ URL); thanh hành động, khối, panel, trạng thái trang, hành động trên dòng, tìm theo cột
- **feat: add the API layer and the session** — client gọi API dùng chung, kiểu dữ liệu, phiên đăng nhập và quyền của người dùng
- **feat: add global styles and i18n in Vietnamese and English** — style toàn cục; i18next tự đăng ký mọi tệp `locales/<ngôn ngữ>/<nhóm>.json`
- **feat(ui): add DataTable with filters, column settings, import and export** — bảng dữ liệu: sắp xếp, phân trang, bộ lọc nâng cao, chọn cột, thẻ trên điện thoại, nhập và xuất
- **feat(ui): add base components** — nút, thẻ, thống kê, khung trang, ô tìm kiếm, modal và drawer biểu mẫu, xác nhận, chi tiết, trạng thái (bộ UniFlow)
- **feat(ui): add hooks for lists, filters, paging and resources** — hook dùng chung: `useListState`, `useFilters`, `usePagination`, `useResource`, `useAccess`…
- **feat(ui): add the theme, design tokens and app config provider** — `packages/ui`: theme Ant Design, token màu sáng/tối, `UiProvider`, `AppConfigContext`, tiện ích xuất/lưu/kiểm tra
- **feat(api-client): add the typed HTTP client** — `packages/api-client`: client HTTP có kiểu, lỗi API thống nhất
- **feat(contracts): add shared types, resources and the permission matrix** — `packages/contracts`: kiểu dữ liệu, định nghĩa tài nguyên CRUD (`resources.json`), ma trận quyền (`permissions.json`), kiểm tra trường, bộ lọc danh sách
- **chore: add the shared TypeScript config package** — `packages/config`: tsconfig gốc cho các gói
- **chore: add ESLint and Prettier** — luật lint và định dạng dùng chung (lấy từ CodeCash)
- **chore: scaffold the web app with Vite, React and TypeScript** — Vite 8, React 19, TypeScript `strict`, alias `@/`
- **docs: plan the frontend base** — phân tích phần nền, nguồn lấy từ CodeCash và thứ tự dựng (`docs/PHAN_TICH.md`)
