import type { Metadata } from 'next'
import { Inter, Oswald } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import ToastContainer from '@/components/ToastContainer'
import Footer from '@/components/Footer'

const inter  = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })
const oswald = Oswald({ subsets: ['latin', 'cyrillic'], variable: '--font-oswald', weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'LED Ivanov Auto',
  description: 'Висококачествени LED крушки и авто аксесоари',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className={`${inter.variable} ${oswald.variable} font-sans bg-background text-white`}>
        {/* Fixed delivery banner — h-8 (32px) */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-accent text-white text-center text-xs h-8 flex items-center justify-center font-semibold tracking-widest uppercase">
          <svg className="w-3.5 h-3.5 mr-2 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h1.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 13.172V17a2 2 0 01-2 2h-1m-6 0a2 2 0 100 4 2 2 0 000-4zm6 0a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Безплатна доставка над 150 €
        </div>
        <Navbar />
        {/* pt-8 for banner + pt-16 for navbar = pt-24 */}
        <main className="pt-24">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  )
}
