import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Target,
  TrendingUp,
  Clock,
  BarChart3,
  ChevronRight,
  RotateCcw,
  Search,
  ArrowLeft,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAssessmentStore } from '@/store/assessmentStore';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444'];

export default function Results() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentResult, selectedHistoryItem } = useAssessmentStore();

  // Use selectedHistoryItem if available, otherwise use currentResult
  const result = selectedHistoryItem
    ? {
        score: selectedHistoryItem.score,
        topicName: selectedHistoryItem.topicName,
        duration: selectedHistoryItem.duration,
        date: selectedHistoryItem.date,
        isHistoryView: true,
      }
    : currentResult;

  if (!result) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Results Available</h2>
        <p className="text-muted-foreground mb-6">Complete an assessment to see your results.</p>
        <Button onClick={() => navigate('/topics')}>
          {t('nav.start_assessment')}
        </Button>
      </div>
    );
  }

  // Use currentResult skill scores if available, otherwise show mock data
  const skillScores = currentResult?.skillScores || [
    { skill: 'Knowledge Assessment', score: result.score, maxScore: 100, level: 'intermediate' },
  ];

  const chartData = skillScores.map((s) => ({
    name: s.skill,
    score: s.score,
    level: s.level,
    fill: CHART_COLORS[skillScores.indexOf(s) % CHART_COLORS.length],
  }));

  const avgScore = result.score;
  const durationMinutes = Math.floor(result.duration / 60);
  const isHistoryView = selectedHistoryItem !== null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'expert': return 'Expert';
      case 'advanced': return 'Advanced';
      case 'intermediate': return 'Intermediate';
      case 'beginner': return 'Beginner';
      default: return level;
    }
  };

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
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('results.title')}</h1>
          <p className="text-muted-foreground">{result.topicName}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Award className="h-5 w-5 mx-auto text-primary mb-2" />
              <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                {avgScore}%
              </div>
              <div className="text-xs text-muted-foreground">{t('results.overall_score')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Target className="h-5 w-5 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{skillScores.length}</div>
              <div className="text-xs text-muted-foreground">Skills Assessed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-5 w-5 mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-bold">
                {durationMinutes}:{String(result.duration % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {avgScore >= 60 ? 'Passed' : 'Needs Work'}
              </div>
              <div className="text-xs text-muted-foreground">{t('results.status')}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Skill Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('results.skill_distribution')}
              </CardTitle>
              <CardDescription>{t('results.score_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      className="text-xs"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Skill Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('results.performance_metrics')}
              </CardTitle>
              <CardDescription>Detailed skill-by-skill breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isHistoryView ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Detailed metrics for this assessment will be available here.</p>
                  <p className="text-sm mt-2">Score recorded: {avgScore}%</p>
                </div>
              ) : (
                skillScores.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{skill.skill}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            skill.score >= 80
                              ? 'success'
                              : skill.score >= 60
                                ? 'warning'
                                : 'destructive'
                          }
                          className="text-xs"
                        >
                          {getLevelLabel(skill.level)}
                        </Badge>
                        <span className={`text-sm font-bold ${getScoreColor(skill.score)}`}>
                          {skill.score}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={skill.score}
                      className={`h-2 ${
                        skill.score >= 80
                          ? '[&>div]:bg-green-500'
                          : skill.score >= 60
                            ? '[&>div]:bg-yellow-500'
                            : '[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/topics`)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t('results.retake')}
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/knowledge-gaps')}
          >
            {t('results.view_gaps')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
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
