import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Map,
  CheckCircle2,
  Circle,
  Lock,
  BookOpen,
  ArrowRight,
  Calendar,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAssessmentStore } from '@/store/assessmentStore';
import type { RoadmapMilestone } from '@/types';

function MilestoneCard({
  milestone,
  index,
  total,
}: {
  milestone: RoadmapMilestone;
  index: number;
  total: number;
}) {
  const { t } = useTranslation();
  const isLast = index === total - 1;

  const statusIcon = {
    completed: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    in_progress: <Circle className="h-6 w-6 text-primary animate-pulse" />,
    locked: <Lock className="h-6 w-6 text-muted-foreground" />,
  };

  const statusColor = {
    completed: 'border-green-500/50 bg-green-50/50 dark:bg-green-950/30',
    in_progress: 'border-primary/50 bg-primary/5',
    locked: 'border-muted',
  };

  return (
    <div className="relative">
      <div className="flex gap-4">
        {/* Timeline connector */}
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-background p-1">
            {statusIcon[milestone.status]}
          </div>
          {!isLast && (
            <div className="w-0.5 flex-1 bg-border mt-2" />
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 p-4 rounded-lg border mb-6 ${statusColor[milestone.status]}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t('roadmap.week', { number: milestone.week })}
              </span>
              <Badge
                variant={
                  milestone.status === 'completed'
                    ? 'success'
                    : milestone.status === 'in_progress'
                      ? 'info'
                      : 'outline'
                }
                className="text-xs"
              >
                {milestone.status === 'completed'
                  ? t('roadmap.completed')
                  : milestone.status === 'in_progress'
                    ? t('roadmap.in_progress')
                    : t('roadmap.locked')}
              </Badge>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-1">{milestone.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {milestone.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>

          {milestone.resources.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground mr-1">{t('roadmap.resources')}:</span>
              {milestone.resources.map((r) => (
                <Badge key={r} variant="outline" className="text-xs">
                  {r}
                </Badge>
              ))}
            </div>
          )}

          {milestone.status === 'in_progress' && (
            <div className="mt-3">
              <Button size="sm">
                {t('roadmap.start_learning')}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Roadmap() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentResult } = useAssessmentStore();

  if (!currentResult) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <Map className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('roadmap.no_roadmap_title')}</h2>
          <p className="text-muted-foreground mb-6">{t('roadmap.no_roadmap')}</p>
          <Button onClick={() => navigate('/topics')}>
            {t('nav.start_assessment')}
          </Button>
        </div>
      </div>
    );
  }

  const roadmap = currentResult.roadmap;
  const completedCount = roadmap.filter((m) => m.status === 'completed').length;
  const totalCount = roadmap.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('roadmap.title')}</h1>
          <p className="text-muted-foreground">{t('roadmap.subtitle')}</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-xs text-muted-foreground">{t('roadmap.total_weeks')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedCount}
                </div>
                <div className="text-xs text-muted-foreground">{t('roadmap.completed')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{t('roadmap.current_week')}</div>
                <div className="text-xs text-muted-foreground">
                  {roadmap.find((m) => m.status === 'in_progress')?.week || '-'}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{t('interview.progress')}</span>
              <Progress value={progressPercent} className="flex-1 h-2" />
              <span className="text-sm text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('learning_roadmap')}
            </CardTitle>
            <CardDescription>
              {currentResult.topicName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roadmap.map((milestone, index) => (
              <MilestoneCard
                key={milestone.week}
                milestone={milestone}
                index={index}
                total={roadmap.length}
              />
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" onClick={() => navigate('/knowledge-gaps')}>
            {t('roadmap.back_to_gaps')}
          </Button>
        </div>
      </div>
    </div>
  );
}
