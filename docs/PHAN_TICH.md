# Phân tích phần nền frontend

Viết một lần trước khi dựng; tiến độ từng bước ghi ở `CHANGELOG.md`.

## Mục tiêu

Dựng **phần nền** của web app trước khi có nghiệp vụ: bộ thành phần giao diện, theme, i18n, tầng gọi API, đăng nhập và phân quyền, vỏ ứng dụng, màn CRUD dùng chung cho mọi tài nguyên. Các màn nghiệp vụ (hợp đồng, ký, mốc, chi tiền, kiểm toán) thêm sau, mỗi màn một thư mục `src/features/<x>`.

## Nguồn

Lấy từ CodeCash (`apps/web`, `packages/ui`, `packages/contracts`, `packages/api-client`, `packages/config`) bản `c667ec4`, đã chạy ổn định và qua kiểm thử. Đi theo đúng thứ tự CodeCash đã lớn lên: cấu hình → gói dùng chung → giao diện nền → tầng dữ liệu → vỏ ứng dụng → CRUD → kiểm thử.

| Lấy | Không lấy ở phần nền |
| --- | --- |
| `packages/ui` (bộ UniFlow: DataTable, FormModal, DetailModal, hook danh sách, theme) | Màn nghiệp vụ trong `apps/web/src/features` (trừ CRUD và ma trận quyền) |
| `src/shared` (api, auth, layout, lib, ui chung), `src/i18n`, `src/styles` | Thành phần riêng của hợp đồng và ký (xem trước hợp đồng, vị trí ký…) |
| Locale `common`, `platform`, `domain`, `audit`, `contracts`, `dashboard` | Hướng dẫn sử dụng theo nghiệp vụ, thiết bị ký |
| `ResourcePage` (CRUD + lọc + nhập/xuất), `PermissionMatrixPage` | |

## Thứ tự dựng

1. Khởi tạo Vite + React + TypeScript strict.
2. ESLint, Prettier.
3. Gói cấu hình TypeScript dùng chung.
4. Gói `contracts`: kiểu, định nghĩa tài nguyên và ma trận quyền.
5. Gói `api-client`.
6. Gói `ui`: theme và cấu hình → hook danh sách/lọc/phân trang → thành phần cơ bản → DataTable.
7. Style toàn cục và tiện ích (`format`, `useListQuery`, URL danh sách).
8. i18n vi/en.
9. Tầng API và phiên đăng nhập.
10. Thành phần giao diện dùng chung của app.
11. Vỏ ứng dụng: layout, menu, router lazy, đăng nhập, trang chủ, 404.
12. Màn CRUD tài nguyên và ma trận quyền.
13. Vitest + Testing Library và test của phần nền.

## Việc sau phần nền (theo đề LTWNC)

State toàn cục bằng Redux Toolkit (RTK Query), trang đăng ký, HOC `withPermission` và Render Props `<Can>`, MSW theo OpenAPI của backend, ngưỡng độ phủ 50%, CI.
