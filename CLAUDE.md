# Hướng dẫn cho AI (và người) làm việc trong `btl-frontend`

Web của dự án Smart Contract Workflow (môn Lập trình Web nâng cao). React 19, Vite, TypeScript
strict, Ant Design 6, TanStack Query, Redux Toolkit (chỉ phiên đăng nhập), i18next, Vitest + MSW.
Công cụ AI khác đọc `AGENTS.md`, tệp đó trỏ về đây.

## 1. Thư mục cùng cấp (phải có đủ)

```
<thư mục làm việc>/
├── codecash/            MÃ CŨ — chỉ đọc. git clone https://github.com/Tunhoclaptrinh/Code-n-Cash.git codecash
├── btl-frontend/        repo này
├── btl-backend/         repo cha backend (docs/KICH_BAN_VIBE_CODE.md: ai làm gì, ngày nào)
└── btl-backend-<tên>/   các service (service/openapi.yaml là hợp đồng API của màn gọi nó)
```

Web cũ ở **`../codecash/apps/web/src/`**. Không có thì dừng lại, nhắc người dùng clone đúng tên thư
mục. **Không bao giờ sửa, commit trong `../codecash`.**

## 2. Nguồn sự thật

| Cần biết | Đọc |
| --- | --- |
| Màn cũ nào chuyển đi đâu, ai làm, gọi service nào | `docs/DOI_CHIEU_CODECASH.md` |
| Nghiệp vụ, từ điển trạng thái | `../codecash/docs/NGHIEP_VU.md` (mục 14) |
| Cách dựng màn danh sách, quy ước giao diện | `../codecash/docs/08_HUONG_DAN_PHAT_TRIEN_UI.md` |
| API của service | `../btl-backend-<tên>/service/openapi.yaml`, `SERVICE.md` |
| Lịch, prompt mẫu | `../btl-backend/docs/KICH_BAN_VIBE_CODE.md` |
| Quy trình nhánh | `docs/QUY_TRINH_NHANH.md` |

## 3. Được sửa ở đâu

| Được sửa (nhánh `feat/…` → `main`) | Không được sửa (phần nền) |
| --- | --- |
| `src/features/<phần>/**` (pages, components, hooks, lib, `api.ts`, test) | `packages/**` (bộ UI, api-client, contracts, config) |
| `src/locales/{vi,en}/<phần>.json` | `src/shared/**` (trừ `navConfig.ts`), `src/i18n`, `src/styles`, `src/test` |
| `src/router.tsx` (một route lazy mỗi màn) | `vite.config.ts`, `tsconfig*`, ESLint, Prettier, `.github/**`, `scripts/**` |
| `src/shared/layout/navConfig.ts` (mục menu, quyền route) | `CLAUDE.md`, `AGENTS.md`, `docs/*.md` chung |
| `package.json`, `pnpm-lock.yaml` (thêm thư viện màn cần), `public/` | |

CI chạy `scripts/check-base-untouched.mjs` và **từ chối** PR sửa phần nền. Thiếu một thành phần,
hook, helper dùng chung? **Dừng lại**, nói với người dùng cần gì; việc đó làm qua `core/<việc>` →
`base` rồi merge `main`. Thứ chỉ một màn dùng thì để trong `src/features/<phần>/`.

## 4. Chuyển một màn từ CodeCash (quy trình bắt buộc)

1. Tra `docs/DOI_CHIEU_CODECASH.md`; mở màn cũ và các component, hook, lib, api nó dùng trong
   `../codecash/apps/web/src/features/<x>/`.
2. Liệt kê (trong câu trả lời) màn làm gì, gọi API nào, ai được thấy (quyền), trước khi viết mã.
3. Chép vào `src/features/<x>/`, giữ cấu trúc và tên. Đổi:
   - lời gọi API cũ (`shared/api/domain.ts`, `workflow.ts`) thành hàm trong
     `src/features/<x>/api.ts`, dùng client `platform` (`@/shared/api/platform`, đường dẫn
     `/api/v1/...` như cũ; gateway định tuyến tới service), đúng `openapi.yaml` của service;
   - import phần nền theo đường dẫn mới (`@/shared/...`, `@codecash/ui`).
4. Route lazy trong `src/router.tsx`; mục menu, `ROUTE_PERMISSIONS` trong `navConfig.ts`; chữ trong
   `src/locales/{vi,en}/<x>.json` (cả hai ngôn ngữ, cùng khoá).
5. Test ≥ 5 cho mỗi màn: một hàm thuần, một tương tác (`userEvent`), một bất đồng bộ có MSW (thành
   công và một lỗi nghiệp vụ). Dùng `renderWithApp` (`src/test/render.tsx`), `server.use(http…)`
   với `ok`/`fail` (`src/test/server.ts`). Service chưa xong thì vẫn làm được: MSW trả theo `openapi.yaml`.
6. Rà soát: màn mới hiển thị, cho phép đúng như cũ và đúng `NGHIEP_VU.md`; cải tiến (Compound
   component, hook dùng lại, type guard…) ghi vào mô tả PR để đưa vào báo cáo.
7. `pnpm check` xanh rồi mới báo xong.

## 5. Quy tắc mã

- Định danh, chú thích tiếng Anh. Không có chữ hiển thị cứng: mọi chữ (kể cả `aria-label`,
  `placeholder`, `title`) qua i18next; khoá lồng nhau camelCase, enum theo `status.<MÃ>`.
- Dữ liệu máy chủ: TanStack Query (`useQuery`, `useMutation`, invalidate sau khi ghi). Redux chỉ giữ
  phiên đăng nhập (`useSession()`); không đưa dữ liệu nghiệp vụ vào Redux.
- Quyền: `withPermission` cho cả màn, `<Can>` / `usePermission` cho một phần; API vẫn kiểm lại.
- Trình duyệt không quyết định nghiệp vụ: không tự tính tiền, quyết định, trạng thái; chỉ hiển thị
  kết quả API. Tiền, ngày qua `src/shared/lib/format.ts`.
- Giao diện: Ant Design và thành phần dùng chung (`@codecash/ui`, `src/shared/ui`). Tiêu đề trang là
  breadcrumb, không có phụ đề; ghi chú dùng `Alert` loại info; tab của danh sách nằm trong `DataTable`.
- Không ghi token, bí mật vào mã; không chép `.env` từ repo cũ.

## 6. Lệnh

```bash
pnpm install
pnpm dev            # http://127.0.0.1:5173, /api chuyển tới http://127.0.0.1:3000 (gateway)
pnpm check          # typecheck, lint, format, test + cổng độ phủ 50%, build — phải xanh trước khi PR
pnpm check:base     # tự kiểm: có lỡ sửa phần nền không
```

## 7. Git

- Nhánh `feat/<phần>-<màn>` từ `main`. Không commit thẳng `main`.
- Commit Conventional Commits, tiếng Anh: `feat(contracts): add contract list page`.
- `git add <tệp cụ thể>`; không commit `.env*`, `dist`, `coverage`, ảnh chụp tạm.
- Không thêm dòng ghi công AI (`Co-Authored-By`, "Generated with…") vào commit hay PR.
- Chỉ push, mở PR khi người dùng bảo. PR kèm ảnh chụp màn.
