import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Галерия | LED Ivanov Auto' }

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: images } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('published', true)
    .order('position')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-background min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Page header */}
        <div className="text-center mb-12">
          <p className="text-accent text-xs font-bold uppercase tracking-widest mb-3">СНИМКИ</p>
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">ГАЛЕРИЯ</h1>
          <p className="text-muted text-lg">Реални монтажи от нашите клиенти</p>
        </div>

        {images && images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="flex flex-col gap-1.5">
                <div className="aspect-square overflow-hidden rounded-xl bg-surface">
                  <img
                    src={img.url}
                    alt={img.caption ?? 'Gallery image'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {img.caption && (
                  <p className="text-muted text-xs px-1">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted text-lg text-center">Галерията се попълва скоро</p>
          </div>
        )}
      </div>
    </div>
  )
}
