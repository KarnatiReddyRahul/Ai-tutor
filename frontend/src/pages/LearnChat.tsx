import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TOPICS } from '@/constants';
import { useInterviewStore } from '@/store/interviewStore';
import ChatBox from '@/components/ChatBox';
import { chatService } from '@/services/chatService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export default function LearnChat() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { setTopic } = useInterviewStore();

  const topic = TOPICS.find(t => t.id === topicId);
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Topic not found.</p>
        <Button onClick={() => navigate('/topics')} className="mt-4">Back to Topics</Button>
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
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button onClick={handleStartAssessment}>
            <Play className="h-4 w-4 mr-2" /> Start Assessment
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{topic.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">Learn: {topic.name}</h1>
                <p className="text-muted-foreground text-sm">{topic.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="h-[600px]">
          <ChatBox
            topic={topic.name}
            apiKey={GROQ_API_KEY}
            provider="groq"
            onSendMessage={(question, history) => chatService.ask(topic.name, question, history, GROQ_API_KEY, 'groq')}
            placeholder="Ask anything about this topic..."
          />
        </div>
      </div>
    </div>
  );
}
