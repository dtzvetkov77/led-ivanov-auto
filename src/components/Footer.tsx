import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import LogoImage from './LogoImage'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <LogoImage className="h-12 max-w-64" />
            </Link>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Висококачествени LED крушки и авто аксесоари. Кристално ясна картина, по-бърза реакция и пълна безопасност на пътя.
            </p>
            <p className="text-xs text-muted/60 mt-4">
              Безплатна доставка над 150 €
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted/70 mb-4">Продукти</h3>
            <ul className="space-y-2">
              {PRODUCT_CATEGORIES.map(c => (
                <li key={c.slug}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted/70 mb-4">Информация</h3>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'Всички продукти' },
                { href: '/contact',  label: 'Контакти' },
                { href: '/video',    label: 'Видео' },
                { href: '/reviews',  label: 'Доволни клиенти' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted/50">
            © {new Date().getFullYear()} LED Ivanov Auto. Всички права запазени.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted/50">
            <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Powered by LED Ivanov Auto
          </div>
        </div>
      </div>
    </footer>
  )
}
