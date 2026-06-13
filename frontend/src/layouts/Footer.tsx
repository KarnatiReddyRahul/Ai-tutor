import { useTranslation } from 'react-i18next';
import { GraduationCap } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              {t('app.name')}
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              {t('app.description')}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">{t('footer.product')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/topics" className="hover:text-primary transition-colors">{t('nav.topics')}</a></li>
              <li><a href="/history" className="hover:text-primary transition-colors">{t('nav.history')}</a></li>
              <li><a href="/settings" className="hover:text-primary transition-colors">{t('nav.settings')}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm">{t('footer.support')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">{t('footer.documentation')}</span></li>
              <li><span className="cursor-default">{t('footer.api')}</span></li>
              <li><span className="cursor-default">{t('footer.contact')}</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          {t('landing.footer_copyright')}
        </div>
      </div>
    </footer>
  );
}
