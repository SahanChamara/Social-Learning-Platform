import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  User,
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const stats = [
    { label: 'Courses Enrolled', value: '12', icon: BookOpen, color: 'text-blue-600' },
    { label: 'In Progress', value: '5', icon: Clock, color: 'text-orange-600' },
    { label: 'Completed', value: '7', icon: Award, color: 'text-green-600' },
    { label: 'Learning Streak', value: '15 days', icon: TrendingUp, color: 'text-purple-600' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.fullName || user?.username}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/my-learning">
                <Button variant="outline" size="sm">
                  <GraduationCap className="h-4 w-4" />
                  My Learning
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        Course Title {i}
                      </h4>
                      <p className="text-sm text-gray-600">Lesson {i * 3}/20</p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(i * 3) * 5}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'First Course Completed', icon: '🎓', date: '2 days ago' },
                  { name: '7-Day Streak', icon: '🔥', date: '5 days ago' },
                  { name: 'Quick Learner', icon: '⚡', date: '1 week ago' },
                ].map((achievement) => (
                  <div key={achievement.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">🎉 You're on a Protected Route!</CardTitle>
            <CardDescription className="text-blue-700">
              This dashboard is only accessible to authenticated users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <p>
                <strong>Your Info:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Username: {user?.username}</li>
                <li>Email: {user?.email}</li>
                <li>Full Name: {user?.fullName}</li>
                <li>Role: {user?.role}</li>
                <li>Verified: {user?.isVerified ? 'Yes' : 'No'}</li>
              </ul>
              <p className="mt-4 pt-4 border-t border-blue-200">
                <strong>Try this:</strong> Log out and try to access this page directly. 
                You'll be redirected to the login page and then brought back here after logging in!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
