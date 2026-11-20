-- ============================================================================
-- SANKALP UPSC PRELIMS PREPARATION PLATFORM
-- Complete PostgreSQL Schema (18 Tables), Indexes, IST Functions & RLS Policies
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    avatar_url TEXT,
    target_year INTEGER NOT NULL DEFAULT 2027,
    daily_target_minutes INTEGER NOT NULL DEFAULT 180 CHECK (daily_target_minutes BETWEEN 30 AND 720),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. student_approvals
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 3. subjects (All 9 UPSC Prelims Categories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    paper TEXT NOT NULL DEFAULT 'GS-I' CHECK (paper IN ('GS-I', 'CSAT')),
    description TEXT NOT NULL,
    syllabus_text TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 1,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. chapters
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    subtopics TEXT[] NOT NULL DEFAULT '{}',
    estimated_minutes INTEGER NOT NULL DEFAULT 45,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (subject_id, chapter_number)
);

-- ----------------------------------------------------------------------------
-- 5. study_materials
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    summary_points TEXT[] NOT NULL DEFAULT '{}',
    reference_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    pdf_storage_path TEXT,
    pdf_external_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. study_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
    revision_count INTEGER NOT NULL DEFAULT 0,
    time_spent_minutes INTEGER NOT NULL DEFAULT 0,
    last_studied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (student_id, chapter_id)
);

-- ----------------------------------------------------------------------------
-- 7. questions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    paper TEXT NOT NULL DEFAULT 'GS-I' CHECK (paper IN ('GS-I', 'CSAT')),
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_type TEXT NOT NULL DEFAULT 'standard' CHECK (question_type IN ('standard', 'statement_pair')),
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    source_reference TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. tests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('topic', 'daily', 'weekly', 'mock_gs1', 'mock_csat')),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    paper TEXT NOT NULL DEFAULT 'GS-I' CHECK (paper IN ('GS-I', 'CSAT')),
    total_questions INTEGER NOT NULL CHECK (total_questions > 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    positive_marks NUMERIC(5,3) NOT NULL DEFAULT 2.000,
    negative_marks NUMERIC(5,3) NOT NULL DEFAULT 0.667,
    qualifying_percentage NUMERIC(5,2),
    scheduled_date DATE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. test_questions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL DEFAULT 1,
    UNIQUE (test_id, question_id)
);

-- ----------------------------------------------------------------------------
-- 10. test_attempts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 0,
    attempted_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    unanswered_count INTEGER NOT NULL DEFAULT 0,
    raw_marks NUMERIC(7,3) NOT NULL DEFAULT 0,
    negative_marks_deducted NUMERIC(7,3) NOT NULL DEFAULT 0,
    net_score NUMERIC(7,3) NOT NULL DEFAULT 0,
    max_marks NUMERIC(7,3) NOT NULL DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    qualified_status BOOLEAN
);

-- ----------------------------------------------------------------------------
-- 11. student_answers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option CHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_marked_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(6,3) NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE (attempt_id, question_id)
);

-- ----------------------------------------------------------------------------
-- 12. performance_summary
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.performance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    total_questions_attempted INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    incorrect_answers INTEGER NOT NULL DEFAULT 0,
    accuracy_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    average_score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    strength_level TEXT NOT NULL DEFAULT 'moderate' CHECK (strength_level IN ('strong', 'moderate', 'weak')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, subject_id)
);

-- ----------------------------------------------------------------------------
-- 13. study_plans
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('study_chapter', 'revision', 'practice_test', 'weak_topic_drill')),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
    test_id UUID REFERENCES public.tests(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    target_date DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date,
    estimated_minutes INTEGER NOT NULL DEFAULT 45,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    recommendation_reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. daily_activities (Indian Standard Time boundary enforcement + deduplication)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_date_ist DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('chapter_completed', 'test_submitted', 'study_task_completed')),
    reference_id TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    minutes_logged INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, activity_type, reference_id)
);

