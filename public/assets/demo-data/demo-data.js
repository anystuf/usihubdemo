export const demoData = {
  metrics: [
    { label: "Total startups", value: "9", note: "2025 reference cohort plus demo additions" },
    { label: "At-risk startups", value: "3", note: "Needs human review before any decision" },
    { label: "Pending actions", value: "18", note: "Mentor, document, and validation tasks" },
    { label: "Mentor sessions", value: "24", note: "Demo count for program health" },
    { label: "Documents indexed", value: "31", note: "Roadmaps, pitch decks, cohort docs" },
    { label: "AI insights", value: "12", note: "Mock recommendations only" }
  ],
  startups: [
    {
      id: "skyholic",
      name: "Skyholic",
      cohort: "IP 2025",
      stage: "PoC / MVP",
      sector: "AI / UAV",
      risk: "Medium",
      health: 68,
      founderNeed: "Regulatory guidance, pilot partner, B2B/government sales mentor",
      summary: "VTOL UAV concept for mapping, agriculture, rescue, logistics, and environmental monitoring with future AI dashboard potential.",
      traction: "Technical roadmap and pitch material available; validation depends on permissioned pilot testing.",
      nextAction: "Prepare a controlled pilot brief with risk assessment, use case, partner value, and legal checklist.",
      sources: ["[Skyholic - IP 2025] Incubatee Growth-Roadmap.pdf", "Pitching desk UII_skyholic.pptx.pdf"],
      tags: ["UAV", "AI dashboard", "regulated market", "pilot validation"],
      missingData: ["Confirmed pilot partner", "UAV flight permission path", "Customer willingness-to-pay evidence"]
    },
    {
      id: "niion",
      name: "NIION",
      cohort: "IP 2025",
      stage: "Market validation",
      sector: "Agritech / Clean energy",
      risk: "High",
      health: 56,
      founderNeed: "Product focus, unit economics, brand positioning, Vietnam GTM",
      summary: "Biomass product concept using agricultural waste with green positioning and potential rural supply chain relevance.",
      traction: "Growth roadmap available; needs tighter product line and market focus.",
      nextAction: "Choose one hero product and run a 30-day validation sprint with margin, buyer, and supply assumptions.",
      sources: ["[NIION] Incubatee Growth-Roadmap.pdf"],
      tags: ["biomass", "circular economy", "R&D focus", "Vietnam agriculture"],
      missingData: ["Unit economics", "Target buyer segment", "Supply stability", "Regulatory constraints"]
    },
    {
      id: "onto",
      name: "Onto",
      cohort: "IP 2025",
      stage: "Beta launch",
      sector: "Sports platform",
      risk: "High",
      health: 60,
      founderNeed: "Venue onboarding, marketplace model, UI/UX, local sports community access",
      summary: "Sports ecosystem connecting players, venues, teams, coaches, referees, and tournaments.",
      traction: "Roadmap available; early viability depends on venue supply and repeat user behavior.",
      nextAction: "Validate with 10-15 venues and measure bookings, repeat use, churn, and event participation.",
      sources: ["[Onto - IP 2025] Incubatee Growth-Roadmap.pdf"],
      tags: ["marketplace", "sports", "venue supply", "community"],
      missingData: ["Venue commitment", "Monthly active users", "Churn", "Revenue model"]
    },
    {
      id: "vizion",
      name: "Vizion",
      cohort: "IP 2025",
      stage: "Growth roadmap",
      sector: "Technology",
      risk: "Medium",
      health: 66,
      founderNeed: "Clear ICP, milestone reporting, mentor fit",
      summary: "Startup with a dedicated incubatee growth-roadmap source in the 2025 reference set.",
      traction: "Roadmap file available; detailed performance should be reviewed before operational decisions.",
      nextAction: "Convert roadmap milestones into weekly measurable tasks and assign SGA follow-up.",
      sources: ["_[Vizion - IP 2025] Incubatee Growth-Roadmap.pdf"],
      tags: ["roadmap", "milestones", "mentor matching"],
      missingData: ["Sector details", "Current KPI baseline", "Mentor session notes"]
    },
    {
      id: "ecombox",
      name: "Ecombox",
      cohort: "IP 2025",
      stage: "Launch / early growth",
      sector: "Ecommerce SaaS",
      risk: "Low",
      health: 82,
      founderNeed: "Growth marketing, customer success, affiliate channels, AI tracking positioning",
      summary: "Ecommerce packing and order-control solution with pitch material under goihangchuan.vn reference.",
      traction: "Roadmap and pitch source available; strong candidate for growth and customer-success playbooks.",
      nextAction: "Package onboarding, segment customers by order volume, and build partner-led acquisition.",
      sources: ["[Ecombox] Incubatee Growth-Roadmap.pdf", "goihangchuan.vn pitch.pptx.pdf"],
      tags: ["ecommerce", "SaaS", "operations", "customer success"],
      missingData: ["Current active stores", "Monthly recurring revenue", "Support load", "Conversion rate"]
    },
    {
      id: "emergeniz",
      name: "EmerGeniZ",
      cohort: "IP 2025",
      stage: "PoC / MVP",
      sector: "HealthTech / MedTech",
      risk: "High",
      health: 62,
      founderNeed: "Medical validation, customer discovery, legal/IP, focused target segment",
      summary: "CPR training and emergency-assistance concept using sensors and machine learning for feedback.",
      traction: "Growth roadmap available; requires expert validation and careful medical/legal framing.",
      nextAction: "Interview medical trainers, schools, and corporate safety teams to identify the fastest buyer.",
      sources: ["[EmerGeniZ - IP 2025] Incubatee Growth-Roadmap.pdf"],
      tags: ["healthtech", "CPR", "validation", "IP"],
      missingData: ["Clinical validation", "Target customer", "IP ownership", "Regulatory path"]
    },
    {
      id: "air-mattress",
      name: "Air Mattress",
      cohort: "IP 2025",
      stage: "Pitch / roadmap",
      sector: "Consumer product",
      risk: "Medium",
      health: 64,
      founderNeed: "Manufacturing plan, product-market fit, pricing, distribution channels",
      summary: "Consumer product startup with roadmap and pitch deck references in the source folder.",
      traction: "Roadmap and draft pitch deck available for review.",
      nextAction: "Define prototype validation criteria and compare direct-to-consumer vs channel distribution.",
      sources: ["[Air Matterss - IP 2025] Incubatee Growth-Roadmap.pdf", "Airr Mattress - Pitch deck - Draft 2.0.pdf"],
      tags: ["consumer product", "prototype", "distribution"],
      missingData: ["BOM", "Prototype testing", "Target price", "Distribution plan"]
    },
    {
      id: "study-cake",
      name: "Study Cake",
      cohort: "IP 2025",
      stage: "MVP",
      sector: "EdTech / AI",
      risk: "Medium",
      health: 72,
      founderNeed: "Target segment, user testing, learning outcomes, differentiation",
      summary: "AI-personalized language learning concept with gamification and mentor/teacher support potential.",
      traction: "Growth roadmap template/source available; market is crowded and needs clear positioning.",
      nextAction: "Run user tests with one narrow learner segment and compare retention against existing habits.",
      sources: ["Study Cake - Incubatee Growth-Roadmap-Template_V02.pdf"],
      tags: ["edtech", "AI learning", "gamification", "retention"],
      missingData: ["Retention", "Learning outcome proof", "Target learner", "Pricing"]
    },
    {
      id: "vocake",
      name: "Vocake",
      cohort: "IP 2025",
      stage: "Pitch",
      sector: "Food / Consumer",
      risk: "Medium",
      health: 67,
      founderNeed: "Market positioning, channel testing, production planning",
      summary: "Food/consumer startup with pitch deck reference available in the source folder.",
      traction: "Pitch deck available; needs conversion from pitch story into measurable incubation milestones.",
      nextAction: "Map pitch assumptions to customer, margin, production, and distribution validation tasks.",
      sources: ["Vocake Pitch Deck.pdf"],
      tags: ["food", "consumer", "pitch", "market testing"],
      missingData: ["Current sales", "COGS", "Distribution partners", "Repeat purchase"]
    }
  ],
  aiInsights: [
    {
      title: "Highest-risk cluster",
      body: "NIION, Onto, and EmerGeniZ show high-risk signals because key validation data is still missing.",
      action: "Schedule focused validation reviews before using any score for decisions."
    },
    {
      title: "Vietnam-context USP",
      body: "Future analysis should combine startup data with Vietnam regulation, buyer behavior, local mentors, grants, and ecosystem access.",
      action: "Add Vietnam context tags to every document and mentor profile."
    },
    {
      title: "Human approval rule",
      body: "USI Brain should only propose updates. SGAs or leaders approve changes before dashboard data is updated.",
      action: "Design proposed-update workflow before Firebase write access."
    }
  ],
  projectTasks: [
    { title: "Source inventory and README", assignee: "Platform team", due: "2026-06-13", status: "Done", progress: 100 },
    { title: "Static prototype shell", assignee: "Product", due: "2026-06-14", status: "In progress", progress: 80 },
    { title: "Firebase schema draft", assignee: "Data/IT", due: "2026-06-18", status: "Next", progress: 20 },
    { title: "RAG source permissions map", assignee: "SGA lead", due: "2026-06-21", status: "Next", progress: 15 },
    { title: "Founder demo feedback round", assignee: "Program team", due: "2026-06-24", status: "Planned", progress: 0 },
    { title: "Human approval workflow design", assignee: "Leadership + SGA", due: "2026-06-26", status: "Planned", progress: 0 }
  ],
  documents: [
    { title: "Innovation Platform Proposal", type: "Proposal", startup: "Platform", tags: ["strategy", "IP", "commercialization"], indexed: "Ready", source: "Innovation Platform Proposal.pdf" },
    { title: "High-level Plan", type: "Plan", startup: "Platform", tags: ["roadmap", "scope"], indexed: "Ready", source: "[Innovation Platform] High-level Plan.docx.pdf" },
    { title: "Cohort 1 2026 Incubatees", type: "Cohort data", startup: "Cohort", tags: ["startup list", "documents"], indexed: "Partial", source: "Cohort 1_2026 Incubatees.xlsx" },
    { title: "Cohort 2026 Document Matrix", type: "CSV", startup: "Cohort", tags: ["roadmap", "OKR", "NDA", "pitch"], indexed: "Ready", source: "Cohort 1_2026 Incubatees - Document.csv" },
    { title: "Skyholic Growth Roadmap", type: "Roadmap", startup: "Skyholic", tags: ["UAV", "AI", "pilot"], indexed: "Ready", source: "[Skyholic - IP 2025] Incubatee Growth-Roadmap.pdf" },
    { title: "NIION Growth Roadmap", type: "Roadmap", startup: "NIION", tags: ["biomass", "R&D"], indexed: "Ready", source: "[NIION] Incubatee Growth-Roadmap.pdf" },
    { title: "Ecombox Growth Roadmap", type: "Roadmap", startup: "Ecombox", tags: ["ecommerce", "SaaS"], indexed: "Ready", source: "[Ecombox] Incubatee Growth-Roadmap.pdf" },
    { title: "Vocake Pitch Deck", type: "Pitch deck", startup: "Vocake", tags: ["pitch", "consumer"], indexed: "Queued", source: "Vocake Pitch Deck.pdf" },
    { title: "Cohort 2025 Orientation Slides", type: "Slides", startup: "Cohort", tags: ["orientation", "program"], indexed: "Queued", source: "[WIP] [Cohort 2025] Orientation Slides.pdf" }
  ],
  questions: [
    {
      startup: "Skyholic",
      question: "How should we approach UAV testing permission for a pilot?",
      answer: "Start with a controlled pilot through a university, research unit, or enterprise partner. Prepare a risk assessment, flight scope, data policy, and stakeholder value case before approaching authorities.",
      tags: ["legal", "pilot", "UAV"]
    },
    {
      startup: "Ecombox",
      question: "How can we grow without hiring a large sales team?",
      answer: "Productize onboarding, build referral loops with ecommerce service providers, and segment stores by order volume so customer success effort scales with account value.",
      tags: ["growth", "SaaS", "customer success"]
    },
    {
      startup: "NIION",
      question: "Which product direction should we validate first?",
      answer: "Select the product with the clearest buyer, fastest test cycle, and strongest gross margin. Do not run too many R&D tracks at once during incubation.",
      tags: ["focus", "R&D", "market validation"]
    }
  ],
  sourceSummary: [
    { file: "USI_HUb_dashboard.html", value: "Old dashboard prototype with USI Hub 2.0 framing, dark navy/orange visual language, metrics, startup OS, project board, and mock AI concepts." },
    { file: "USI_Innovatiion_platformdemo_bookface_version.html", value: "Bookface-inspired product demo with founder Q&A, startup profiles, project board, and prototype similarity framing." },
    { file: "USI_Digital_tools.html", value: "Digital tools proposal dashboard covering user groups, problems, HCD plan, modules, benchmark logic, data input, tech direction, roadmap, and metrics." },
    { file: "Innovation Platform Proposal.pdf", value: "Strategic proposal reference for platform positioning, IP, and commercialization narrative." },
    { file: "[Innovation Platform] High-level Plan.docx.pdf", value: "High-level project plan reference for scope, phases, and execution framing." },
    { file: "Tóm tắt dự án UEH Innovation Platform cho Khôi.pdf", value: "Vietnamese project summary likely useful for stakeholder communication and vision alignment." },
    { file: "Cohort 1_2026 Incubatees.xlsx", value: "Structured cohort data source for future import into Firestore startup and document collections." },
    { file: "Cohort 1_2026 Incubatees - Document.csv", value: "Document matrix listing startup document availability such as roadmaps, OKRs, metrics, NDA, TTUT, pitch decks, logos, coworking, and MVP testing plans." },
    { file: "Cohort 1_2025 Incubatees - Startup's Information.pdf", value: "Startup information reference for the 2025 cohort." },
    { file: "Cohort 1_2025 Incubatees - [20_07_2025]Startup Performance.pdf", value: "Performance reference for cohort tracking and risk indicators." },
    { file: "Cohort 1_2025 Incubatees - Phân tích.pdf", value: "Analysis reference for future startup evaluation rules and report generation." },
    { file: "Growth-roadmap PDFs", value: "Startup-specific incubation evidence for Skyholic, NIION, Onto, Vizion, Ecombox, EmerGeniZ, Air Mattress, and Study Cake." },
    { file: "Pitch deck PDFs", value: "Pitch references for Skyholic, Ecombox/goihangchuan.vn, Air Mattress, and Vocake." },
    { file: "[WIP] [Cohort 2025] Orientation Slides.pdf", value: "Program onboarding and orientation material for Knowledge Base indexing." },
    { file: "UII_Logo.jpg", value: "Brand asset available for future visual polish." }
  ]
};
