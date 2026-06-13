import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  Palette,
  Accessibility,
  Info,
  GraduationCap,
  ExternalLink,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useSettingsStore } from '@/store/settingsStore';
import type { Language, Theme } from '@/types';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { language, theme, fontSize, setLanguage, setTheme, setFontSize } = useSettingsStore();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: t('settings.language_en'), native: 'English' },
    { code: 'te', label: t('settings.language_te'), native: 'తెలుగు' },
    { code: 'hi', label: t('settings.language_hi'), native: 'हिन्दी' },
  ];

  const themes: { value: Theme; label: string }[] = [
    { value: 'light', label: t('settings.theme_light') },
    { value: 'dark', label: t('settings.theme_dark') },
    { value: 'system', label: t('settings.theme_system') },
  ];

  const fontSizes: { value: 'small' | 'medium' | 'large'; label: string }[] = [
    { value: 'small', label: t('settings.small') },
    { value: 'medium', label: t('settings.medium') },
    { value: 'large', label: t('settings.large') },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
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
            {t('common.back')}
            </Button>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Language */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('settings.language')}</CardTitle>
                  <CardDescription>{t('settings.language_description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={language}
                onValueChange={(v) => handleLanguageChange(v as Language)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {languages.map((l) => (
                  <div key={l.code}>
                    <RadioGroupItem
                      value={l.code}
                      id={`lang-${l.code}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`lang-${l.code}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <span className="text-lg font-semibold">{l.native}</span>
                      <span className="text-xs text-muted-foreground">{l.label}</span>
                      {language === l.code && (
                        <Check className="h-4 w-4 text-primary mt-1" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('settings.theme')}</CardTitle>
                  <CardDescription>{t('settings.theme_description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme}
                onValueChange={(v) => setTheme(v as Theme)}
                className="flex gap-3"
              >
                {themes.map((t) => (
                  <div key={t.value}>
                    <RadioGroupItem
                      value={t.value}
                      id={`theme-${t.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`theme-${t.value}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-w-[100px]"
                    >
                      <span className="font-medium">{t.label}</span>
                      {theme === t.value && (
                        <Check className="h-4 w-4 text-primary mt-1" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Accessibility */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('settings.accessibility')}</CardTitle>
                  <CardDescription>{t('settings.accessibility_description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="mb-3 block">{t('settings.font_size')}</Label>
                <RadioGroup
                  value={fontSize}
                  onValueChange={(v) => setFontSize(v as 'small' | 'medium' | 'large')}
                  className="flex gap-3"
                >
                  {fontSizes.map((f) => (
                    <div key={f.value}>
                      <RadioGroupItem
                        value={f.value}
                        id={`font-${f.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`font-${f.value}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer min-w-[80px]"
                      >
                        <span className="font-medium">{f.label}</span>
                        {fontSize === f.value && (
                          <Check className="h-4 w-4 text-primary mt-1" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>{t('settings.about')}</CardTitle>
                  <CardDescription>{t('settings.about_description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('settings.app_name')}</h3>
                  <p className="text-sm text-muted-foreground">{t('settings.version')}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('settings.description')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('settings.built_with')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
