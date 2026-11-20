import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  BookOpen,
  FileCheck2,
  BarChart3,
  Target,
  Shield,
  Database,
  LayoutDashboard,
  Flame,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  Bookmark,
  Download,
  ExternalLink,
  Play,
  RefreshCw,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Lock,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Subject,
  Chapter,
  Question,
  TestItem,
  TestType,
  PaperType,
  TestAttempt,
  StudentAnswerRecord,
  StudyPlanTask,
  DailyActivity,
  StreakData,
  Achievement,
  StudentApproval,
  ApprovalStatus,
  AdminRewardSettings,
} from './types/database';
import {
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_QUESTIONS,
  INITIAL_TESTS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_APPROVALS,
  DEFAULT_REWARD_SETTINGS,
} from './data/upscData';


interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

export default function App() {
  // Theme & Navigation State
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'materials' | 'tests' | 'analytics' | 'study-plan' | 'admin' | 'roadmap'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [footerModal, setFooterModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Authentication & Student Access Approval State
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState<string>('arjun.upsc2027@example.com');
  const [authPassword, setAuthPassword] = useState<string>('••••••••••••');
  const [authName, setAuthName] = useState<string>('Arjun Karthikeyan');
  const [authTargetYear, setAuthTargetYear] = useState<number>(2027);
  const [sessionMode, setSessionMode] = useState<'approved_student' | 'pending_student' | 'admin'>('approved_student');

  // Core Database State (Synchronized with LocalStorage & Ready for Supabase)
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [tests, setTests] = useState<TestItem[]>(INITIAL_TESTS);
  const [approvals, setApprovals] = useState<StudentApproval[]>(INITIAL_APPROVALS);
  const [rewardSettings, setRewardSettings] = useState<AdminRewardSettings>(DEFAULT_REWARD_SETTINGS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  // Student Progress & Activity State
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>(['chap-hist-1', 'chap-pol-1', 'chap-env-1']);
  const [bookmarkedChapterIds, setBookmarkedChapterIds] = useState<string[]>(['chap-pol-1', 'chap-econ-1']);
  const [revisionCounts, setRevisionCounts] = useState<Record<string, number>>({
    'chap-hist-1': 2,
    'chap-pol-1': 3,
    'chap-env-1': 1,
  });

  // Study Materials Filters & Selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-pol');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('chap-pol-1');
  const [materialSearch, setMaterialSearch] = useState<string>('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState<boolean>(false);

  // Practice & Mock Exam Engine State
  const [testCategoryFilter, setTestCategoryFilter] = useState<'all' | TestType>('all');
  const [topicQuestionLimit, setTopicQuestionLimit] = useState<number>(5);
  const [activeExam, setActiveExam] = useState<{
    test: TestItem;
    questions: Question[];
    currentIndex: number;
    selectedOptions: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
    markedForReview: Record<string, boolean>;
    visitedQuestions: Record<string, boolean>;
    remainingSeconds: number;
    startedAt: string;
  } | null>(null);

  // Test Attempts History & Latest Result View
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([
    {
      id: 'att-seed-1',
      test_id: 'test-daily-quiz',
      test_title: 'Daily Prelims Mini-Quiz (IST Streak Qualifier)',
      test_type: 'daily',
      paper: 'GS-I',
      student_id: 'stu-arjun',
      status: 'submitted',
      started_at: '2026-11-15T09:00:00Z',
      submitted_at: '2026-11-15T09:07:30Z',
      time_taken_seconds: 450,
      total_questions: 5,
      attempted_count: 5,
      correct_count: 3,
      incorrect_count: 2,
      unanswered_count: 0,
      raw_marks: 6.0,
      negative_marks_deducted: 1.33,
      net_score: 4.67,
      max_marks: 10.0,
      accuracy_percentage: 60.0,
      answers: [],
    },
    {
      id: 'att-seed-2',
      test_id: 'test-weekly-gs',
      test_title: 'Weekly Mixed-Subject Prelims Assessment',
      test_type: 'weekly',
      paper: 'GS-I',
      student_id: 'stu-arjun',
      status: 'submitted',
      started_at: '2026-11-16T10:00:00Z',
      submitted_at: '2026-11-16T10:12:00Z',
      time_taken_seconds: 720,
      total_questions: 8,
      attempted_count: 7,
      correct_count: 5,
      incorrect_count: 2,
      unanswered_count: 1,
      raw_marks: 10.0,
      negative_marks_deducted: 1.33,
      net_score: 8.67,
      max_marks: 16.0,
      accuracy_percentage: 71.4,
      answers: [],
    },
    {
      id: 'att-seed-3',
      test_id: 'test-mock-csat',
      test_title: 'Full-Length Mock Exam — CSAT Paper II (+2.5 / -0.83 • 33% Qualifying)',
      test_type: 'mock_csat',
      paper: 'CSAT',
      student_id: 'stu-arjun',
      status: 'submitted',
      started_at: '2026-11-17T14:30:00Z',
      submitted_at: '2026-11-17T14:40:00Z',
      time_taken_seconds: 600,
      total_questions: 4,
      attempted_count: 4,
      correct_count: 3,
      incorrect_count: 1,
      unanswered_count: 0,
      raw_marks: 7.5,
      negative_marks_deducted: 0.83,
      net_score: 6.67,
      max_marks: 10.0,
      accuracy_percentage: 75.0,
      qualified_status: true,
      answers: [],
    },
  ]);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string>('att-seed-3');

  // Personalized Study Plan + Integrated Streaks & XP State
  const [dailyTargetMinutes, setDailyTargetMinutes] = useState<number>(180);
  const [studyPlanTasks, setStudyPlanTasks] = useState<StudyPlanTask[]>([
    {
      id: 'task-1',
      student_id: 'stu-arjun',
      title: 'Revise Money Bills & Parliamentary Committees (Article 110)',
      task_type: 'study_chapter',
      subject_id: 'subj-pol',
      chapter_id: 'chap-pol-2',
      priority: 'high',
      target_date: '2026-11-18',
      estimated_minutes: 50,
      is_completed: false,
      recommendation_reason: 'Uncompleted high-weightage Polity chapter (Parliamentary governance accounts for ~15-18 GS-I questions).',
    },
    {
      id: 'task-2',
      student_id: 'stu-arjun',
      title: 'Study RBI Monetary Policy, SDF, CRR & Money Multiplier',
      task_type: 'weak_topic_drill',
      subject_id: 'subj-econ',
      chapter_id: 'chap-econ-1',
      priority: 'high',
      target_date: '2026-11-18',
      estimated_minutes: 55,
      is_completed: false,
      recommendation_reason: 'Bookmarked Economy topic requiring conceptual drill before Mock GS-I.',
    },
    {
      id: 'task-3',
      student_id: 'stu-arjun',
      title: 'Attempt Daily Prelims Mini-Quiz (5 MCQs • IST Streak Qualifier)',
      task_type: 'practice_test',
      subject_id: 'subj-pol',
      test_id: 'test-daily-quiz',
      priority: 'medium',
      target_date: '2026-11-18',
      estimated_minutes: 15,
      is_completed: true,
      recommendation_reason: 'Maintains daily UPSC accuracy momentum and locks in your IST streak.',
    },
    {
      id: 'task-4',
      student_id: 'stu-arjun',
      title: 'Practice CSAT Reading Comprehension & Modular Arithmetic',
      task_type: 'revision',
      subject_id: 'subj-csat',
      chapter_id: 'chap-csat-1',
      priority: 'medium',
      target_date: '2026-11-18',
      estimated_minutes: 45,
      is_completed: false,
      recommendation_reason: 'Ensures safe buffer above the mandatory 33% (66.67/200) CSAT qualifying mark.',
    },
  ]);

  const [streakData, setStreakData] = useState<StreakData>({
    student_id: 'stu-arjun',
    current_streak: 5,
    longest_streak: 6,
    last_activity_date_ist: '2026-11-18',
    total_xp: 640,
    active_dates_ist: [
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-14',
      '2026-11-15',
      '2026-11-16',
      '2026-11-17',
      '2026-11-18',
    ],
  });

  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([
    {
      id: 'act-1',
      student_id: 'stu-arjun',
      activity_date_ist: '2026-11-18',
      activity_type: 'chapter_completed',
      reference_id: 'chap-pol-1',
      title: 'Completed Chapter: Fundamental Rights, DPSP & Basic Structure',
      xp_earned: 50,
      minutes_logged: 60,
    },
    {
      id: 'act-2',
      student_id: 'stu-arjun',
      activity_date_ist: '2026-11-18',
      activity_type: 'study_task_completed',
      reference_id: 'task-3',
      title: 'Completed Study Plan Task: Daily Prelims Mini-Quiz',
      xp_earned: 60,
      minutes_logged: 15,
    },
  ]);

  // Admin Form State
  const [adminSubTab, setAdminSubTab] = useState<'approvals' | 'chapters' | 'questions' | 'tests' | 'rewards' | 'sql'>('approvals');
  const [newChapterTitle, setNewChapterTitle] = useState<string>('');
  const [newChapterSubj, setNewChapterSubj] = useState<string>('subj-pol');
  const [newChapterSubtopics, setNewChapterSubtopics] = useState<string>('Constitutional Bodies, Election Commission, CAG');
  const [newChapterNotes, setNewChapterNotes] = useState<string>('### Constitutional Bodies Overview\n- **Article 324**: Election Commission of India.\n- **Article 148**: Comptroller and Auditor General of India.');
  const [newChapterPdf, setNewChapterPdf] = useState<string>('POL_Constitutional_Bodies.pdf');

  const [newQSubj, setNewQSubj] = useState<string>('subj-pol');
  const [newQPaper, setNewQPaper] = useState<PaperType>('GS-I');
  const [newQText, setNewQText] = useState<string>('');
  const [newQOptA, setNewQOptA] = useState<string>('');
  const [newQOptB, setNewQOptB] = useState<string>('');
  const [newQOptC, setNewQOptC] = useState<string>('');
  const [newQOptD, setNewQOptD] = useState<string>('');
  const [newQCorrect, setNewQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newQExplanation, setNewQExplanation] = useState<string>('');
  const [csvUploadText, setCsvUploadText] = useState<string>(
    'subj-econ,GS-I,What does the Lorenz Curve graphically represent in an economy?,Inflation vs Unemployment,Income or Wealth Inequality distribution,Tax Revenue vs Tax Rate,GDP Growth vs Environmental Degradation,B,The Lorenz Curve shows the cumulative share of income earned by cumulative percentages of the population (Gini Coefficient).'
  );

  const [newTestTitle, setNewTestTitle] = useState<string>('');
  const [newTestType, setNewTestType] = useState<TestType>('daily');
  const [newTestPaper, setNewTestPaper] = useState<PaperType>('GS-I');
  const [newTestDuration, setNewTestDuration] = useState<number>(15);

  // Toast helper
  const notify = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  // Current IST Date Helper
  const todayIST = '2026-11-18';

  // Award XP & Update Streak (Deduplicated by reference_id)
  const recordQualifyingActivity = (
    activityType: DailyActivity['activity_type'],
    referenceId: string,
    title: string,
    xpAmount: number,
    minutesLogged: number
  ) => {
    const alreadyLogged = dailyActivities.some(
      (a) => a.activity_type === activityType && a.reference_id === referenceId
    );
    if (alreadyLogged) {
      notify('Progress updated (XP already awarded earlier for this item — duplicate XP prevented).', 'info');
      return;
    }

    const newAct: DailyActivity = {
      id: 'act-' + Date.now(),
      student_id: 'stu-arjun',
      activity_date_ist: todayIST,
      activity_type: activityType,
      reference_id: referenceId,
      title,
      xp_earned: xpAmount,
      minutes_logged: minutesLogged,
    };

    setDailyActivities((prev) => [newAct, ...prev]);

    setStreakData((prev) => {
      const hasToday = prev.active_dates_ist.includes(todayIST);
      const nextDates = hasToday ? prev.active_dates_ist : [...prev.active_dates_ist, todayIST];
      const nextStreak = hasToday ? prev.current_streak : prev.current_streak + 1;
      const nextLongest = Math.max(prev.longest_streak, nextStreak);
      return {
        ...prev,
        current_streak: nextStreak,
        longest_streak: nextLongest,
        last_activity_date_ist: todayIST,
        total_xp: prev.total_xp + xpAmount,
        active_dates_ist: nextDates,
      };
    });

    notify(`+${xpAmount} XP Earned! "${title}" logged in IST Streak Tracker.`, 'success');
  };

  // Check and unlock achievements dynamically
  useEffect(() => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.unlocked) return ach;
        let met = false;
        if (ach.criteria_type === 'streak_days' && streakData.current_streak >= ach.criteria_threshold) met = true;
        if (ach.criteria_type === 'chapters_completed' && completedChapterIds.length >= ach.criteria_threshold) met = true;
        if (ach.criteria_type === 'tests_completed' && testAttempts.length >= ach.criteria_threshold) met = true;
        if (ach.criteria_type === 'total_xp' && streakData.total_xp >= ach.criteria_threshold) met = true;
        if (met) {
          return { ...ach, unlocked: true, unlocked_at: todayIST };
        }
        return ach;
      })
    );
  }, [streakData.current_streak, streakData.total_xp, completedChapterIds.length, testAttempts.length]);

  // Countdown timer for active exam
  useEffect(() => {
    if (!activeExam) return;
    const timer = setInterval(() => {
      setActiveExam((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          clearInterval(timer);
          return { ...prev, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeExam !== null]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (activeExam && activeExam.remainingSeconds === 0) {
      handleSubmitExam();
    }
  }, [activeExam?.remainingSeconds]);

  // Toggle Chapter Completion
  const handleToggleChapterComplete = (chapter: Chapter) => {
    const isAlreadyDone = completedChapterIds.includes(chapter.id);
    if (isAlreadyDone) {
      setCompletedChapterIds((prev) => prev.filter((id) => id !== chapter.id));
      notify(`Marked "${chapter.title}" as in-progress.`, 'info');
    } else {
      setCompletedChapterIds((prev) => [...prev, chapter.id]);
      setRevisionCounts((prev) => ({ ...prev, [chapter.id]: (prev[chapter.id] || 0) + 1 }));
      recordQualifyingActivity(
        'chapter_completed',
        chapter.id,
        `Completed Chapter: ${chapter.title}`,
        rewardSettings.chapter_completion_xp,
        chapter.estimated_minutes
      );
    }
  };

  // Toggle Chapter Bookmark
  const handleToggleBookmark = (chapterId: string) => {
    setBookmarkedChapterIds((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    );
    notify(
      bookmarkedChapterIds.includes(chapterId)
        ? 'Removed chapter from Revision Bookmarks.'
        : 'Bookmarked chapter for rapid Prelims revision!',
      'info'
    );
  };

  // Download Printable Study Notes Handout (.md / .txt download)
  const handleDownloadStudyHandout = (chapter: Chapter, subject?: Subject) => {
    const content = [
      `SANKALP UPSC PRELIMS REVISION HANDOUT`,
      `Subject: ${subject?.name || 'General Studies'} (${subject?.paper || 'GS-I'})`,
      `Chapter ${chapter.chapter_number}: ${chapter.title}`,
      `Estimated Study Time: ${chapter.estimated_minutes} mins`,
      `====================================================================`,
      ``,
      `KEY SUBTOPICS:`,
      ...chapter.subtopics.map((s, i) => `${i + 1}. ${s}`),
      ``,
      `STUDY NOTES:`,
      chapter.notes_markdown.replace(/\\n/g, '\n'),
      ``,
      `HIGH-YIELD PRELIMS REVISION POINTS:`,
      ...chapter.summary_points.map((p) => `• ${p}`),
      ``,
      `AUTHORIZED OFFICIAL REFERENCES:`,
      ...chapter.reference_links.map((r) => `- ${r.title} (${r.source}): ${r.url}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = chapter.pdf_title.replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(`Downloaded authorized study notes: ${chapter.pdf_title.replace('.pdf', '.txt')}`, 'success');
  };

  // Start Practice or Mock Exam
  const handleStartTest = (test: TestItem, customQuestionLimit?: number) => {
    let pool = questions.filter((q) => test.question_ids.includes(q.id));
    if (pool.length === 0) {
      pool = questions.filter((q) => (test.subject_id ? q.subject_id === test.subject_id : q.paper === test.paper));
    }
    if (customQuestionLimit && test.test_type === 'topic') {
      pool = pool.slice(0, Math.max(1, Math.min(customQuestionLimit, pool.length)));
    }
    if (pool.length === 0) {
      pool = questions.slice(0, 5);
    }

    setActiveExam({
      test,
      questions: pool,
      currentIndex: 0,
      selectedOptions: {},
      markedForReview: {},
      visitedQuestions: { [pool[0].id]: true },
      remainingSeconds: test.duration_minutes * 60,
      startedAt: new Date().toISOString(),
    });
    setActiveTab('tests');
  };

  // Submit Active Exam & Calculate Official UPSC Negative Marking
  const handleSubmitExam = () => {
    if (!activeExam) return;
    const { test, questions: examQs, selectedOptions, markedForReview, remainingSeconds, startedAt } = activeExam;
    const posMarks = test.paper === 'CSAT' ? rewardSettings.csat_positive : rewardSettings.gs1_positive;
    const negMarks = test.paper === 'CSAT' ? rewardSettings.csat_negative : rewardSettings.gs1_negative;

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const answerRecords: StudentAnswerRecord[] = [];

    examQs.forEach((q) => {
      const sel = selectedOptions[q.id] || null;
      const marked = Boolean(markedForReview[q.id]);
      if (!sel) {
        unansweredCount += 1;
        answerRecords.push({
          question_id: q.id,
          selected_option: null,
          is_marked_for_review: marked,
          is_correct: false,
          marks_awarded: 0,
          time_spent_seconds: 45,
        });
      } else if (sel === q.correct_option) {
        correctCount += 1;
        answerRecords.push({
          question_id: q.id,
          selected_option: sel,
          is_marked_for_review: marked,
          is_correct: true,
          marks_awarded: posMarks,
          time_spent_seconds: 50,
        });
      } else {
        incorrectCount += 1;
        answerRecords.push({
          question_id: q.id,
          selected_option: sel,
          is_marked_for_review: marked,
          is_correct: false,
          marks_awarded: -negMarks,
          time_spent_seconds: 55,
        });
      }
    });

    const attemptedCount = correctCount + incorrectCount;
    const rawMarks = Number((correctCount * posMarks).toFixed(2));
    const negativeDeducted = Number((incorrectCount * negMarks).toFixed(2));
    const netScore = Number((rawMarks - negativeDeducted).toFixed(2));
    const maxMarks = Number((examQs.length * posMarks).toFixed(2));
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
    const timeTaken = Math.max(15, test.duration_minutes * 60 - remainingSeconds);

    const scorePercent = maxMarks > 0 ? (netScore / maxMarks) * 100 : 0;
    const qualifiedStatus =
      test.paper === 'CSAT' ? scorePercent >= rewardSettings.csat_qualifying_percent : undefined;

    const newAttempt: TestAttempt = {
      id: 'att-' + Date.now(),
      test_id: test.id,
      test_title: test.title,
      test_type: test.test_type,
      paper: test.paper,
      student_id: 'stu-arjun',
      status: 'submitted',
      started_at: startedAt,
      submitted_at: new Date().toISOString(),
      time_taken_seconds: timeTaken,
      total_questions: examQs.length,
      attempted_count: attemptedCount,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      unanswered_count: unansweredCount,
      raw_marks: rawMarks,
      negative_marks_deducted: negativeDeducted,
      net_score: netScore,
      max_marks: maxMarks,
      accuracy_percentage: accuracy,
      qualified_status: qualifiedStatus,
      answers: answerRecords,
    };

    setTestAttempts((prev) => [newAttempt, ...prev]);
    setSelectedAttemptId(newAttempt.id);
    setActiveExam(null);

    // Award Gamification XP (kept strictly separate from UPSC exam marks)
    const xpMap: Record<TestType, number> = {
      topic: rewardSettings.topic_test_xp,
      daily: rewardSettings.daily_quiz_xp,
      weekly: rewardSettings.weekly_test_xp,
      mock_gs1: rewardSettings.mock_test_xp,
      mock_csat: rewardSettings.mock_test_xp,
    };
    recordQualifyingActivity(
      'test_submitted',
      newAttempt.id,
      `Submitted ${test.title} (Score: ${netScore}/${maxMarks})`,
      xpMap[test.test_type] || 75,
      Math.ceil(timeTaken / 60)
    );
    setActiveTab('analytics');
  };

  // Computed Analytics & Metrics
  const syllabusCompletionPercent = useMemo(() => {
    if (chapters.length === 0) return 0;
    return Math.round((completedChapterIds.length / chapters.length) * 100);
  }, [completedChapterIds.length, chapters.length]);

  const subjectsCompletedCount = useMemo(() => {
    return subjects.filter((subj) => {
      const subjChaps = chapters.filter((c) => c.subject_id === subj.id);
      return subjChaps.length > 0 && subjChaps.every((c) => completedChapterIds.includes(c.id));
    }).length;
  }, [subjects, chapters, completedChapterIds]);

  const averageAccuracy = useMemo(() => {
    if (testAttempts.length === 0) return 0;
    const sum = testAttempts.reduce((acc, a) => acc + a.accuracy_percentage, 0);
    return Number((sum / testAttempts.length).toFixed(1));
  }, [testAttempts]);

  const todayLoggedMinutes = useMemo(() => {
    return dailyActivities
      .filter((a) => a.activity_date_ist === todayIST)
      .reduce((acc, a) => acc + a.minutes_logged, 0);
  }, [dailyActivities]);

  // Subject-wise Performance Aggregation for Charts & Study Plan Recommendations
  const subjectPerformanceData = useMemo(() => {
    const baseStats: Record<string, { subject: string; code: string; accuracy: number; attempted: number; subjectId: string }> = {
      'subj-hist': { subject: 'History', code: 'HIST', accuracy: 74, attempted: 18, subjectId: 'subj-hist' },
      'subj-geog': { subject: 'Geography', code: 'GEOG', accuracy: 68, attempted: 14, subjectId: 'subj-geog' },
      'subj-pol': { subject: 'Polity', code: 'POL', accuracy: 82, attempted: 24, subjectId: 'subj-pol' },
      'subj-econ': { subject: 'Economy', code: 'ECON', accuracy: 54, attempted: 15, subjectId: 'subj-econ' },
      'subj-env': { subject: 'Environment', code: 'ENV', accuracy: 78, attempted: 16, subjectId: 'subj-env' },
      'subj-sci': { subject: 'Sci & Tech', code: 'SCI', accuracy: 58, attempted: 12, subjectId: 'subj-sci' },
      'subj-ca': { subject: 'Current Affairs', code: 'CA', accuracy: 71, attempted: 20, subjectId: 'subj-ca' },
      'subj-art': { subject: 'Art & Culture', code: 'ART', accuracy: 62, attempted: 10, subjectId: 'subj-art' },
      'subj-csat': { subject: 'CSAT II', code: 'CSAT', accuracy: 75, attempted: 16, subjectId: 'subj-csat' },
    };

    // Incorporate live answers from user's submitted exams
    testAttempts.forEach((att) => {
      att.answers.forEach((ans) => {
        const q = questions.find((item) => item.id === ans.question_id);
        if (q && baseStats[q.subject_id] && ans.selected_option) {
          const item = baseStats[q.subject_id];
          const prevCorrect = (item.accuracy / 100) * item.attempted;
          const nextAttempted = item.attempted + 1;
          const nextCorrect = prevCorrect + (ans.is_correct ? 1 : 0);
          item.attempted = nextAttempted;
          item.accuracy = Math.round((nextCorrect / nextAttempted) * 100);
        }
      });
    });

    return Object.values(baseStats);
  }, [testAttempts, questions]);

  const strongSubjects = useMemo(
    () => subjectPerformanceData.filter((s) => s.accuracy >= 70),
    [subjectPerformanceData]
  );
  const weakSubjects = useMemo(
    () => subjectPerformanceData.filter((s) => s.accuracy < 65),
    [subjectPerformanceData]
  );

  // Regenerate Rule-Based Study Plan
  const handleRegenerateStudyPlan = () => {
    const newTasks: StudyPlanTask[] = [];
    // 1. Weak subjects drill
    weakSubjects.forEach((ws, idx) => {
      const chap = chapters.find((c) => c.subject_id === ws.subjectId);
      newTasks.push({
        id: 'task-gen-weak-' + idx + '-' + Date.now(),
        student_id: 'stu-arjun',
        title: `Weak Subject Priority Drill: ${ws.subject} (${ chap ? chap.title : 'Core Concepts'})`,
        task_type: 'weak_topic_drill',
        subject_id: ws.subjectId,
        chapter_id: chap?.id,
        priority: 'high',
        target_date: todayIST,
        estimated_minutes: 50,
        is_completed: false,
        recommendation_reason: `Rule Engine: Accuracy in ${ws.subject} is ${ws.accuracy}% (<65% threshold). Immediate conceptual revision + MCQ drill recommended.`,
      });
    });

    // 2. Uncompleted chapters
    const pendingChapters = chapters.filter((c) => !completedChapterIds.includes(c.id)).slice(0, 2);
    pendingChapters.forEach((ch, idx) => {
      newTasks.push({
        id: 'task-gen-chap-' + idx + '-' + Date.now(),
        student_id: 'stu-arjun',
        title: `Complete Chapter: ${ch.title}`,
        task_type: 'study_chapter',
        subject_id: ch.subject_id,
        chapter_id: ch.id,
        priority: 'medium',
        target_date: todayIST,
        estimated_minutes: ch.estimated_minutes,
        is_completed: false,
        recommendation_reason: `Rule Engine: Syllabus completion progression (${completedChapterIds.length}/${chapters.length} chapters done).`,
      });
    });

    // 3. Daily Streak Qualifier Quiz
    newTasks.push({
      id: 'task-gen-quiz-' + Date.now(),
      student_id: 'stu-arjun',
      title: 'Attempt Daily Prelims Mini-Quiz (IST Streak Qualifier)',
      task_type: 'practice_test',
      subject_id: 'subj-pol',
      test_id: 'test-daily-quiz',
      priority: 'high',
      target_date: todayIST,
      estimated_minutes: 15,
      is_completed: false,
      recommendation_reason: 'Rule Engine: Daily timed MCQ practice locks in your IST streak and sharpens 1/3rd negative marking elimination.',
    });

    setStudyPlanTasks(newTasks);
    notify('Refreshed rule-based Personalized Study Plan based on your latest accuracy & syllabus progress!', 'success');
  };

  // Toggle Study Plan Task Completion
  const handleToggleStudyTask = (task: StudyPlanTask) => {
    const nextState = !task.is_completed;
    setStudyPlanTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextState } : t))
    );
    if (nextState) {
      recordQualifyingActivity(
        'study_task_completed',
        task.id,
        `Completed Study Task: ${task.title}`,
        40,
        task.estimated_minutes
      );
    }
  };

  // Admin Handlers
  const handleUpdateApproval = (id: string, status: ApprovalStatus) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              reviewed_at: new Date().toISOString(),
              review_notes: status === 'approved' ? 'Approved by Administrator' : 'Access request rejected by Administrator',
            }
          : a
      )
    );
    notify(`Student access status updated to "${status.toUpperCase()}".`, status === 'approved' ? 'success' : 'warning');
  };

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      notify('Please enter a chapter title.', 'warning');
      return;
    }
    const subjChaps = chapters.filter((c) => c.subject_id === newChapterSubj);
    const newChap: Chapter = {
      id: 'chap-custom-' + Date.now(),
      subject_id: newChapterSubj,
      chapter_number: subjChaps.length + 1,
      title: newChapterTitle.trim(),
      subtopics: newChapterSubtopics.split(',').map((s) => s.trim()).filter(Boolean),
      estimated_minutes: 45,
      is_published: true,
      notes_markdown: newChapterNotes,
      summary_points: ['Newly published faculty revision note for UPSC Prelims.'],
      reference_links: [
        { title: 'NCERT Official Portal', source: 'NCERT', url: 'https://ncert.nic.in/' },
        { title: 'PIB Official Releases', source: 'PIB', url: 'https://www.pib.gov.in/' },
      ],
      pdf_title: newChapterPdf || 'UPSC_Authorized_Notes.pdf',
    };
    setChapters((prev) => [...prev, newChap]);
    setNewChapterTitle('');
    notify(`Created Chapter "${newChap.title}" under selected UPSC subject!`, 'success');
  };

  const handleAddSingleQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !newQOptA.trim() || !newQOptB.trim()) {
      notify('Please fill question text and options.', 'warning');
      return;
    }
    const qObj: Question = {
      id: 'q-custom-' + Date.now(),
      subject_id: newQSubj,
      paper: newQPaper,
      difficulty: 'medium',
      question_type: 'standard',
      question_text: newQText.trim(),
      option_a: newQOptA.trim(),
      option_b: newQOptB.trim(),
      option_c: newQOptC.trim() || 'Both A and B',
      option_d: newQOptD.trim() || 'Neither A nor B',
      correct_option: newQCorrect,
      explanation: newQExplanation.trim() || 'Verified UPSC Prelims explanation.',
      source_reference: 'Admin Uploaded Question Bank',
      is_published: true,
    };
    setQuestions((prev) => [qObj, ...prev]);
    setNewQText('');
    setNewQOptA('');
    setNewQOptB('');
    setNewQOptC('');
    setNewQOptD('');
    setNewQExplanation('');
    notify('Added new UPSC Prelims MCQ to Question Bank!', 'success');
  };

  const handleBulkCsvUpload = () => {
    const lines = csvUploadText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      notify('Paste at least one CSV row to import.', 'warning');
      return;
    }
    const imported: Question[] = [];
    lines.forEach((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 8) {
        imported.push({
          id: 'q-csv-' + Date.now() + '-' + idx,
          subject_id: parts[0] || 'subj-econ',
          paper: (parts[1] === 'CSAT' ? 'CSAT' : 'GS-I') as PaperType,
          difficulty: 'medium',
          question_type: 'standard',
          question_text: parts[2],
          option_a: parts[3],
          option_b: parts[4],
          option_c: parts[5],
          option_d: parts[6],
          correct_option: (['A', 'B', 'C', 'D'].includes(parts[7].toUpperCase()) ? parts[7].toUpperCase() : 'B') as 'A' | 'B' | 'C' | 'D',
          explanation: parts.slice(8).join(', ') || 'Imported via Admin CSV uploader.',
          source_reference: 'Admin CSV Batch Import',
          is_published: true,
        });
      }
    });
    if (imported.length === 0) {
      notify('Invalid CSV format. Expected: subject_id,paper,question,optA,optB,optC,optD,correctOpt,explanation', 'warning');
      return;
    }
    setQuestions((prev) => [...imported, ...prev]);
    notify(`Successfully imported ${imported.length} UPSC question(s) from CSV!`, 'success');
  };

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestTitle.trim()) {
      notify('Enter a test title.', 'warning');
      return;
    }
    const matchingQs = questions.filter((q) => q.paper === newTestPaper).map((q) => q.id);
    const created: TestItem = {
      id: 'test-custom-' + Date.now(),
      title: newTestTitle.trim(),
      test_type: newTestType,
      paper: newTestPaper,
      total_questions: matchingQs.length,
      duration_minutes: newTestDuration,
      positive_marks: newTestPaper === 'CSAT' ? rewardSettings.csat_positive : rewardSettings.gs1_positive,
      negative_marks: newTestPaper === 'CSAT' ? rewardSettings.csat_negative : rewardSettings.gs1_negative,
      qualifying_percentage: newTestPaper === 'CSAT' ? 33.0 : undefined,
      scheduled_date: todayIST,
      is_published: true,
      question_ids: matchingQs,
    };
    setTests((prev) => [created, ...prev]);
    setNewTestTitle('');
    notify(`Created and published "${created.title}"!`, 'success');
  };

  // Format Seconds Helper (MM:SS or HH:MM:SS)
  const formatSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remSec = sec % 60;
    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  };

  // Last 14 Days in IST for Streak Calendar
  const last14DaysIST = useMemo(() => {
    const days: { date: string; label: string; active: boolean }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date('2026-11-18T00:00:00+05:30');
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      days.push({
        date: iso,
        label,
        active: streakData.active_dates_ist.includes(iso),
      });
    }
    return days;
  }, [streakData.active_dates_ist]);

  // Selected Chapter & Subject for Materials View
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchesSubject = c.subject_id === selectedSubjectId;
      const matchesBookmark = showBookmarkedOnly ? bookmarkedChapterIds.includes(c.id) : true;
      const matchesSearch = materialSearch.trim()
        ? c.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
          c.subtopics.some((st) => st.toLowerCase().includes(materialSearch.toLowerCase()))
        : true;
      return matchesSubject && matchesBookmark && matchesSearch;
    });
  }, [chapters, selectedSubjectId, showBookmarkedOnly, bookmarkedChapterIds, materialSearch]);

  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) || filteredChapters[0] || chapters[0];

  // Selected Test Attempt for Detailed Analytics Review
  const activeAttempt =
    testAttempts.find((a) => a.id === selectedAttemptId) || testAttempts[0];

  // Daily & Weekly Chart Series for Recharts
  const dailyTrendData = useMemo(() => {
    return [
      { day: '12 Nov', scorePercent: 52, accuracy: 60, minutes: 140 },
      { day: '13 Nov', scorePercent: 56, accuracy: 64, minutes: 165 },
      { day: '14 Nov', scorePercent: 55, accuracy: 63, minutes: 150 },
      { day: '15 Nov', scorePercent: 61, accuracy: 68, minutes: 190 },
      { day: '16 Nov', scorePercent: 64, accuracy: 71, minutes: 210 },
      { day: '17 Nov', scorePercent: 67, accuracy: 75, minutes: 195 },
      {
        day: '18 Nov',
        scorePercent: activeAttempt
          ? Math.max(0, Math.round((activeAttempt.net_score / Math.max(1, activeAttempt.max_marks)) * 100))
          : 72,
        accuracy: averageAccuracy || 74,
        minutes: Math.max(120, todayLoggedMinutes),
      },
    ];
  }, [activeAttempt, averageAccuracy, todayLoggedMinutes]);

  const weeklyComparisonData = [
    { week: 'Week 1 (Oct)', gs1Net: 74, csatNet: 62, targetCutoff: 90 },
    { week: 'Week 2 (Nov)', gs1Net: 82, csatNet: 71, targetCutoff: 90 },
    { week: 'Week 3 (Nov)', gs1Net: 89, csatNet: 78, targetCutoff: 90 },
    { week: 'Current Week', gs1Net: 96, csatNet: 86, targetCutoff: 90 },
  ];

  return (
    <div className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-slate-50 text-slate-900 min-h-screen'}>
      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
              t.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-700'
                : t.type === 'warning'
                ? 'bg-amber-950/95 text-amber-100 border-amber-700'
                : 'bg-slate-900/95 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-slate-400 hover:text-white p-1"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Global Header Bar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {viewMode === 'app' && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg border border-slate-300 dark:border-slate-700"
                aria-label="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-sm">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-base sm:text-lg">Sankalp UPSC</span>
                  <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Prelims CSE
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  100% Free GS Paper I & CSAT Paper II Preparation Portal
                </p>
              </div>
            </button>
          </div>

          {/* Right Header Controls: Role Switcher, Theme Toggle & Portal Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Instant Role / Approval State Switcher for Testing RLS & Admin Gate */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSessionMode('approved_student');
                  setViewMode('app');
                  notify('Switched to Approved Student Account (Full RLS Access).', 'info');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  sessionMode === 'approved_student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Approved Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setSessionMode('pending_student');
                  setViewMode('app');
                  notify('Switched to Unapproved Student (Pending Admin Approval Gate).', 'warning');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  sessionMode === 'pending_student'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Pending Gate
              </button>
              <button
                type="button"
                onClick={() => {
                  setSessionMode('admin');
                  setViewMode('app');
                  setActiveTab('admin');
                  notify('Switched to Verified Administrator Role.', 'success');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  sessionMode === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Admin Role
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Light or Dark Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {viewMode === 'landing' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setViewMode('auth');
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('app');
                    setActiveTab('dashboard');
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <span>Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================================
          VIEW 1: PROFESSIONAL EDUCATIONAL LANDING PAGE (HOMEPAGE)
      ===================================================================== */}
      {viewMode === 'landing' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-14">
          {/* Hero Section */}
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-12 shadow-xl border border-indigo-500/20">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Free for Approved Aspirants • Zero Paid Subscriptions • Official NCERT & PIB Aligned</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Master the UPSC Civil Services Preliminary Examination with Precision.
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Structured syllabus coverage across all 9 UPSC Prelims categories, realistic GS Paper I (+2.0 / -0.66) and CSAT Paper II (+2.5 / -0.83, 33% qualifying) full-length mock examinations, Recharts analytics, rule-based study planning, and IST daily learning streaks.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSessionMode('approved_student');
                    setViewMode('app');
                    setActiveTab('dashboard');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg flex items-center gap-2 transition"
                >
                  <span>Get Started — Enter Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setViewMode('auth');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition"
                >
                  Student Login / Signup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSessionMode('admin');
                    setViewMode('app');
                    setActiveTab('roadmap');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-semibold text-sm border border-emerald-400/30 transition"
                >
                  View 18-Table SQL & 7-Day Roadmap
                </button>
              </div>
            </div>

            {/* Official Exam Pattern Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-indigo-300 font-medium">GS Paper I (Merit Rank)</p>
                <p className="text-xl font-bold mt-1">100 MCQs • 200M</p>
                <p className="text-xs text-slate-400 mt-0.5">+2.00 Correct | -0.66 Wrong</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-emerald-300 font-medium">CSAT Paper II (Qualifying)</p>
                <p className="text-xl font-bold mt-1">80 MCQs • 200M</p>
                <p className="text-xs text-slate-400 mt-0.5">+2.50 Correct | -0.83 Wrong (33% Pass)</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-amber-300 font-medium">Complete Prelims Syllabus</p>
                <p className="text-xl font-bold mt-1">9 Core Subjects</p>
                <p className="text-xs text-slate-400 mt-0.5">NCERT, PIB & UPSC Referenced</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-purple-300 font-medium">Database & Hosting</p>
                <p className="text-xl font-bold mt-1">18 RLS Tables</p>
                <p className="text-xs text-slate-400 mt-0.5">Supabase + GitHub / Cloudflare</p>
              </div>
            </div>
          </section>

          {/* 4 Module Previews: Study Materials, Practice Tests, Analytics, Study Plan + Streaks */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold">Comprehensive Prelims Preparation Ecosystem</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Built specifically for serious UPSC Civil Services Preliminary Examination aspirants.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">9-Subject Study Materials</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    History, Geography, Polity, Economy, Environment, Science & Tech, Current Affairs, Art & Culture, and CSAT with chapter completion and official NCERT/PIB links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('app');
                    setActiveTab('materials');
                  }}
                  className="mt-5 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                >
                  <span>Explore Syllabus & Notes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Prelims Mock Exam Engine</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Topic-wise tests, Daily Quiz, Weekly Timed Tests, and Full-Length GS Paper I & CSAT Paper II Mocks with question palette, Mark for Review, and 1/3rd negative marking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('app');
                    setActiveTab('tests');
                  }}
                  className="mt-5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
                >
                  <span>Launch Practice & Mock Tests</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Performance Tracking</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Interactive Recharts analytics for daily/weekly scores, accuracy trajectories, raw vs net marks after negative penalty, and subject-wise strengths & weaknesses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('app');
                    setActiveTab('analytics');
                  }}
                  className="mt-5 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                >
                  <span>Inspect Recharts Analytics</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Study Plan, Streaks & XP</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Rule-based daily study recommendations targeting weak subjects, integrated with an IST (`Asia/Kolkata`) streak calendar, XP rewards, and achievement badges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('app');
                    setActiveTab('study-plan');
                  }}
                  className="mt-5 text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
                >
                  <span>Open Study Plan & Streaks</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* All 9 UPSC Prelims Categories Preview Grid */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">All 9 Mandatory UPSC Prelims Categories Built-In</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subj) => (
                <div
                  key={subj.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {subj.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{subj.paper}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base">{subj.name}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{subj.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(subj.id);
                      const firstChap = chapters.find((c) => c.subject_id === subj.id);
                      if (firstChap) setSelectedChapterId(firstChap.id);
                      setViewMode('app');
                      setActiveTab('materials');
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-left"
                  >
                    Open {subj.category} Chapters →
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Footer with About, Privacy Policy, Terms, and Contact */}
          <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Sankalp UPSC Prelims Platform</span> — Free Private-Access Portal for Civil Services Aspirants.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setFooterModal('about')} className="hover:underline">
                About
              </button>
              <button type="button" onClick={() => setFooterModal('privacy')} className="hover:underline">
                Privacy Policy
              </button>
              <button type="button" onClick={() => setFooterModal('terms')} className="hover:underline">
                Terms of Access
              </button>
              <button type="button" onClick={() => setFooterModal('contact')} className="hover:underline">
                Contact & Official Links
              </button>
            </div>
          </footer>
        </main>
      )}

      {/* Footer Information Modal */}
      {footerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg capitalize">{footerModal} — Sankalp UPSC Portal</h3>
              <button
                type="button"
                onClick={() => setFooterModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              {footerModal === 'about' && (
                <p>
                  Sankalp UPSC is a 100% free, English-medium preparation portal focused exclusively on the UPSC Civil Services Preliminary Examination (GS Paper I & CSAT Paper II). Built on a ₹0 free-tier stack (React, Vite, Tailwind, Supabase PostgreSQL with Row Level Security, and Cloudflare/GitHub Pages).
                </p>
              )}
              {footerModal === 'privacy' && (
                <p>
                  Student progress, test attempts, and study plans are isolated per student via Supabase PostgreSQL Row Level Security (`auth.uid() = student_id`). No student data is sold or shared with third parties.
                </p>
              )}
              {footerModal === 'terms' && (
                <p>
                  Access is restricted to approved students. Study materials link directly to official public-domain government sources (UPSC, NCERT, PIB) and original faculty notes without republishing copyrighted commercial textbooks.
                </p>
              )}
              {footerModal === 'contact' && (
                <div className="space-y-2">
                  <p>For student access approval or content corrections, contact the platform administrator via the Admin Dashboard.</p>
                  <p className="text-xs">
                    Official References:{' '}
                    <a href="https://upsc.gov.in/" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                      UPSC Official Website
                    </a>{' '}
                    |{' '}
                    <a href="https://ncert.nic.in/" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                      NCERT Textbooks
                    </a>{' '}
                    |{' '}
                    <a href="https://www.pib.gov.in/" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                      Press Information Bureau (PIB)
                    </a>
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setFooterModal(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: STUDENT AUTHENTICATION (LOGIN / SIGNUP / PASSWORD RESET)
      ===================================================================== */}
      {viewMode === 'auth' && (
        <main className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-extrabold">
                {authMode === 'login'
                  ? 'Student & Admin Login'
                  : authMode === 'signup'
                  ? 'Register Aspirant Account'
                  : 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-500">
                Protected by Supabase Auth & PostgreSQL Row Level Security
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 rounded-lg ${authMode === 'login' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`py-2 rounded-lg ${authMode === 'signup' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('reset')}
                className={`py-2 rounded-lg ${authMode === 'reset' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                Reset
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (authMode === 'signup') {
                  const newReq: StudentApproval = {
                    id: 'appr-' + Date.now(),
                    student_id: 'stu-' + Date.now(),
                    student_name: authName || 'New Aspirant',
                    student_email: authEmail,
                    target_year: authTargetYear,
                    status: 'pending',
                    review_notes: 'Submitted via Student Signup — awaiting Admin approval.',
                    requested_at: new Date().toISOString(),
                  };
                  setApprovals((prev) => [newReq, ...prev]);
                  setSessionMode('pending_student');
                  setViewMode('app');
                  notify('Account created! Your access request is now pending Administrator approval.', 'info');
                } else if (authMode === 'reset') {
                  notify(`Password reset instructions sent to ${authEmail}.`, 'success');
                  setAuthMode('login');
                } else {
                  setViewMode('app');
                  notify(`Welcome back, ${authName}!`, 'success');
                }
              }}
              className="space-y-4"
            >
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                />
              </div>

              {authMode !== 'reset' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  />
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">Target UPSC Prelims Attempt Year</label>
                  <select
                    value={authTargetYear}
                    onChange={(e) => setAuthTargetYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                  >
                    <option value={2027}>UPSC CSE Prelims 2027</option>
                    <option value={2028}>UPSC CSE Prelims 2028</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
              >
                {authMode === 'login'
                  ? 'Sign In to Portal'
                  : authMode === 'signup'
                  ? 'Submit Registration for Approval'
                  : 'Send Password Reset Link'}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* =====================================================================
          VIEW 3: AUTHENTICATED APPLICATION (PENDING GATE OR MAIN PORTAL)
      ===================================================================== */}
      {viewMode === 'app' && sessionMode === 'pending_student' && (
        <main className="max-w-xl mx-auto px-4 py-14">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold">Student Access Pending Admin Approval</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your account (<strong>{authEmail}</strong>) has been created, and a record has been inserted into <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">public.student_approvals</code> with status <code className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">pending</code>.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-left text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-700 dark:text-slate-200">How Authorization Enforces This Gate:</p>
              <p>• Supabase PostgreSQL helper <code className="font-mono">public.is_approved_student()</code> blocks queries to <code className="font-mono">study_materials</code>, <code className="font-mono">questions</code>, and <code className="font-mono">tests</code> until an Administrator approves your account.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSessionMode('admin');
                  setActiveTab('admin');
                  notify('Switched to Admin View — you can approve pending students here.', 'info');
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Switch to Admin & Approve Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setSessionMode('approved_student');
                  setActiveTab('dashboard');
                  notify('Switched to Approved Student account.', 'success');
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Preview as Approved Student
              </button>
            </div>
          </div>
        </main>
      )}

      {viewMode === 'app' && sessionMode !== 'pending_student' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Navigation (Desktop + Mobile Drawer) */}
          <aside
            className={`${
              mobileMenuOpen ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 shrink-0 space-y-4`}
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5 shadow-sm">
              <div className="px-3 py-2 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold truncate">{authName}</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {sessionMode === 'admin' ? 'Verified Administrator' : 'Approved CSE 2027 Aspirant'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>{streakData.current_streak}d</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Student Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('materials');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'materials'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Study Materials</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  9 Subj
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('tests');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'tests'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Practice & Mocks</span>
                </span>
                {activeExam && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('analytics');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Results & Analytics</span>
              </button>

              {/* Streaks & Rewards are intentionally housed inside Personalized Study Plan per Master Prompt Section 9 */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('study-plan');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'study-plan'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Target className="w-4 h-4" />
                  <span>Study Plan & Streaks</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {streakData.total_xp} XP
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSessionMode('admin');
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  RLS
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('roadmap');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'roadmap'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>SQL, GitHub & 7-Day Plan</span>
              </button>
            </div>

            {/* Quick IST Streak & Daily Progress Mini-Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-200">Daily Target (IST)</span>
                <span className="text-xs font-bold">{todayLoggedMinutes} / {dailyTargetMinutes} min</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((todayLoggedMinutes / dailyTargetMinutes) * 100))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Complete any chapter or quiz before 23:59 IST to extend your {streakData.current_streak}-day streak.
              </p>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* ===============================================================
                TAB 1: STUDENT DASHBOARD
            =============================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Banner & Continue Learning Button */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Target Examination: UPSC Civil Services Prelims {authTargetYear}</span>
                    </div>
                    <h1 className="text-2xl font-extrabold">Welcome back, {authName}!</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      You have completed {completedChapterIds.length} of {chapters.length} core chapters ({syllabusCompletionPercent}% syllabus) and logged {todayLoggedMinutes} study minutes today.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const nextChap = chapters.find((c) => !completedChapterIds.includes(c.id)) || chapters[0];
                        setSelectedSubjectId(nextChap.subject_id);
                        setSelectedChapterId(nextChap.id);
                        setActiveTab('materials');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Continue Learning</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const dailyQuiz = tests.find((t) => t.test_type === 'daily') || tests[0];
                        handleStartTest(dailyQuiz);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold"
                    >
                      Take Daily Quiz
                    </button>
                  </div>
                </div>

                {/* 6 KPI Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Syllabus Done</p>
                    <p className="text-2xl font-extrabold mt-1 text-indigo-600 dark:text-indigo-400">{syllabusCompletionPercent}%</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{completedChapterIds.length}/{chapters.length} Chapters</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Subjects Done</p>
                    <p className="text-2xl font-extrabold mt-1">{subjectsCompletedCount} / {subjects.length}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">All 9 Categories Active</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Tests Attempted</p>
                    <p className="text-2xl font-extrabold mt-1">{testAttempts.length}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">GS-I & CSAT History</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Avg Accuracy</p>
                    <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{averageAccuracy}%</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Target ≥ 75% for Cut-off</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Daily Streak</p>
                    <p className="text-2xl font-extrabold mt-1 text-amber-500 flex items-center gap-1">
                      <Flame className="w-5 h-5 fill-amber-500" />
                      <span>{streakData.current_streak} Days</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Best: {streakData.longest_streak} Days (IST)</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Earned XP</p>
                    <p className="text-2xl font-extrabold mt-1 text-purple-600 dark:text-purple-400">{streakData.total_xp} XP</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{achievements.filter((a) => a.unlocked).length}/{achievements.length} Badges</p>
                  </div>
                </div>

                {/* Recent Test Scores & Recommended Study Topics + Upcoming Revisions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Test Scores */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-base">Recent Prelims Test Scores</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('analytics')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Full Analytics →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {testAttempts.slice(0, 4).map((att) => (
                        <div
                          key={att.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                {att.paper}
                              </span>
                              <p className="text-xs sm:text-sm font-bold">{att.test_title}</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Correct: {att.correct_count} | Wrong: {att.incorrect_count} (-{att.negative_marks_deducted}M) | Accuracy: {att.accuracy_percentage}%
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                              {att.net_score} / {att.max_marks}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAttemptId(att.id);
                                setActiveTab('analytics');
                              }}
                              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 underline"
                            >
                              Review Qs
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Topics & Bookmarked Revision Tasks */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-base">Recommended Study & Revision Tasks</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('study-plan')}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Open Study Plan →
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {studyPlanTasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <input
                              type="checkbox"
                              checked={task.is_completed}
                              onChange={() => handleToggleStudyTask(task)}
                              className="mt-1 rounded text-indigo-600"
                            />
                            <div>
                              <p className={`text-xs sm:text-sm font-bold ${task.is_completed ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{task.recommendation_reason}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                              task.priority === 'high'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 2: STUDY MATERIALS MODULE (ALL 9 UPSC PRELIMS SUBJECTS)
            =============================================================== */}
            {activeTab === 'materials' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-extrabold">UPSC Prelims Study Materials & Syllabus Tracker</h1>
                      <p className="text-xs text-slate-500">
                        Select any of the 9 mandatory UPSC Prelims categories to read structured notes, download handouts, or launch topic tests.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search chapters or subtopics..."
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                          showBookmarkedOnly
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Bookmarked ({bookmarkedChapterIds.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* 9 UPSC Subject Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {subjects.map((subj) => {
                      const subjChaps = chapters.filter((c) => c.subject_id === subj.id);
                      const doneCount = subjChaps.filter((c) => completedChapterIds.includes(c.id)).length;
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => {
                            setSelectedSubjectId(subj.id);
                            const firstChap = chapters.find((c) => c.subject_id === subj.id);
                            if (firstChap) setSelectedChapterId(firstChap.id);
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                            selectedSubjectId === subj.id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                          }`}
                        >
                          <span>{subj.code}</span>
                          <span className="opacity-75 text-[10px]">
                            ({doneCount}/{subjChaps.length})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Official UPSC Syllabus Box for Selected Subject */}
                <div className="bg-indigo-950/90 text-indigo-100 rounded-2xl p-5 border border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Official UPSC Prelims Syllabus — {activeSubject.name} ({activeSubject.paper})
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-800 text-indigo-200 font-semibold">
                      {activeSubject.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">{activeSubject.syllabus_text}</p>
                </div>

                {/* Chapter List + Active Study Material Reader */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Chapters Sidebar */}
                  <div className="space-y-3">
                    <h2 className="font-bold text-sm px-1">
                      Chapters in {activeSubject.category} ({filteredChapters.length})
                    </h2>
                    {filteredChapters.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                        No chapters match your current filter. Try clearing the search or bookmark toggle.
                      </div>
                    ) : (
                      filteredChapters.map((chap) => {
                        const isDone = completedChapterIds.includes(chap.id);
                        const isBookmarked = bookmarkedChapterIds.includes(chap.id);
                        return (
                          <div
                            key={chap.id}
                            className={`p-4 rounded-2xl border transition cursor-pointer ${
                              activeChapter?.id === chap.id
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                            onClick={() => setSelectedChapterId(chap.id)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                  Chapter {chap.chapter_number} • {chap.estimated_minutes} min
                                </span>
                                <h3 className="font-bold text-sm mt-0.5">{chap.title}</h3>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {isBookmarked && <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {chap.subtopics.map((st, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                >
                                  {st}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Active Chapter Study Notes & Reference Viewer */}
                  {activeChapter && (
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Chapter {activeChapter.chapter_number}</span>
                            <span>•</span>
                            <span>Revision Count: {revisionCounts[activeChapter.id] || 0}x</span>
                          </div>
                          <h2 className="text-xl font-extrabold mt-1">{activeChapter.title}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(activeChapter.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                              bookmarkedChapterIds.includes(activeChapter.id)
                                ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-300'
                                : 'border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{bookmarkedChapterIds.includes(activeChapter.id) ? 'Bookmarked' : 'Bookmark'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleChapterComplete(activeChapter)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                              completedChapterIds.includes(activeChapter.id)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>
                              {completedChapterIds.includes(activeChapter.id)
                                ? 'Completed (+XP Logged)'
                                : `Mark Complete (+${rewardSettings.chapter_completion_xp} XP)`}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Structured Study Notes */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          English Prelims Study Notes
                        </h3>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-sm leading-relaxed">
                          {activeChapter.notes_markdown.split('\\n').map((line, idx) => (
                            <p key={idx} className={line.startsWith('###') ? 'font-bold text-base text-indigo-600 dark:text-indigo-400' : ''}>
                              {line.replace('### ', '')}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* High-Yield Revision Summary Points */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          High-Yield Prelims Revision Bullets
                        </h3>
                        <ul className="space-y-2">
                          {activeChapter.summary_points.map((pt, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2.5 text-xs sm:text-sm bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 p-3 rounded-xl"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Official Reference Links & Authorized Downloadable Handout */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <h4 className="text-xs font-bold uppercase text-slate-400">Official Reference Resources</h4>
                          <div className="space-y-1.5">
                            {activeChapter.reference_links.map((ref, i) => (
                              <a
                                key={i}
                                href={ref.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
                              >
                                <span>{ref.title} ({ref.source})</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="text-xs font-bold uppercase text-slate-400">Authorized Handout & Topic Test</h4>
                            <p className="text-xs text-slate-500 mt-1">{activeChapter.pdf_title}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadStudyHandout(activeChapter, activeSubject)}
                              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Notes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const customTopicTest: TestItem = {
                                  id: 'test-chap-' + activeChapter.id,
                                  title: `Topic Test: ${activeChapter.title}`,
                                  test_type: 'topic',
                                  subject_id: activeChapter.subject_id,
                                  chapter_id: activeChapter.id,
                                  paper: activeSubject.paper,
                                  total_questions: topicQuestionLimit,
                                  duration_minutes: 10,
                                  positive_marks: activeSubject.paper === 'CSAT' ? 2.5 : 2.0,
                                  negative_marks: activeSubject.paper === 'CSAT' ? 0.8333 : 0.6667,
                                  scheduled_date: todayIST,
                                  is_published: true,
                                  question_ids: questions
                                    .filter((q) => q.subject_id === activeChapter.subject_id)
                                    .map((q) => q.id),
                                };
                                handleStartTest(customTopicTest, topicQuestionLimit);
                              }}
                              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5" />
                              <span>Practice Topic MCQs</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 3: PRACTICE TESTS & FULL-LENGTH MOCK EXAM ENGINE
            =============================================================== */}
            {activeTab === 'tests' && (
              <div className="space-y-6">
                {!activeExam ? (
                  <>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-xl font-extrabold">Practice Tests & Full-Length Prelims Mock Exams</h1>
                          <p className="text-xs text-slate-500">
                            Realistic UPSC marking: GS Paper I (+2.00 / -0.6667) & CSAT Paper II (+2.50 / -0.8333, 33% qualifying). Mock marks are stored separately from gamification XP.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <label className="font-semibold text-slate-500">Topic Test Qs:</label>
                          <select
                            value={topicQuestionLimit}
                            onChange={(e) => setTopicQuestionLimit(Number(e.target.value))}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                          >
                            <option value={2}>2 Questions</option>
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                          </select>
                        </div>
                      </div>

                      {/* Filter Tabs: All, Topic-wise, Daily Quiz, Weekly Test, GS-I Mock, CSAT Mock */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'all', label: 'All Tests' },
                          { id: 'topic', label: 'A. Topic-wise Tests' },
                          { id: 'daily', label: 'B. Daily Quiz (Streak)' },
                          { id: 'weekly', label: 'C. Weekly Timed Test' },
                          { id: 'mock_gs1', label: 'D1. Full Mock GS Paper I' },
                          { id: 'mock_csat', label: 'D2. Full Mock CSAT Paper II' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setTestCategoryFilter(tab.id as 'all' | TestType)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                              testCategoryFilter === tab.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Test Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {tests
                        .filter((t) => (testCategoryFilter === 'all' ? true : t.test_type === testCategoryFilter))
                        .map((test) => (
                          <div
                            key={test.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                  {test.test_type.replace('_', ' ')} • {test.paper}
                                </span>
                                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{test.duration_minutes} mins</span>
                                </span>
                              </div>
                              <h3 className="font-bold text-base sm:text-lg">{test.title}</h3>
                              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                                  <span className="text-slate-400 block text-[10px]">Correct</span>
                                  <span className="font-bold text-emerald-600">+{test.positive_marks}M</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                                  <span className="text-slate-400 block text-[10px]">Negative (1/3)</span>
                                  <span className="font-bold text-rose-600">-{test.negative_marks.toFixed(2)}M</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                                  <span className="text-slate-400 block text-[10px]">Criteria</span>
                                  <span className="font-bold">
                                    {test.paper === 'CSAT' ? '33% Qualify' : 'Merit Rank'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleStartTest(test, topicQuestionLimit)}
                              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm"
                            >
                              <Play className="w-4 h-4" />
                              <span>Start Exam Interface</span>
                            </button>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  /* LIVE UPSC EXAM-STYLE INTERFACE */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Question Area */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {activeExam.test.title} ({activeExam.test.paper})
                          </span>
                          <h2 className="text-lg font-extrabold">
                            Question {activeExam.currentIndex + 1} of {activeExam.questions.length}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-sm font-extrabold">
                          <Clock className="w-4 h-4" />
                          <span>{formatSeconds(activeExam.remainingSeconds)}</span>
                        </div>
                      </div>

                      {(() => {
                        const currQ = activeExam.questions[activeExam.currentIndex];
                        const selected = activeExam.selectedOptions[currQ.id] || null;
                        return (
                          <div className="space-y-5">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>
                                Marking: <strong className="text-emerald-600">+{activeExam.test.positive_marks}</strong> | Negative:{' '}
                                <strong className="text-rose-600">-{activeExam.test.negative_marks.toFixed(2)}</strong>
                              </span>
                              <span className="uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                Difficulty: {currQ.difficulty}
                              </span>
                            </div>

                            <p className="text-sm sm:text-base font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                              {currQ.question_text}
                            </p>

                            <div className="space-y-3">
                              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                                const optText =
                                  optKey === 'A'
                                    ? currQ.option_a
                                    : optKey === 'B'
                                    ? currQ.option_b
                                    : optKey === 'C'
                                    ? currQ.option_c
                                    : currQ.option_d;
                                const isSelected = selected === optKey;
                                return (
                                  <button
                                    key={optKey}
                                    type="button"
                                    onClick={() =>
                                      setActiveExam((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              selectedOptions: { ...prev.selectedOptions, [currQ.id]: optKey },
                                            }
                                          : null
                                      )
                                    }
                                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition flex items-start gap-3 ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                    }`}
                                  >
                                    <span
                                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isSelected ? 'bg-white text-indigo-700' : 'bg-slate-100 dark:bg-slate-800'
                                      }`}
                                    >
                                      {optKey}
                                    </span>
                                    <span className="pt-0.5">{optText}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Exam Action Bar: Previous, Mark for Review, Clear, Save & Next */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const prevIdx = Math.max(0, activeExam.currentIndex - 1);
                                    const prevQId = activeExam.questions[prevIdx].id;
                                    setActiveExam((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            currentIndex: prevIdx,
                                            visitedQuestions: { ...prev.visitedQuestions, [prevQId]: true },
                                          }
                                        : null
                                    );
                                  }}
                                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                                >
                                  ← Previous
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveExam((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            markedForReview: {
                                              ...prev.markedForReview,
                                              [currQ.id]: !prev.markedForReview[currQ.id],
                                            },
                                          }
                                        : null
                                    )
                                  }
                                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
                                    activeExam.markedForReview[currQ.id]
                                      ? 'bg-purple-600 text-white border-purple-600'
                                      : 'border-purple-400 text-purple-600 dark:text-purple-300'
                                  }`}
                                >
                                  {activeExam.markedForReview[currQ.id] ? 'Marked for Review' : 'Mark for Review'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveExam((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            selectedOptions: { ...prev.selectedOptions, [currQ.id]: null },
                                          }
                                        : null
                                    )
                                  }
                                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500"
                                >
                                  Clear Response
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  if (activeExam.currentIndex + 1 < activeExam.questions.length) {
                                    const nextIdx = activeExam.currentIndex + 1;
                                    const nextQId = activeExam.questions[nextIdx].id;
                                    setActiveExam((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            currentIndex: nextIdx,
                                            visitedQuestions: { ...prev.visitedQuestions, [nextQId]: true },
                                          }
                                        : null
                                    );
                                  } else {
                                    handleSubmitExam();
                                  }
                                }}
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                              >
                                {activeExam.currentIndex + 1 < activeExam.questions.length
                                  ? 'Save & Next →'
                                  : 'Save & Finish Exam'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Question Navigation Palette Sidebar */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-sm">Question Navigation Palette</h3>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
                            <span>Answered</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-amber-500 inline-block" />
                            <span>Visited / Unanswered</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-purple-600 inline-block" />
                            <span>Marked for Review</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 inline-block" />
                            <span>Not Visited</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-2 pt-2">
                          {activeExam.questions.map((q, idx) => {
                            const isAns = Boolean(activeExam.selectedOptions[q.id]);
                            const isRev = Boolean(activeExam.markedForReview[q.id]);
                            const isVis = Boolean(activeExam.visitedQuestions[q.id]);
                            let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';
                            if (isRev) btnClass = 'bg-purple-600 text-white';
                            else if (isAns) btnClass = 'bg-emerald-600 text-white';
                            else if (isVis) btnClass = 'bg-amber-500 text-white';

                            return (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() =>
                                  setActiveExam((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          currentIndex: idx,
                                          visitedQuestions: { ...prev.visitedQuestions, [q.id]: true },
                                        }
                                      : null
                                  )
                                }
                                className={`h-10 rounded-xl font-bold text-xs transition ${btnClass} ${
                                  activeExam.currentIndex === idx ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                                }`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={handleSubmitExam}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md"
                        >
                          Submit Exam & Compute UPSC Score
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveExam(null)}
                          className="w-full py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500"
                        >
                          Cancel Attempt
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===============================================================
                TAB 4: TEST RESULTS & RECHARTS PERFORMANCE ANALYSIS
            =============================================================== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Attempt Selector & Latest Scorecard */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-extrabold">Test Results & UPSC Negative-Marking Analysis</h1>
                      <p className="text-xs text-slate-500">
                        Select any completed test attempt to inspect raw marks, 1/3rd penalty deductions, and question-by-question explanations.
                      </p>
                    </div>
                    <select
                      value={activeAttempt?.id || ''}
                      onChange={(e) => setSelectedAttemptId(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                    >
                      {testAttempts.map((att) => (
                        <option key={att.id} value={att.id}>
                          {att.test_title} — Net: {att.net_score}/{att.max_marks}
                        </option>
                      ))}
                    </select>
                  </div>

                  {activeAttempt && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Total Qs</span>
                        <p className="text-lg font-extrabold mt-0.5">{activeAttempt.total_questions}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                        <span className="text-[10px] text-emerald-600 uppercase font-bold">Correct</span>
                        <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{activeAttempt.correct_count}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                        <span className="text-[10px] text-rose-600 uppercase font-bold">Incorrect</span>
                        <p className="text-lg font-extrabold text-rose-600 mt-0.5">{activeAttempt.incorrect_count}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Unanswered</span>
                        <p className="text-lg font-extrabold mt-0.5">{activeAttempt.unanswered_count}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Raw Marks</span>
                        <p className="text-lg font-extrabold mt-0.5">+{activeAttempt.raw_marks}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40">
                        <span className="text-[10px] text-rose-600 uppercase font-bold">1/3 Penalty</span>
                        <p className="text-lg font-extrabold text-rose-600 mt-0.5">-{activeAttempt.negative_marks_deducted}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
                        <span className="text-[10px] text-indigo-600 uppercase font-bold">Net Score</span>
                        <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {activeAttempt.net_score} / {activeAttempt.max_marks}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Time/Q</span>
                        <p className="text-lg font-extrabold mt-0.5">
                          {Math.round(activeAttempt.time_taken_seconds / Math.max(1, activeAttempt.total_questions))}s
                        </p>
                      </div>
                    </div>
                  )}

                  {activeAttempt?.paper === 'CSAT' && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                        activeAttempt.qualified_status
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      <span>
                        CSAT Paper II Qualifying Threshold Check (Mandatory 33% = 66.67 / 200 Equivalent):
                      </span>
                      <span className="uppercase px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900">
                        {activeAttempt.qualified_status ? 'QUALIFIED (≥ 33%)' : 'BELOW 33% THRESHOLD'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recharts Performance Graphs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart 1: Daily Score & Accuracy Trajectory */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h2 className="font-bold text-sm">Daily Performance & Accuracy Trend (%)</h2>
                    <div className="relative h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="accuracy"
                            name="Accuracy %"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.2}
                          />
                          <Area
                            type="monotone"
                            dataKey="scorePercent"
                            name="Net Score %"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.15}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Subject-wise Strengths & Weaknesses */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h2 className="font-bold text-sm">Subject-Wise Accuracy Across All 9 UPSC Categories (%)</h2>
                    <div className="relative h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectPerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                          <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="accuracy" name="Subject Accuracy %" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Weekly Test Score Improvement */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h2 className="font-bold text-sm">Weekly Mock Trajectory (GS-I & CSAT Scaled / 200)</h2>
                    <div className="relative h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                          <YAxis domain={[40, 140]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="gs1Net" name="GS Paper I Net" stroke="#4f46e5" strokeWidth={2.5} />
                          <Line type="monotone" dataKey="csatNet" name="CSAT Paper II Net" stroke="#10b981" strokeWidth={2.5} />
                          <Line type="monotone" dataKey="targetCutoff" name="Safe Cut-Off Benchmark" stroke="#f59e0b" strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Strong vs Weak Subjects Diagnostic Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="font-bold text-sm">Diagnostic Subject Classification</h2>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                          Strong Subjects (≥ 70% Accuracy)
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {strongSubjects.map((s) => (
                            <span
                              key={s.code}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-sm"
                            >
                              {s.subject}: {s.accuracy}%
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                        <p className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase">
                          Priority Revision Subjects (&lt; 65% Accuracy)
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {weakSubjects.map((s) => (
                            <span
                              key={s.code}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs font-bold text-rose-700 dark:text-rose-300 shadow-sm"
                            >
                              {s.subject}: {s.accuracy}%
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Review & Official Explanations */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h2 className="font-bold text-base">Question-by-Question Solutions & Explanations</h2>
                  <div className="space-y-4">
                    {(activeAttempt && activeAttempt.answers.length > 0
                      ? activeAttempt.answers.map((ans) => ({
                          q: questions.find((item) => item.id === ans.question_id) || questions[0],
                          selected: ans.selected_option,
                          marks: ans.marks_awarded,
                        }))
                      : questions.slice(0, 5).map((q) => ({ q, selected: q.correct_option, marks: 2.0 }))
                    ).map(({ q, selected, marks }, index) => (
                      <div
                        key={q.id + '-' + index}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            Q{index + 1} • {q.paper} • Correct Option: {q.correct_option}
                          </span>
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              selected === q.correct_option
                                ? 'bg-emerald-100 text-emerald-800'
                                : selected === null
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Your Choice: {selected || 'Skipped'} ({marks >= 0 ? `+${marks}` : marks.toFixed(2)}M)
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold">{q.question_text}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
                          <strong>Explanation:</strong> {q.explanation} <em className="text-slate-400">({q.source_reference})</em>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 5: PERSONALIZED STUDY PLAN (WITH INTEGRATED STREAKS & REWARDS)
            =============================================================== */}
            {activeTab === 'study-plan' && (
              <div className="space-y-6">
                {/* Rule-Based Study Plan Header & Daily Target Control */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        Transparent Rule-Based Recommendation Engine (AI-Upgrade Ready)
                      </span>
                      <h1 className="text-xl font-extrabold mt-0.5">
                        Personalized Study Plan, Daily Streaks & XP Rewards
                      </h1>
                      <p className="text-xs text-slate-500">
                        Automatically prioritizes weak subjects (&lt;65% accuracy), uncompleted syllabus chapters, and bookmarked revisions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRegenerateStudyPlan}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Recalculate Study Plan</span>
                    </button>
                  </div>

                  {/* Daily Study Target Slider */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold block">
                        Configurable Daily Study Target: <span className="text-indigo-600">{dailyTargetMinutes} Minutes ({(dailyTargetMinutes / 60).toFixed(1)} Hours/Day)</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Logged Today ({todayIST} IST): <strong>{todayLoggedMinutes} mins</strong>
                      </p>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={360}
                      step={30}
                      value={dailyTargetMinutes}
                      onChange={(e) => setDailyTargetMinutes(Number(e.target.value))}
                      className="w-full sm:w-56 accent-indigo-600"
                    />
                  </div>

                  {/* Recommended Daily Study Tasks */}
                  <div className="space-y-3">
                    {studyPlanTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleStudyTask(task)}
                            className="mt-1 w-4 h-4 rounded text-indigo-600"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  task.priority === 'high'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {task.priority} priority
                              </span>
                              <span className="text-xs text-slate-400">{task.estimated_minutes} mins</span>
                            </div>
                            <h3 className={`font-bold text-sm mt-1 ${task.is_completed ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{task.recommendation_reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {task.chapter_id && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubjectId(task.subject_id);
                                if (task.chapter_id) setSelectedChapterId(task.chapter_id);
                                setActiveTab('materials');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Open Chapter
                            </button>
                          )}
                          {task.test_id && (
                            <button
                              type="button"
                              onClick={() => {
                                const targetTest = tests.find((t) => t.id === task.test_id) || tests[0];
                                handleStartTest(targetTest);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                            >
                              Start Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* INTEGRATED DAILY STREAKS & XP REWARDS SECTION (Inside Study Plan Module) */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-amber-500">
                        IST (Asia/Kolkata) Streak Boundary & Gamification Engine
                      </span>
                      <h2 className="text-lg font-extrabold mt-0.5">
                        Daily Learning Streaks, Activity Calendar & Achievement Badges
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <div>
                          <p className="text-xs font-extrabold text-amber-700 dark:text-amber-300">
                            {streakData.current_streak} Day Streak
                          </p>
                          <p className="text-[10px] text-amber-600">Longest: {streakData.longest_streak}d</p>
                        </div>
                      </div>
                      <div className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                        <p className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                          {streakData.total_xp} Total XP
                        </p>
                        <p className="text-[10px] text-purple-600">Level {Math.floor(streakData.total_xp / 200) + 1} Aspirant</p>
                      </div>
                    </div>
                  </div>

                  {/* 14-Day IST Streak Calendar */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase text-slate-400">
                      14-Day Activity Calendar (Indian Standard Time Boundary)
                    </h3>
                    <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
                      {last14DaysIST.map((d) => (
                        <div
                          key={d.date}
                          className={`p-2 rounded-xl border text-center ${
                            d.active
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <p className="text-[10px] font-semibold">{d.label}</p>
                          <div className="mt-1 flex justify-center">
                            {d.active ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 inline-block" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievement Badges Grid */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase text-slate-400">
                      UPSC Milestone Achievement Badges
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((ach) => (
                        <div
                          key={ach.id}
                          className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                            ach.unlocked
                              ? 'bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/30 dark:to-slate-900 border-amber-300 dark:border-amber-800'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-65'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              ach.unlocked
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}
                          >
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm">{ach.title}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                +{ach.xp_bonus} XP
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
                            <p className="text-[10px] font-semibold mt-1.5 text-emerald-600 dark:text-emerald-400">
                              {ach.unlocked ? `Unlocked on ${ach.unlocked_at}` : 'Locked — keep studying to unlock'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 6: ADMIN DASHBOARD (ROLE-PROTECTED OPERATIONS)
            =============================================================== */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                        Protected by public.is_admin() & Supabase RLS Policies
                      </span>
                      <h1 className="text-xl font-extrabold">Administrator Control Center</h1>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'approvals', label: `Student Approvals (${approvals.filter((a) => a.status === 'pending').length})` },
                        { id: 'chapters', label: 'Add Chapter & PDF' },
                        { id: 'questions', label: 'Upload Questions / CSV' },
                        { id: 'tests', label: 'Create Quiz / Mock' },
                        { id: 'rewards', label: 'Configure XP & Scoring' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAdminSubTab(t.id as typeof adminSubTab)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            adminSubTab === t.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtab 1: Approve or Reject Student Access */}
                  {adminSubTab === 'approvals' && (
                    <div className="space-y-3 pt-2">
                      {approvals.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{item.student_name}</span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  item.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {item.student_email} • Target CSE {item.target_year} • {item.review_notes}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateApproval(item.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                            >
                              Approve Access
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateApproval(item.id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subtab 2: Add Chapter & Study Notes */}
                  {adminSubTab === 'chapters' && (
                    <form onSubmit={handleAddChapter} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">UPSC Subject Category</label>
                          <select
                            value={newChapterSubj}
                            onChange={(e) => setNewChapterSubj(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            {subjects.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.code} — {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Chapter Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Constitutional Bodies: ECI, UPSC, CAG"
                            value={newChapterTitle}
                            onChange={(e) => setNewChapterTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold mb-1">Subtopics (Comma-separated)</label>
                          <input
                            type="text"
                            value={newChapterSubtopics}
                            onChange={(e) => setNewChapterSubtopics(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Authorized Handout Filename</label>
                          <input
                            type="text"
                            value={newChapterPdf}
                            onChange={(e) => setNewChapterPdf(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Study Notes (Markdown)</label>
                        <textarea
                          rows={4}
                          value={newChapterNotes}
                          onChange={(e) => setNewChapterNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Publish Chapter & Study Material
                      </button>
                    </form>
                  )}

                  {/* Subtab 3: Single Question & Bulk CSV Uploader */}
                  {adminSubTab === 'questions' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                      <form onSubmit={handleAddSingleQuestion} className="space-y-3">
                        <h3 className="font-bold text-sm">Add Individual UPSC MCQ</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newQSubj}
                            onChange={(e) => setNewQSubj(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            {subjects.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.code}
                              </option>
                            ))}
                          </select>
                          <select
                            value={newQPaper}
                            onChange={(e) => setNewQPaper(e.target.value as PaperType)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="GS-I">GS Paper I (+2.0 / -0.66)</option>
                            <option value="CSAT">CSAT Paper II (+2.5 / -0.83)</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Question stem..."
                          value={newQText}
                          onChange={(e) => setNewQText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Option A"
                            value={newQOptA}
                            onChange={(e) => setNewQOptA(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Option B"
                            value={newQOptB}
                            onChange={(e) => setNewQOptB(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Option C"
                            value={newQOptC}
                            onChange={(e) => setNewQOptC(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Option D"
                            value={newQOptD}
                            onChange={(e) => setNewQOptD(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold">Correct Answer:</label>
                          <select
                            value={newQCorrect}
                            onChange={(e) => setNewQCorrect(e.target.value as 'A' | 'B' | 'C' | 'D')}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          placeholder="Detailed answer explanation..."
                          value={newQExplanation}
                          onChange={(e) => setNewQExplanation(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                        >
                          Save Question to Bank
                        </button>
                      </form>

                      <div className="space-y-3">
                        <h3 className="font-bold text-sm">Bulk CSV Question Upload</h3>
                        <p className="text-[11px] text-slate-500">
                          Format: <code className="font-mono">subject_id,paper,question,optA,optB,optC,optD,correctOpt,explanation</code>
                        </p>
                        <textarea
                          rows={6}
                          value={csvUploadText}
                          onChange={(e) => setCsvUploadText(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleBulkCsvUpload}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                        >
                          Parse & Import CSV Questions
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subtab 4: Create Quiz / Mock Test */}
                  {adminSubTab === 'tests' && (
                    <form onSubmit={handleCreateTest} className="space-y-4 pt-2 max-w-lg">
                      <div>
                        <label className="block text-xs font-bold mb-1">Assessment Title</label>
                        <input
                          type="text"
                          placeholder="e.g., All-India Prelims Simulators — Mock Test 2"
                          value={newTestTitle}
                          onChange={(e) => setNewTestTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold mb-1">Category</label>
                          <select
                            value={newTestType}
                            onChange={(e) => setNewTestType(e.target.value as TestType)}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="daily">Daily Quiz</option>
                            <option value="weekly">Weekly Test</option>
                            <option value="mock_gs1">Full Mock GS-I</option>
                            <option value="mock_csat">Full Mock CSAT</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Paper</label>
                          <select
                            value={newTestPaper}
                            onChange={(e) => setNewTestPaper(e.target.value as PaperType)}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="GS-I">GS-I</option>
                            <option value="CSAT">CSAT</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1">Duration (Min)</label>
                          <input
                            type="number"
                            value={newTestDuration}
                            onChange={(e) => setNewTestDuration(Number(e.target.value))}
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        Publish Test to Student Portal
                      </button>
                    </form>
                  )}

                  {/* Subtab 5: Configure XP Rewards & Scoring */}
                  {adminSubTab === 'rewards' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold mb-1">Chapter Completion XP</label>
                        <input
                          type="number"
                          value={rewardSettings.chapter_completion_xp}
                          onChange={(e) =>
                            setRewardSettings((prev) => ({ ...prev, chapter_completion_xp: Number(e.target.value) }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Daily Quiz XP</label>
                        <input
                          type="number"
                          value={rewardSettings.daily_quiz_xp}
                          onChange={(e) =>
                            setRewardSettings((prev) => ({ ...prev, daily_quiz_xp: Number(e.target.value) }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Full Mock Test XP</label>
                        <input
                          type="number"
                          value={rewardSettings.mock_test_xp}
                          onChange={(e) =>
                            setRewardSettings((prev) => ({ ...prev, mock_test_xp: Number(e.target.value) }))
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs font-bold"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <button
                          type="button"
                          onClick={() => notify('Saved updated XP and UPSC scoring parameters to admin_settings!', 'success')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                        >
                          Save Admin Settings
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===============================================================
                TAB 7: DATABASE ARCHITECTURE (18 TABLES), GITHUB CI/CD & 7-DAY ROADMAP
            =============================================================== */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h1 className="text-xl font-extrabold">
                    Complete Database Architecture (18 Tables + RLS), GitHub Pages CI/CD & 7-Day Roadmap
                  </h1>
                  <p className="text-xs text-slate-500">
                    Every file below is packaged inside your downloadable <code className="font-mono">upsc_prelims_github_project.zip</code> archive ready to push directly to GitHub.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        day: 'Day 1',
                        title: 'Setup, UI, Landing & Auth Gate',
                        desc: 'Vite + React + TS + Tailwind scaffolding, Landing page, Supabase Auth, and profiles + student_approvals RLS gate.',
                      },
                      {
                        day: 'Day 2',
                        title: 'Dashboard & 9 UPSC Categories',
                        desc: 'Live Student Dashboard KPIs, all 9 UPSC Prelims subject categories, chapter hierarchy, and responsive sidebar/mobile nav.',
                      },
                      {
                        day: 'Day 3',
                        title: 'Study Materials & Progress',
                        desc: 'English markdown study notes, official NCERT/PIB/UPSC links, printable notes export, bookmarks, and completion tracking.',
                      },
                      {
                        day: 'Day 4',
                        title: 'Practice & Mock Exam Engine',
                        desc: 'Topic-wise tests, Daily Quiz, Weekly Test, and Full-Length GS-I (+2/-0.66) & CSAT (+2.5/-0.83, 33%) Mock Exam interface.',
                      },
                      {
                        day: 'Day 5',
                        title: 'Recharts Analytics, Study Plan & Streaks',
                        desc: 'Post-exam scorecard, 3 Recharts graphs, rule-based Study Plan generator, and integrated IST Daily Streaks + XP Badges.',
                      },
                      {
                        day: 'Day 6 & Day 7',
                        title: 'Admin Center, RLS Audit & Deployment',
                        desc: 'Admin student approval, chapter/note CRUD, CSV question uploader, XP config, and GitHub Pages / Cloudflare deployment.',
                      },
                    ].map((item) => (
                      <div
                        key={item.day}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                      >
                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{item.day}</span>
                        <h3 className="font-bold text-sm">{item.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* 18 Required Tables Verification Grid */}
                  <div className="pt-2">
                    <h2 className="font-bold text-sm mb-2">
                      All 18 Supabase PostgreSQL Tables Included in <code className="font-mono">supabase/migrations/001_initial_schema_and_rls.sql</code>:
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
                      {[
                        '1. profiles',
                        '2. student_approvals',
                        '3. subjects',
                        '4. chapters',
                        '5. study_materials',
                        '6. study_progress',
                        '7. questions',
                        '8. tests',
                        '9. test_questions',
                        '10. test_attempts',
                        '11. student_answers',
                        '12. performance_summary',
                        '13. study_plans',
                        '14. daily_activities',
                        '15. streaks',
                        '16. achievements',
                        '17. student_achievements',
                        '18. admin_settings',
                      ].map((tbl) => (
                        <div
                          key={tbl}
                          className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold"
                        >
                          {tbl}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
