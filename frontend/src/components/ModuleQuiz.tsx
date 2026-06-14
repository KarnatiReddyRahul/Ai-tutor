import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, RefreshCw, Trophy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLearningStore } from '@/store/learningStore';

interface Props {
  module: any;
  onBack: () => void;
}

export default function ModuleQuiz({ module: mod, onBack }: Props) {
  const { sessionId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { submitQuiz, loadModuleContent } = useLearningStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questions = useMemo(() => {
    if (!mod.quiz_questions) return [];
    try {
      return JSON.parse(mod.quiz_questions);
    } catch {
      return [];
    }
  }, [mod.quiz_questions]);

  const handleAnswer = () => {
    if (selected === null) return;
    const correct = questions[currentQ]?.answer;
    if (selected === correct) setScore(s => s + 1);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setFinished(true);
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const finalScore = Math.round((score / questions.length) * 100);
    try {
      const updated = await submitQuiz(mod.id, finalScore);
      if (updated.concept_explanation) {
        await loadModuleContent(mod.id);
      }
    } catch { }
    setSubmitting(false);
  };

  const isCorrect = (qIdx: number) => {
    return qIdx < currentQ || (qIdx === currentQ && showAnswer && selected === questions[qIdx]?.answer);
  };

  if (!questions.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No quiz questions available yet.</p>
          <Button onClick={onBack}>Back to Content</Button>
        </CardContent>
      </Card>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Trophy className={`h-16 w-16 mx-auto mb-4 ${passed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <CardTitle className="text-2xl mb-2">
            {passed ? 'Great Job!' : 'Keep Learning!'}
          </CardTitle>
          <CardDescription className="mb-6">
            You scored {score} / {questions.length} ({pct}%)
            {passed ? ' — Module completed!' : ' — Review the revision notes below.'}
          </CardDescription>
          <div className="flex justify-center gap-4">
            {passed ? (
              <Button onClick={() => navigate(`/learning/${sessionId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Roadmap
              </Button>
            ) : (
              <Button onClick={() => { setFinished(false); setCurrentQ(0); setSelected(null); setShowAnswer(false); setScore(0); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Quiz
              </Button>
            )}
            {passed && (
              <Button variant="outline" onClick={() => navigate(`/learning/${sessionId}/chat`)}>
                Ask AI Tutor
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <Progress value={((currentQ + 1) / questions.length) * 100} className="flex-1 h-2" />
        <span className="text-sm text-muted-foreground">{currentQ + 1} / {questions.length}</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">Question {currentQ + 1}</Badge>
            <span className="text-sm text-muted-foreground">Score: {score}</span>
          </div>
          <CardTitle className="text-lg mt-4">{q.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options?.map((opt: string, i: number) => {
            const isSelected = selected === i;
            const isAns = showAnswer && i === q.answer;
            const isWrong = showAnswer && isSelected && i !== q.answer;
            return (
              <button
                key={i}
                onClick={() => !showAnswer && setSelected(i)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  showAnswer && i === q.answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : isWrong
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                    : isSelected
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full border flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                  {showAnswer && i === q.answer && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
                  {isWrong && <XCircle className="h-5 w-5 text-red-500 ml-auto" />}
                </div>
              </button>
            );
          })}

          {q.explanation && showAnswer && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Content
        </Button>
        {!showAnswer ? (
          <Button onClick={handleAnswer} disabled={selected === null}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentQ < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
}
