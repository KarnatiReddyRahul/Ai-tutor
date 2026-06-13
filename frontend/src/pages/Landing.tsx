import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Search,
  Map,
  Globe,
  TrendingUp,
  Users,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FEATURES, STATS } from '@/constants';
import { useAuthStore } from '@/store/authStore';

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
      <CardHeader>
        <div className="text-3xl mb-2">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function StatCard({ label, value, change, icon }: { label: string; value: string; change: string; icon: string }) {
  return (
    <Card className="text-center hover:shadow-md transition-all duration-300">
      <CardContent className="pt-6">
        <div className="text-2xl mb-2">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
        <div className="text-xs text-green-600 dark:text-green-400 mt-1">{change}</div>
      </CardContent>
    </Card>
  );
}

export default function Landing() {
  console.log('LANDING PAGE MOUNTED');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const handleStart = () => {
    console.log('Start Assessment clicked. Logged in:', isLoggedIn);
    if (isLoggedIn) {
      navigate('/topics');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Bot className="h-4 w-4" />
              {t('app.tagline')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {t('landing.hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('landing.hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="w-full sm:w-auto" onClick={handleStart}>
                {t('landing.hero_cta')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto" onClick={() => navigate('/login')}>
                {t('landing.hero_secondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.features_title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('landing.features_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.stats_title')}</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI Reverse Tutor uses a four-step process to transform how you learn.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Choose Topic', desc: 'Select what you want to learn', icon: Search },
              { step: '02', title: 'AI Interviews', desc: 'Answer AI-generated questions', icon: Bot },
              { step: '03', title: 'Discover Gaps', desc: 'Find knowledge gaps instantly', icon: Map },
              { step: '04', title: 'Learn Faster', desc: 'Follow a personalized roadmap', icon: TrendingUp },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                <item.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('landing.cta_title')}</h2>
            <p className="text-muted-foreground mb-8">{t('landing.cta_subtitle')}</p>
            <Button size="xl" onClick={handleStart}>
              {t('landing.cta_button')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
