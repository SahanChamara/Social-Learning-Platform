import { Link } from 'react-router-dom';

export default function Discover() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Learning Paths
            </h1>
            <p className="text-lg text-gray-600">
              Explore trending courses, tutorials, and personalized recommendations
            </p>
          </div>

          {/* Trending Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              🔥 Trending Courses
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4"></div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Course Title {i}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Learn the fundamentals and advanced concepts in this comprehensive course.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">⭐ 4.8 (1.2k)</span>
                    <span className="text-sm font-semibold text-blue-600">View Course</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Categories Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📚 Browse by Category
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {['Web Development', 'Data Science', 'Design', 'Business', 'Marketing', 'Mobile Development', 'AI & ML', 'DevOps'].map((category) => (
                <div key={category} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500 mt-1">120+ courses</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Tutorials */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📝 Popular Tutorials
            </h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Tutorial: Quick Start Guide {i}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      A step-by-step guide to getting started with this technology.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👤 Sahan Chamara</span>
                      <span>📅 2 days ago</span>
                      <span>⏱️ 15 min read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <p className="text-center text-gray-700">
              <strong>Note:</strong> This is a placeholder page. Course listings and filtering will be implemented in Phase 2.
              <br />
              <Link to="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
