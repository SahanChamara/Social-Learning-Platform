-- Phase 7.1: Performance indexes for common query patterns (idempotent)

-- =====================================================================
-- Courses
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_courses_pub_arch_rating_enroll
    ON courses (published, archived, average_rating DESC, enrollment_count DESC);

CREATE INDEX IF NOT EXISTS idx_courses_creator_published_created
    ON courses (creator_id, published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_creator_draft_updated
    ON courses (creator_id, draft, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_creator_archived_updated
    ON courses (creator_id, archived, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_category_published_created
    ON courses (category_id, published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_published_published_at
    ON courses (published, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_featured_published_rating
    ON courses (featured, published, average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_courses_published_enroll_view
    ON courses (published, enrollment_count DESC, view_count DESC);

CREATE INDEX IF NOT EXISTS idx_courses_difficulty_published_rating
    ON courses (difficulty, published, average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_courses_published_language_created
    ON courses (published, lower(language), created_at DESC);

CREATE INDEX IF NOT EXISTS idx_courses_search_tsv
    ON courses
    USING gin (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '')));

-- Join table for tag-based course lookups
CREATE INDEX IF NOT EXISTS idx_course_tags_tag_course
    ON course_tags (tag_id, course_id);

-- =====================================================================
-- Enrollments
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_enrollments_user_enrolled_at
    ON enrollments (user_id, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_status_enrolled_at
    ON enrollments (user_id, status, enrolled_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_status
    ON enrollments (course_id, status);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_user
    ON enrollments (course_id, user_id);

-- =====================================================================
-- Progress
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_progress_enrollment_completed
    ON lesson_progress (enrollment_id, completed);

CREATE INDEX IF NOT EXISTS idx_progress_user_completed
    ON lesson_progress (user_id, completed);

-- =====================================================================
-- Comments
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_comments_target_root_visibility
    ON comments (commentable_type, commentable_id, parent_id, is_deleted, is_pinned, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_parent_visibility_created
    ON comments (parent_id, is_deleted, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_comments_root_visibility_created
    ON comments (root_comment_id, is_deleted, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_comments_user_visibility_created
    ON comments (user_id, is_deleted, created_at DESC);

-- =====================================================================
-- Ratings
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_ratings_course_visible_recent
    ON ratings (course_id, is_hidden, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_course_visible_helpful
    ON ratings (course_id, is_hidden, helpful_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_course_visible_value_recent
    ON ratings (course_id, is_hidden, rating_value, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ratings_response_queue
    ON ratings (created_at ASC)
    WHERE is_hidden = false
      AND admin_response IS NULL
      AND rating_value <= 2;

-- =====================================================================
-- Likes
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_likes_user_type_created
    ON likes (user_id, likeable_type, created_at DESC);

-- =====================================================================
-- Modules and Lessons
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_modules_course_published_order
    ON modules (course_id, published, order_index ASC);

CREATE INDEX IF NOT EXISTS idx_lessons_module_published_order
    ON lessons (module_id, published, order_index ASC);

CREATE INDEX IF NOT EXISTS idx_lessons_published_completion
    ON lessons (published, completion_count DESC);

CREATE INDEX IF NOT EXISTS idx_lessons_published_views
    ON lessons (published, view_count DESC);
