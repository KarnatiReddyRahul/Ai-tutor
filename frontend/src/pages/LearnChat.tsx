import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TOPICS } from '@/constants';
import { useInterviewStore } from '@/store/interviewStore';
import { useSettingsStore } from '@/store/settingsStore';
import ChatBox from '@/components/ChatBox';
import { chatService } from '@/services/chatService';

export default function LearnChat() {
  const { t } = useTranslation();
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { setTopic } = useInterviewStore();
  const { provider, apiKey } = useSettingsStore();
  const key = apiKey || import.meta.env.VITE_GROQ_API_KEY || '';

  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">{t('learn_chat.topic_not_found')}</p>
        <Button onClick={() => navigate('/topics')} className="mt-4">{t('nav.back_to_topics')}</Button>
      </div>
    );
  }

  const handleStartAssessment = () => {
    setTopic(topic);
    navigate(`/interview/${topicId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/topics')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('common.back')}
          </Button>
          <Button onClick={handleStartAssessment}>
            <Play className="h-4 w-4 mr-2" /> {t('nav.start_assessment')}
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{topic.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{t('learn_chat.learn_title')} {t('topics.' + topic.id.replace(/-/g, '_') + '_name')}</h1>
                <p className="text-muted-foreground text-sm">{t('topics.' + topic.id.replace(/-/g, '_') + '_desc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-[600px]">
          <ChatBox
            topic={topic.name}
            apiKey={key}
            provider={provider}
            onSendMessage={(question, history) => chatService.ask(topic.name, question, history, key, provider)}
            placeholder={t('learn_chat.placeholder')}
          />
        </div>
      </div>
    </div>
  );
}
