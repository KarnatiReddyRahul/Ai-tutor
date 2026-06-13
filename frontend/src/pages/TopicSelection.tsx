import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Sliders, ArrowLeft, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { TOPICS, DIFFICULTIES } from '@/constants';
import { useInterviewStore } from '@/store/interviewStore';
import type { Difficulty } from '@/types';

const PROVIDERS = [
  { value: 'gemini', label: 'Gemini', keyPlaceholder: 'Enter your Gemini API Key', keyLabel: 'Gemini API Key' },
  { value: 'groq', label: 'Groq', keyPlaceholder: 'Enter your Groq API Key', keyLabel: 'Groq API Key' },
];

export default function TopicSelection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTopic, setDifficulty, setApiKey, setProvider, apiKey, provider } = useInterviewStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('beginner');
  const [confidence, setConfidence] = useState([50]);

  const filteredTopics = useMemo(
    () =>
      TOPICS.filter(
        (topic) =>
          topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const categories = useMemo(
    () => [...new Set(TOPICS.map((t) => t.category))],
    []
  );

  const handleTopicClick = (topicId: string) => {
    const topic = TOPICS.find((t) => t.id === topicId);
    if (topic) {
      setTopic(topic);
      setDifficulty(selectedDifficulty);
      if (confidence[0] === 0) {
        navigate(`/learn/${topicId}`);
      } else {
        navigate(`/interview/${topicId}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('topics.title')}</h1>
          <p className="text-muted-foreground">{t('topics.subtitle')}</p>
        </div>

        {/* Settings */}
        <Card className="mb-8 p-4">
          <div className="space-y-4">
            <div>
              <Label>AI Provider</Label>
              <div className="flex gap-2 mt-1">
                {PROVIDERS.map((p) => (
                  <Button
                    key={p.value}
                    variant={provider === p.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProvider(p.value)}
                  >
                    <Cpu className="h-4 w-4 mr-2" />
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>{PROVIDERS.find(p => p.value === provider)?.keyLabel} (Required for Assessment)</Label>
              <Input 
                placeholder={PROVIDERS.find(p => p.value === provider)?.keyPlaceholder}
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('topics.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <Button
                key={d.value}
                variant={selectedDifficulty === d.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDifficulty(d.value as Difficulty)}
              >
                {t(`topics.${d.value}`)}
              </Button>
            ))}
          </div>
        </div>

        {/* Confidence Slider */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="h-4 w-4 text-muted-foreground" />
              <Label>{t('topics.confidence')}</Label>
              <Badge variant="secondary" className="ml-auto">
                {confidence[0]}%
              </Badge>
            </div>
            <Slider
              value={confidence}
              onValueChange={setConfidence}
              max={100}
              step={1}
            />
          </CardContent>
        </Card>

        {/* Topic Grid */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('topics.no_topics')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryTopics = filteredTopics.filter(
                (t) => t.category === category
              );
              if (categoryTopics.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTopics.map((topic) => (
                      <Card
                        key={topic.id}
                        className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300"
                        onClick={() => handleTopicClick(topic.id)}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="text-2xl">{topic.icon}</div>
                              <div>
                                <CardTitle className="text-base mb-1">
                                  {topic.name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {topic.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTopicClick(topic.id);
                              }}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
