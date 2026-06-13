import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-8xl font-bold text-muted-foreground/30 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-2">{t('not_found.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('not_found.message')}</p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              {t('not_found.back_home')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
