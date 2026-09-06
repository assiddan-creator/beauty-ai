import { useEffect, useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'

type UiLanguage = 'he' | 'en'

function detectLanguage(): UiLanguage {
  const htmlLang = document.documentElement.lang.toLowerCase()
  if (htmlLang.startsWith('he')) return 'he'
  if (htmlLang.startsWith('en')) return 'en'
  return navigator.language.toLowerCase().startsWith('he') ? 'he' : 'en'
}

const COPY = {
  he: {
    chip: 'פרטיות ושקיפות',
    title: 'איך Beauty AI מטפלת בתמונה שלך',
    subtitle: 'שקיפות קצרה לפני שהמוצר הופך למסחרי.',
    items: [
      'זו הדמיית איפור חזותית בלבד — לא אבחון רפואי, לא דירוג מראה ולא הבטחה להתאמת גוון מדויקת.',
      'כדי לבצע ניתוח או הדמיה, התמונה נשלחת לספקי ה-AI שמפעילים את התכונה שבחרת. בגרסה הנוכחית אין באפליקציה מסד נתונים לשמירת סלפי.',
      'היסטוריית תוצאות יכולה להישמר מקומית בדפדפן במכשיר שלך. ספקי ה-AI עשויים לעבד מידע בהתאם למדיניות השירות שלהם.',
      'שמות מותגים ומוצרים משמשים לזיהוי מוצרים ולהדגמת חוויית קנייה. אין בכך הצהרה על שותפות, חסות או אישור מצד המותגים.',
    ],
    close: 'הבנתי',
  },
  en: {
    chip: 'Privacy & transparency',
    title: 'How Beauty AI handles your photo',
    subtitle: 'A short transparency note for the commercial product.',
    items: [
      'This is a visual makeup simulation only — not medical analysis, appearance scoring, or a guarantee of exact shade matching.',
      'To run analysis or try-on, your image is sent to the AI providers powering the feature you selected. The current app has no database for storing selfies.',
      'Result history may be stored locally in your browser on this device. AI providers may process data under their own service policies.',
      'Brand and product names are used for product identification and shopping-demo purposes. They do not imply partnership, sponsorship, or endorsement.',
    ],
    close: 'Got it',
  },
} as const

export default function CommercialTrustLayer() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<UiLanguage>(() => detectLanguage())

  useEffect(() => {
    const observer = new MutationObserver(() => setLang(detectLanguage()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] })
    return () => observer.disconnect()
  }, [])

  const copy = COPY[lang]
  const isHe = lang === 'he'

  return (
    <>
      <button
        type="button"
        className="beauty-trust-chip"
        onClick={() => setOpen(true)}
        aria-label={copy.chip}
      >
        <ShieldCheck aria-hidden="true" />
        <span>{copy.chip}</span>
      </button>

      {open && (
        <div
          className="beauty-trust-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            className="beauty-trust-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="beauty-trust-title"
            dir={isHe ? 'rtl' : 'ltr'}
          >
            <button
              type="button"
              className="beauty-trust-close"
              onClick={() => setOpen(false)}
              aria-label={isHe ? 'סגירה' : 'Close'}
            >
              <X aria-hidden="true" />
            </button>

            <div className="beauty-trust-icon" aria-hidden="true">
              <ShieldCheck />
            </div>

            <p className="beauty-trust-kicker">Beauty AI · Trust</p>
            <h2 id="beauty-trust-title">{copy.title}</h2>
            <p className="beauty-trust-subtitle">{copy.subtitle}</p>

            <div className="beauty-trust-list">
              {copy.items.map((item, index) => (
                <div className="beauty-trust-item" key={item}>
                  <span>{index + 1}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <button type="button" className="beauty-trust-primary" onClick={() => setOpen(false)}>
              {copy.close}
            </button>
          </section>
        </div>
      )}
    </>
  )
}
