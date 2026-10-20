'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { findPlaceholder, renderCampaignHtml, TEMPLATES, type CampaignContent } from '@/lib/campaignEmail'

type SegmentOption = { key: string; label: string; count: number }

export default function CampaignComposer({ segments, canSend }: { segments: SegmentOption[]; canSend: boolean }) {
  const router = useRouter()
  const [templateKey, setTemplateKey] = useState(TEMPLATES[0].key)
  const [segment, setSegment] = useState(TEMPLATES[0].segment)
  const [content, setContent] = useState<CampaignContent>(() => pick(TEMPLATES[0]))
  const [busy, setBusy] = useState<'test' | 'send' | null>(null)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const template = TEMPLATES.find(t => t.key === templateKey)!
  const count = segments.find(s => s.key === segment)?.count ?? 0
  const placeholder = findPlaceholder(content)
  const preview = useMemo(() => renderCampaignHtml(content, 'Иван', '#'), [content])

  function pick(t: (typeof TEMPLATES)[number]): CampaignContent {
    return { subject: t.subject, preheader: t.preheader, body: t.body, ctaLabel: t.ctaLabel, ctaUrl: t.ctaUrl }
  }

  function chooseTemplate(key: string) {
    const t = TEMPLATES.find(x => x.key === key)!
    setTemplateKey(key)
    setSegment(t.segment)
    setContent(pick(t))
    setResult(null)
  }

  const set = (field: keyof CampaignContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setContent(c => ({ ...c, [field]: e.target.value }))

  async function submit(mode: 'test' | 'send') {
    if (mode === 'send' && !confirm(`Да изпратя ли „${content.subject}“ до ${count} души? Това не може да се отмени.`)) return
    setBusy(mode)
    setResult(null)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...content, mode, segment, template: templateKey }),
      })
      const data = await res.json()
      if (!res.ok && !data.sent) setResult({ ok: false, text: data.error ?? 'Грешка' })
      else if (mode === 'test') setResult({ ok: true, text: `Тестов имейл пратен до ${data.to}` })
      else setResult({ ok: !data.failed, text: `Пратени: ${data.sent}${data.failed ? `, неуспешни: ${data.failed} (${data.error})` : ''}` })
      if (mode === 'send') router.refresh()
    } catch {
      setResult({ ok: false, text: 'Няма връзка със сървъра' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
        <label className="block space-y-1">
          <span className="text-xs text-muted">Шаблон</span>
          <select className="field-input" value={templateKey} onChange={e => chooseTemplate(e.target.value)}>
            {TEMPLATES.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
          </select>
          <span className="block text-xs text-muted">{template.hint}</span>
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">Сегмент (получатели с имейл)</span>
          <select className="field-input" value={segment} onChange={e => setSegment(e.target.value)}>
            {segments.map(s => <option key={s.key} value={s.key}>{s.label} — {s.count}</option>)}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">Тема</span>
          <input className="field-input" value={content.subject} onChange={set('subject')} maxLength={150} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">Преглед в пощата (текстът след темата)</span>
          <input className="field-input" value={content.preheader} onChange={set('preheader')} maxLength={200} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">Текст — празен ред = нов абзац, „- “ = точка от списък, {'{{име}}'} = име на клиента</span>
          <textarea className="field-input min-h-72 font-mono text-xs leading-relaxed" value={content.body} onChange={set('body')} />
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-muted">Текст на бутона</span>
            <input className="field-input" value={content.ctaLabel} onChange={set('ctaLabel')} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">Линк на бутона</span>
            <input className="field-input" value={content.ctaUrl} onChange={set('ctaUrl')} />
          </label>
        </div>

        {placeholder && (
          <p className="text-sm text-yellow-400">Попълни {placeholder} преди пращане.</p>
        )}
        {result && <p className={`text-sm ${result.ok ? 'text-green-400' : 'text-red-400'}`}>{result.text}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => submit('test')}
            disabled={!!busy || !!placeholder}
            className="px-4 py-2 rounded-xl border border-border hover:border-accent text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {busy === 'test' ? 'Праща се...' : 'Тест до моя имейл'}
          </button>
          <button
            type="button"
            onClick={() => submit('send')}
            disabled={!!busy || !!placeholder || !canSend || count === 0}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {busy === 'send' ? 'Праща се...' : `Изпрати до ${count} души`}
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
        <p className="text-xs text-muted px-4 py-2 border-b border-border">Преглед (с примерно име „Иван“)</p>
        <iframe title="Преглед на имейла" srcDoc={preview} sandbox="" className="flex-1 w-full bg-[#0d0d0d]" />
      </div>
    </div>
  )
}
