-- Phase 6.4: Initial achievements seed data (idempotent)

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    'First Course Completed',
    'first-course-completed',
    'Complete your first course to unlock this milestone.',
    'COURSE_COMPLETION',
    'award',
    '#22C55E',
    '{"type":"COURSE_COMPLETION","target":1}',
    50, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'first-course-completed'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '5 Courses Completed',
    'five-courses-completed',
    'Complete five full courses.',
    'COURSE_COMPLETION',
    'medal',
    '#16A34A',
    '{"type":"COURSE_COMPLETION","target":5}',
    250, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'five-courses-completed'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '10 Lessons Mastered',
    'ten-lessons-completed',
    'Complete 10 lessons across any courses.',
    'LESSON_COMPLETION',
    'book-open',
    '#0EA5E9',
    '{"type":"LESSON_COMPLETION","target":10}',
    100, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'ten-lessons-completed'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '100 Lessons Mastered',
    'hundred-lessons-completed',
    'Complete 100 lessons to prove deep consistency.',
    'LESSON_COMPLETION',
    'graduation-cap',
    '#2563EB',
    '{"type":"LESSON_COMPLETION","target":100}',
    600, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'hundred-lessons-completed'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    'First Enrollment',
    'first-enrollment',
    'Enroll in your first course.',
    'COURSE_ENROLLMENT',
    'bookmark-plus',
    '#F59E0B',
    '{"type":"COURSE_ENROLLMENT","target":1}',
    25, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'first-enrollment'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '10 Enrollments Explorer',
    'ten-enrollments',
    'Enroll in ten different courses.',
    'COURSE_ENROLLMENT',
    'compass',
    '#D97706',
    '{"type":"COURSE_ENROLLMENT","target":10}',
    150, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'ten-enrollments'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '7 Day Streak',
    'streak-7-days',
    'Learn for 7 consecutive days.',
    'STREAK_DAYS',
    'flame',
    '#F97316',
    '{"type":"STREAK_DAYS","target":7}',
    120, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'streak-7-days'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '30 Day Streak',
    'streak-30-days',
    'Learn for 30 consecutive days.',
    'STREAK_DAYS',
    'flame',
    '#DC2626',
    '{"type":"STREAK_DAYS","target":30}',
    500, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'streak-30-days'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '5 Hours of Study',
    'study-300-minutes',
    'Accumulate 300 minutes of learning time.',
    'STUDY_MINUTES',
    'clock',
    '#8B5CF6',
    '{"type":"STUDY_MINUTES","target":300}',
    100, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'study-300-minutes'
);

INSERT INTO achievements (
    name, slug, description, category, icon_url, badge_color, criteria_json,
    points, is_active, is_hidden, is_secret, created_at, updated_at
)
SELECT
    '20 Hours of Study',
    'study-1200-minutes',
    'Accumulate 1200 minutes of learning time.',
    'STUDY_MINUTES',
    'timer',
    '#7C3AED',
    '{"type":"STUDY_MINUTES","target":1200}',
    350, true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM achievements WHERE slug = 'study-1200-minutes'
);
