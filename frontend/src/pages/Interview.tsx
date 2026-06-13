import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Brain,
  BarChart3,
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInterviewStore } from '@/store/interviewStore';
import { useTimer } from '@/hooks/useTimer';
import { useAssessmentStore } from '@/store/assessmentStore';
import ChatBox from '@/components/ChatBox';
import { chatService } from '@/services/chatService';

export default function Interview() {
  const { t } = useTranslation();
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { formatTime } = useTimer();
  const { generateResult } = useAssessmentStore();
  const [showDoubtChat, setShowDoubtChat] = useState(false);

  const {
    topic,
    currentQuestion,
    history,
    isComplete,
    isLoading,
    currentAnswer,
    startInterview,
    submitAnswer,
    setCurrentAnswer,
    getSessionStats,
  } = useInterviewStore();

  useEffect(() => {
    if (topicId) {
      startInterview();
    }
  }, [topicId]);

  useEffect(() => {
    if (isComplete && topic) {
      generateResult(topic.id, topic.name);
    }
  }, [isComplete, topic, generateResult]);

  const stats = getSessionStats();
  const progressPercent = (history.length / stats.totalQuestions) * 100;

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;
    await submitAnswer();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded mx-auto" />
          <div className="h-4 w-96 bg-muted rounded mx-auto" />
          <div className="h-64 w-full max-w-2xl bg-muted rounded mx-auto mt-8" />
        </div>
      </div>
    );
  }

  if (!topic || (!currentQuestion && !isComplete)) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('interview.no_questions')}</h2>
        <Button onClick={() => navigate('/topics')} variant="outline">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t('interview.completed')}</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{stats.answeredQuestions}</div>
                <div className="text-xs text-muted-foreground">{t('interview.questions_answered')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{stats.correctAnswers}</div>
                <div className="text-xs text-muted-foreground">{t('interview.correct_answers')}</div>
              </CardContent>
            </Card>
          </div>
          <Button size="lg" onClick={() => navigate('/results')}>
            {t('interview.view_results')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/topics')}
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('nav.back_to_topics')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4" />
                {t('interview.topic_info')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{t('topics.' + topic.id.replace(/-/g, '_') + '_name')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t('interview.progress')}</span>
                <span className="font-medium">{t('interview.turn_counter', { current: history.length + 1, total: stats.totalQuestions })}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDoubtChat(!showDoubtChat)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {showDoubtChat ? t('interview.close_doubt_chat') : t('interview.ask_doubt')}
          </Button>
        </div>

        <div className={`${showDoubtChat ? 'lg:col-span-4' : 'lg:col-span-6'} transition-all duration-300`}>
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl">{t('interview.current_question')}</CardTitle>
              <CardDescription className="text-base mt-2">
                {currentQuestion?.question_text}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t('interview.your_answer')}
                </label>
                <Textarea
                  placeholder={t('interview.answer_placeholder')}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  className="min-h-[120px] resize-y"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {t('interview.submit')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {showDoubtChat ? (
          <div className="lg:col-span-5">
            <div className="h-[500px]">
              <ChatBox
                topic={topic.name}
                apiKey={import.meta.env.VITE_GROQ_API_KEY || ''}
                provider="groq"
                onSendMessage={(question, history) => chatService.ask(topic.name, question, history, import.meta.env.VITE_GROQ_API_KEY || '', 'groq')}
                placeholder={t('interview.doubt_placeholder')}
                compact
              />
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {t('interview.question_history')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {history.map((h, i) => (
                      <div key={h.id} className="p-3 rounded-lg text-sm border border-muted">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs text-muted-foreground">{t('interview.turn_number', { number: h.turn_number })}</span>
                          {(h.score || 0) >= 60 ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs line-clamp-2">{h.question_text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
