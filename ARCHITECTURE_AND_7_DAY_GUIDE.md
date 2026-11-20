# Complete Project Architecture, Database Relationships & 7-Day Implementation Roadmap

## 1. System Architecture & Folder Structure

```text
upsc-prelims-prep/
├── .github/
│   └── workflows/
│       └── deploy.yml                         # Automated GitHub Pages CI/CD pipeline
├── public/
│   └── _redirects                             # Cloudflare Pages SPA routing rule
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema_and_rls.sql     # All 18 PostgreSQL tables, IST triggers & RLS policies
│   └── seed.sql                               # 9 UPSC Prelims subjects, badges & admin config seed
├── src/
│   ├── data/
│   │   └── upscData.ts                        # Grounded UPSC Prelims syllabus, notes, MCQs & tests
│   ├── lib/
│   │   └── supabase.ts                        # Supabase client + IST timezone helper + local fallback
│   ├── types/
│   │   └── database.ts                        # Strict TypeScript interfaces for all 18 database tables
│   ├── App.tsx                                # Complete modular application & responsive layouts
│   ├── main.tsx                               # Application entry point
│   └── index.css                              # Tailwind CSS directives & typography
├── .env.example                               # Safe public environment variable template
├── index.html                                 # Vite HTML entry
├── package.json                               # Dependencies (React 18, Vite, Tailwind, Recharts, Supabase)
├── tailwind.config.js                         # Dark-mode & theme configuration
├── tsconfig.json                              # Strict TypeScript compiler configuration
└── vite.config.ts                             # Relative base ('./') for GitHub & Cloudflare Pages
```

## 2. Entity-Relationship Architecture (All 18 Tables)

- **Identity & Access Control**:
  - `profiles` (1) $\leftrightarrow$ (1) `student_approvals`: Every student signup creates a `profiles` row (`role = 'student'`) and a `student_approvals` row (`status = 'pending'`). Helper functions `public.is_admin()` and `public.is_approved_student()` enforce server-side access across all content and test tables.
- **Curriculum & Study Content**:
  - `subjects` (1) $\rightarrow$ ($N$) `chapters` (1) $\rightarrow$ ($N$) `study_materials`: Stores the 9 UPSC Prelims subject categories, chapter hierarchy, English markdown notes, NCERT/PIB/UPSC reference links, and authorized PDF paths.
  - `profiles` (1) $\rightarrow$ ($N$) `study_progress` ($N$) $\leftarrow$ (1) `chapters`: Tracks per-student chapter completion, bookmarking, revision count, and study minutes.
- **Assessment & UPSC Scoring Engine**:
  - `subjects` / `chapters` (1) $\rightarrow$ ($N$) `questions` ($N$) $\leftrightarrow$ ($M$) `tests` (joined via `test_questions`).
  - `tests` (1) $\rightarrow$ ($N$) `test_attempts` (1) $\rightarrow$ ($N$) `student_answers`: Stores each student's attempt, raw marks, 1/3rd negative marking penalty (`-0.6667` for GS-I, `-0.8333` for CSAT), net score, CSAT 33% qualifying status, and per-question time/review flags.
  - `performance_summary`: Aggregated subject-wise accuracy and strength classification (`strong` $\ge 70\%$, `moderate` $50\text{–}69\%$, `weak` $< 50\%$).
- **Personalized Study Plan & Integrated Streaks/XP (IST Timezone)**:
  - `study_plans`: Stores rule-based daily tasks generated from weak subjects, uncompleted chapters, and bookmarked revisions.
  - `daily_activities`: Logs qualifying actions (`chapter_completed`, `test_submitted`, `study_task_completed`) stamped with `(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date` and a `UNIQUE (student_id, activity_type, reference_id)` constraint to prevent duplicate XP farming.
  - `streaks`: Updated via PostgreSQL trigger `trg_update_streak_on_activity` comparing consecutive IST dates.
  - `achievements` (1) $\rightarrow$ ($N$) `student_achievements`: Tracks unlocked milestone badges.
  - `admin_settings`: Stores configurable JSON parameters for XP rewards and exam marking rules.

## 3. Free-Tier Limits & Cost Safeguards (₹0 Budget)

- **Supabase Free Tier**: 500 MB PostgreSQL database (~500,000+ MCQ attempt rows), 50,000 Monthly Active Users (MAU), and 1 GB Storage. To stay well within 1 GB storage, store text notes in PostgreSQL `study_materials.content_markdown` and link externally to official NCERT (`https://ncert.nic.in/`) and PIB (`https://www.pib.gov.in/`) PDFs, reserving Supabase Storage only for compact, original faculty handouts.
- **Cloudflare Pages / GitHub Pages Free Tier**: Unlimited static bandwidth on Cloudflare Pages and 100 GB/month on GitHub Pages at ₹0 cost.
- **Future Paid Triggers to Watch**: Pausing after 7 days of inactivity on Supabase Free Tier (prevented by regular student activity or a lightweight scheduled GitHub Action ping) and exceeding 1 GB of uploaded PDFs.

## 4. Seven-Day Incremental Implementation & Verification Sequence

- **Day 1**: Project scaffolding (`package.json`, `vite.config.ts`, Tailwind), Landing Homepage, Supabase Auth (Signup/Login/Reset), and `profiles` + `student_approvals` tables with Pending Approval gate.
- **Day 2**: Student Dashboard live metrics, `subjects` + `chapters` tables seeded with all 9 UPSC Prelims categories, responsive desktop sidebar & mobile drawer navigation, and Light/Dark theme switch.
- **Day 3**: Study Materials reader (`study_materials` & `study_progress`), English markdown notes, official NCERT/PIB/UPSC links, printable summary export, Bookmarking, and "Mark Chapter Complete" synchronization.
- **Day 4**: Practice & Mock Exam Engine (`questions`, `tests`, `test_questions`, `test_attempts`, `student_answers`) supporting Topic-wise Tests, Daily Quiz, Weekly Test, and Full-Length GS Paper I & CSAT Paper II Mock Tests with countdown timer, question palette, and 1/3rd negative marking.
- **Day 5**: Post-test Scorecard & Recharts Analytics (`performance_summary`) + Personalized Study Plan (`study_plans`) with integrated IST Daily Streaks (`daily_activities`, `streaks`) and Achievement Badges (`achievements`, `student_achievements`).
- **Day 6**: Role-protected Admin Dashboard (`admin_settings`, student approval/rejection workflow, chapter/note CRUD, single & CSV bulk question uploader, and XP configuration).
- **Day 7**: End-to-end RLS policy verification, mobile responsiveness check, and deployment to GitHub Pages / Cloudflare Pages.
