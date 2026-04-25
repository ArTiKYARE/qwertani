import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn('sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container flex h-16 items-center justify-between">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            AnimeStream
          </span>
        </Link>

        {/* Навигация */}
        <nav className="flex items-center gap-6">
          <Link 
            href="/catalog" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Каталог
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Онгоинги
          </Link>
          <Link 
            href="#" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Популярное
          </Link>
        </nav>

        {/* Поиск и профиль */}
        <div className="flex items-center gap-4">
          <Link
            href="/catalog"
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Смотреть
          </Link>
        </div>
      </div>
    </header>
  );
}
