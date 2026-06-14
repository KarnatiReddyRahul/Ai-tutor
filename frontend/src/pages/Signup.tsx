import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User, Loader, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/constants';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t('signup.fill_fields'));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('signup.invalid_email'));
      return false;
    }

    if (formData.password.length < 6) {
      setError(t('signup.password_length'));
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('signup.passwords_mismatch'));
      return false;
    }

    if (formData.name.length < 2) {
      setError(t('signup.name_length'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await signup(formData.email, formData.name, formData.password);
      navigate('/topics');
    } catch (err: any) {
      setError(err?.message || t('signup.failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Brand */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {APP_NAME}
          </h1>
          <p className="text-muted-foreground">{t('signup.subtitle')}</p>
        </div>

        {/* Back button */}
        <div className="text-left mb-4">
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

        {/* Signup Card */}
        <Card className="border border-primary/10 shadow-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">{t('signup.title')}</CardTitle>
            <CardDescription>{t('signup.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {t('signup.full_name')}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('signup.name_placeholder')}
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('signup.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('signup.email_placeholder')}
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('signup.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('signup.password_placeholder')}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t('signup.password_hint')}</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t('signup.confirm_password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t('signup.confirm_placeholder')}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    {t('signup.creating_account')}
                  </>
                ) : (
                  t('signup.create_account')
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted-foreground/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('signup.or')}</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              {t('signup.has_account')}{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                {t('signup.sign_in')}
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Demo Hint */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center text-sm text-muted-foreground">
          <p>{t('signup.demo_hint')}</p>
        </div>
      </div>
    </div>
  );
}
