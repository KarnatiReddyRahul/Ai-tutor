import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Map, CheckCircle2, Circle, Lock, BookOpen,
  ArrowRight, TrendingUp, Award, Brain, MessageCircle, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useLearningStore } from '@/store/learningStore';
import { useAssessmentStore } from '@/store/assessmentStore';
import ConceptSearch from '@/components/ConceptSearch';

export default function LearningDashboard() {
  const { sessionId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentResult } = useAssessmentStore();
  const {
    roadmap, progress, isLoading, error,
    generateRoadmap, loadRoadmap, loadProgress,
  } = useLearningStore();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadRoadmap(sessionId).catch(() => {
        if (currentResult) {
          generateRoadmap(sessionId, 'en');
        }
      });
      loadProgress(sessionId);
    }
  }, [sessionId]);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'available': return <Circle className="h-5 w-5 text-primary animate-pulse" />;
      default: return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading && !roadmap) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded mx-auto" />
          <div className="h-4 w-96 bg-muted rounded mx-auto" />
          <div className="h-64 bg-muted rounded mx-auto mt-8 max-w-2xl" />
        </div>
      </div>
    );
  }

  if (error && !roadmap) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Learning Roadmap</h2>
        <p className="text-muted-foreground mb-6">Complete an assessment first to generate your personalized roadmap.</p>
        <Button onClick={() => navigate('/topics')}>Take an Assessment</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('roadmap.title')}</h1>
          <p className="text-muted-foreground">{roadmap?.topic}</p>
        </div>

        {/* Stats & Score */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-5 w-5 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">{roadmap?.overall_score?.toFixed(0) || 0}%</div>
              <div className="text-xs text-muted-foreground">Assessment Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-5 w-5 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{progress?.total_modules || 0}</div>
              <div className="text-xs text-muted-foreground">Total Modules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">{progress?.completed_modules || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-bold">{progress?.average_quiz_score ?? '-'}</div>
              <div className="text-xs text-muted-foreground">Avg Quiz Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Progress</span>
              <Progress value={progress?.progress_percent || 0} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground">{progress?.progress_percent || 0}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Weak Areas */}
        {roadmap && roadmap.weak_areas.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Focus Areas (from your assessment)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {roadmap.weak_areas.map((area, i) => (
                  <Badge key={i} variant="destructive" className="text-xs">{area}</Badge>
                ))}
                {roadmap.strengths.map((s, i) => (
                  <Badge key={`s-${i}`} variant="success" className="text-xs">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modules / Roadmap */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Map className="h-5 w-5" />
            Your Learning Path
          </h2>

          {roadmap?.modules.map((mod, idx) => (
            <Card
              key={mod.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                mod.status === 'locked' ? 'opacity-60' : ''
              } ${mod.status === 'available' ? 'border-primary/50' : ''}`}
              onClick={() => {
                if (mod.status !== 'locked') {
                  navigate(`/learning/${sessionId}/module/${mod.id}`);
                }
              }}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {statusIcon(mod.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">Week {mod.week_number}</span>
                      <Badge variant="outline" className="text-xs">{mod.difficulty}</Badge>
                      {mod.quiz_score !== null && (
                        <Badge variant={mod.quiz_score >= 70 ? 'success' : 'destructive'} className="text-xs">
                          Quiz: {mod.quiz_score}%
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{mod.description}</p>
                  </div>
                  {mod.status !== 'locked' && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Tutor & Search */}
        <div className="flex gap-4 justify-center mb-8">
          <Button variant="outline" onClick={() => navigate(`/learning/${sessionId}/chat`)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            AI Tutor Chat
          </Button>
          <Button variant="outline" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-4 w-4 mr-2" />
            Search Concepts
          </Button>
        </div>

        {showSearch && roadmap && (
          <ConceptSearch topic={roadmap.topic} difficulty="beginner" language="en" />
        )}
      </div>
    </div>
  );
}
