# Startup Growth Workspace — audit và kế hoạch tích hợp

Ngày audit: 13/10/2026. Trạng thái: audit code; chưa triển khai task tích hợp này.

## Nguồn và phạm vi

Yêu cầu: file pasted text 0986da75-4bd5-4fc4-8181-c6274bb47240 do người dùng cung cấp. Reference: `usi_hub_growth_workspace_prototype (1).html`. Prototype chỉ làm tham chiếu bố cục/tương tác; không import sample startup, goal, task, session và không dùng iframe.

Phân công đã xác nhận trong task: Worklist — Nguyễn + Trường; Growth Session/Roadmap — Nguyễn + Danz. W01–W06/G01–G06 là đề xuất cần review. Chưa đọc trực tiếp bảng Google Sheet; không suy thêm PIC từ bảng đó.

## Repository và deployment đã xác định

- Repo: `anystuf/usihubdemo`.
- Checkout Render: `usi-hub-platform-v2.worktrees/continue-conversation-flow`; branch `agents/continue-conversation-flow`.
- Cấu hình `render.yaml`: Node web service, `npm install`, `node server/localServer.js`, health `/health`.
- Lần triển khai trước trong phiên đã xác nhận branch push phản ánh lên `usihubdemo.onrender.com`. Chưa đọc cấu hình trong Render Dashboard ở audit này.
- Checkout `usi-hub-platform-v2` / branch `main` dùng GitHub Pages để publish `public/`; không được suy hai deployment luôn cùng revision.
- Kiến trúc: vanilla ES modules, hash router trong `public/js/app.js`, CSS tokens/component classes, Node HTTP backend.
- Render có endpoint AI; backend hiện chưa có endpoint nghiệp vụ Growth hoặc xác minh Firebase ID token.
- Task mới yêu cầu duyệt trước thay đổi schema/quyền/deployment không thể đảo ngược. Không deploy trong bước audit.

## Gap analysis

| Khả năng | Hiện trạng | Gap / xung đột | Hướng tích hợp |
|---|---|---|---|
| Startup master | Đã có: `dataService`, Startup OS và Firestore read/fallback | Demo trộn nguồn fallback; không được dùng tên làm khóa ghi production | Dùng startupId đã tồn tại; xác nhận nguồn master trước ghi |
| W01/W02 task create/update | Một phần: `projectBoard`, `platformActionService`, task detail | Owner là text, lưu local, chưa có lịch sử thay đổi task đầy đủ | Mở rộng module hiện tại; thêm UID, timestamps, change log |
| W03 startup worklist | Một phần: lọc tên startup và Operating History | Cần khóa ID và cùng tập task giữa các view | Chuẩn hóa adapter; một task ID, không tạo board thứ hai |
| W04 personal SGA queue | Thiếu | Lọc owner trên giao diện không có quyền truy cập | Backend query trong phạm vi startup được giao và UID owner |
| W05 action integration | Một phần: session → task trong `mvpService` | Task chưa lưu đầy đủ sessionId/milestoneId; task tồn tại ở workspace và legacy storage | Production chỉ dùng một collection task; nối các FK |
| W06 task follow-up | Một phần: status, notes; Blocked/Done có thể không có note | Thiếu actor UID, completion rationale, audit | Transition validation trên server; note khi Blocked/Done |
| G01 session log | Một phần: title/date/owner/notes/source | Chưa tách issue/supportNeed/agreedAction/participants | Mở rộng session entity hiện có |
| G02 roadmap links | Một phần: `milestones`, session.milestoneId và kiểm tra cùng startup | Milestones hiện local; cần xác nhận entity roadmap chính thức | Reuse milestoneId; không tạo goal seed từ HTML |
| G03 issue/support need | Thiếu trường có cấu trúc | Notes tự do chưa đáp ứng truy vết | Nhúng trường vào session ở MVP; chưa cần collection riêng |
| G04 session + action task | Một phần: hai thao tác thủ công; atomic local workspace write | Chưa có transaction backend, idempotency token từ submit | Transaction session/task/audit; một token tạo đúng một task |
| G05 independent outcome | Thiếu | Milestone.outcome text không phải follow-up record; task Done không chứng minh outcome | Record riêng gắn startup/session/task, date, actor, type, text, evidence |
| G06 support timeline | Một phần: Operating History | Chưa có timeline xuyên session → action → follow-up/outcome | Đọc các entity hiện có, sắp theo event date, giữ nguồn |
| Authorization | Xung đột yêu cầu mới | `getAuth` được khởi tạo nhưng `requireAuthPlaceholder` trả demo user. Role trong localStorage. `publicDemoRead()` trả true cho startup/projectTasks; `isStaff` vượt phạm vi startup | Firebase Auth + server UID/claim checks, assignment scope; không xem role selector là quyền |
| Refresh / shared persistence | Chỉ đạt single-browser demo | `usiHubMvpV1` và `usiHubProjectTasks`; không đồng bộ thiết bị/người dùng | API repository qua Firestore; demo mode tách rõ, không fallback riêng tư sang fixtures |
| Tests | Có 10 workflow tests từ cập nhật trước | Không đủ để chứng minh authorization hoặc 6-view browser flow | Thêm auth/transaction/relationship tests và browser evidence |

