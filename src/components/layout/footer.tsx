import { t } from '@/lib/i18n'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background">
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            © {currentYear} {t('meta.title')}. {t('footer.copyright')}.
          </div>
        </div>
      </div>
    </footer>
  )
}