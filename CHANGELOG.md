# Changelog

Mỗi bước dựng phần nền ghi một mục; mới nhất ở trên.

- **feat(contracts): add shared types, resources and the permission matrix** — `packages/contracts`: kiểu dữ liệu, định nghĩa tài nguyên CRUD (`resources.json`), ma trận quyền (`permissions.json`), kiểm tra trường, bộ lọc danh sách
- **chore: add the shared TypeScript config package** — `packages/config`: tsconfig gốc cho các gói
- **chore: add ESLint and Prettier** — luật lint và định dạng dùng chung (lấy từ CodeCash)
- **chore: scaffold the web app with Vite, React and TypeScript** — Vite 8, React 19, TypeScript `strict`, alias `@/`
- **docs: plan the frontend base** — phân tích phần nền, nguồn lấy từ CodeCash và thứ tự dựng (`docs/PHAN_TICH.md`)
