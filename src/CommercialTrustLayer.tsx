import { useEffect, useState } from 'react'
import { ShieldCheck, Trash2, X } from 'lucide-react'
import { loadCommercialConfig, type CommercialConfig } from './lib/commercialConfig'
import './commercial-trust.css'

type UiLanguage = 'he' | 'en'

const HISTORY_STORAGE_KEY = 'beauty-tryon-history-v1'

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
    subtitle: 'מידע קצר וברור על ההדמיה, ספקי ה-AI והנתונים שנשמרים במכשיר.',
    items: [
      'זו הדמיית איפור חזותית בלבד — לא אבחון רפואי, לא דירוג מראה ולא הבטחה להתאמת גוון מדויקת.',
      'כדי לבצע ניתוח או הדמיה, התמונה נשלחת לספקי ה-AI שמפעילים את התכונה שבחרת. בגרסה הנוכחית אין באפליקציה מסד נתונים ייעודי לשמירת סלפי.',
      'היסטוריית תוצאות נשמרת, אם קיימת, מקומית בדפדפן במכשיר ונמחקת אוטומטית כשהקישור לתוצאת ההדמיה מתקרב לסיום חייו.',
      'שמות מותגים ומוצרים משמשים לזיהוי מוצרים ולהדגמת חוויית קנייה. אין בכך הצהרה על שותפות, חסות או אישור מצד המותגים.',
    ],
    lifecycleTitle: 'מחזור החיים הנוכחי של הנתונים',
    lifecycle: 'נכון לספטמבר 2026: קבצי פלט ונתוני Prediction של Replicate דרך ה-API נמחקים כברירת מחדל לאחר כשעה. קלט ופלט של Anthropic API נמחקים כברירת מחדל בתוך 30 יום, בכפוף לחריגים ולהסכמים. Anthropic אינה משתמשת בנתוני API מסחריים לאימון מודלים כברירת מחדל.',
    operator: 'מפעיל המוצר',
    retailer: 'חנות / מותג',
    privacyContact: 'יצירת קשר בנושא פרטיות',
    clearHistory: 'מחיקת היסטוריה מקומית',
    historyCleared: 'ההיסטוריה המקומית נמחקה מהמכשיר',
    clearHistoryNote: 'הפעולה מוחקת את היסטוריית התוצאות ששמורה בדפדפן הזה. התוצאה שמוצגת כרגע יכולה להישאר על המסך עד לרענון או מעבר מסך.',
    details: 'מידע מלא על טיפול בנתונים',
    close: 'הבנתי',
  },
  en: {
    chip: 'Privacy & transparency',
    title: 'How Beauty AI handles your photo',
    subtitle: 'A clear summary of the simulation, AI providers, and data stored on this device.',
    items: [
      'This is a visual makeup simulation only — not medical analysis, appearance scoring, or a guarantee of exact shade matching.',
      'To run analysis or try-on, your image is sent to the AI providers powering the feature you selected. The current app has no dedicated selfie database.',
      'Result history, when present, is stored locally in this browser and is automatically pruned as the generated-result link approaches the end of its useful lifetime.',
      'Brand and product names are used for product identification and shopping-demo purposes. They do not imply partnership, sponsorship, or endorsement.',
    ],
    lifecycleTitle: 'Current provider data lifecycle',
    lifecycle: 'As of September 2026: Replicate API prediction data and output files are deleted by default after about one hour. Anthropic API inputs and outputs are deleted by default within 30 days, subject to exceptions and agreements. Anthropic does not use commercial API data for model training by default.',
    operator: 'Product operator',
    retailer: 'Retailer / brand',
    privacyContact: 'Privacy contact',
    clearHistory: 'Clear local result history',
    historyCleared: 'Local history was cleared from this device',
    clearHistoryNote: 'This removes result history stored in this browser. A result already visible on screen may remain until you refresh or navigate away.',
    details: 'Full data-handling notice',
    close: 'Got it',
  },
} as const

export default function CommercialTrustLayer() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<UiLanguage>(() => detectLanguage())
  const [config, setConfig] = useState<CommercialConfig | null>(null)
  const [historyCleared, setHistoryCleared] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => setLang(detectLanguage()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let active = true
    loadCommercialConfig().then((value) => {
      if (active) setConfig(value)
    })
    return () => {
      active = false
    }
  }, [])

  const copy = COPY[lang]
  const isHe = lang === 'he'
  const hasCommercialIdentity = Boolean(
    config?.operatorName || config?.retailerName || config?.privacyContact,
  )

  const clearLocalHistory = () => {
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
      setHistoryCleared(true)
      window.dispatchEvent(new CustomEvent('beauty:history-cleared'))
    } catch (error) {
      console.warn('[privacy controls] could not clear local history', error)
    }
  }

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

            <div className="beauty-trust-lifecycle">
              <strong>{copy.lifecycleTitle}</strong>
              <p>{copy.lifecycle}</p>
            </div>

            {hasCommercialIdentity && config && (
              <div className="beauty-trust-identity">
                {config.operatorName && (
                  <p><strong>{copy.operator}:</strong> {config.operatorName}</p>
                )}
                {config.retailerName && (
                  <p><strong>{copy.retailer}:</strong> {config.retailerName}</p>
                )}
                {config.privacyContact && (
                  <p><strong>{copy.privacyContact}:</strong> {config.privacyContact}</p>
                )}
              </div>
            )}

            <div className="beauty-trust-local-control">
              <button
                type="button"
                onClick={clearLocalHistory}
                disabled={historyCleared}
              >
                <Trash2 aria-hidden="true" />
                <span>{historyCleared ? copy.historyCleared : copy.clearHistory}</span>
              </button>
              <p>{copy.clearHistoryNote}</p>
            </div>

            <a className="beauty-trust-details" href="/privacy.html" target="_blank" rel="noreferrer">
              {copy.details}
            </a>

            <button type="button" className="beauty-trust-primary" onClick={() => setOpen(false)}>
              {copy.close}
            </button>
          </section>
        </div>
      )}
    </>
  )
}
