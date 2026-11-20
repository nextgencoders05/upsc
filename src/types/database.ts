export type UserRole = 'student' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PaperType = 'GS-I' | 'CSAT';
export type TestType = 'topic' | 'daily' | 'weekly' | 'mock_gs1' | 'mock_csat';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  target_year: number;
  daily_target_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface StudentApproval {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  target_year: number;
  status: ApprovalStatus;
  reviewed_by?: string;
  review_notes?: string;
  requested_at: string;
  reviewed_at?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: string;
  paper: PaperType;
  description: string;
  syllabus_text: string;
  display_order: number;
  is_published: boolean;
}

export interface ReferenceLink {
  title: string;
  source: 'UPSC Official' | 'NCERT' | 'PIB' | 'Government Portal';
  url: string;
}

export interface Chapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  title: string;
  subtopics: string[];
  estimated_minutes: number;
  is_published: boolean;
  notes_markdown: string;
  summary_points: string[];
  reference_links: ReferenceLink[];
  pdf_title: string;
}

export interface StudyProgress {
  id: string;
  student_id: string;
  chapter_id: string;
  is_completed: boolean;
  is_bookmarked: boolean;
  revision_count: number;
  time_spent_minutes: number;
  last_studied_at: string;
  completed_at?: string;
}

export interface Question {
  id: string;
  subject_id: string;
  chapter_id?: string;
  paper: PaperType;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: 'standard' | 'statement_pair';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  source_reference: string;
  is_published: boolean;
}

export interface TestItem {
  id: string;
  title: string;
  test_type: TestType;
  subject_id?: string;
  chapter_id?: string;
  paper: PaperType;
  total_questions: number;
  duration_minutes: number;
  positive_marks: number;
  negative_marks: number;
  qualifying_percentage?: number;
  scheduled_date: string;
  is_published: boolean;
  question_ids: string[];
}

export interface StudentAnswerRecord {
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  is_marked_for_review: boolean;
  is_correct: boolean;
  marks_awarded: number;
  time_spent_seconds: number;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  test_title: string;
  test_type: TestType;
  paper: PaperType;
  student_id: string;
  status: 'in_progress' | 'submitted';
  started_at: string;
  submitted_at: string;
  time_taken_seconds: number;
  total_questions: number;
  attempted_count: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  raw_marks: number;
  negative_marks_deducted: number;
  net_score: number;
  max_marks: number;
  accuracy_percentage: number;
  qualified_status?: boolean;
  answers: StudentAnswerRecord[];
}

export interface StudyPlanTask {
  id: string;
  student_id: string;
  title: string;
  task_type: 'study_chapter' | 'revision' | 'practice_test' | 'weak_topic_drill';
  subject_id: string;
  chapter_id?: string;
  test_id?: string;
  priority: 'high' | 'medium' | 'low';
  target_date: string;
  estimated_minutes: number;
  is_completed: boolean;
  recommendation_reason: string;
}

export interface DailyActivity {
  id: string;
  student_id: string;
  activity_date_ist: string;
  activity_type: 'chapter_completed' | 'test_submitted' | 'study_task_completed';
  reference_id: string;
  title: string;
  xp_earned: number;
  minutes_logged: number;
}

export interface StreakData {
  student_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date_ist: string;
  total_xp: number;
  active_dates_ist: string[];
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon_name: string;
  xp_bonus: number;
  criteria_type: 'streak_days' | 'chapters_completed' | 'tests_completed' | 'total_xp';
  criteria_threshold: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface AdminRewardSettings {
  chapter_completion_xp: number;
  topic_test_xp: number;
  daily_quiz_xp: number;
  weekly_test_xp: number;
  mock_test_xp: number;
  gs1_positive: number;
  gs1_negative: number;
  csat_positive: number;
  csat_negative: number;
  csat_qualifying_percent: number;
}
