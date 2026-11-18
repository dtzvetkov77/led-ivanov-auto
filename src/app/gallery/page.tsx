import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import LightboxGallery from '@/components/LightboxGallery'

const GALLERY_TITLE = 'Галерия: реални монтажи на LED крушки | LED Ivanov Auto'
const GALLERY_DESC = 'Снимки от реални монтажи на LED и ксенон крушки при наши клиенти от сервиза на LED Ivanov Auto в София.'

export const metadata: Metadata = {
  title: { absolute: GALLERY_TITLE },
  description: GALLERY_DESC,
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: GALLERY_TITLE,
    description: GALLERY_DESC,
    url: '/gallery',
    type: 'website',
    locale: 'bg_BG',
    siteName: 'LED Ivanov Auto',
    images: ['/images/hero.webp'],
  },
}

export const revalidate = 600

export default async function GalleryPage() {
  const supabase = createPublicClient()
  const { data: images } = await supabase
    .from('gallery_images')
    .select('id, url, caption')
    .eq('published', true)
    .order('position')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-background min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">СНИМКИ</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">ГАЛЕРИЯ</h1>
          <p className="text-muted text-lg">Реални монтажи от нашите клиенти</p>
        </div>

        {images && images.length > 0 ? (
          <LightboxGallery images={images} alt="Галерия LED Ivanov Auto" cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted text-lg text-center">Галерията се попълва скоро</p>
          </div>
        )}

        <section className="max-w-3xl mx-auto mt-16 text-muted leading-relaxed space-y-4">
          <h2 className="text-2xl font-black text-white">Какво ще видите в галерията</h2>
          <p>
            Снимките са от реални автомобили на наши клиенти, повечето от сервиза ни в ж.к. Малинова долина, София.
            Показваме как изглежда светлината на LED
            крушките след монтаж: ярко бял цвят около 6000K, ясна линия на светлината и без разпиляване към насрещното
            движение, когато крушката е правилно избрана за фара.
          </p>
          <p>
            Голяма част от кадрите са от монтажи на{' '}
            <Link href="/c/led-krushki-h7" className="text-accent hover:underline">LED крушки H7</Link>,{' '}
            <Link href="/c/led-krushki-h4" className="text-accent hover:underline">LED крушки H4</Link> и LED заместители
            на ксенон D1S, D2S и D3S. Ще намерите и снимки на габаритни крушки T10 W5W, LED плафони за регистрационен
            номер и динамични бягащи мигачи за огледала. Повечето модели са Plug &amp; Play и се поставят на мястото на
            оригиналната крушка без рязане на кабели, а при коли с CANBUS използваме крушки с вграден декодер, за да няма
            грешки на таблото.
          </p>
          <p>
            Освен монтажи на крушки, в галерията има резултати от{' '}
            <Link href="/services/headlight-polishing" className="text-accent hover:underline">полиране на фарове</Link>,{' '}
            <Link href="/services/headlight-tinting" className="text-accent hover:underline">фолиране на фарове</Link> и{' '}
            <Link href="/services/headlight-alignment" className="text-accent hover:underline">регулиране на фарове</Link>.
            Ако не сте сигурни коя крушка е подходяща за вашата кола, разгледайте{' '}
            <Link href="/products" className="text-accent hover:underline">всички продукти</Link> или ни пишете и ще ви
            помогнем да изберете правилния цокъл.
          </p>
        </section>
      </div>
    </div>
  )
}
