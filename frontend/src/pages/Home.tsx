import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn with structure, progress, and community
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover practical courses, complete lessons step by step, and learn alongside
            people working toward the same goals.
          </p>
          
          <div className="flex flex-col gap-3 justify-center mb-16 sm:flex-row">
            <Link
              to="/courses"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              to="/auth/register"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Account
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Structured Courses
              </h3>
              <p className="text-gray-600">
                Follow modules and lessons in a clear order, with outcomes visible before you enroll.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Learning Progress
              </h3>
              <p className="text-gray-600">
                Track enrolled courses, completed lessons, streaks, and achievements from one place.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Social Feedback
              </h3>
              <p className="text-gray-600">
                Ask questions, reply to learners, like helpful comments, and rate courses after learning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
