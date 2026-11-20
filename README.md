# Sankalp UPSC — Free UPSC Civil Services Prelims Preparation Platform

A modern, responsive, secure, and 100% free-tier UPSC Civil Services Preliminary Examination (GS Paper I & CSAT Paper II) preparation web platform built with **React 18, Vite, TypeScript, Tailwind CSS, Recharts, and Supabase PostgreSQL/Auth/Storage**.

---

## Key Features Implemented

1. **Public Educational Landing Page**:
   - Hero section, UPSC Prelims Paper I & Paper II structure breakdown, Study Materials overview, Practice Tests overview, Performance Analytics preview, Personalized Study Plan + Streaks preview, and Footer (About, Privacy Policy, Terms, Contact).
2. **Student Authentication & Admin Access Approval Gate**:
   - Email/Password Signup, Login, Password Reset, and Session persistence via Supabase Auth.
   - Strict **Admin Approval Gate**: Newly registered students enter a `pending` state in `student_approvals` and cannot access private study materials or tests until approved by a verified administrator (enforced both in UI and PostgreSQL Row Level Security).
3. **Student Dashboard**:
   - Real-time syllabus completion %, daily target progress bar, subjects completed, total tests attempted, recent test scores, average accuracy, IST daily learning streak, earned XP & badges, rule-based recommended study topics, and "Continue Learning" quick action.
4. **Study Materials Module (All 9 UPSC Prelims Categories)**:
   - Indian History (Ancient, Medieval, Modern), Indian & World Geography, Indian Polity & Constitution, Indian Economy, Environment & Ecology, General Science & Technology, Current Affairs, Indian Art & Culture, and CSAT (Paper II).
   - Official UPSC syllabus text, English study notes, key revision bullets, official external links ([UPSC](https://upsc.gov.in/), [NCERT](https://ncert.nic.in/), [PIB](https://www.pib.gov.in/)), downloadable chapter summary sheet, chapter completion tracking, bookmarking, and direct topic test launcher.
5. **Practice Tests & Full-Length Mock Exam Engine**:
   - **Topic-wise Tests** (configurable question count), **Daily Quiz** (IST streak qualifier), **Weekly Timed Test**, and **Full-Length Mock Exams** for **GS Paper I** (+2.00 / -0.6667 marks) and **CSAT Paper II** (+2.50 / -0.8333 marks, 33% = 66.67/200 qualifying criterion).
   - Exam-style interface with countdown timer, auto-submit on timeout, Question Navigation Palette (Answered, Not Answered, Marked for Review, Not Visited), Save & Next, Mark for Review, and Clear Response.
   - Mock exam marks are stored strictly separately from gamification XP.
6. **Test Results & Recharts Performance Analysis**:
   - Post-test scorecard with Raw Marks, 1/3rd Negative Penalty Deduction, Net UPSC Score, Accuracy %, Time per question, Subject-wise breakdown, Strong/Weak subject identification, and Question-by-Question review with explanations.
   - Recharts visualizations: Daily Performance, Weekly Progress, Test Score Improvement, Accuracy Trends, and Subject-wise Strengths/Weaknesses.
7. **Personalized Study Plan (with Integrated Daily Streaks & XP Rewards)**:
   - Rule-based recommendation engine analyzing test accuracy (<60% weak subjects), uncompleted chapters, and bookmarked revisions; adjustable daily study target.
   - **Streaks & Rewards integrated directly inside the Study Plan module** (no separate main nav section): IST (`Asia/Kolkata`) consecutive-day streak counter, 14-day streak calendar, qualifying daily activity tracker, configurable XP rewards, and Achievement Badges (`Beginner Badge`, `Consistency Badge`, `Weekly Warrior Badge`, `Dedicated Aspirant Badge`, `NCERT Foundation Scholar`, `Prelims Test Challenger`) with duplicate prevention.
8. **Admin Dashboard**:
   - Approve or reject pending student accounts, manage subjects & CRUD chapters/notes, add individual MCQs or bulk CSV upload, create quizzes/mock exams, configure XP reward values, and inspect the 18-table PostgreSQL RLS architecture.

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables template (optional for Demo/Local mode; required for live Supabase)
cp .env.example .env

# 3. Start Vite development server
npm run dev

# 4. Build production bundle
npm run build
```

---

## Deploying to GitHub Pages (Automated via Included GitHub Action)

1. Create a new repository on GitHub and push all files from this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sankalp UPSC Prelims Platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. *(Optional — For Live Supabase Backend)*: Go to **Settings → Secrets and variables → Actions** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   *(Note: If you do not add Supabase secrets yet, the deployed app automatically runs in full interactive Local Persistence Mode so every feature works immediately on GitHub Pages!)*
5. The included workflow `.github/workflows/deploy.yml` will build and publish your live site automatically.

---

## Deploying to Cloudflare Pages (Free Tier)

1. Log in to the Cloudflare Dashboard and open **Workers & Pages → Create Application → Pages → Connect to Git**.
2. Select your GitHub repository.
3. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) and click **Save and Deploy**.
   - `public/_redirects` is already included to handle SPA routing cleanly.

---

## Setting Up Supabase (Free Tier Database, Auth & Storage)

1. Create a new free project at [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase Dashboard:
   - Paste and run `supabase/migrations/001_initial_schema_and_rls.sql` (creates all 18 tables, indexes, IST timezone triggers, and Row Level Security policies).
   - Paste and run `supabase/seed.sql` (populates all 9 UPSC Prelims subject categories, initial achievements, and default XP/scoring settings).
3. In **Authentication → Providers**, ensure **Email** provider is enabled.
4. In **Storage**, create a bucket named `study-pdfs` (set to private/authenticated with RLS allowing read for `public.is_approved_student()` and insert/update for `public.is_admin()`).
5. Copy your **Project URL** and **`anon` public key** from **Project Settings → API** into `.env` (never expose your `service_role` secret key in frontend code).
