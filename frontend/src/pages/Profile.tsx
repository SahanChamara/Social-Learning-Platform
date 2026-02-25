import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const userDetails = [
    { label: 'Username', value: user.username, icon: User },
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Full Name', value: user.fullName, icon: User },
    { label: 'Role', value: user.role, icon: Shield },
    { 
      label: 'Account Created', 
      value: new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 
      icon: Calendar 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                      {user.fullName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {user.fullName}
                  </h2>
                  <p className="text-gray-600 mb-3">@{user.username}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {user.isVerified ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-500">Not Verified</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <>
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-600">Active</span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                          <span className="text-sm text-gray-500">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>

                  {user.bio && (
                    <p className="mt-4 text-gray-700">{user.bio}</p>
                  )}
                  
                  {user.expertise && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-600">Expertise: </span>
                      <span className="text-sm text-gray-700">{user.expertise}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Details Grid */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userDetails.map((detail) => {
                    const Icon = detail.icon;
                    return (
                      <div key={detail.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">{detail.label}</p>
                          <p className="text-base text-gray-900 mt-1">{detail.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information (Demo - not functional yet)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    defaultValue={user.fullName}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                    defaultValue={user.bio || ''}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Expertise</Label>
                  <Input
                    id="expertise"
                    defaultValue={user.expertise || ''}
                    placeholder="e.g., Web Development, Data Science"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled>
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" disabled>
                    Cancel
                  </Button>
                </div>

                <p className="text-sm text-gray-500 italic">
                  Note: Profile editing functionality will be implemented in a future phase.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Protected Route Info */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900">🔒 Protected Profile Page</CardTitle>
              <CardDescription className="text-purple-700">
                This profile page is protected and requires authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-purple-800">
              <p>
                Only authenticated users can view their profile. The ProtectedRoute component
                ensures that unauthorized access is prevented and users are redirected to login.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
