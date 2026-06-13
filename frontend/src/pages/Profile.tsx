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
      alert(t('profile.name_length_alert'));
      return;
    }

    updateBio(editData.bio);
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm(t('profile.confirm_logout'))) {
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
            {t('common.back')}
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('profile.title')}</h1>
          <p className="text-muted-foreground">{t('profile.subtitle')}</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle>{t('profile.information_title')}</CardTitle>
                <CardDescription>{t('profile.information_description')}</CardDescription>
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
                      {t('common.cancel')}
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      {t('common.save')}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t('common.edit')}
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
                    {t('profile.full_name')}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder={t('profile.name_placeholder')}
                    />
                  ) : (
                    <p className="text-lg font-semibold">{user.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('profile.email')}
                  </Label>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                {t('profile.bio')}
              </Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder={t('profile.bio_placeholder')}
                  className="min-h-24"
                />
              ) : (
                <p className="text-muted-foreground">
                  {user.bio || t('profile.no_bio')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('profile.stats_title')}</CardTitle>
            <CardDescription>{t('profile.stats_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Assessments */}
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold">{user.totalAssessments}</div>
                <p className="text-sm text-muted-foreground mt-1">{t('profile.assessments_completed')}</p>
              </div>

              {/* Average Score */}
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className="text-3xl font-bold text-primary">⭐</div>
                </div>
                <div className="text-3xl font-bold">{user.averageScore}%</div>
                <p className="text-sm text-muted-foreground mt-1">{t('profile.average_score')}</p>
              </div>

              {/* Join Date */}
              <div className="border rounded-lg p-4 text-center">
                <div className="flex justify-center mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="text-sm font-semibold">{formatDate(user.joinedDate)}</div>
                <p className="text-sm text-muted-foreground mt-1">{t('profile.joined_date')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.account_settings_title')}</CardTitle>
            <CardDescription>{t('profile.account_settings_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{t('profile.sign_out_item')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('profile.end_session')}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('profile.sign_out_button')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
