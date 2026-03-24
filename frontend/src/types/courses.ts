import type { User } from './auth';

// ============================================
// Enums
// ============================================

/**
 * Course difficulty levels
 */
export const CourseDifficulty = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
} as const;

export type CourseDifficulty = typeof CourseDifficulty[keyof typeof CourseDifficulty];

/**
 * Lesson content types
 */
export const LessonType = {
  VIDEO: 'VIDEO',
  TEXT: 'TEXT',
  QUIZ: 'QUIZ',
  ASSIGNMENT: 'ASSIGNMENT',
  RESOURCE: 'RESOURCE',
} as const;

export type LessonType = typeof LessonType[keyof typeof LessonType];

/**
 * Enrollment lifecycle status
 */
export const EnrollmentStatus = {
  ENROLLED: 'ENROLLED',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
} as const;

export type EnrollmentStatus = typeof EnrollmentStatus[keyof typeof EnrollmentStatus];

// ============================================
// Entity Types
// ============================================

/**
 * Category entity
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: Category;
  courseCount: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Tag entity
 */
export interface Tag {
  id: string;
  name: string;
  usageCount: number;
  createdAt: string;
}

/**
 * Lesson entity
 */
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  orderIndex: number;
  durationMinutes?: number;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  textContent?: string;
  quizData?: string;
  assignmentInstructions?: string;
  assignmentMaxPoints?: number;
  resourceUrl?: string;
  additionalResources?: string;
  transcript?: string;
  isPublished: boolean;
  isFree: boolean;
  isDownloadable: boolean;
  viewCount: number;
  completionCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Module entity
 */
