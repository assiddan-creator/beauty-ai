import { useEffect, useMemo, useRef, useState } from 'react'
import { ExternalLink, ShoppingBag, X } from 'lucide-react'
import {
  loadCommercialConfig,
  type CommercialConfig,
} from './lib/commercialConfig'
import {
  matchesCatalogProductInText,
  normalizeCatalogText,
} from './lib/beautyCatalog'
import './commercial-purchase.css'

type UiLanguage = 'he' | 'en'

function detectLanguage(): UiLanguage {
  const htmlLang = document.documentElement.lang.toLowerCase()
  if (htmlLang.startsWith('he')) return 'he'
  if (htmlLang.startsWith('en')) return 'en'
  return navigator.language.toLowerCase().startsWith('he') ? 'he' : 'en'
}

function collectAppText(): string {
  const root = document.getElementById('root')
  if (!root) return ''

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('.beauty-commerce-layer')) return NodeFilter.FILTER_REJECT
      if (parent.closest('.beauty-trust-backdrop')) return NodeFilter.FILTER_REJECT
      const text = node.textContent?.trim()
      return text ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    },
  })

  const parts: string[] = []
  let current = walker.nextNode()
  while (current) {
    if (current.textContent) parts.push(current.textContent)
    current = walker.nextNode()
  }

  return normalizeCatalogText(parts.join(' '))
}

const COPY = {
  he: {
    chip: 'קנייה',
    eyebrow: 'SHOP THE LOOK',
    title: 'המוצרים שמופיעים עכשיו',
    subtitle: 'הקישורים נפתחים באתר החנות ומובילים למוצר ולגוון שהוגדרו בקטלוג.',
    lookCta: 'לרכישת הלוק',
    productCta: 'לרכישה',
    retailerPrefix: 'זמין דרך',
    close: 'סגירה',
  },
  en: {
    chip: 'Shop',
    eyebrow: 'SHOP THE LOOK',
    title: 'Products in your current view',
    subtitle: 'Links open the retailer site and point to the configured product and shade.',
    lookCta: 'Shop this look',
    productCta: 'Shop product',
    retailerPrefix: 'Available from',
    close: 'Close',
  },
} as const

export default function CommercialPurchaseLayer() {
  const [config, setConfig] = useState<CommercialConfig | null>(null)
  const [lang, setLang] = useState<UiLanguage>(() => detectLanguage())
  const [pageText, setPageText] = useState('')
  const [open, setOpen] = useState(false)
  const scanTimer = useRef<number | null>(null)

  useEffect(() => {
    let alive = true
    loadCommercialConfig().then((next) => {
      if (alive) setConfig(next)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const langObserver = new MutationObserver(() => setLang(detectLanguage()))
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] })
    return () => langObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!config || (config.products.length === 0 && Object.keys(config.lookLinks).length === 0)) return

    const root = document.getElementById('root')
    if (!root) return

    const scan = () => {
      if (scanTimer.current !== null) window.clearTimeout(scanTimer.current)
      scanTimer.current = window.setTimeout(() => {
        setPageText(collectAppText())
        scanTimer.current = null
      }, 120)
    }

    scan()
    const observer = new MutationObserver(scan)
    observer.observe(root, { childList: true, subtree: true, characterData: true })

    return () => {
      observer.disconnect()
      if (scanTimer.current !== null) window.clearTimeout(scanTimer.current)
    }
  }, [config])

  const activeProducts = useMemo(() => {
    if (!config || !pageText) return []
    return config.products
      .filter((product) => matchesCatalogProductInText(pageText, product))
      .slice(0, 8)
  }, [config, pageText])

  const activeLook = useMemo(() => {
    if (!config || !pageText) return null

    const match = Object.entries(config.lookLinks).find(([lookName]) => {
      const normalizedLook = normalizeCatalogText(lookName)
      return normalizedLook.length > 0 && pageText.includes(normalizedLook)
    })

    return match ? { name: match[0], url: match[1] } : null
  }, [config, pageText])

  useEffect(() => {
    if (activeProducts.length === 0 && !activeLook) setOpen(false)
  }, [activeProducts, activeLook])

  if (!config || (activeProducts.length === 0 && !activeLook)) return null

  const copy = COPY[lang]
  const isHe = lang === 'he'
  const retailerName = config.retailerName || config.operatorName

  const emitCommerceClick = (detail: Record<string, string>) => {
    window.dispatchEvent(new CustomEvent('beauty:commerce-click', { detail }))
  }

  const openCommerce = () => {
    setOpen(true)
    window.dispatchEvent(new CustomEvent('beauty:commerce-open', {
      detail: { visibleItems: activeProducts.length + (activeLook ? 1 : 0) },
    }))
  }

  return (
    <div className="beauty-commerce-layer" dir={isHe ? 'rtl' : 'ltr'}>
      <button
        type="button"
        className="beauty-commerce-chip"
        onClick={openCommerce}
        aria-label={copy.chip}
      >
        <ShoppingBag aria-hidden="true" />
        <span>{copy.chip}</span>
        <strong>{activeProducts.length + (activeLook ? 1 : 0)}</strong>
      </button>

      {open && (
        <div
          className="beauty-commerce-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section
            className="beauty-commerce-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="beauty-commerce-title"
          >
            <button
              type="button"
              className="beauty-commerce-close"
              onClick={() => setOpen(false)}
              aria-label={copy.close}
            >
              <X aria-hidden="true" />
            </button>

            <div className="beauty-commerce-mark" aria-hidden="true">
              <ShoppingBag />
            </div>
            <p className="beauty-commerce-eyebrow">{copy.eyebrow}</p>
            <h2 id="beauty-commerce-title">{copy.title}</h2>
            <p className="beauty-commerce-subtitle">{copy.subtitle}</p>

            {retailerName && (
              <p className="beauty-commerce-retailer">
                {copy.retailerPrefix} <strong>{retailerName}</strong>
              </p>
            )}

            {activeLook && (
              <a
                className="beauty-commerce-look-cta"
                href={activeLook.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => emitCommerceClick({ type: 'look', lookName: activeLook.name, url: activeLook.url })}
              >
                <div>
                  <span>{copy.lookCta}</span>
                  <strong>{activeLook.name}</strong>
                </div>
                <ExternalLink aria-hidden="true" />
              </a>
            )}

            {activeProducts.length > 0 && (
              <div className="beauty-commerce-products">
                {activeProducts.map((product) => (
                  <article className="beauty-commerce-product" key={product.id}>
                    <div className="beauty-commerce-product-copy">
                      <span>{product.brand}</span>
                      <strong>{product.productName}</strong>
                      <small>{product.shadeName}</small>
                      {product.priceLabel && <em>{product.priceLabel}</em>}
                    </div>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => emitCommerceClick({
                        type: 'product',
                        productId: product.id,
                        brand: product.brand,
                        productName: product.productName,
                        shadeName: product.shadeName,
                        url: product.url,
                      })}
                    >
                      {copy.productCta}
                      <ExternalLink aria-hidden="true" />
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
