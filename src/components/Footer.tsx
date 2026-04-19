import Link from 'next/link'
import { PRODUCT_CATEGORIES } from '@/lib/categories'
import LogoImage from './LogoImage'

const FACEBOOK = 'https://www.facebook.com/p/LED-Ivanov-Auto-%D0%9A%D1%80%D1%83%D1%88%D0%BA%D0%B8-%D0%B8-%D0%90%D0%B2%D1%82%D0%BE%D0%B0%D0%BA%D1%81%D0%B5%D1%81%D0%BE%D0%B0%D1%80%D0%B8-100065233232609/'
const TIKTOK = 'https://www.tiktok.com/@ivanov_auto'
const YOUTUBE = 'https://www.youtube.com/@Ivanov-Auto'

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
            <p className="text-muted text-sm leading-relaxed max-w-xs mb-4">
              Висококачествени LED крушки и авто аксесоари. Кристално ясна картина, по-бърза реакция и пълна безопасност на пътя.
            </p>
            <p className="text-xs text-muted/60 mb-5">Безплатна доставка над 150 €</p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a href={FACEBOOK} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-border hover:bg-accent hover:text-white flex items-center justify-center text-muted transition-all"
                aria-label="Facebook">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href={TIKTOK} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-border hover:bg-accent hover:text-white flex items-center justify-center text-muted transition-all"
                aria-label="TikTok">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>
              <a href={YOUTUBE} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-border hover:bg-accent hover:text-white flex items-center justify-center text-muted transition-all"
                aria-label="YouTube">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted/70 mb-4">Продукти</h3>
            <ul className="space-y-2">
              {PRODUCT_CATEGORIES.map(c => (
                <li key={c.slug}>
                  <Link href={`/products?category=${c.slug}`}
                    className="text-sm text-muted hover:text-white transition-colors">
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
                { href: '/products',                      label: 'Всички продукти' },
                { href: '/services/headlight-polishing',  label: 'Полиране на фарове' },
                { href: '/about',                         label: 'За нас' },
                { href: '/partners',                      label: 'Партньори' },
                { href: '/gallery',                       label: 'Галерия' },
                { href: '/contact',                       label: 'Контакти' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-1 text-xs text-muted/60">
              <p>+359 99 999 7996</p>
              <p>Пон–Нед: 09:00 – 23:00</p>
              <p>ж.к. Малинова долина, София</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted/50">
            © {new Date().getFullYear()} LED Ivanov Auto. Всички права запазени.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted/40 flex-wrap justify-center">
            <Link href="/privacy-policy" className="hover:text-muted transition-colors">Поверителност</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-muted transition-colors">Условия</Link>
            <span>·</span>
            <Link href="/cookies" className="hover:text-muted transition-colors">Бисквитки</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
