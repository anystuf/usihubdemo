// Exact UI translations preserve IDs, values, data attributes and user input.
// WeakMap retains source strings so changing language never compounds translations.
const translations = {
  "Overview": "Tổng quan", "Overview Dashboard": "Bảng điều hành tổng quan",
  "UEH Innovation Platform": "Nền tảng đổi mới sáng tạo UEH",
  "Innovation Platform V2": "Nền tảng đổi mới sáng tạo V2",
  "Startups": "Startup", "Startup List": "Danh sách startup", "Startup list": "Danh sách startup",
  "Startup Detail": "Chi tiết startup", "Startup profile": "Hồ sơ startup",
  "UII Startup Directory": "Danh mục startup UII", "Public startup directory": "Danh mục startup công khai",
  "Explore UII startups": "Khám phá startup UII", "Published profiles": "Hồ sơ công khai",
  "Public profiles from UII. Investment stages reflect the source directory, not an assessment by USI Hub.": "Hồ sơ công khai từ UII. Giai đoạn đầu tư theo danh mục nguồn, không phải đánh giá của USI Hub.",
  "Search startups": "Tìm startup", "Search by name or description": "Tìm theo tên hoặc mô tả",
  "All industries": "Tất cả lĩnh vực", "All investment stages": "Tất cả giai đoạn đầu tư",
  "Investment stage": "Giai đoạn đầu tư", "Industry": "Lĩnh vực", "Location": "Địa điểm",
  "View UII profile": "Xem hồ sơ tại UII", "Source directory": "Danh mục nguồn",
  "Source: UII public startup directory": "Nguồn: Danh mục startup công khai của UII",
  "No startups match your filters.": "Không có startup phù hợp với bộ lọc.",
  "Reset filters": "Xóa bộ lọc", "Cohorts": "Khóa ươm tạo",
  "Logos": "Logo", "Directory": "Danh mục", "Profiles": "Hồ sơ",
  "Operational demo": "Bản demo vận hành", "Public UII profiles": "Hồ sơ công khai UII",
  "Cohort 2 2026": "Khóa 2 năm 2026", "Contacts": "Danh bạ", "UII Startup Directory": "Danh mục startup UII", "Ecosystem Hub": "Hệ sinh thái đổi mới sáng tạo", "Directory": "Danh mục", "Operations": "Vận hành", "All startup records": "Tất cả hồ sơ startup", "Assessed only": "Chỉ hồ sơ đã đánh giá", "Awaiting assessment": "Đang chờ đánh giá", "Not available": "Chưa có dữ liệu",
  "Incubation Tasks": "Công việc ươm tạo", "Incubation Worklist": "Danh sách công việc ươm tạo",
  "Task Detail": "Chi tiết công việc", "Knowledge Base": "Kho tri thức",
  "USI Intelligence": "Trợ lý USI", "View as:": "Vai trò:",
  "Internal incubation assistant": "Trợ lý ươm tạo nội bộ",
  "Ask about this platform...": "Hỏi về nền tảng này...",
  "Checking sources...": "Đang kiểm tra nguồn...",
  "Next:": "Tiếp theo:",
  "Could not answer:": "Không thể trả lời:",
  "USI Intelligence is available across the platform. Ask about a startup, support need, task, or source.": "Trợ lý USI hoạt động trên toàn nền tảng. Hãy hỏi về startup, nhu cầu hỗ trợ, công việc hoặc nguồn tài liệu.",
  "SGA (Startup Growth Associate)": "SGA (Chuyên viên hỗ trợ startup)",
  "Leader": "Lãnh đạo", "Mentor": "Cố vấn", "Founder": "Nhà sáng lập",
  "Notifications": "Thông báo", "Approvals": "Phê duyệt", "Settings": "Cài đặt",
  "Close": "Đóng", "Open": "Mở", "Menu": "Menu", "Loading": "Đang tải",
  "All cohorts": "Tất cả khóa", "All sectors": "Tất cả lĩnh vực",
  "Current demo dataset": "Dữ liệu minh họa hiện tại",
  "Total startups": "Tổng số startup", "At-risk startups": "Startup cần lưu ý",
  "Pending actions": "Việc chờ xử lý", "Open support tasks": "Việc hỗ trợ đang mở",
  "Documents indexed": "Tài liệu đã lập chỉ mục", "AI proposals": "Đề xuất AI",
  "View details →": "Xem chi tiết →", "Executive analytics": "Phân tích điều hành",
  "Signals for program coordination": "Thông tin hỗ trợ điều phối chương trình",
  "Risk distribution": "Phân bố rủi ro", "Stage distribution": "Phân bố giai đoạn",
  "Top support needs": "Nhu cầu hỗ trợ chính", "Document readiness": "Mức sẵn sàng của tài liệu",
  "Top priorities": "Ưu tiên hàng đầu", "Action required": "Cần xử lý",
  "Decision-support insights": "Thông tin hỗ trợ quyết định",
  "Open Intelligence →": "Mở trợ lý USI →", "Health ranking": "Xếp hạng tình trạng",
  "Startups needing support first": "Startup cần ưu tiên hỗ trợ",
  "Recent support tasks": "Công việc hỗ trợ gần đây", "Current work": "Công việc hiện tại",
  "Open worklist →": "Mở danh sách công việc →", "Open Startup OS →": "Mở danh sách startup →",
  "Health score": "Điểm tình trạng", "Health": "Tình trạng", "Risk": "Rủi ro",
  "Stage": "Giai đoạn", "Sector": "Lĩnh vực", "Cohort": "Khóa",
  "High": "Cao", "Medium": "Trung bình", "Low": "Thấp", "High risk": "Rủi ro cao",
  "Medium risk": "Rủi ro trung bình", "Low risk": "Rủi ro thấp",
  "Ready": "Sẵn sàng", "Queued": "Chờ xử lý", "Partial": "Một phần",
  "Lifecycle progress": "Tiến trình phát triển", "Ideation": "Hình thành ý tưởng",
  "Prototyping / MVP": "Nguyên mẫu / MVP", "PMF": "Phù hợp sản phẩm–thị trường",
  "Product–Channel Fit": "Phù hợp sản phẩm–kênh", "Growth": "Tăng trưởng",
  "Completed": "Đã hoàn thành", "Current stage": "Giai đoạn hiện tại", "Next gate": "Cột mốc tiếp theo",
  "Evidence-led view": "Thông tin có căn cứ", "Roadblocks & needs": "Trở ngại và nhu cầu",
  "What is blocking progress?": "Điều gì đang cản trở tiến độ?", "Risk reason": "Nguyên nhân rủi ro",
  "Missing data": "Dữ liệu còn thiếu", "Support needs": "Nhu cầu hỗ trợ",
  "Business metrics": "Chỉ số kinh doanh", "Stage-specific operating snapshot": "Chỉ số vận hành theo giai đoạn",
  "Not recorded": "Chưa ghi nhận", "Data gap": "Thiếu dữ liệu", "Recorded": "Đã ghi nhận",
  "Source not recorded": "Chưa ghi nhận nguồn", "Traction/context": "Kết quả và bối cảnh",
  "AI recommendation": "Khuyến nghị AI", "Suggested support path": "Hướng hỗ trợ đề xuất",
  "Ask USI Intelligence": "Hỏi trợ lý USI", "On-going supports": "Hỗ trợ đang triển khai",
  "Current incubation actions": "Hoạt động ươm tạo hiện tại", "Linked documents": "Tài liệu liên quan",
  "Last check-in": "Cập nhật gần nhất", "Sources": "Nguồn", "Evidence": "Bằng chứng",
  "Confidence": "Độ tin cậy", "Next actions": "Hành động tiếp theo", "Send": "Gửi",
  "AI Proposed Update": "Cập nhật do AI đề xuất", "Approve": "Phê duyệt", "Reject": "Từ chối",
  "Approved": "Đã phê duyệt", "Rejected": "Đã từ chối", "Human approval required": "Cần người phụ trách phê duyệt",
  "AI proposes. Humans decide.": "AI đề xuất. Con người quyết định.",
  "Sort by risk": "Sắp xếp theo rủi ro", "Lowest health first": "Điểm tình trạng thấp nhất trước",
  "Highest health first": "Điểm tình trạng cao nhất trước", "Name A-Z": "Tên A–Z",
  "Startup directory": "Danh mục startup", "Sector / cohort": "Lĩnh vực / khóa",
  "Search by name, sector, cohort, support need": "Tìm theo tên, lĩnh vực, khóa hoặc nhu cầu hỗ trợ",
  "No startups match the current filters.": "Không có startup phù hợp với bộ lọc hiện tại.",
  "Search, filter, and sort startups before opening a detailed operating profile.": "Tìm, lọc và sắp xếp startup trước khi mở hồ sơ vận hành chi tiết.",
  "AgTech": "Công nghệ nông nghiệp", "LegalTech": "Công nghệ pháp lý",
  "Digital Transformation": "Chuyển đổi số", "Health Care": "Chăm sóc sức khỏe",
  "Edtech": "Công nghệ giáo dục", "Ecommerce": "Thương mại điện tử",
  "Consumer": "Tiêu dùng", "Sport-tech Platform": "Công nghệ thể thao",
  "Idea": "Ý tưởng", "Angel": "Vốn thiên thần", "Seed": "Vốn hạt giống",
  "PreA": "Trước Series A", "HCMC": "TP. Hồ Chí Minh", "HN": "Hà Nội",
  "Hanoi": "Hà Nội", "Vinh Long, HCMC": "Vĩnh Long, TP. Hồ Chí Minh",
  "HCMC, HN": "TP. Hồ Chí Minh, Hà Nội", "HCMC & HN": "TP. Hồ Chí Minh và Hà Nội",
  "Startup operations": "Vận hành startup", "Startup list & operating profiles": "Danh sách và hồ sơ vận hành startup", "Search, filter, and sort operating records after reviewing the public UII directory.": "Tìm, lọc và sắp xếp hồ sơ vận hành sau khi xem danh mục UII công khai.", "Not assessed": "Chưa đánh giá", "risk": "rủi ro", "Current stage": "Giai đoạn hiện tại", "Stage is taken from the current startup record. “Not recorded” metrics are data gaps, not estimates.": "Giai đoạn được lấy từ hồ sơ startup hiện tại. Chỉ số “Chưa ghi nhận” là dữ liệu thiếu, không phải ước tính.", "No linked document metadata yet.": "Chưa có siêu dữ liệu tài liệu liên quan.", "Current KPI baseline": "Mốc KPI hiện tại", "Public UII profile; operational metrics have not yet been recorded in USI Hub.": "Hồ sơ UII công khai; các chỉ số vận hành chưa được ghi nhận trong USI Hub.", "Sustainable vegan leather made from upcycled mango peels for fashion and lifestyle brands.": "Da thuần chay bền vững từ vỏ xoài tái chế cho các thương hiệu thời trang và phong cách sống.", "AI-powered platform for automated data privacy management and compliance workflows.": "Nền tảng ứng dụng AI để tự động hóa quản lý quyền riêng tư và quy trình tuân thủ.", "NFC-enabled smart digital business cards and an AI-powered customer loyalty ecosystem.": "Danh thiếp kỹ thuật số tích hợp NFC và hệ sinh thái khách hàng thân thiết ứng dụng AI.", "AI solutions for medical imaging and histopathological analysis to improve diagnostic accuracy and speed.": "Giải pháp AI cho hình ảnh y khoa và phân tích mô bệnh học nhằm nâng cao độ chính xác và tốc độ chẩn đoán.", "AI-powered job simulation experiences for practical learning, hiring, and workforce development.": "Trải nghiệm mô phỏng công việc ứng dụng AI cho học tập thực hành, tuyển dụng và phát triển nhân lực.", "Collect the first USI Hub operating check-in and evidence set.": "Thu thập lần cập nhật vận hành và bộ bằng chứng đầu tiên trên USI Hub.",
  "Public UII profile; assessment is required before risk decisions.": "Hồ sơ UII công khai; cần đánh giá trước khi đưa ra quyết định về rủi ro.", "USI Hub operating check-in": "Cập nhật vận hành trên USI Hub", "Problem clarity": "Mức độ rõ ràng của vấn đề", "Customer evidence": "Bằng chứng khách hàng", "Solution hypothesis": "Giả thuyết giải pháp", "Next experiment": "Thử nghiệm tiếp theo", "Defined in startup summary": "Đã nêu trong tóm tắt startup", "Described in startup summary": "Đã mô tả trong tóm tắt startup", "Recorded": "Đã ghi nhận", "Data gap": "Thiếu dữ liệu", "No interview evidence linked": "Chưa có bằng chứng phỏng vấn liên kết", "Startup profile": "Hồ sơ startup", "Recommended next action": "Hành động tiếp theo đề xuất", "No startup selected. Open the Startup List and choose a startup first.": "Chưa chọn startup. Hãy mở Danh sách startup và chọn một startup trước.",
  "Request evidence for:": "Yêu cầu bằng chứng cho:",
  "Proposal": "Đề xuất", "Plan": "Kế hoạch", "Cohort data": "Dữ liệu khóa", "CSV": "CSV", "Roadmap": "Lộ trình", "Pitch deck": "Pitch deck", "Slides": "Slide", "Platform vision, operating model, and stakeholder reporting.": "Tầm nhìn nền tảng, mô hình vận hành và báo cáo các bên liên quan.", "Cohort document tracking and data completeness.": "Theo dõi tài liệu khóa và mức độ đầy đủ dữ liệu.", "Good metadata; full text pending RAG pipeline": "Siêu dữ liệu tốt; toàn văn đang chờ quy trình RAG", "Source not recorded": "Chưa ghi nhận nguồn", "Platform": "Nền tảng", "Cohort": "Khóa", "Program": "Chương trình", "Program team": "Đội ngũ chương trình", "Operations": "Vận hành", "Investor connection": "Kết nối nhà đầu tư", "Prepare traction narrative, customer segment, and partnership ask before warm introductions.": "Chuẩn bị câu chuyện kết quả, phân khúc khách hàng và nhu cầu hợp tác trước khi kết nối giới thiệu.", "Added during demo.": "Được thêm trong bản demo.", "Workshops, investor connections, expert support, partner outreach, and data governance.": "Workshop, kết nối nhà đầu tư, hỗ trợ chuyên gia, tiếp cận đối tác và quản trị dữ liệu.",
  "USI learning library": "Thư viện học tập USI", "Knowledge Base": "Kho tri thức", "Browse curated playbooks, startup evidence, and program resources.": "Khám phá playbook, bằng chứng startup và tài nguyên chương trình đã chọn lọc.", "resources": "tài nguyên", "Featured resources": "Tài nguyên nổi bật", "Total sources": "Tổng số nguồn", "Tracked source metadata for USI Intelligence": "Siêu dữ liệu nguồn đang được theo dõi cho Trợ lý USI", "Ready metadata": "Siêu dữ liệu sẵn sàng", "Can be cited in demo answers": "Có thể trích dẫn trong câu trả lời demo", "Startup-linked": "Liên kết startup", "Roadmaps and pitch evidence": "Bằng chứng từ lộ trình và pitch", "Search documents, startup, type, or tag": "Tìm tài liệu, startup, loại hoặc thẻ", "All types": "Tất cả loại", "All index status": "Tất cả trạng thái lập chỉ mục", "All startups": "Tất cả startup", "Upload placeholder": "Khu vực tải tài liệu", "Document upload disabled": "Tải tài liệu đang tắt", "Later this will upload to Firebase Storage, create a Firestore document record, and queue indexing through Cloud Functions.": "Sau này tài liệu sẽ được tải lên Firebase Storage, tạo bản ghi tài liệu trong Firestore và đưa vào hàng đợi lập chỉ mục qua Cloud Functions.", "Indexing rule": "Quy tắc lập chỉ mục", "Every source should store type, owner, linked startup, tags, permission level, indexed status, and extraction quality.": "Mỗi nguồn cần lưu loại, người phụ trách, startup liên kết, thẻ, cấp quyền, trạng thái lập chỉ mục và chất lượng trích xuất.", "Evidence standard": "Tiêu chuẩn bằng chứng", "USI Intelligence should cite document title, startup, confidence, missing data, and whether full text has been extracted.": "Trợ lý USI cần nêu tên tài liệu, startup, độ tin cậy, dữ liệu thiếu và trạng thái trích xuất toàn văn.", "USI Intelligence tool action": "Tác vụ công cụ Trợ lý USI", "Approved Intelligence proposals can add reviewed AI notes here. Production version should write proposed documents to Firestore, not directly index them.": "Đề xuất AI đã được duyệt có thể thêm ghi chú đã rà soát tại đây. Bản production nên ghi tài liệu đề xuất vào Firestore thay vì lập chỉ mục trực tiếp.", "Firestore demo seed": "Tạo dữ liệu demo Firestore", "Run this from local server mode to create demo collections in Firestore.": "Chạy thao tác này từ chế độ máy chủ local để tạo các collection demo trong Firestore.", "Seed Firestore": "Tạo dữ liệu Firestore", "Seeding Firestore demo collections...": "Đang tạo collection demo trong Firestore...", "Done. Refresh Firebase Console to see collections.": "Hoàn tất. Tải lại Firebase Console để xem các collection.", "Seed failed:": "Tạo dữ liệu thất bại:", "Source:": "Nguồn:", "Evidence use:": "Mục đích sử dụng bằng chứng:", "Extraction:": "Trích xuất:", "Ask USI Intelligence": "Hỏi Trợ lý USI", "Summarize": "Tóm tắt", "Risk Signals": "Tín hiệu rủi ro",
  "AI decision support": "Hỗ trợ quyết định bằng AI", "Turn startup, cohort, task, and knowledge records into an evidence-led next action.": "Chuyển dữ liệu startup, khóa, công việc và tri thức thành hành động tiếp theo có căn cứ.", "Evidence first": "Ưu tiên bằng chứng", "Sources shown": "Hiển thị nguồn", "Human approval required": "Cần người phụ trách phê duyệt", "Ask about cohort risk, mentor needs, growth options, missing data, support matching, or a meeting brief. I will answer with evidence and propose actions for human approval only.": "Hỏi về rủi ro khóa, nhu cầu cố vấn, phương án tăng trưởng, dữ liệu thiếu, kết nối hỗ trợ hoặc tóm tắt cuộc họp. Tôi sẽ trả lời có bằng chứng và chỉ đề xuất hành động để người phụ trách phê duyệt.", "Ask USI Intelligence...": "Hỏi Trợ lý USI...", "USI Intelligence prompts": "Gợi ý cho Trợ lý USI", "USI Intelligence is checking sources": "Trợ lý USI đang kiểm tra nguồn", "USI Intelligence is available across the platform. Ask about a startup, support need, task, or source.": "Trợ lý USI hoạt động trên toàn nền tảng. Hãy hỏi về startup, nhu cầu hỗ trợ, công việc hoặc nguồn tài liệu.", "Which startup is at risk?": "Startup nào đang có rủi ro?", "What mentor does Venture Alpha need?": "Venture Alpha cần cố vấn nào?", "How can Venture Epsilon grow?": "Venture Epsilon có thể tăng trưởng thế nào?", "Generate Venture Beta brief": "Tạo tóm tắt Venture Beta", "What data is missing for Venture Gamma?": "Venture Gamma còn thiếu dữ liệu gì?", "Who should support Venture Zeta?": "Ai nên hỗ trợ Venture Zeta?", "Send": "Gửi",
  "Task detail": "Chi tiết công việc", "No task selected. Open the Incubation Worklist and choose a task.": "Chưa chọn công việc. Hãy mở Danh sách công việc ươm tạo và chọn một công việc.", "Update task": "Cập nhật công việc", "Owner": "Người phụ trách", "Due date": "Ngày đến hạn", "Status": "Trạng thái", "Progress": "Tiến độ", "Notes": "Ghi chú", "Back to worklist": "Quay lại danh sách công việc", "Save changes": "Lưu thay đổi", "Planned": "Đã lên kế hoạch", "Next": "Tiếp theo", "In progress": "Đang thực hiện", "Done": "Hoàn tất", "Saved locally": "Đã lưu local", "Reset demo": "Đặt lại demo", "Demo tasks reset": "Đã đặt lại công việc demo", "Task added locally": "Đã thêm công việc local",
  "Switch language": "Chuyển ngôn ngữ", "USI Hub Dashboard": "Bảng điều hành USI Hub", "See cohort status, address priority work, and use evidence-informed signals to coordinate next steps.": "Theo dõi tình trạng khóa, xử lý công việc ưu tiên và sử dụng tín hiệu có căn cứ để điều phối bước tiếp theo.",
  "Reporting period": "Kỳ báo cáo", "Reporting period selection will be available when dated snapshots are connected.": "Lựa chọn kỳ báo cáo sẽ khả dụng khi kết nối dữ liệu theo thời điểm.",
  "Assessment status": "Trạng thái đánh giá", "Active profiles in this view": "Hồ sơ đang hoạt động trong chế độ xem này", "Require human review": "Cần người phụ trách xem xét", "Missing data and follow-up": "Dữ liệu thiếu và việc cần theo dõi", "Worklist items not done": "Công việc chưa hoàn tất", "9 records tracked": "9 bản ghi đang theo dõi", "Awaiting human approval": "Đang chờ người phụ trách phê duyệt", "View details": "Xem chi tiết",
  "Average health": "Điểm tình trạng trung bình", "public profile(s) awaiting assessment": "hồ sơ công khai đang chờ đánh giá", "Unassessed": "Chưa đánh giá", "Review at-risk startups": "Xem xét startup có rủi ro", "High-risk cases need SGA or Leader attention.": "Các trường hợp rủi ro cao cần SGA hoặc lãnh đạo chú ý.", "Resolve open support tasks": "Xử lý công việc hỗ trợ đang mở", "Prioritize founder support and mentor follow-up.": "Ưu tiên hỗ trợ nhà sáng lập và theo dõi cố vấn.", "Complete document records": "Hoàn thiện hồ sơ tài liệu", "Metadata or extraction remains incomplete.": "Siêu dữ liệu hoặc việc trích xuất vẫn chưa hoàn tất.", "Review AI proposals": "Xem xét đề xuất AI", "Human approval is required before updates.": "Cần người phụ trách phê duyệt trước khi cập nhật.",
  "Highest-risk cluster": "Nhóm rủi ro cao nhất", "Venture Beta, Venture Gamma, and Venture Zeta show high-risk signals because key validation data is still missing.": "Venture Beta, Venture Gamma và Venture Zeta có tín hiệu rủi ro cao vì còn thiếu dữ liệu kiểm chứng quan trọng.", "Recommended next step:": "Bước tiếp theo đề xuất:", "Schedule focused validation reviews before using any score for decisions.": "Lên lịch phiên kiểm chứng tập trung trước khi dùng điểm số để ra quyết định.", "Vietnam-context USP": "Lợi thế trong bối cảnh Việt Nam", "Future analysis should combine startup data with Vietnam regulation, buyer behavior, local mentors, grants, and ecosystem access.": "Phân tích tiếp theo nên kết hợp dữ liệu startup với quy định Việt Nam, hành vi người mua, cố vấn địa phương, chương trình hỗ trợ và kết nối hệ sinh thái.", "Add Vietnam context tags to every document and mentor profile.": "Thêm nhãn bối cảnh Việt Nam cho từng tài liệu và hồ sơ cố vấn.", "Human approval rule": "Quy tắc phê duyệt của con người", "USI Intelligence should only propose updates. SGAs or leaders approve changes before dashboard data is updated.": "USI Intelligence chỉ đề xuất cập nhật. SGA hoặc lãnh đạo phê duyệt trước khi dữ liệu bảng điều hành thay đổi.", "Design proposed-update workflow before Firebase write access.": "Thiết kế quy trình cập nhật đề xuất trước khi cấp quyền ghi Firebase.", "Risk scores are triage signals, not final decisions about support, funding, or startup status.": "Điểm rủi ro chỉ là tín hiệu phân loại ưu tiên, không phải quyết định cuối cùng về hỗ trợ, vốn hoặc trạng thái startup.",
  "Signals for program coordination": "Thông tin hỗ trợ điều phối chương trình", "Market validation": "Kiểm chứng thị trường", "Beta launch": "Ra mắt beta", "Growth roadmap": "Lộ trình tăng trưởng", "Launch / early growth": "Ra mắt / tăng trưởng sớm", "Pitch / roadmap": "Pitch / lộ trình", "MVP": "MVP", "Pitch": "Pitch", "Current work": "Công việc hiện tại", "Due": "Hạn", "Open Intelligence": "Mở trợ lý USI", "Open Startup OS": "Mở danh sách startup", "Open worklist": "Mở danh sách công việc", "Pilot permission workshop": "Workshop về giấy phép thử nghiệm", "Validation sprint planning": "Lập kế hoạch sprint kiểm chứng", "Investor readiness review": "Rà soát mức sẵn sàng với nhà đầu tư", "Venue partner outreach": "Tiếp cận đối tác địa điểm", "Medical validation advisory session": "Phiên tư vấn kiểm chứng y tế", "Medical validation": "Kiểm chứng y tế", "B2B partnerships": "Đối tác B2B", "sustainable materials": "Vật liệu bền vững", "market expansion": "Mở rộng thị trường", "not scheduled": "chưa lên lịch", "STARTUP": "STARTUP", "HEALTH SCORE": "ĐIỂM TÌNH TRẠNG", "RISK": "RỦI RO", "STAGE": "GIAI ĐOẠN", "Pitch deck": "Bộ pitch", "Resource": "Tài nguyên", "Evidence use:": "Mục đích sử dụng bằng chứng:", "Extraction:": "Trích xuất:", "startup(s) need review": "startup cần xem xét", "Human review required": "Cần người phụ trách xem xét", "Missing data": "Dữ liệu còn thiếu", "Next action": "Hành động tiếp theo", "Risk reason not recorded.": "Chưa ghi nhận nguyên nhân rủi ro.", "None recorded": "Chưa ghi nhận", "No high-risk startups in this view.": "Không có startup rủi ro cao trong chế độ xem này.", "tasks grouped by startup": "công việc được nhóm theo startup", "Worklist view": "Chế độ xem danh sách công việc", "open task(s)": "công việc đang mở", "No open support tasks.": "Không có công việc hỗ trợ đang mở.", "Open support tasks": "Việc hỗ trợ đang mở"
};

