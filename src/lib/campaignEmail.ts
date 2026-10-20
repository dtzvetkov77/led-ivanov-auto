// Pure campaign email helpers — imported by both the admin composer (client) and the send API.

export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.ledivanovauto.com'

export type CampaignContent = {
  subject: string
  preheader: string
  body: string
  ctaLabel: string
  ctaUrl: string
}

export type CampaignTemplate = CampaignContent & {
  key: string
  name: string
  segment: string
  hint: string
}

/** `[[...]]` marks text the admin must replace before sending. */
export const PLACEHOLDER = /\[\[[^\]]*\]\]/

export function findPlaceholder(c: CampaignContent): string | null {
  for (const v of [c.subject, c.preheader, c.body, c.ctaLabel, c.ctaUrl]) {
    const m = v.match(PLACEHOLDER)
    if (m) return m[0]
  }
  return null
}

export const TEMPLATES: CampaignTemplate[] = [
  {
    key: 'winter',
    name: 'Зима и видимост',
    segment: 'all',
    hint: 'Сезонна кампания до всички купувачи — октомври/ноември.',
    subject: 'Зимата идва — виждаш ли пътя достатъчно добре?',
    preheader: 'Кратки дни, мъгла и мокър асфалт. Провери светлините преди студовете.',
    body: `Здравей, {{име}}!

Дните стават по-кратки и все повече караме на тъмно, в мъгла и по мокър асфалт. Точно тогава слабите или потъмнели крушки се усещат най-много.

Преди зимата ти препоръчваме бърза проверка:
- Светят ли еднакво двата фара?
- Работят ли фаровете за мъгла?
- Не са ли пожълтели или матови стъклата на фаровете?

Ако нещо не е наред — при нас ще намериш LED крушки за всеки цокъл (H7, H4, H1, H11, HB3/HB4 и LED заместители на ксенон), с гаранция и бърза доставка.

Не си сигурен коя крушка ти трябва? Просто отговори на този имейл с марка, модел и година на колата.`,
    ctaLabel: 'Виж LED крушките',
    ctaUrl: `${SITE}/c/led-krushki-za-kola`,
  },
  {
    key: 'cross-sell-small',
    name: 'Допълни светлините (за H7/H4 купувачи)',
    segment: 'h7',
    hint: 'За хора с LED фарове — предложи габарити и плафони в същия бял цвят.',
    subject: 'Фаровете ти вече светят бяло. А габаритите?',
    preheader: 'Габарити T10 и плафони за номер в същия студено бял цвят.',
    body: `Здравей, {{име}}!

Благодарим ти, че избра LED крушки от нас. След като фаровете светят в чисто бяло, жълтите габарити и осветлението на номера изпъкват още повече.

Най-често нашите клиенти допълват с:
- LED габарити T10 / W5W — без грешки на таблото
- LED плафони за номер — директен монтаж, без пробиване
- LED крушки за мъгла H8 / H11 / H16

Така цялата кола свети в един и същ цвят.`,
    ctaLabel: 'Виж плафоните и габаритите',
    ctaUrl: `${SITE}/blog/led-gabaritni-krushki-t10-w5w`,
  },
  {
    key: 'xenon-drl',
    name: 'Ксенон купувачи — дневни светлини',
    segment: 'xenon',
    hint: 'За купувачи на D1S/D2S/D3S заместители.',
    subject: 'Допълни новите си фарове с дневни LED светлини',
    preheader: 'Модерен вид и по-добра видимост през деня.',
    body: `Здравей, {{име}}!

Надяваме се, че LED заместителите на ксенон ти служат отлично.

Ако искаш да довършиш визията на колата, разгледай нашите дневни LED светлини и динамични мигачи — по-добра видимост през деня и модерен вид.

Имаш въпрос за съвместимост? Отговори на този имейл и ще ти помогнем.`,
    ctaLabel: 'Виж дневните светлини',
    ctaUrl: `${SITE}/c/dnevni-svetlini`,
  },
  {
    key: 'win-back',
    name: 'Връщане на неактивни клиенти',
    segment: 'lapsed-180',
    hint: 'Попълни офертата в [[ ]] преди пращане (напр. код за отстъпка).',
    subject: 'Отдавна не сме се чували, {{име}}',
    preheader: 'Имаме нещо специално за теб.',
    body: `Здравей, {{име}}!

Мина известно време от последната ти поръчка при нас. Междувременно добавихме много нови продукти — LED крушки за всички цокли, CANBUS модули, дневни светлини и плафони.

Като благодарност, че вече си наш клиент: [[ОФЕРТА — напр. 10% отстъпка с код ОТНОВО10 до 30 ноември]]

Ще се радваме да те видим отново.`,
    ctaLabel: 'Разгледай продуктите',
    ctaUrl: `${SITE}/products`,
  },
  {
    key: 'review',
    name: 'Молба за отзив',
    segment: 'delivered',
    hint: 'Сложи линка към Google ревютата на фирмата в бутона.',
    subject: 'Как се справят крушките, {{име}}?',
    preheader: 'Отнема 30 секунди и много ни помага.',
    body: `Здравей, {{име}}!

Благодарим ти, че пазаруваш от LED Ivanov Auto. Ще се радваме да научим как се справят продуктите на твоята кола.

Ако си доволен — един кратък отзив в Google много ни помага да растем.

Ако нещо не е както трябва — просто отговори на този имейл и ще го оправим.`,
    ctaLabel: 'Остави отзив',
    ctaUrl: '[[ЛИНК КЪМ GOOGLE РЕВЮТАТА]]',
  },
  {
    key: 'vip',
    name: 'Благодарност към лоялни клиенти',
    segment: 'repeat',
    hint: 'За повторни клиенти или Топ 20%. Попълни офертата.',
    subject: 'Благодарим, че ни избираш отново',
    preheader: 'Специално предложение само за постоянни клиенти.',
    body: `Здравей, {{име}}!

Ти си от клиентите, които се връщат при нас отново — и за това искаме да ти благодарим.

Специално за теб: [[ОФЕРТА — напр. безплатна доставка за следващата поръчка с код VIP]]

Ако имаш нужда от съвет за друга кола в семейството — пиши ни директно на този имейл.`,
    ctaLabel: 'Към магазина',
    ctaUrl: `${SITE}/products`,
  },
]

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const capitalize = (s: string) => (s ? s[0].toLocaleUpperCase('bg') + s.slice(1).toLocaleLowerCase('bg') : s)

