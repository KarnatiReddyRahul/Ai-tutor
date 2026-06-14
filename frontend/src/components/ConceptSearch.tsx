import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { learningService } from '@/services/learningService';
import { useSettingsStore } from '@/store/settingsStore';

interface Props {
  topic: string;
  difficulty: string;
  language: string;
}

export default function ConceptSearch({ topic, difficulty, language }: Props) {
  const { t } = useTranslation();
  const { provider, apiKey } = useSettingsStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ explanation: string; examples: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await learningService.searchConcept(query, topic, difficulty, language, provider, apiKey);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search any concept..."
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Explanation
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {result.explanation}
              </div>
            </div>
            {result.examples && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2 text-yellow-600">
                  Examples
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {result.examples}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