let language = "en";
try { language = localStorage.getItem("usiHubLanguage") === "vi" ? "vi" : "en"; } catch {}
const originals = new WeakMap();
const attributes = new WeakMap();
export const getLanguage = () => language;
export function addTranslations(entries) { Object.assign(translations, entries); }
export function translate(value) { return language === "vi" ? (translations[value] || value) : value; }

function localize(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement?.closest('script, style, textarea, [contenteditable], [translate="no"]')) continue;
    const old = originals.get(node);
    const source = old && node.nodeValue === old.rendered ? old.source : node.nodeValue;
    const trimmed = source.trim();
    const rendered = source.replace(trimmed, translate(trimmed));
    originals.set(node, { source, rendered });
    if (node.nodeValue !== rendered) node.nodeValue = rendered;
  }
  root.querySelectorAll?.("[placeholder], [aria-label], [title]").forEach(el => {
    const saved = attributes.get(el) || {};
    for (const name of ["placeholder", "aria-label", "title"]) {
      if (!el.hasAttribute(name)) continue;
      const current = el.getAttribute(name);
      const source = saved[name]?.rendered === current ? saved[name].source : current;
      const rendered = translate(source);
      saved[name] = { source, rendered };
      if (current !== rendered) el.setAttribute(name, rendered);
    }
    attributes.set(el, saved);
  });
}

export function initLanguage() {
  const observer = new MutationObserver(() => refresh());
  function refresh() {
    observer.disconnect();
    document.documentElement.lang = language;
    localize(document.body);
    const button = document.querySelector("#language-switch");
    if (button) {
      button.textContent = language === "vi" ? "EN" : "Tiếng Việt";
      button.setAttribute("aria-label", language === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt");
    }
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  document.querySelector("#language-switch")?.addEventListener("click", () => {
    language = language === "vi" ? "en" : "vi";
    try { localStorage.setItem("usiHubLanguage", language); } catch {}
    refresh();
    window.dispatchEvent(new Event("languageChanged"));
  });
  refresh();
}
