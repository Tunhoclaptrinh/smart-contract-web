# Đối chiếu: màn CodeCash → `btl-frontend`

Bảng tra cho người và AI. Cột "Nguồn" tính từ `../codecash/apps/web/src/`. Backend xem
`btl-backend/docs/DOI_CHIEU_CODECASH.md`.

## 1. Đã có trong phần nền

| Cũ | Ở đây |
| --- | --- |
| `packages/ui` (DataTable, form, hook, theme từ UniFlow) | `packages/ui` (`@codecash/ui`) |
| `shared/ui`, `shared/layout`, `shared/lib`, `shared/onboarding`, `shared/pages` | `src/shared/...` (cùng tên) |
| `shared/auth` (đăng nhập, `useSession`, `RequireAuth`) | `src/shared/auth` + Redux `src/shared/state`; thêm `RegisterPage`, `Can`, `withPermission` |
| `features/platform/ResourcePage.tsx`, `PermissionMatrixPage.tsx` | `src/features/platform/` |
| `locales/{vi,en}/{common,platform,domain,contracts,audit,dashboard}.json` | `src/locales/` (chép sẵn, thêm khoá khi chuyển màn) |
| `shared/api/{auth.api,client,domain,notifications.api,platform,tasks.api,types,workflow}.ts` | `src/shared/api/` — `domain.ts`, `workflow.ts` gọi API kiểu cũ; màn mới gọi qua `src/features/<x>/api.ts` |

## 2. Màn cần chuyển

| Màn | Route | Nguồn | Chủ | Service | Làm mới / đổi | Test |
| --- | --- | --- | --- | --- | --- | --- |
| Tổ chức, người dùng, mời thành viên | `/platform/*` (đã có) | `features/platform/ResourcePage.tsx` | TV1 | identity | Mời thành viên, hồ sơ tổ chức | 5 |
| Tổng quan | `/dashboard` | `features/dashboard/` (pages, components: `charts`, `DueCalendar`, `WelcomeBanner`) | TV6 | execution, payment | Số liệu từ API | 5 |
| Việc cần làm | `/tasks` | `features/milestones/pages/TaskInboxPage.tsx` | TV4 | execution | | 5 |
| Danh sách hợp đồng | `/contracts` | `features/contracts/pages/ContractListPage.tsx` | TV2 | contract | | 5 |
| Soạn hợp đồng (wizard) | `/contracts/new` | `features/contracts/pages/ContractUploadPage.tsx`, `components/*` | TV2 | contract, signing | Compound `<MilestoneBuilder>`, `usePersistentDraft<T>`, schema Zod | 6 |
| Số hoá mốc, luật riêng | `/contracts/:id/digitize` | `features/signing/pages/DigitizeReviewPage.tsx`, `components/{MilestoneEditor,ContractRulesPanel,ExtractionPanel}.tsx` | TV2 | contract, decision | | 4 |
| Vị trí ký, trình tự ký, cách ký, thiết bị ký | `/contracts/:id/sign-positions`, `/signing`, `/signing/:step` | `features/signing/pages/{SignaturePositionsPage,SigningFlowPage,SigningMethodPage,DevicePage}.tsx`, `device/`, `components/Positions*` | TV3 | signing | | 6 |
| Xác minh chữ ký (cả khách) | `/verify/:id?` | `features/signing/pages/SignatureVerificationPage.tsx` | TV3 | signing | Trang không cần đăng nhập (cần khung công khai FB2 ở phần nền) | 4 |
| Chi tiết hợp đồng và mốc | `/contracts/:id` | `features/milestones/pages/ContractDetailPage.tsx`, `components/{MilestoneJourney,SmartContractPanel,AmountsPanel,…}` | TV4 | execution | Bảng 405 mốc ảo hoá + đo Profiler | 6 |
| Nộp chứng từ | `/submissions/:id?/:no?` | `features/milestones/pages/EvidenceSubmissionPage.tsx`, `components/{EvidenceViewer,InvoiceFormModal}` | TV4 | execution, signing | | 5 |
| Tranh chấp | `/contracts/:id/milestones/:no/dispute` | `features/disputes/` | TV4 | execution | | 4 |
| Truy vết quyết định | `/contracts/:id/milestones/:no/decision` | `features/milestones/pages/MilestoneDecisionPage.tsx`, `components/{DecisionTrace,DecisionBanner,RulesPanel,VariablesPanel,ReplayPanel}` | TV5 | decision | Compound `<DecisionTrace>`, type guard `isPayableDecision` | 5 |
| Duyệt chi | `/approvals/:id?/:no?` | `features/milestones/pages/PaymentApprovalPage.tsx`, `components/PaymentInstructionPanel.tsx` | TV5 | payment | Trạng thái PENDING, đối soát | 5 |
| Phiên bản luật, thư viện mốc | `/platform/rule-versions`, `/platform/milestone-library` | `features/platform/{RuleVersionsPage,MilestoneLibraryPage}.tsx`, `components/RuleExpressionEditor.tsx` | TV5 | decision, contract | | 4 |
| Nhật ký, toàn vẹn, ngoại lệ | `/activity-log`, `/integrity`, `/exceptions` | `features/audit/` (`ActivityLogView`, `AnchorPanel`) | TV6 | audit, execution | | 5 |
| Thông báo | ngăn kéo ở header (khung đã có) | `shared/layout/NotificationDrawer.tsx`, `useNotifications.ts` | TV6 | audit | Mô tả theo loại sự kiện | 3 |
| Hướng dẫn sử dụng | `/guide/:topic?` | `guide/` | TV6 | — | Viết lại theo bản BTL (cắt nếu thiếu giờ) | 2 |

Bỏ, không chuyển: `features/platform/{DataPage,AnchorsPage}.tsx` và `components/{BenchmarkCard,DatasetPanel}.tsx` (công cụ chấm Data Pack của cuộc thi), trừ khi nhóm cần cho demo.

## 3. Đổi gì khi chuyển (chung cho mọi màn)

| Cũ | Mới |
| --- | --- |
| `import … from "@/shared/api/domain"` / `workflow` | Hàm trong `src/features/<x>/api.ts` theo `openapi.yaml` của service |
| Kiểu trong `features/<x>/types.ts` | Giữ; kiểu trả về khớp `openapi.yaml` |
| Test cũ cạnh màn (`*.test.tsx`) | Chép, đổi sang `renderWithApp` + MSW |
| CSS module của màn | Chép nguyên cạnh màn |
