# Changelog

Mỗi bước dựng phần nền ghi một mục; mới nhất ở trên.

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
