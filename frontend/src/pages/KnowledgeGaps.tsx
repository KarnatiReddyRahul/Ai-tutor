import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  Zap,
  Shield,
  Search,
  ArrowLeft,
} from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAssessmentStore } from '@/store/assessmentStore';

export default function KnowledgeGaps() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentResult, selectedHistoryItem } = useAssessmentStore();
  const isHistoryView = !!selectedHistoryItem;

  if (!currentResult) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <AlertTriangle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Assessment Data</h2>
          <p className="text-muted-foreground mb-6">
            Complete an assessment to see your knowledge gap analysis.
          </p>
          <Button onClick={() => navigate('/topics')}>
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  const strengths = currentResult.knowledgeGaps.filter((g) => g.status === 'strength');
  const weakAreas = currentResult.knowledgeGaps.filter((g) => g.status === 'weak');
  const missing = currentResult.knowledgeGaps.filter((g) => g.status === 'missing');

  const chartData = currentResult.skillScores.map((s) => ({
    name: s.skill,
    score: s.score,
    fill: s.score >= 80 ? '#22c55e' : s.score >= 60 ? '#eab308' : '#ef4444',
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
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

        {/* Back Button for History View */}
        {isHistoryView && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            onClick={() => {
              useAssessmentStore.setState({ selectedHistoryItem: null });
              navigate('/history');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('gaps.title')}</h1>
          <p className="text-muted-foreground">{t('gaps.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Strengths */}
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="bg-green-50 dark:bg-green-950/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-green-800 dark:text-green-300">
                  {t('gaps.strengths')}
                </CardTitle>
              </div>
              <CardDescription className="text-green-700 dark:text-green-400">
                {t('gaps.strength_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {strengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('gaps.no_strengths')}</p>
              ) : (
                <div className="space-y-3">
                  {strengths.map((gap) => (
                    <div key={gap.concept} className="p-3 rounded-lg border bg-green-50/50 dark:bg-green-950/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-sm">{gap.concept}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{gap.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weak Areas */}
          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-950/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <CardTitle className="text-yellow-800 dark:text-yellow-300">
                  {t('gaps.weak_areas')}
                </CardTitle>
              </div>
              <CardDescription className="text-yellow-700 dark:text-yellow-400">
                {t('gaps.weak_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {weakAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('gaps.no_weak')}</p>
              ) : (
                <div className="space-y-3">
                  {weakAreas.map((gap) => (
                    <div key={gap.concept} className="p-3 rounded-lg border bg-yellow-50/50 dark:bg-yellow-950/30">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium text-sm">{gap.concept}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{gap.description}</p>
                      {gap.suggestedResources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {gap.suggestedResources.map((r) => (
                            <Badge key={r} variant="warning" className="text-xs">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Missing Concepts */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="bg-red-50 dark:bg-red-950/50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-600 dark:text-red-400" />
                <CardTitle className="text-red-800 dark:text-red-300">
                  {t('gaps.missing_concepts')}
                </CardTitle>
              </div>
              <CardDescription className="text-red-700 dark:text-red-400">
                {t('gaps.missing_description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {missing.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('gaps.no_missing')}</p>
              ) : (
                <div className="space-y-3">
                  {missing.map((gap) => (
                    <div key={gap.concept} className="p-3 rounded-lg border bg-red-50/50 dark:bg-red-950/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-sm">{gap.concept}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{gap.description}</p>
                      {gap.suggestedResources.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {gap.suggestedResources.map((r) => (
                            <Badge key={r} variant="destructive" className="text-xs">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Skill Proficiency Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t('gaps.skill_breakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="90%"
                    barSize={15}
                    data={chartData}
                    startAngle={180}
                    endAngle={-180}
                  >
                    <RadialBar
                      label={{ position: 'insideStart', fill: 'var(--foreground)', fontSize: 11 }}
                      background
                      dataKey="score"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t('gaps.action_items')}</h3>
                {currentResult.skillScores
                  .filter((s) => s.score < 70)
                  .map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{skill.skill}</span>
                        <span className="text-muted-foreground">{skill.score}%</span>
                      </div>
                      <Progress
                        value={skill.score}
                        className="h-2"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/results')}
          >
            Back to Results
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/roadmap')}
          >
            {t('results.view_roadmap')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
