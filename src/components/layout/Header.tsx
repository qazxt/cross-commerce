'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, Menu, User, Globe } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/SearchBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-bold text-primary">FindsIndex</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/category" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('Common.categories')}
          </Link>
          <Link 
            href="/brand" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('Common.brands')}
          </Link>
          <Link 
            href="/favorites" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ❤️ 收藏
          </Link>
          <Link 
            href="/history" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            🕐 历史
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar />
        </div>

        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <span className="flex items-center gap-2">
                  🇨🇳 中文
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="flex items-center gap-2">
                  🇺🇸 English
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-4">
          <SearchBar />
          <nav className="flex flex-col gap-4">
            <Link 
              href="/category" 
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('Common.categories')}
            </Link>
            <Link 
              href="/brand" 
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('Common.brands')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