-- ----------------------------------------------------------------------------
-- 15. streaks
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.streaks (
    student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date_ist DATE,
    total_xp INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 16. achievements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    xp_bonus INTEGER NOT NULL DEFAULT 50,
    criteria_type TEXT NOT NULL CHECK (criteria_type IN ('streak_days', 'chapters_completed', 'tests_completed', 'total_xp')),
    criteria_threshold INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 17. student_achievements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, achievement_id)
);

-- ----------------------------------------------------------------------------
-- 18. admin_settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value_json JSONB NOT NULL,
    description TEXT NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_student ON public.study_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_chapter ON public.questions(subject_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON public.test_attempts(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activities_student_date ON public.daily_activities(student_id, activity_date_ist DESC);
CREATE INDEX IF NOT EXISTS idx_study_plans_student_date ON public.study_plans(student_id, target_date);

-- ============================================================================
-- HELPER FUNCTIONS FOR AUTHORIZATION & IST STREAK CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_approved_student()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.student_approvals sa ON sa.student_id = p.id
    WHERE p.id = auth.uid()
      AND (p.role = 'admin' OR sa.status = 'approved')
  );
$$;

-- Trigger function: Automatically create profile, pending approval, and streak row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  );

  INSERT INTO public.student_approvals (student_id, status)
  VALUES (NEW.id, 'pending');

  INSERT INTO public.streaks (student_id, current_streak, longest_streak, total_xp)
  VALUES (NEW.id, 0, 0, 0);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function: Update IST Streak & Total XP when a qualifying daily_activity is inserted
CREATE OR REPLACE FUNCTION public.update_streak_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_date DATE;
  v_curr_streak INTEGER;
  v_long_streak INTEGER;
BEGIN
  SELECT last_activity_date_ist, current_streak, longest_streak
    INTO v_last_date, v_curr_streak, v_long_streak
    FROM public.streaks
   WHERE student_id = NEW.student_id
   FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.streaks (student_id, current_streak, longest_streak, last_activity_date_ist, total_xp)
    VALUES (NEW.student_id, 1, 1, NEW.activity_date_ist, NEW.xp_earned);
    RETURN NEW;
  END IF;

  IF v_last_date IS NULL THEN
    v_curr_streak := 1;
  ELSIF NEW.activity_date_ist = v_last_date THEN
    -- Same IST day: increment XP only, streak unchanged
    v_curr_streak := v_curr_streak;
  ELSIF NEW.activity_date_ist = v_last_date + INTERVAL '1 day' THEN
    -- Consecutive IST day: increment streak
    v_curr_streak := v_curr_streak + 1;
  ELSIF NEW.activity_date_ist > v_last_date + INTERVAL '1 day' THEN
    -- Streak broken: reset to 1
    v_curr_streak := 1;
  END IF;

  IF v_curr_streak > v_long_streak THEN
    v_long_streak := v_curr_streak;
  END IF;

  UPDATE public.streaks
     SET current_streak = v_curr_streak,
         longest_streak = v_long_streak,
         last_activity_date_ist = GREATEST(COALESCE(v_last_date, NEW.activity_date_ist), NEW.activity_date_ist),
         total_xp = total_xp + NEW.xp_earned,
         updated_at = NOW()
   WHERE student_id = NEW.student_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_streak_on_activity ON public.daily_activities;
CREATE TRIGGER trg_update_streak_on_activity
  AFTER INSERT ON public.daily_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_streak_on_activity();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES ACROSS ALL 18 TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 1. profiles policies
CREATE POLICY "Students view own profile or admins view all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Students update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = 'student');
CREATE POLICY "Admins full access profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 2. student_approvals policies
CREATE POLICY "Students view own approval status" ON public.student_approvals
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Admins manage approvals" ON public.student_approvals
  FOR ALL USING (public.is_admin());

-- 3–5 & 7–9. Learning content & tests: only approved students can read published items; admins manage all
CREATE POLICY "Approved students view subjects" ON public.subjects
  FOR SELECT USING ((is_published = TRUE AND public.is_approved_student()) OR public.is_admin());
CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL USING (public.is_admin());

CREATE POLICY "Approved students view chapters" ON public.chapters
  FOR SELECT USING ((is_published = TRUE AND public.is_approved_student()) OR public.is_admin());
CREATE POLICY "Admins manage chapters" ON public.chapters
  FOR ALL USING (public.is_admin());

CREATE POLICY "Approved students view materials" ON public.study_materials
  FOR SELECT USING ((is_published = TRUE AND public.is_approved_student()) OR public.is_admin());
CREATE POLICY "Admins manage materials" ON public.study_materials
  FOR ALL USING (public.is_admin());

CREATE POLICY "Approved students view questions" ON public.questions
  FOR SELECT USING ((is_published = TRUE AND public.is_approved_student()) OR public.is_admin());
CREATE POLICY "Admins manage questions" ON public.questions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Approved students view tests" ON public.tests
  FOR SELECT USING ((is_published = TRUE AND public.is_approved_student()) OR public.is_admin());
CREATE POLICY "Admins manage tests" ON public.tests
  FOR ALL USING (public.is_admin());

CREATE POLICY "Approved students view test_questions" ON public.test_questions
  FOR SELECT USING (public.is_approved_student() OR public.is_admin());
CREATE POLICY "Admins manage test_questions" ON public.test_questions
  FOR ALL USING (public.is_admin());

-- 6 & 10–15 & 17. Student-owned private records: students access ONLY their own rows (when approved)
CREATE POLICY "Students manage own study_progress" ON public.study_progress
  FOR ALL USING (auth.uid() = student_id AND public.is_approved_student())
  WITH CHECK (auth.uid() = student_id AND public.is_approved_student());
CREATE POLICY "Admins view all study_progress" ON public.study_progress
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students manage own test_attempts" ON public.test_attempts
  FOR ALL USING (auth.uid() = student_id AND public.is_approved_student())
  WITH CHECK (auth.uid() = student_id AND public.is_approved_student());
CREATE POLICY "Admins view all test_attempts" ON public.test_attempts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students manage own answers" ON public.student_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = attempt_id AND ta.student_id = auth.uid()
    ) AND public.is_approved_student()
  );
CREATE POLICY "Admins view all answers" ON public.student_answers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students manage own performance_summary" ON public.performance_summary
  FOR ALL USING (auth.uid() = student_id AND public.is_approved_student())
  WITH CHECK (auth.uid() = student_id AND public.is_approved_student());
CREATE POLICY "Admins view all performance_summary" ON public.performance_summary
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Students manage own study_plans" ON public.study_plans
  FOR ALL USING (auth.uid() = student_id AND public.is_approved_student())
  WITH CHECK (auth.uid() = student_id AND public.is_approved_student());
CREATE POLICY "Admins manage all study_plans" ON public.study_plans
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students insert/select own daily_activities" ON public.daily_activities
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Approved students log daily_activities" ON public.daily_activities
  FOR INSERT WITH CHECK (auth.uid() = student_id AND public.is_approved_student());

CREATE POLICY "Students view own streaks" ON public.streaks
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

CREATE POLICY "Approved students view achievements catalog" ON public.achievements
  FOR SELECT USING (public.is_approved_student() OR public.is_admin());
CREATE POLICY "Admins manage achievements catalog" ON public.achievements
  FOR ALL USING (public.is_admin());

CREATE POLICY "Students view/unlock own achievements" ON public.student_achievements
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());
CREATE POLICY "Approved students insert unlocked achievements" ON public.student_achievements
  FOR INSERT WITH CHECK (auth.uid() = student_id AND public.is_approved_student());

CREATE POLICY "Approved students read admin_settings" ON public.admin_settings
  FOR SELECT USING (public.is_approved_student() OR public.is_admin());
CREATE POLICY "Admins manage admin_settings" ON public.admin_settings
  FOR ALL USING (public.is_admin());
