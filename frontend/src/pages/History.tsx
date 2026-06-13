import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowUpDown,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAssessmentStore } from '@/store/assessmentStore';
import { MOCK_ASSESSMENT_HISTORY } from '@/services/mockData';

type SortOption = 'newest' | 'oldest' | 'score_high' | 'score_low';
type FilterOption = 'all' | 'completed' | 'in_progress';

export default function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loadHistory, history, setSelectedHistoryItem } = useAssessmentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const displayData = MOCK_ASSESSMENT_HISTORY;

  const filtered = useMemo(() => {
    let data = [...displayData];

    if (searchQuery) {
      data = data.filter((item) =>
        item.topicName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      data = data.filter((item) => item.status === filterStatus);
    }

    data.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'score_high':
          return b.score - a.score;
        case 'score_low':
          return a.score - b.score;
        default:
          return 0;
      }
    });

    return data;
  }, [searchQuery, filterStatus, sortBy, displayData]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}${t('history.minutes')} ${secs}${t('history.seconds')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleViewResults = (item: any) => {
    setSelectedHistoryItem(item);
    navigate('/results');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('history.title')}</h1>
          <p className="text-muted-foreground">{t('history.subtitle')}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('history.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Tabs
                  value={filterStatus}
                  onValueChange={(v) => setFilterStatus(v as FilterOption)}
                >
                  <TabsList>
                    <TabsTrigger value="all">{t('history.filter_all')}</TabsTrigger>
                    <TabsTrigger value="completed">{t('history.filter_completed')}</TabsTrigger>
                    <TabsTrigger value="in_progress">{t('history.filter_in_progress')}</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-[160px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('history.sort_newest')}</SelectItem>
                    <SelectItem value="oldest">{t('history.sort_oldest')}</SelectItem>
                    <SelectItem value="score_high">{t('history.sort_score_high')}</SelectItem>
                    <SelectItem value="score_low">{t('history.sort_score_low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('history.no_results')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card key={item.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate">{item.topicName}</span>
                          <Badge
                            variant={item.status === 'completed' ? 'success' : 'warning'}
                            className="text-xs shrink-0"
                          >
                            {item.status === 'completed'
                              ? t('history.completed')
                              : t('history.in_progress')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(item.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(item.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </div>
                        <div className="text-xs text-muted-foreground">{t('history.score')}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleViewResults(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
