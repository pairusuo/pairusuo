import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="bg-content-background dark:bg-content-background-dark rounded-xl shadow-sm p-8 md:p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                404
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                {t('common.notFound')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {t('notFound.description')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">{t('nav.home')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">{t('nav.blog')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}