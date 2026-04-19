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
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
            {images.map(img => (
              <div key={img.id} className="mb-3 break-inside-avoid">
                <img
                  src={img.url}
                  alt={img.caption ?? 'Gallery image'}
                  className="w-full rounded-xl object-cover"
                />
                {img.caption && (
                  <p className="text-muted text-xs mt-1.5 px-1">{img.caption}</p>
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