/** Replace {{име}}; when the name is unknown drop it together with a preceding comma. */
export function personalize(text: string, firstName: string): string {
  const name = capitalize(firstName.replace(/[^\p{L}'-]/gu, ''))
  return name ? text.replace(/\{\{име\}\}/g, name) : text.replace(/,?\s*\{\{име\}\}/g, '')
}

/** Blank line = new paragraph; runs of "- " lines = bullet list (may follow a lead-in line). */
function bodyHtml(body: string): string {
  const text = 'color:#e5e5e5;font-size:15px;line-height:1.6;'
  const out: string[] = []
  for (const block of body.trim().split(/\n\s*\n/)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    // Split the block into consecutive runs of plain lines and list lines
    const runs: { list: boolean; lines: string[] }[] = []
    for (const l of lines) {
      const isItem = l.startsWith('- ')
      const last = runs[runs.length - 1]
      if (last && last.list === isItem) last.lines.push(isItem ? l.slice(2) : l)
      else runs.push({ list: isItem, lines: [isItem ? l.slice(2) : l] })
    }
    runs.forEach((r, i) => {
      const gap = i < runs.length - 1 ? 8 : 16
      out.push(r.list
        ? `<ul style="margin:0 0 ${gap}px;padding-left:20px;${text}">${r.lines.map(l => `<li style="margin:0 0 6px;">${esc(l)}</li>`).join('')}</ul>`
        : `<p style="margin:0 0 ${gap}px;${text}">${r.lines.map(esc).join('<br>')}</p>`)
    })
  }
  return out.join('')
}

export function renderCampaignHtml(c: CampaignContent, firstName: string, unsubscribeUrl: string): string {
  const subject = esc(personalize(c.subject, firstName))
  const preheader = esc(personalize(c.preheader, firstName))
  const cta = c.ctaLabel && /^https?:\/\//.test(c.ctaUrl)
    ? `<table cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td style="background:#cc0000;border-radius:10px;">
        <a href="${esc(c.ctaUrl)}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;">${esc(c.ctaLabel)}</a>
      </td></tr></table>`
    : ''
  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#111111;border-radius:16px 16px 0 0;padding:28px 40px;border-bottom:2px solid #cc0000;text-align:center;">
            <a href="${SITE}" style="text-decoration:none;">
              <img src="${SITE}/images/logo.png" width="300" alt="LED IVANOV AUTO" style="display:inline-block;width:300px;max-width:100%;height:auto;border:0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:3px;">
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#161616;padding:36px 40px;border-radius:0 0 16px 16px;">
            ${bodyHtml(personalize(c.body, firstName))}
            ${cta}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;text-align:center;font-size:12px;color:#9a9a9a;line-height:1.8;">
            LED Ivanov Auto · ж.к. Малинова долина, София · <a href="tel:+359999997996" style="color:#cc0000;text-decoration:none;">+359 99 999 7996</a><br>
            Получаваш този имейл, защото си пазарувал от ledivanovauto.com.<br>
            <a href="${esc(unsubscribeUrl)}" style="color:#9a9a9a;">Отпиши се от тези имейли</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function renderCampaignText(c: CampaignContent, firstName: string, unsubscribeUrl: string): string {
  const cta = c.ctaLabel && /^https?:\/\//.test(c.ctaUrl) ? `\n\n${c.ctaLabel}: ${c.ctaUrl}` : ''
  return `${personalize(c.body, firstName).trim()}${cta}\n\n--\nLED Ivanov Auto · +359 99 999 7996\nОтписване: ${unsubscribeUrl}\n`
}