Reference prototype có một lỗi cần tránh: pending-follow-up loại session có task Completed dù chưa có outcome. Số pending outcome phải dựa trên outcome/follow-up cần ghi, độc lập task status.

## Kế hoạch module/UI

Một route native `#startup-growth` làm trang phối hợp, giữ shell/nav/theme/VI–EN. Sáu tab nội bộ:

1. Overview: counts từ bản ghi người dùng được phép xem; không thêm KPI/health giả.
2. Worklist & To-do: tái sử dụng renderer/form/service của worklist; link task detail hiện có.
3. Growth Sessions: form issue → support need → agreed action; chọn startup/milestone hiện có; tùy chọn tạo task cùng lần lưu.
4. Growth Roadmap: đọc milestone hiện có và lịch sử liên quan; chuyển về editor hiện có khi cần đổi mục tiêu.
5. Follow-up & Outcome: tạo observation/partial/not-yet-achieved độc lập; evidence optional; không tự sửa task/milestone status.
6. Feature Breakdown: tài liệu W/G trong panel optional, ghi rõ proposed; không đưa vào critical workflow.

Startup Detail và Worklist link route này với startupId; giữ startup scope khi chuyển view. `mvp-operations` dẫn tới cùng session/milestone records; không duy trì hai implementation tạo session khác nhau.

## Data/API proposal — chưa duyệt

Giữ `startups` và `projectTasks`. Xác nhận sử dụng `mentorSessions` hiện có cho GrowthSession hay collection session khác trước ghi. Milestone chưa thấy production entity riêng trong code audit; đề nghị canonical roadmap milestone collection được duyệt thay vì tự import prototype goals.

Trường mở rộng đề xuất:

- Task: startupId, programId, assigneeUid, title, description, nextStep, due, status, priority, sourceSessionId, milestoneId, createdByUid, createdAt, updatedAt.
- Session: startupId, programId, milestoneId optional, facilitatorUid, participants, date, title, issue, supportNeed, agreedAction, notes, taskId optional, timestamps.
- Outcome: startupId, sessionId, taskId optional, date, type, observation, evidence optional, recordedByUid, timestamps. Có thể dùng subcollection của session; chọn theo reporting nhu cầu.
- Audit: actorUid, entityId, action, previous/new values, server timestamp. Client không được giả actor/time.

API shape đề xuất: authorized GET growth scope; POST session-with-action; PATCH task; POST session outcome. Server xác minh Bearer Firebase ID token; đọc claims/assignment từ nguồn tin cậy. POST session-with-action dùng transaction và idempotency key. Reject startup/milestone/session/task không cùng startup, không trả dữ liệu ngoài quyền.

Không tự migrate dữ liệu local hoặc rename collection. Import chỉ sau đối chiếu nguồn, preview và duyệt; không xóa các storage key cũ để giữ khả năng phục hồi.

## Các quyết định cần xác nhận

1. Firebase Auth là identity provider được dùng tiếp; cách đăng nhập và người quản trị cấp claims/assignment UID.
2. Quyền SGA: chỉ startup được giao; leader có phạm vi program nào; founder/mentor được xem phần nào của session/outcome. Không dùng toàn bộ isStaff như hiện tại.
3. Canonical session/milestone source và quy tắc migrate local demo; session có nhiều action hay chỉ một action được chọn tạo task trong lần lưu đầu.
4. Outcome là quan sát do ai được ghi/xác nhận; chưa tự coi Recorded là success hay stage advancement.
5. Nguyễn–Trường review owner/queue/task transitions; Nguyễn–Danz review goal/issue/support need/outcome definitions.

## Vertical slices và nghiệm thu

| Slice | Nội dung reviewable | Điều kiện pass |
|---|---|---|
| A | UI native/read adapter và W/G mapping, dùng existing records | 6 view render; không nhân startup/goal/task; legacy routes giữ hoạt động |
| B | Authenticated scope + server validation/repository | Unauthenticated 401; ngoài scope 403/không trả record; SGA chỉ permitted startup/tasks |
| C | Structured session + linked action | Transaction atomic; submit lại cùng idempotency key không tạo trùng; FK đúng startup |
| D | Follow-up/outcome + traceable history | Task Done không đổi outcome; date/actor/evidence giữ qua refresh; startup/detail/queue cùng task |
| E | Browser QA và bàn giao | Screenshots desktop/mobile, VI/EN, navigation/refresh, forms/error states; ghi tests thực chạy |

Chạy syntax/check script hiện có, unit/integration và emulator authorization tests khi có backend. Repo không có TypeScript/build/lint pipeline; ghi N/A thay vì nói các check đó đã pass. Chưa chạy browser hoặc authorization tests trong bước audit này.

Chỉ commit sau khi có slice reviewable. HKTT ghi actual commit date/hash, files và tests thực chạy; không ghi planned work là completed. Audit này chưa có commit, chưa đổi API/schema/rules hoặc deploy.
