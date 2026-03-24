import { gql } from '@apollo/client';
import { USER_FRAGMENT } from './auth';

// ============================================
// GraphQL Fragments
// ============================================

/**
 * Basic category information
 */
export const CATEGORY_FRAGMENT = gql`
  fragment CategoryFields on Category {
    id
    name
    slug
    description
    courseCount
    isActive
    createdAt
  }
`;

/**
 * Basic tag information
 */
export const TAG_FRAGMENT = gql`
  fragment TagFields on Tag {
    id
    name
    usageCount
    createdAt
  }
`;

/**
 * Lesson information (for course detail view)
 */
export const LESSON_FRAGMENT = gql`
  fragment LessonFields on Lesson {
    id
    title
    description
    type
    orderIndex
    durationMinutes
    videoUrl
    videoThumbnailUrl
    isPublished
    isFree
    isDownloadable
    viewCount
    createdAt
  }
`;

/**
 * Module information with lessons
 */
export const MODULE_FRAGMENT = gql`
  ${LESSON_FRAGMENT}
  fragment ModuleFields on Module {
    id
    title
    description
    orderIndex
    durationMinutes
    isPublished
    lessons {
      ...LessonFields
    }
    createdAt
  }
`;

/**
 * Basic course information (for course cards and lists)
 */
export const COURSE_BASIC_FRAGMENT = gql`
  ${USER_FRAGMENT}
  ${CATEGORY_FRAGMENT}
  fragment CourseBasicFields on Course {
    id
    title
    description
    slug
    thumbnailUrl
    difficulty
    language
    priceInCents
    durationMinutes
    isPublished
    isFeatured
    averageRating
    ratingCount
    enrollmentCount
    viewCount
    publishedAt
    creator {
      ...UserFields
    }
    category {
      ...CategoryFields
    }
    createdAt
    updatedAt
  }
`;

/**
 * Complete course information (for course detail page)
 */
export const COURSE_DETAIL_FRAGMENT = gql`
  ${COURSE_BASIC_FRAGMENT}
  ${TAG_FRAGMENT}
  ${MODULE_FRAGMENT}
  fragment CourseDetailFields on Course {
    ...CourseBasicFields
    requirements
    learningOutcomes
    isDraft
    isArchived
    tags {
      ...TagFields
    }
    modules {
      ...ModuleFields
    }
  }
`;

/**
 * Lesson progress information for an enrollment
 */
export const PROGRESS_FRAGMENT = gql`
  ${LESSON_FRAGMENT}
  fragment ProgressFields on Progress {
    id
    completed
    startedAt
    completedAt
    lastAccessedAt
    watchTimeSeconds
    attemptCount
    scorePercentage
    lesson {
      ...LessonFields
    }
    createdAt
    updatedAt
  }
`;

/**
 * Enrollment information with associated course and progress records
 */
export const ENROLLMENT_FRAGMENT = gql`
  ${COURSE_BASIC_FRAGMENT}
  ${PROGRESS_FRAGMENT}
  fragment EnrollmentFields on Enrollment {
    id
    status
    progressPercentage
    completedLessons
    totalLessons
    enrolledAt
    startedAt
    completedAt
    lastAccessedAt
    timeSpentMinutes
    course {
      ...CourseBasicFields
    }
    progressRecords {
      ...ProgressFields
    }
    createdAt
    updatedAt
  }
`;

// ============================================
// GraphQL Queries
// ============================================

/**
 * Get a single course by slug (for course detail page)
 */
