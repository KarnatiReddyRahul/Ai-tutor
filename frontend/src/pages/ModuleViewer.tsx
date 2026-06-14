import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, BookOpen, Lightbulb, FileText, CheckCircle2,
  ChevronLeft, ChevronRight, MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLearningStore } from '@/store/learningStore';
import ModuleQuiz from '@/components/ModuleQuiz';

export default function ModuleViewer() {
  const { sessionId, moduleId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roadmap, currentModule, isLoading, loadModuleContent } = useLearningStore();
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  const moduleData = currentModule || roadmap?.modules.find(m => m.id === moduleId);
  const moduleIndex = roadmap?.modules.findIndex(m => m.id === moduleId) ?? -1;
  const prevModule = moduleIndex > 0 ? roadmap?.modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex >= 0 && moduleIndex < (roadmap?.modules.length ?? 0) - 1
    ? roadmap?.modules[moduleIndex + 1] : null;

  useEffect(() => {
    if (moduleId && !moduleData?.concept_explanation) {
      loadModuleContent(moduleId);
    }
  }, [moduleId]);

  if (isLoading && !moduleData?.concept_explanation) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4 max-w-2xl mx-auto">
          <div className="h-8 w-48 bg-muted rounded mx-auto" />
          <div className="h-4 w-64 bg-muted rounded mx-auto" />
          <div className="h-96 bg-muted rounded mt-8" />
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Module not found</h2>
        <Button onClick={() => navigate(`/learning/${sessionId}`)}>Back to Roadmap</Button>
      </div>
    );
  }

  const isCompleted = moduleData.status === 'completed';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Top Nav */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/learning/${sessionId}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>Week {moduleData.week_number}</span>
              <Badge variant="outline" className="text-xs">{moduleData.difficulty}</Badge>
              {isCompleted && <Badge variant="success" className="text-xs">Completed</Badge>}
            </div>
            <h1 className="text-xl font-bold">{moduleData.title}</h1>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="content"><FileText className="h-4 w-4 mr-2" />Content</TabsTrigger>
            <TabsTrigger value="quiz"><Lightbulb className="h-4 w-4 mr-2" />Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Concept Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Concept Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {moduleData.concept_explanation || 'Loading content...'}
                </div>
              </CardContent>
            </Card>

            {/* Examples */}
            {moduleData.examples && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Examples
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {moduleData.examples}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Practice */}
            {moduleData.practice_exercises && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    Practice Exercises
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {moduleData.practice_exercises}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revision Notes */}
            {moduleData.revision_notes && (
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    Revision Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {moduleData.revision_notes}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              {isCompleted && moduleData.revision_notes ? null : (
                <Button onClick={() => setShowQuiz(true)} className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Take Quiz
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate(`/learning/${sessionId}/chat`)} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                Ask AI Tutor
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="quiz">
            <ModuleQuiz
              module={moduleData}
              onBack={() => setActiveTab('content')}
            />
          </TabsContent>
        </Tabs>

        {/* Prev / Next Nav */}
        <Separator className="my-8" />
        <div className="flex justify-between">
          <div>
            {prevModule && prevModule.status !== 'locked' && (
              <Button
                variant="ghost"
                onClick={() => navigate(`/learning/${sessionId}/module/${prevModule.id}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Week {prevModule.week_number}: {prevModule.title}
              </Button>
            )}
          </div>
          <div>
            {nextModule && nextModule.status !== 'locked' && (
              <Button
                variant="ghost"
                onClick={() => navigate(`/learning/${sessionId}/module/${nextModule.id}`)}
              >
                Week {nextModule.week_number}: {nextModule.title}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
