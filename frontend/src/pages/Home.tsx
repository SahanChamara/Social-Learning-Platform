export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Social Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Learn, share, and grow together. Discover courses, tutorials, and connect with learners worldwide.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <a
              href="/auth/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/auth/login"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Sign In
            </a>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quality Courses
              </h3>
              <p className="text-gray-600">
                Access thousands of courses created by expert instructors
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community
              </h3>
              <p className="text-gray-600">
                Connect with learners and share knowledge through discussions
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600">
                Monitor your learning journey with achievements and streaks
              </p>
            </div>
          </div>

          {/* Navigation Info */}
          <div className="mt-16 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              🎉 React Router is Now Set Up!
            </h2>
            <p className="text-gray-700 mb-4">
              You can navigate between pages using the links above or by visiting these routes:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <code className="px-3 py-1 bg-white rounded text-sm">/</code>
              <code className="px-3 py-1 bg-white rounded text-sm">/auth/login</code>
              <code className="px-3 py-1 bg-white rounded text-sm">/auth/register</code>
              <code className="px-3 py-1 bg-white rounded text-sm">/discover</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
