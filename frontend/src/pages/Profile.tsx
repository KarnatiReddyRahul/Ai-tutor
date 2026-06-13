import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Edit2, Save, X, Mail, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useAssessmentStore } from '@/store/assessmentStore';
import { MOCK_ASSESSMENT_HISTORY } from '@/services/mockData';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, updateStats } = useAuthStore();
  const { updateBio } = useProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    bio: '',
  });

  // Calculate stats from history on mount and when history changes
  useEffect(() => {
    if (user) {
      const completedAssessments = MOCK_ASSESSMENT_HISTORY.filter(
        (a) => a.status === 'completed'
      );
      const totalAssessments = completedAssessments.length;
      const averageScore =
        totalAssessments > 0
          ? Math.round(
              completedAssessments.reduce((sum, a) => sum + a.score, 0) / totalAssessments
            )
          : 0;

      if (
        user.totalAssessments !== totalAssessments ||
        user.averageScore !== averageScore
      ) {
        updateStats(totalAssessments, averageScore);
      }
    }
  }, [user, updateStats]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEditData({
      name: user.name,
      bio: user.bio || '',
    });
  }, [user, navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditData({
        name: user.name,
        bio: user.bio || '',
      });
    }
  };

  const handleSave = () => {
    if (editData.name.trim().length < 2) {
      alert('Name must be at least 2 characters');
      return;
    }

    updateBio(editData.bio);
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (!user) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account and profile information</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal details and account information</CardDescription>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Name */}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/10"
              />

              <div className="flex-1 space-y-4 w-full">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Your name"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{user.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                Bio
              </Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself..."
                  className="min-h-24"
                />
              ) : (
                <p className="text-muted-foreground">
                  {user.bio || 'No bio added yet. Click Edit to add one.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
            <CardDescription>Your progress and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Assessments */}
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{user.totalAssessments}</div>
                <p className="text-sm text-muted-foreground mt-1">Assessments Completed</p>
              </div>

              {/* Average Score */}
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="text-3xl font-bold text-primary">⭐</div>
                </div>
                <div className="text-3xl font-bold">{user.averageScore}%</div>
                <p className="text-sm text-muted-foreground mt-1">Average Score</p>
              </div>

              {/* Join Date */}
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm font-semibold">{formatDate(user.joinedDate)}</div>
                <p className="text-sm text-muted-foreground mt-1">Joined Date</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-muted-foreground">
                  End your current session
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
