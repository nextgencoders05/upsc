-- ============================================================================
-- SEED DATA: 9 UPSC PRELIMS SUBJECT CATEGORIES, ACHIEVEMENTS & REWARD CONFIG
-- ============================================================================

INSERT INTO public.subjects (code, name, category, paper, description, syllabus_text, display_order) VALUES
('HIST', 'Indian History — Ancient, Medieval, Modern', 'History', 'GS-I', 'Comprehensive coverage of Ancient India, Medieval Sultanate & Mughal eras, and Modern Indian National Movement (1757–1947).', 'History of India and Indian National Movement: Indus Valley Civilization, Vedic Age, Mauryan & Gupta Empires, Bhakti & Sufi Movements, British Expansion, Socio-Religious Reforms, and Freedom Struggle.', 1),
('GEOG', 'Indian and World Geography', 'Geography', 'GS-I', 'Physical, Social, and Economic Geography of India and the World including Geomorphology, Climatology, Oceanography, and Indian Monsoon.', 'Indian and World Geography - Physical, Social, Economic Geography of India and the World: Plate Tectonics, Climate Systems, Drainage Basins, Soils, Natural Vegetation, Agriculture, and Mineral Resources.', 2),
('POL', 'Indian Polity and Constitution', 'Polity', 'GS-I', 'Constitutional framework, Fundamental Rights, DPSP, Parliament, Judiciary, Federalism, Panchayati Raj, and Constitutional Bodies.', 'Indian Polity and Governance - Constitution, Political System, Panchayati Raj, Public Policy, Rights Issues, Constitutional Amendments, Supreme Court Judgments, and Statutory Commissions.', 3),
('ECON', 'Indian Economy', 'Economy', 'GS-I', 'Macroeconomics, National Income, RBI & Monetary Policy, Union Budget, Taxation, Balance of Payments, Agriculture, and Inclusive Development.', 'Economic and Social Development - Sustainable Development, Poverty, Inclusion, Demographics, Social Sector Initiatives, Banking Reforms, Inflation, and External Sector.', 4),
('ENV', 'Environment and Ecology', 'Environment', 'GS-I', 'Ecosystem functions, Biodiversity hotspots, Protected Area Network (National Parks, Biosphere Reserves), Climate Change treaties, and Environmental Laws.', 'General issues on Environmental Ecology, Bio-diversity and Climate Change - UNFCCC, CBD, Ramsar Wetlands, Wildlife Protection Act 1972, Project Tiger, and Pollution Control.', 5),
('SCI', 'General Science and Technology', 'Science & Tech', 'GS-I', 'Core concepts in Physics, Chemistry, and Biology alongside Space Technology (ISRO), Biotechnology, Defence Missiles, Nanotech, and AI.', 'General Science and Technological Developments: Cell Biology, Human Immunity, CRISPR Gene Editing, Orbit Mechanics, Launch Vehicles, Semiconductor Mission, and Digital Public Infrastructure.', 6),
('CA', 'Current Affairs', 'Current Affairs', 'GS-I', 'National and International events, PIB Press Releases, Union Ministries Flagship Schemes, Global Indices, and International Summits.', 'Current events of national and international importance: Government Policies, Economic Survey highlights, India Year Book, Multilateral Groupings (G20, BRICS, QUAD), and Legal Developments.', 7),
('ART', 'Indian Art and Culture', 'Art & Culture', 'GS-I', 'Temple Architecture (Nagara, Dravida, Vesara), Buddhist & Jain Sculptures, Classical Dances, Hindustani & Carnatic Music, Painting Schools, and UNESCO Sites.', 'Salient aspects of Indian Art Forms, Literature and Architecture from ancient to modern times: Cave Architecture, Indo-Islamic Architecture, Classical Languages, and Intangible Cultural Heritage.', 8),
('CSAT', 'CSAT — Quantitative Aptitude, Logical Reasoning, and Reading Comprehension', 'Aptitude (Paper II)', 'CSAT', 'Civil Services Aptitude Test (Paper II): Reading Comprehension passages, Analytical & Logical Reasoning, Number System, Permutations, and Data Interpretation.', 'Comprehension; Interpersonal skills including communication skills; Logical reasoning and analytical ability; Decision-making and problem-solving; General mental ability; Basic numeracy (Class X level).', 9)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.achievements (code, title, description, icon_name, xp_bonus, criteria_type, criteria_threshold) VALUES
('BEGINNER_DAY_1', 'Beginner Badge', 'Completed your first qualifying UPSC daily study activity or quiz.', 'Sparkles', 50, 'streak_days', 1),
('CONSISTENCY_3', 'Consistency Badge', 'Maintained a consecutive 3-day learning streak in IST.', 'Flame', 100, 'streak_days', 3),
('WEEKLY_WARRIOR_7', 'Weekly Warrior Badge', 'Maintained a 7-day unbroken UPSC preparation streak.', 'ShieldCheck', 250, 'streak_days', 7),
('DEDICATED_ASPIRANT_30', 'Dedicated Aspirant Badge', 'Achieved a 30-day unbroken UPSC Prelims study streak.', 'Crown', 1000, 'streak_days', 30),
('CHAPTER_SCHOLAR_5', 'NCERT Foundation Scholar', 'Completed 5 UPSC Prelims syllabus chapters with revision notes.', 'BookOpen', 150, 'chapters_completed', 5),
('MOCK_CHALLENGER_3', 'Prelims Test Challenger', 'Completed 3 practice or mock examinations under timed conditions.', 'Award', 200, 'tests_completed', 3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.admin_settings (key, value_json, description) VALUES
('xp_rewards', '{"chapter_completion_xp": 50, "topic_test_xp": 75, "daily_quiz_xp": 60, "weekly_test_xp": 120, "mock_test_xp": 200}'::jsonb, 'Configurable XP reward values for qualifying student actions'),
('exam_rules', '{"gs1_positive": 2.0, "gs1_negative": 0.6667, "csat_positive": 2.5, "csat_negative": 0.8333, "csat_qualifying_percent": 33.0, "timezone": "Asia/Kolkata"}'::jsonb, 'Official UPSC Prelims scoring and IST boundary configuration')
ON CONFLICT (key) DO NOTHING;
