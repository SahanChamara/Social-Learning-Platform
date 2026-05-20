import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import * as Tabs from '@radix-ui/react-tabs';
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, BookOpen, CheckCircle2, Eye, Image, Layers3, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Label, PageHeader, Skeleton } from '@/components/ui';
import { useToast } from '@/hooks';
import {
  ADD_TAGS_TO_COURSE_MUTATION,
  CATEGORIES_QUERY,
  CREATE_COURSE_MUTATION,
  CREATE_LESSON_MUTATION,
  CREATE_MODULE_MUTATION,
  PUBLISH_COURSE_MUTATION,
  TAGS_QUERY,
} from '@/graphql';
import { CourseDifficulty, LessonType } from '@/types/courses';
import type {
  CategoriesResponse,
  Category,
  CourseMutationResponse,
  CourseIdMutationVariables,
  CourseTagsMutationVariables,
  CreateCourseInput,
  CreateCourseMutationVariables,
  CreateLessonInput,
  CreateLessonMutationVariables,
  CreateModuleInput,
  CreateModuleMutationVariables,
  LessonMutationResponse,
  ModuleMutationResponse,
  Tag,
  TagsResponse,
} from '@/types/courses';

const createLessonSchema = z.object({
  title: z.string().trim().min(1, 'Lesson title is required'),
  description: z.string().trim().optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT', 'RESOURCE']),
  durationMinutes: z.number().int().min(0, 'Duration cannot be negative'),
  isFree: z.boolean(),
});

const createModuleSchema = z.object({
  title: z.string().trim().min(1, 'Module title is required'),
  description: z.string().trim().optional(),
  lessons: z.array(createLessonSchema).min(1, 'Add at least one lesson to each module'),
});

const createCourseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().trim().min(1, 'Please select a category'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  language: z.string().trim().min(2, 'Language is required'),
  thumbnailUrl: z.union([z.url({ message: 'Please enter a valid URL' }), z.literal('')]),
  requirements: z.string().trim().optional(),
  learningOutcomes: z.string().trim().optional(),
  priceInCents: z.number().int().min(0, 'Price cannot be negative'),
  tagIds: z.array(z.string()),
  modules: z.array(createModuleSchema).min(1, 'Add at least one module'),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

type CourseFormStep = 'basics' | 'value' | 'curriculum' | 'review';

const FORM_STEPS: CourseFormStep[] = ['basics', 'value', 'curriculum', 'review'];

const STEP_COPY: Record<CourseFormStep, { label: string; title: string; icon: typeof BookOpen }> = {
  basics: { label: 'Basics', title: 'Course basics', icon: BookOpen },
  value: { label: 'Value', title: 'Course value', icon: Sparkles },
  curriculum: { label: 'Curriculum', title: 'Curriculum', icon: Layers3 },
  review: { label: 'Review', title: 'Review and publish', icon: Eye },
};

const defaultLesson: CreateCourseFormData['modules'][number]['lessons'][number] = {
  title: '',
  description: '',
  type: LessonType.VIDEO,
  durationMinutes: 0,
  isFree: false,
};

const defaultModule: CreateCourseFormData['modules'][number] = {
  title: '',
  description: '',
  lessons: [defaultLesson],
};

function toOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

interface ModuleEditorProps {
  moduleIndex: number;
  control: Control<CreateCourseFormData>;
  register: UseFormRegister<CreateCourseFormData>;
  removeModule: (index: number) => void;
  canRemove: boolean;
  errors: FieldErrors<CreateCourseFormData>;
}

function ModuleEditor({
  moduleIndex,
  control,
  register,
  removeModule,
  canRemove,
  errors,
}: Readonly<ModuleEditorProps>) {
  const {
    fields: lessonFields,
    append: appendLesson,
    remove: removeLesson,
  } = useFieldArray({
    control,
    name: `modules.${moduleIndex}.lessons` as const,
  });

  const moduleErrors = errors.modules?.[moduleIndex];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">Module {moduleIndex + 1}</h3>

        {canRemove ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeModule(moduleIndex)}
          >
            <Trash2 className="h-4 w-4" />
            Remove module
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`modules.${moduleIndex}.title`}>Module title</Label>
          <Input
            id={`modules.${moduleIndex}.title`}
            placeholder="Module title"
            error={
              typeof moduleErrors?.title?.message === 'string'
                ? moduleErrors.title.message
                : undefined
            }
            {...register(`modules.${moduleIndex}.title` as const)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`modules.${moduleIndex}.description`}>Module description</Label>
          <textarea
            id={`modules.${moduleIndex}.description`}
            rows={3}
            className="min-h-24 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            placeholder="What this module covers"
            {...register(`modules.${moduleIndex}.description` as const)}
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">Lessons</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendLesson(defaultLesson)}
          >
            <Plus className="h-4 w-4" />
            Add lesson
          </Button>
        </div>

        {typeof moduleErrors?.lessons?.message === 'string' ? (
          <p className="text-sm text-red-600">{moduleErrors.lessons.message}</p>
        ) : null}

        <div className="space-y-3">
          {lessonFields.map((lesson, lessonIndex) => {
            const lessonErrors = moduleErrors?.lessons?.[lessonIndex];

            return (
              <div key={lesson.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">Lesson {lessonIndex + 1}</p>
                  {lessonFields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLesson(lessonIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}>
                      Lesson title
                    </Label>
                    <Input
                      id={`modules.${moduleIndex}.lessons.${lessonIndex}.title`}
                      placeholder="Lesson title"
                      error={
                        typeof lessonErrors?.title?.message === 'string'
                          ? lessonErrors.title.message
                          : undefined
                      }
                      {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.title` as const)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.type`}>
                      Lesson type
                    </Label>
                    <select
                      id={`modules.${moduleIndex}.lessons.${lessonIndex}.type`}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.type` as const)}
                    >
                      <option value={LessonType.VIDEO}>Video</option>
                      <option value={LessonType.TEXT}>Text</option>
                      <option value={LessonType.QUIZ}>Quiz</option>
                      <option value={LessonType.ASSIGNMENT}>Assignment</option>
                      <option value={LessonType.RESOURCE}>Resource</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.durationMinutes`}>
                      Duration (minutes)
                    </Label>
                    <Input
                      id={`modules.${moduleIndex}.lessons.${lessonIndex}.durationMinutes`}
                      type="number"
                      min={0}
                      error={
                        typeof lessonErrors?.durationMinutes?.message === 'string'
                          ? lessonErrors.durationMinutes.message
                          : undefined
                      }
                      {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.durationMinutes` as const, {
                        valueAsNumber: true,
                      })}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor={`modules.${moduleIndex}.lessons.${lessonIndex}.description`}>
                      Lesson description
                    </Label>
                    <textarea
                      id={`modules.${moduleIndex}.lessons.${lessonIndex}.description`}
                      rows={2}
                      className="min-h-18 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      placeholder="Optional lesson description"
                      {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.description` as const)}
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      {...register(`modules.${moduleIndex}.lessons.${lessonIndex}.isFree` as const)}
                    />
                    <span>Mark as free preview lesson</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState<CourseFormStep>('basics');
  const [publishOnSubmit, setPublishOnSubmit] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      difficulty: CourseDifficulty.BEGINNER,
      language: 'English',
      thumbnailUrl: '',
      requirements: '',
      learningOutcomes: '',
      priceInCents: 0,
      tagIds: [],
      modules: [defaultModule],
    },
  });

  const {
    fields: moduleFields,
    append: appendModule,
    remove: removeModule,
  } = useFieldArray({
    control,
    name: 'modules',
  });

  const { data: categoriesData, loading: categoriesLoading } = useQuery<CategoriesResponse>(
    CATEGORIES_QUERY,
  );
  const { data: tagsData, loading: tagsLoading } = useQuery<TagsResponse>(TAGS_QUERY);

  const [createCourse] = useMutation<CourseMutationResponse, CreateCourseMutationVariables>(
    CREATE_COURSE_MUTATION,
  );
  const [addTagsToCourse] = useMutation<CourseMutationResponse, CourseTagsMutationVariables>(
    ADD_TAGS_TO_COURSE_MUTATION,
  );
  const [publishCourse] = useMutation<CourseMutationResponse, CourseIdMutationVariables>(
    PUBLISH_COURSE_MUTATION,
  );
  const [createModule] = useMutation<ModuleMutationResponse, CreateModuleMutationVariables>(
    CREATE_MODULE_MUTATION,
  );
  const [createLesson] = useMutation<LessonMutationResponse, CreateLessonMutationVariables>(
    CREATE_LESSON_MUTATION,
  );

  const categories = (categoriesData?.categories ?? []).filter((category) => category.isActive);
  const tags = tagsData?.tags ?? [];
  const formPreview = watch();
  const selectedCategory = categories.find((category) => category.id === formPreview.categoryId);
  const selectedTags = tags.filter((tag) => formPreview.tagIds.includes(tag.id));
  const totalLessons = formPreview.modules.reduce(
    (sum, moduleData) => sum + moduleData.lessons.length,
    0,
  );
  const totalMinutes = formPreview.modules.reduce(
    (sum, moduleData) =>
      sum +
      moduleData.lessons.reduce(
        (lessonSum, lesson) =>
          lessonSum + (Number.isFinite(lesson.durationMinutes) ? lesson.durationMinutes : 0),
        0,
      ),
    0,
  );

  const navigateStep = async (direction: 'next' | 'prev') => {
    const currentIndex = FORM_STEPS.indexOf(activeStep);

    if (direction === 'prev') {
      setActiveStep(FORM_STEPS[Math.max(currentIndex - 1, 0)]);
      return;
    }

    if (activeStep === 'basics') {
      const valid = await trigger(['title', 'description', 'categoryId', 'difficulty', 'language']);
      if (!valid) {
        return;
      }
    }

    if (activeStep === 'value') {
      const valid = await trigger([
        'thumbnailUrl',
        'requirements',
        'learningOutcomes',
        'priceInCents',
      ]);
      if (!valid) {
        return;
      }
    }

    if (activeStep === 'curriculum') {
      const valid = await trigger(['modules']);
      if (!valid) {
        return;
      }
    }

    setActiveStep(FORM_STEPS[Math.min(currentIndex + 1, FORM_STEPS.length - 1)]);
  };

  const onSubmit = async (values: CreateCourseFormData) => {
    try {
      const courseInput: CreateCourseInput = {
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        difficulty: values.difficulty,
        language: values.language,
        thumbnailUrl: toOptionalString(values.thumbnailUrl),
        requirements: toOptionalString(values.requirements),
        learningOutcomes: toOptionalString(values.learningOutcomes),
        priceInCents: values.priceInCents,
      };

      const courseResult = await createCourse({
        variables: {
          input: courseInput,
        },
      });

      const createdCourse = courseResult.data?.createCourse;

      if (!createdCourse) {
        throw new Error('Course creation failed.');
      }

      if (values.tagIds.length > 0) {
        await addTagsToCourse({
          variables: {
            courseId: createdCourse.id,
            tagIds: values.tagIds,
          },
        });
      }

      for (const moduleData of values.modules) {
        const moduleInput: CreateModuleInput = {
          title: moduleData.title,
          description: toOptionalString(moduleData.description),
        };

        const moduleResult = await createModule({
          variables: {
            courseId: createdCourse.id,
            input: moduleInput,
          },
        });

        const createdModule = moduleResult.data?.createModule;

        if (!createdModule) {
          throw new Error(`Failed to create module: ${moduleData.title}`);
        }

        for (const lessonData of moduleData.lessons) {
          const lessonInput: CreateLessonInput = {
            title: lessonData.title,
            description: toOptionalString(lessonData.description),
            type: lessonData.type,
            durationMinutes: Number.isFinite(lessonData.durationMinutes)
              ? lessonData.durationMinutes
              : undefined,
            isFree: lessonData.isFree,
          };

          const lessonResult = await createLesson({
            variables: {
              moduleId: createdModule.id,
              input: lessonInput,
            },
          });

          if (!lessonResult.data?.createLesson) {
            throw new Error(`Failed to create lesson: ${lessonData.title}`);
          }
        }
      }

      if (publishOnSubmit) {
        await publishCourse({
          variables: {
            id: createdCourse.id,
          },
        });
      }

      toast({
        title: publishOnSubmit ? 'Course published' : 'Draft saved',
        description: publishOnSubmit
          ? 'Your course is live with its starter curriculum.'
          : 'Your course was saved as a draft.',
      });

      navigate(`/courses/${createdCourse.slug}`, { replace: true });
    } catch (error) {
      toast({
        title: 'Failed to create course',
        description: extractErrorMessage(error, 'Please check your inputs and try again.'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-slate-50">
      <div className="app-container py-10">
        <Link
          to="/creator"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Creator dashboard
        </Link>

        <PageHeader
          eyebrow="Creator workspace"
          title="Create course"
          description="Shape the promise, structure the path, and publish when the first learning loop is ready."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" onSubmit={handleSubmit(onSubmit)}>
            <Tabs.Root
              value={activeStep}
              onValueChange={(value) => setActiveStep(value as CourseFormStep)}
            >
              <Tabs.List className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:grid-cols-4">
                {FORM_STEPS.map((step, index) => {
                  const Icon = STEP_COPY[step].icon;
                  return (
                    <Tabs.Trigger
                      key={step}
                      value={step}
                      className="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{index + 1}. {STEP_COPY[step].label}</span>
                    </Tabs.Trigger>
                  );
                })}
              </Tabs.List>

              <Tabs.Content value="basics" className="mt-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{STEP_COPY.basics.title}</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Course title</Label>
                  <Input
                    id="title"
                    placeholder="Mastering React and GraphQL"
                    error={typeof errors.title?.message === 'string' ? errors.title.message : undefined}
                    {...register('title')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course description</Label>
                  <textarea
                    id="description"
                    rows={5}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    placeholder="Describe who this course is for and what students will achieve..."
                    {...register('description')}
                  />
                  {typeof errors.description?.message === 'string' ? (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <select
                      id="categoryId"
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      {...register('categoryId')}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category: Category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {typeof errors.categoryId?.message === 'string' ? (
                      <p className="text-sm text-red-600">{errors.categoryId.message}</p>
                    ) : null}
                    {categoriesLoading ? <Skeleton className="h-4 w-40" /> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      {...register('difficulty')}
                    >
                      <option value={CourseDifficulty.BEGINNER}>Beginner</option>
                      <option value={CourseDifficulty.INTERMEDIATE}>Intermediate</option>
                      <option value={CourseDifficulty.ADVANCED}>Advanced</option>
                      <option value={CourseDifficulty.EXPERT}>Expert</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      placeholder="English"
                      error={
                        typeof errors.language?.message === 'string' ? errors.language.message : undefined
                      }
                      {...register('language')}
                    />
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="value" className="mt-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">{STEP_COPY.value.title}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="thumbnailUrl"
                      placeholder="https://example.com/course-cover.jpg"
                      error={
                        typeof errors.thumbnailUrl?.message === 'string'
                          ? errors.thumbnailUrl.message
                          : undefined
                      }
                      {...register('thumbnailUrl')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceInCents">Price (in cents)</Label>
                    <Input
                      id="priceInCents"
                      type="number"
                      min={0}
                      error={
                        typeof errors.priceInCents?.message === 'string'
                          ? errors.priceInCents.message
                          : undefined
                      }
                      {...register('priceInCents', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <textarea
                    id="requirements"
                    rows={3}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    placeholder="Any prerequisites for learners"
                    {...register('requirements')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningOutcomes">Learning outcomes</Label>
                  <textarea
                    id="learningOutcomes"
                    rows={4}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    placeholder="What students will be able to do after this course"
                    {...register('learningOutcomes')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    {tagsLoading ? (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <Skeleton key={index} className="h-6 w-full rounded-full" />
                        ))}
                      </div>
                    ) : tags.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {tags.map((tag: Tag) => (
                          <label key={tag.id} className="inline-flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              value={tag.id}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                              {...register('tagIds')}
                            />
                            #{tag.name}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">No tags available yet.</p>
                    )}
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="curriculum" className="mt-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-950">{STEP_COPY.curriculum.title}</h2>
                  <Button type="button" variant="outline" onClick={() => appendModule(defaultModule)}>
                    <Plus className="h-4 w-4" />
                    Add module
                  </Button>
                </div>

                {typeof errors.modules?.message === 'string' ? (
                  <p className="text-sm text-red-600">{errors.modules.message}</p>
                ) : null}

                <div className="space-y-4">
                  {moduleFields.map((moduleField, moduleIndex) => (
                    <ModuleEditor
                      key={moduleField.id}
                      moduleIndex={moduleIndex}
                      control={control}
                      register={register}
                      removeModule={removeModule}
                      canRemove={moduleFields.length > 1}
                      errors={errors}
                    />
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="review" className="mt-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">{STEP_COPY.review.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {publishOnSubmit ? 'Ready to publish' : 'Saving as draft'}
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={publishOnSubmit}
                      onChange={(event) => setPublishOnSubmit(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    />
                    Publish after creation
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Course</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Title</dt>
                        <dd className="text-right font-medium text-slate-900">{formPreview.title || 'Untitled course'}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Category</dt>
                        <dd className="text-right font-medium text-slate-900">{selectedCategory?.name ?? 'Not selected'}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Difficulty</dt>
                        <dd className="text-right font-medium text-slate-900">{formPreview.difficulty}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Language</dt>
                        <dd className="text-right font-medium text-slate-900">{formPreview.language}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Curriculum</p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Modules</dt>
                        <dd className="font-medium text-slate-900">{formPreview.modules.length}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Lessons</dt>
                        <dd className="font-medium text-slate-900">{totalLessons}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Duration</dt>
                        <dd className="font-medium text-slate-900">{totalMinutes}m</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-slate-500">Tags</dt>
                        <dd className="text-right font-medium text-slate-900">
                          {selectedTags.length > 0 ? selectedTags.map((tag) => tag.name).join(', ') : 'None'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {formPreview.thumbnailUrl ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <img
                      src={formPreview.thumbnailUrl}
                      alt=""
                      className="h-56 w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                    <Image className="h-6 w-6" />
                  </div>
                )}
              </Tabs.Content>
            </Tabs.Root>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
              <div>
                {activeStep === 'basics' ? null : (
                  <Button type="button" variant="outline" onClick={() => void navigateStep('prev')}>
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeStep === 'review' ? (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {publishOnSubmit ? 'Publishing...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {publishOnSubmit ? 'Publish Course' : 'Save Draft'}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => void navigateStep('next')}>
                    Next step
                  </Button>
                )}
              </div>
            </div>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-950">Course snapshot</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Status</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                    {publishOnSubmit ? 'Publish' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Modules</span>
                  <span className="font-medium text-slate-900">{formPreview.modules.length}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Lessons</span>
                  <span className="font-medium text-slate-900">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Total time</span>
                  <span className="font-medium text-slate-900">{totalMinutes}m</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
