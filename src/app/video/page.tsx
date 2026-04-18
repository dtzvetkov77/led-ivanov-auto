import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Видео | LED Ivanov Auto',
  description: 'Видео демонстрации и монтажни инструкции на LED крушки от LED Ivanov Auto.',
}

// Replace these with the real YouTube video IDs from the channel
const videos = [
  {
    id: 'W7Xj8s5Ea9E?si=2QLFAn8xCkG71Weq',
    title: 'LED Крушки D-Серия – Монтаж и резултат',
    desc: 'Пълно видео ревю и монтажна инструкция на LED крушки D-серия. Виж разликата преди и след смяната.',
  },
  {
    id: 'zMkOj2PG4vk?si=ZTwQ_lPAMfpYjOjH',
    title: 'Sport Red Series – Тест нощем',
    desc: 'Нощен тест на Sport Red серията. Сравнение с оригинален халоген.',
  },
  {
    id: 'aPM6nWSLPlw?si=zxHRZPug9xnZPXl3',
    title: 'Доволен клиент на LED Ivanov Auto',
    desc: 'Стъпка по стъпка монтаж на Dynamic LED бягащи мигачи за огледала.',
  },
]

export default function VideoPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent text-xs tracking-[5px] uppercase mb-3 font-medium">YouTube</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">ВИДЕО</h1>
          <p className="text-muted max-w-xl mx-auto">
            Демонстрации, монтажни инструкции и тестове на нашите продукти.
          </p>
        </div>

        {/* Video grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(v => (
            <div key={v.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              {v.id !== 'YOUTUBE_ID_1' && v.id !== 'YOUTUBE_ID_2' && v.id !== 'YOUTUBE_ID_3' ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}`}
                    title={v.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href="https://www.youtube.com/@ledivanovauto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-video flex items-center justify-center bg-surface-2 hover:bg-border transition-colors group"
                >
                  <div className="text-center">
                    <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-xs text-muted">Гледай в YouTube</p>
                  </div>
                </a>
              )}
              <div className="p-4">
                <h3 className="font-bold text-sm mb-1">{v.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted mb-4">Виж всички видеа в нашия YouTube канал</p>
          <a
            href="https://www.youtube.com/@ledivanovauto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-3 rounded-lg font-bold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            YouTube Канал
          </a>
        </div>
      </div>
    </div>
  )
}