export interface Module {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  durationMinutes: number;
  isPublished: boolean;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Lesson-level progress for a learner enrollment
 */
export interface LessonProgress {
  id: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  watchTimeSeconds: number;
  attemptCount: number;
  scorePercentage?: number;
  lesson: Lesson;
  createdAt: string;
  updatedAt: string;
}

/**
 * Learner enrollment in a course
 */
export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  timeSpentMinutes: number;
  course: Course;
  progressRecords: LessonProgress[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Course entity (basic info for lists/cards)
 */
export interface Course {
  id: string;
  title: string;
  description?: string;
  slug: string;
  thumbnailUrl?: string;
  difficulty: CourseDifficulty;
  language: string;
  priceInCents: number;
  durationMinutes: number;
  isPublished: boolean;
  isFeatured: boolean;
  averageRating: number;
  ratingCount: number;
  enrollmentCount: number;
  viewCount: number;
  publishedAt?: string;
  creator: User;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course entity with full details (for course detail page)
 */
export interface CourseDetail extends Course {
  requirements?: string;
  learningOutcomes?: string;
  isDraft: boolean;
  isArchived: boolean;
  tags: Tag[];
  modules: Module[];
}

/**
 * Paginated course results
 */
export interface CoursePage {
  content: Course[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// Input Types
// ============================================

/**
 * Input for creating a course
 */
export interface CreateCourseInput {
  title: string;
  description: string;
  categoryId: string;
  difficulty: CourseDifficulty;
  language: string;
  thumbnailUrl?: string;
  requirements?: string;
  learningOutcomes?: string;
  priceInCents?: number;
}

/**
 * Input for updating a course
 */
export interface UpdateCourseInput {
  title?: string;
  description?: string;
  categoryId?: string;
  difficulty?: CourseDifficulty;
  language?: string;
  thumbnailUrl?: string;
  requirements?: string;
  learningOutcomes?: string;
}

/**
 * Input for creating a module
 */
export interface CreateModuleInput {
  title: string;
  description?: string;
}

/**
 * Input for updating a module
 */
export interface UpdateModuleInput {
  title?: string;
  description?: string;
  isPublished?: boolean;
}

/**
 * Input for creating a lesson
 */
export interface CreateLessonInput {
  title: string;
  description?: string;
  type: LessonType;
  durationMinutes?: number;
  isFree?: boolean;
}

/**
 * Input for updating lesson content
 */
export interface UpdateLessonContentInput {
  videoUrl?: string;
  videoThumbnailUrl?: string;
  textContent?: string;
  quizData?: string;
  assignmentInstructions?: string;
  assignmentMaxPoints?: number;
  resourceUrl?: string;
  additionalResources?: string;
  transcript?: string;
  isDownloadable?: boolean;
}

// ============================================
// Query Variables Types
// ============================================

/**
 * Variables for courses query
 */
export interface CoursesQueryVariables {
  searchTerm?: string;
  categoryId?: string;
  difficulty?: CourseDifficulty;
  language?: string;
  minRating?: number;
  page?: number;
  size?: number;
}

/**
 * Variables for course by slug query
 */
export interface CourseQueryVariables {
  slug: string;
}

/**
 * Variables for course by ID query
 */
export interface CourseByIdQueryVariables {
  id: string;
}

/**
 * Variables for courses by creator query
 */
export interface CoursesByCreatorQueryVariables {
  creatorId: string;
  publishedOnly?: boolean;
}

/**
 * Variables for trending/popular/new/featured courses queries
 */
export interface CoursesWithLimitVariables {
  limit?: number;
}

/**
 * Variables for recommended courses query
 */
export interface RecommendedCoursesQueryVariables {
  courseId: string;
  limit?: number;
}

/**
 * Variables for my enrollments query
 */
export interface MyEnrollmentsQueryVariables {
  status?: EnrollmentStatus;
}

/**
 * Variables for enrollment status query (check if enrolled in a specific course)
 */
export interface EnrollmentStatusQueryVariables {
  courseId: string;
}

/**
 * Lightweight enrollment status for a specific course
 */
export interface EnrollmentStatusInfo {
  id: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  enrolledAt: string;
}

/**
 * Variables for course enrollment query
 */
export interface CourseEnrollmentQueryVariables {
  courseId: string;
}

/**
 * Response for course enrollment query
 */
export interface CourseEnrollmentResponse {
  courseEnrollment: Enrollment | null;
}

// ============================================
// Mutation Variables Types
// ============================================

/**
 * Variables for create course mutation
 */
export interface CreateCourseMutationVariables {
  input: CreateCourseInput;
}

/**
 * Variables for update course mutation
 */
export interface UpdateCourseMutationVariables {
  id: string;
  input: UpdateCourseInput;
}

/**
 * Variables for course ID mutations (delete, publish, unpublish, archive)
 */
export interface CourseIdMutationVariables {
  id: string;
}

/**
 * Variables for add/remove tags mutations
 */
export interface CourseTagsMutationVariables {
  courseId: string;
  tagIds: string[];
}

/**
 * Variables for create module mutation
 */
export interface CreateModuleMutationVariables {
  courseId: string;
  input: CreateModuleInput;
}

/**
 * Variables for update module mutation
 */
export interface UpdateModuleMutationVariables {
  id: string;
  input: UpdateModuleInput;
}

/**
 * Variables for module ID mutations (delete)
 */
export interface ModuleIdMutationVariables {
  id: string;
}

/**
 * Variables for reorder modules mutation
 */
export interface ReorderModulesMutationVariables {
  courseId: string;
  moduleIds: string[];
}

/**
 * Variables for create lesson mutation
 */
export interface CreateLessonMutationVariables {
  moduleId: string;
  input: CreateLessonInput;
}

/**
 * Variables for update lesson mutation
 */
export interface UpdateLessonMutationVariables {
  id: string;
  input: CreateLessonInput;
}

/**
 * Variables for update lesson content mutation
 */
export interface UpdateLessonContentMutationVariables {
  id: string;
  input: UpdateLessonContentInput;
}

/**
 * Variables for lesson ID mutations (delete)
 */
export interface LessonIdMutationVariables {
  id: string;
}

/**
 * Variables for reorder lessons mutation
 */
export interface ReorderLessonsMutationVariables {
  moduleId: string;
  lessonIds: string[];
}

/**
 * Variables for enroll course mutation
 */
export interface EnrollCourseMutationVariables {
  courseId: string;
}

/**
 * Variables for mark lesson complete mutation
 */
export interface MarkLessonCompleteMutationVariables {
  lessonId: string;
}

// ============================================
// Response Types
// ============================================

/**
 * Response for single course queries
 */
export interface CourseResponse {
  course: CourseDetail;
}

/**
 * Response for course by ID queries
 */
export interface CourseByIdResponse {
  courseById: CourseDetail;
}

/**
 * Response for courses query (with pagination)
 */
export interface CoursesResponse {
  courses: CoursePage;
}

/**
 * Response for courses by creator query
 */
export interface CoursesByCreatorResponse {
  coursesByCreator: Course[];
}

/**
 * Response for trending courses query
 */
export interface TrendingCoursesResponse {
  trendingCourses: Course[];
}

/**
 * Response for popular courses query
 */
export interface PopularCoursesResponse {
  popularCourses: Course[];
}

/**
 * Response for new courses query
 */
export interface NewCoursesResponse {
  newCourses: Course[];
}

/**
 * Response for featured courses query
 */
export interface FeaturedCoursesResponse {
  featuredCourses: Course[];
}

/**
 * Response for recommended courses query
 */
export interface RecommendedCoursesResponse {
  recommendedCourses: Course[];
}

/**
 * Response for categories query
 */
export interface CategoriesResponse {
  categories: Category[];
}

/**
 * Response for category query
 */
export interface CategoryResponse {
  category: Category;
}

/**
 * Response for tags query
 */
export interface TagsResponse {
  tags: Tag[];
}

/**
 * Response for my enrollments query
 */
export interface MyEnrollmentsResponse {
  myEnrollments: Enrollment[];
}

/**
 * Response for enrollment status query
 */
export interface EnrollmentStatusResponse {
  enrollmentStatus: EnrollmentStatusInfo | null;
}

/**
 * Response for create/update course mutations
 */
export interface CourseMutationResponse {
  createCourse?: CourseDetail;
  updateCourse?: CourseDetail;
  publishCourse?: CourseDetail;
  unpublishCourse?: CourseDetail;
  archiveCourse?: CourseDetail;
  addTagsToCourse?: CourseDetail;
  removeTagsFromCourse?: CourseDetail;
}

/**
 * Response for delete course mutation
 */
export interface DeleteCourseMutationResponse {
  deleteCourse: boolean;
}

/**
 * Response for module mutations
 */
export interface ModuleMutationResponse {
  createModule?: Module;
  updateModule?: Module;
  reorderModules?: Module[];
}

/**
 * Response for delete module mutation
 */
export interface DeleteModuleMutationResponse {
  deleteModule: boolean;
}

/**
 * Response for lesson mutations
 */
export interface LessonMutationResponse {
  createLesson?: Lesson;
  updateLesson?: Lesson;
  updateLessonContent?: Lesson;
  reorderLessons?: Lesson[];
}

/**
 * Response for delete lesson mutation
 */
export interface DeleteLessonMutationResponse {
  deleteLesson: boolean;
}

/**
 * Response for enroll course mutation
 */
export interface EnrollCourseMutationResponse {
  enrollCourse: Enrollment;
}

/**
 * Response for mark lesson complete mutation
 */
export interface MarkLessonCompleteMutationResponse {
  markLessonComplete: LessonProgress;
}

// ============================================
// Utility Types
// ============================================

/**
 * Course filter options
 */
export interface CourseFilters {
  searchTerm?: string;
  categoryId?: string;
  difficulty?: CourseDifficulty;
  language?: string;
  minRating?: number;
}

/**
 * Course sort options
 */
export const CourseSortBy = {
  NEWEST: 'newest',
  POPULAR: 'popular',
  RATING: 'rating',
  TITLE: 'title',
} as const;

export type CourseSortBy = typeof CourseSortBy[keyof typeof CourseSortBy];

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  size: number;
}