export const COURSE_QUERY = gql`
  ${COURSE_DETAIL_FRAGMENT}
  query Course($slug: String!) {
    course(slug: $slug) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Get a single course by ID
 */
export const COURSE_BY_ID_QUERY = gql`
  ${COURSE_DETAIL_FRAGMENT}
  query CourseById($id: ID!) {
    courseById(id: $id) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Get enrollments for the current learner
 */
export const MY_ENROLLMENTS_QUERY = gql`
  ${ENROLLMENT_FRAGMENT}
  query MyEnrollments($status: EnrollmentStatus) {
    myEnrollments(status: $status) {
      ...EnrollmentFields
    }
  }
`;

/**
 * Check if the current learner is enrolled in a course (lightweight query)
 */
export const ENROLLMENT_STATUS_QUERY = gql`
  query EnrollmentStatus($courseId: ID!) {
    enrollmentStatus(courseId: $courseId) {
      id
      status
      progressPercentage
      completedLessons
      totalLessons
      enrolledAt
    }
  }
`;

/**
 * Get the current user's enrollment with progress records for a course
 */
export const COURSE_ENROLLMENT_QUERY = gql`
  ${ENROLLMENT_FRAGMENT}
  query CourseEnrollment($courseId: ID!) {
    courseEnrollment(courseId: $courseId) {
      ...EnrollmentFields
    }
  }
`;

/**
 * Search and filter courses with pagination
 */
export const COURSES_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query Courses(
    $searchTerm: String
    $categoryId: ID
    $difficulty: CourseDifficulty
    $language: String
    $minRating: Float
    $page: Int
    $size: Int
  ) {
    courses(
      searchTerm: $searchTerm
      categoryId: $categoryId
      difficulty: $difficulty
      language: $language
      minRating: $minRating
      page: $page
      size: $size
    ) {
      content {
        ...CourseBasicFields
      }
      totalElements
      totalPages
      pageNumber
      pageSize
      hasNext
      hasPrevious
    }
  }
`;

/**
 * Get courses by creator
 */
export const COURSES_BY_CREATOR_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query CoursesByCreator($creatorId: ID!, $publishedOnly: Boolean) {
    coursesByCreator(creatorId: $creatorId, publishedOnly: $publishedOnly) {
      ...CourseBasicFields
    }
  }
`;

/**
 * Get trending courses
 */
export const TRENDING_COURSES_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query TrendingCourses($limit: Int) {
    trendingCourses(limit: $limit) {
      ...CourseBasicFields
    }
  }
`;

/**
 * Get popular courses
 */
export const POPULAR_COURSES_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query PopularCourses($minEnrollments: Int, $limit: Int) {
    popularCourses(minEnrollments: $minEnrollments, limit: $limit) {
      ...CourseBasicFields
    }
  }
`;

/**
 * Get new courses
 */
export const NEW_COURSES_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query NewCourses($limit: Int) {
    newCourses(limit: $limit) {
      ...CourseBasicFields
    }
  }
`;

/**
 * Get featured courses
 */
export const FEATURED_COURSES_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query FeaturedCourses($limit: Int) {
    featuredCourses(limit: $limit) {
      ...CourseBasicFields
    }
  }
`;

/**
 * Get recommended courses based on a course
 */
export const RECOMMENDED_COURSES_QUERY = gql`
  ${COURSE_BASIC_FRAGMENT}
  query RecommendedCourses($courseId: ID!, $limit: Int) {
    recommendedCourses(courseId: $courseId, limit: $limit) {
      ...CourseBasicFields
    }
  }
`;

/**
 * Get all categories
 */
export const CATEGORIES_QUERY = gql`
  ${CATEGORY_FRAGMENT}
  query Categories {
    categories {
      ...CategoryFields
    }
  }
`;

/**
 * Get a category by ID
 */
export const CATEGORY_QUERY = gql`
  ${CATEGORY_FRAGMENT}
  query Category($id: ID!) {
    category(id: $id) {
      ...CategoryFields
    }
  }
`;

/**
 * Get all tags
 */
export const TAGS_QUERY = gql`
  ${TAG_FRAGMENT}
  query Tags {
    tags {
      ...TagFields
    }
  }
`;

// ============================================
// GraphQL Mutations
// ============================================

/**
 * Create a new course
 */
export const CREATE_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Enroll the current learner in a course
 */
export const ENROLL_COURSE_MUTATION = gql`
  ${ENROLLMENT_FRAGMENT}
  mutation EnrollCourse($courseId: ID!) {
    enrollCourse(courseId: $courseId) {
      ...EnrollmentFields
    }
  }
`;

/**
 * Mark a lesson complete for the current learner
 */
export const MARK_LESSON_COMPLETE_MUTATION = gql`
  ${PROGRESS_FRAGMENT}
  mutation MarkLessonComplete($lessonId: ID!) {
    markLessonComplete(lessonId: $lessonId) {
      ...ProgressFields
    }
  }
`;

/**
 * Update an existing course
 */
export const UPDATE_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Delete a course
 */
export const DELETE_COURSE_MUTATION = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

/**
 * Publish a course
 */
export const PUBLISH_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation PublishCourse($id: ID!) {
    publishCourse(id: $id) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Unpublish a course
 */
export const UNPUBLISH_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation UnpublishCourse($id: ID!) {
    unpublishCourse(id: $id) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Archive a course
 */
export const ARCHIVE_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation ArchiveCourse($id: ID!) {
    archiveCourse(id: $id) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Add tags to a course
 */
export const ADD_TAGS_TO_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation AddTagsToCourse($courseId: ID!, $tagIds: [ID!]!) {
    addTagsToCourse(courseId: $courseId, tagIds: $tagIds) {
      ...CourseDetailFields
    }
  }
`;

/**
 * Remove tags from a course
 */
export const REMOVE_TAGS_FROM_COURSE_MUTATION = gql`
  ${COURSE_DETAIL_FRAGMENT}
  mutation RemoveTagsFromCourse($courseId: ID!, $tagIds: [ID!]!) {
    removeTagsFromCourse(courseId: $courseId, tagIds: $tagIds) {
      ...CourseDetailFields
    }
  }
`;

// ============================================
// Module Mutations
// ============================================

/**
 * Create a module in a course
 */
export const CREATE_MODULE_MUTATION = gql`
  ${MODULE_FRAGMENT}
  mutation CreateModule($courseId: ID!, $input: CreateModuleInput!) {
    createModule(courseId: $courseId, input: $input) {
      ...ModuleFields
    }
  }
`;

/**
 * Update a module
 */
export const UPDATE_MODULE_MUTATION = gql`
  ${MODULE_FRAGMENT}
  mutation UpdateModule($id: ID!, $input: UpdateModuleInput!) {
    updateModule(id: $id, input: $input) {
      ...ModuleFields
    }
  }
`;

/**
 * Delete a module
 */
export const DELETE_MODULE_MUTATION = gql`
  mutation DeleteModule($id: ID!) {
    deleteModule(id: $id)
  }
`;

/**
 * Reorder modules in a course
 */
export const REORDER_MODULES_MUTATION = gql`
  ${MODULE_FRAGMENT}
  mutation ReorderModules($courseId: ID!, $moduleIds: [ID!]!) {
    reorderModules(courseId: $courseId, moduleIds: $moduleIds) {
      ...ModuleFields
    }
  }
`;

// ============================================
// Lesson Mutations
// ============================================

/**
 * Create a lesson in a module
 */
export const CREATE_LESSON_MUTATION = gql`
  ${LESSON_FRAGMENT}
  mutation CreateLesson($moduleId: ID!, $input: CreateLessonInput!) {
    createLesson(moduleId: $moduleId, input: $input) {
      ...LessonFields
    }
  }
`;

/**
 * Update a lesson
 */
export const UPDATE_LESSON_MUTATION = gql`
  ${LESSON_FRAGMENT}
  mutation UpdateLesson($id: ID!, $input: CreateLessonInput!) {
    updateLesson(id: $id, input: $input) {
      ...LessonFields
    }
  }
`;

/**
 * Update lesson content
 */
export const UPDATE_LESSON_CONTENT_MUTATION = gql`
  ${LESSON_FRAGMENT}
  mutation UpdateLessonContent($id: ID!, $input: UpdateLessonContentInput!) {
    updateLessonContent(id: $id, input: $input) {
      ...LessonFields
    }
  }
`;

/**
 * Delete a lesson
 */
export const DELETE_LESSON_MUTATION = gql`
  mutation DeleteLesson($id: ID!) {
    deleteLesson(id: $id)
  }
`;

/**
 * Reorder lessons in a module
 */
export const REORDER_LESSONS_MUTATION = gql`
  ${LESSON_FRAGMENT}
  mutation ReorderLessons($moduleId: ID!, $lessonIds: [ID!]!) {
    reorderLessons(moduleId: $moduleId, lessonIds: $lessonIds) {
      ...LessonFields
    }
  }
`;
