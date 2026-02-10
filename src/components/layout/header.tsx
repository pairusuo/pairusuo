"use client"

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/i18n'
import { useState } from 'react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.tags'), href: '/tag' },
    { name: t('nav.links'), href: '/link' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex h-20 items-center justify-between pt-4 pb-2">
          {/* Desktop Navigation - 居中显示，胶囊样式 */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center bg-muted/30 rounded-full px-2 py-1 space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full hover:bg-background hover:text-primary hover:shadow-md hover:scale-105 active:scale-95"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={t('common.toggleTheme')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('common.toggleTheme')}</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-2 py-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}