# Changelog

Mỗi bước dựng phần nền ghi một mục; mới nhất ở trên.

- **test: tables render in tests** — `src/test/setup.ts` thêm `ResizeObserver` rỗng (jsdom không có bố cục), để test được màn có `DataTable`
- **chore: clean the code of the old project's names** — gói `@codecash/*` đổi thành `@scw/*`; khoá localStorage, sự kiện, class CSS đổi tiền tố `scw`; thương hiệu "Smart Contract Workflow"; chữ hiển thị "BTC", "Data Pack của ban tổ chức" thành "dữ liệu mẫu", màn kết quả thành "Kiểm chứng bộ luật"; chú thích không còn trỏ đường dẫn mã cũ; ESLint áp đúng `src/`. Người dùng đang đăng nhập phải đăng nhập lại một lần (khoá token đổi tên)
- **feat(auth): refresh tokens, password reset, invitations, change password** — `ApiClient` gặp 401 thì làm mới token một lần (một lượt làm mới dùng chung cho các request cùng lỗi) bằng cookie HttpOnly `sc_refresh`, lặp lại request; không làm mới cho đăng nhập sai; `ApiError.errors` giữ lỗi theo trường (RFC 9457); màn `/forgot-password`, `/reset-password`, `/accept-invitation` (ngoài phiên), `/account/password`, `/account/invite` (quyền `users:create`, vai trò được cấp theo SoD, hộp thư đi khi demo); đăng nhập có liên kết "Quên mật khẩu?", báo khoá tài khoản và giới hạn; menu tài khoản thêm hai mục; chữ vi/en (`auth.*`); 14 test mới
- **ci, docs: guard the base and guide AI-assisted work** — `scripts/check-base-untouched.mjs` (`pnpm check:base`, chạy trong CI) từ chối PR nghiệp vụ sửa phần nền; `.github/CODEOWNERS`; `CLAUDE.md` + `AGENTS.md` (mã cũ ở `../codecash`, vùng được sửa, quy trình chuyển màn); `docs/DOI_CHIEU_CODECASH.md` (màn cũ → màn mới, chủ, service)
- **docs: let the repository admin merge when CI is green** — bảo vệ nhánh không áp dụng cho admin, để trưởng nhóm merge việc nền khi chưa có người duyệt; thành viên vẫn cần 1 người duyệt và CI xanh
- **docs: name base task branches core/<task>; allow running CI by hand** — Git không cho có cùng lúc nhánh `base` và `base/<việc>`, nên nhánh việc của phần nền đổi thành `core/<việc>`; CI thêm `workflow_dispatch`
- **docs: keep the base on its own branch** — nhánh `base` chỉ chứa phần nền, `main` chứa nền cộng nghiệp vụ; quy trình sửa nền rồi đồng bộ sang `main`, quy trình làm nghiệp vụ, quy tắc bảo vệ nhánh (`docs/QUY_TRINH_NHANH.md`); script bật bảo vệ nhánh trên GitHub (`scripts/protect-branches.sh`)
- **ci: verify every push** — GitHub Actions chạy typecheck, lint, format, test có ngưỡng độ phủ, build, lưu báo cáo độ phủ; `.env.example`; README ghi cách chạy cùng backend, state và phân quyền
- **test: mock the API with MSW and gate coverage at 50%** — máy chủ giả MSW cho mọi test (yêu cầu không ai trả lời thì test hỏng), test luồng đăng ký qua client HTTP thật (thành công, trùng email, mật khẩu không khớp), test helper; `pnpm coverage` bắt ngưỡng 50% cho state, quyền, helper và logic của từng feature
- **feat(auth): add withPermission and Can** — HOC `withPermission` (lớp chặn thứ hai sau route guard, dùng cho ma trận quyền), Render Props `<Can>` (ẩn hoặc truyền cờ cho phép vào hàm con, dùng ở trang chủ), `usePermission`, `hasPermissions`; hàm test `renderWithApp` dựng sẵn store, phiên, query, router
- **feat(auth): add company sign-up** — trang `/register`: công ty (tên, mã, loại, email, mã số thuế) và người quản trị (họ tên, email, mật khẩu ≥ 12 ký tự, nhập lại); gọi `POST /auth/register` rồi đăng nhập luôn; liên kết từ trang đăng nhập; `useSession().signUp`
- **feat(state): keep the session in a Redux Toolkit store** — slice `session` (đăng nhập, đăng xuất, khôi phục phiên bằng `createAsyncThunk`), hook có kiểu `useAppDispatch`/`useAppSelector`; `useSession()` giữ nguyên chữ ký nên màn chuyển từ CodeCash không phải sửa; dữ liệu server vẫn ở TanStack Query
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
