# Quy trình nhánh: `base` và `main`

Áp dụng cho repo `btl-frontend`. Ai cũng đọc trước khi tạo nhánh đầu tiên.

## Hai nhánh dài hạn

| Nhánh | Chứa gì | Ai sửa | Vào bằng |
| --- | --- | --- | --- |
| `base` | **Phần nền dùng chung**: `packages/*` (bộ UI, contracts, api-client, config), `src/shared/*` (api, auth, layout, state, ui, lib), `src/i18n`, `src/styles`, `src/test`, cấu hình (Vite, TypeScript, ESLint, Prettier, CI) | Trưởng nhóm (TV1 phụ trách kỹ thuật nền) | PR từ `core/<việc>` |
| `main` | Phần nền **cộng** nghiệp vụ của cả nhóm (màn, service) | Mọi người, mỗi người phần của mình | PR từ `feat/<phần>-<việc>`, `fix/…` |

`main` luôn chứa `base`. `base` **không bao giờ** chứa nghiệp vụ, nên phần nền luôn tách sạch, dùng lại được, và lịch sử commit cho thấy rõ ai làm phần nền, ai làm nghiệp vụ.

```
core/<việc> ──PR──▶ base ──PR "sync: base → main"──▶ main ◀──PR── feat/<phần>-<việc>
```

## Sửa phần nền

Nhánh việc của phần nền tên `core/<việc>`, **không** đặt `base/<việc>`: Git coi tên nhánh như đường dẫn, nên đã có nhánh `base` thì không tạo được `base/…`.

1. Tạo nhánh từ `base`: `git switch base && git pull && git switch -c core/<việc>`.
2. Sửa, chạy đủ kiểm tra (`pnpm check` hoặc `pnpm test`), commit theo Conventional Commits.
3. Mở PR vào `base`; một người khác duyệt; CI phải xanh.
4. Merge xong, mở PR **`base` → `main`** (tiêu đề `sync: base → main`), dùng **merge commit** (không squash, không rebase) để `main` giữ nguyên commit của `base`.
5. Ai đang có nhánh nghiệp vụ thì cập nhật: `git switch feat/… && git merge main`.

Phần nền thiếu thứ gì khi đang làm nghiệp vụ (một thành phần, một hook, một helper)? **Không sửa thẳng trên nhánh nghiệp vụ.** Báo trưởng nhóm hoặc tự làm theo các bước trên, rồi merge `main` vào nhánh của mình.

## Làm nghiệp vụ

1. Tạo nhánh từ `main`: `git switch main && git pull && git switch -c feat/<phần>-<việc>` (ví dụ `feat/contracts-list`, `feat/signing-service-s1`).
2. Chỉ sửa đường dẫn nghiệp vụ (bảng mục 3 của `CLAUDE.md`); dùng phần nền như thư viện. CI chạy
   `scripts/check-base-untouched.mjs` và từ chối PR sửa phần nền (tự kiểm: `pnpm check:base`).
3. PR vào `main`, một người duyệt, CI xanh, **merge commit** (giữ commit của từng người).

## Bảo vệ nhánh (GitHub)

`base` và `main` đều:

- chỉ nhận thay đổi qua Pull Request, cần ít nhất 1 người duyệt, và duyệt lại khi có commit mới;
- phải qua CI (job `verify`) và cập nhật với nhánh đích trước khi merge;
- tệp phần nền cần người trong `.github/CODEOWNERS` duyệt;
- cấm force push, cấm xoá nhánh.

Quản trị repo (trưởng nhóm) được merge bằng quyền admin khi CI xanh mà chưa có người duyệt (`gh pr merge --admin --merge`); chỉ dùng cho việc phần nền hoặc đồng bộ `base → main` khi cả nhóm chưa ai duyệt được, không dùng để bỏ qua CI.

Bật bằng `scripts/protect-branches.sh <chủ-repo>/<tên-repo>` (cần GitHub CLI `gh` đã đăng nhập, quyền admin repo), chạy một lần sau khi repo có remote và đã push hai nhánh. Kiểm lại ở **Settings → Branches**.

## Nhanh

| Muốn | Lệnh |
| --- | --- |
| Bắt đầu việc nền | `git switch base && git pull && git switch -c core/<việc>` |
| Bắt đầu việc nghiệp vụ | `git switch main && git pull && git switch -c feat/<phần>-<việc>` |
| Lấy phần nền mới về nhánh đang làm | `git fetch && git merge origin/main` |
| Xem `main` đã có hết `base` chưa | `git log --oneline main..base` (rỗng là đủ) |

