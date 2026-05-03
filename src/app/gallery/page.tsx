import { createClient } from '@/lib/supabase/server'
import LightboxGallery from '@/components/LightboxGallery'

export const metadata = { title: 'Галерия | LED Ivanov Auto' }

export default async function GalleryPage() {
  const supabase = await createClient()
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
      </div>
    </div>
  )
}
