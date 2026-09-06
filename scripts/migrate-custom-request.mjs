import fs from 'node:fs'

const path = 'src/App.tsx'
let source = fs.readFileSync(path, 'utf8')

function replaceOnce(label, before, after) {
  if (!source.includes(before)) throw new Error(`Missing migration anchor: ${label}`)
  source = source.replace(before, after)
}

replaceOnce(
  'custom request imports',
  "import ProductTryOnPicker from './components/ProductTryOnPicker'\nimport type { BeautyProductView } from './lib/productCatalogFacade'\n",
  "import ProductTryOnPicker from './components/ProductTryOnPicker'\nimport CustomRequestTryOn from './components/CustomRequestTryOn'\nimport type { BeautyProductView } from './lib/productCatalogFacade'\nimport { buildCustomTryOnPrompt } from './lib/customTryOnPrompt'\n",
)

replaceOnce(
  'preset custom note declaration',
  "      const presetName = selectedPreset ?? BEAUTY_PRESETS[0].name\n      const customNote = customInstructions.trim()\n      const activePreset = BEAUTY_PRESETS.find(p => p.name === presetName) ?? BEAUTY_PRESETS[0]\n",
  "      const presetName = selectedPreset ?? BEAUTY_PRESETS[0].name\n      const activePreset = BEAUTY_PRESETS.find(p => p.name === presetName) ?? BEAUTY_PRESETS[0]\n",
)

replaceOnce(
  'preset custom note prompt line',
  "        activePreset.prompt,\n        categoryNote,\n        customNote ? `Additional request: ${customNote}` : null,\n",
  "        activePreset.prompt,\n        categoryNote,\n",
)

replaceOnce(
  'refine custom note declaration',
  "    try {\n      const customNote = customInstructions.trim()\n\n      const prompt = [\n",
  "    try {\n      const prompt = [\n",
)

replaceOnce(
  'refine custom note prompt line',
  "        'DESIRED RESULT: A photorealistic clean-face result with natural bare skin, natural lips, and natural cheeks, as if the makeup has been gently removed while preserving the real person exactly.',\n        customNote ? `Additional request: ${customNote}` : null,\n",
  "        'DESIRED RESULT: A photorealistic clean-face result with natural bare skin, natural lips, and natural cheeks, as if the makeup has been gently removed while preserving the real person exactly.',\n",
)

const handler = `  const handleCustomTryOn = async () => {
    if (!originalImage) return

    const request = customInstructions.trim()
    if (!request) {
      setError(lang === 'he' ? 'כתבי קודם מה תרצי לנסות.' : 'Describe the makeup you want to try first.')
      return
    }

    const token = import.meta.env.VITE_REPLICATE_API_TOKEN
    if (!token || typeof token !== 'string' || token.trim() === '') {
      setError('Replicate API token not found. Add VITE_REPLICATE_API_TOKEN to your .env file.')
      return
    }

    setError(null)
    setResultDescription(null)
    setSelectedPreset(null)
    setIsGenerating(true)

    try {
      const prompt = buildCustomTryOnPrompt(request)
      const imageDataUrl = await blobUrlToDataUrl(originalImage)
      const outputUrl = await runReplicatePrediction(prompt, imageDataUrl, activeEngine)

      setGeneratedImage(outputUrl)
      setSliderPosition(50)

      const customLookName = lang === 'he' ? 'בקשה חופשית' : 'Custom Request'
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalUrl: originalImage,
        generatedUrl: outputUrl,
        lookName: customLookName,
        timestamp: Date.now(),
      }
      setHistory((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_HISTORY)
        saveHistoryToStorage(updated)
        return updated
      })
      setActiveHistoryId(entry.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Custom makeup try-on failed.')
    } finally {
      setIsGenerating(false)
    }
  }

`

replaceOnce(
  'custom handler insertion',
  "  const handleProductTryOn = async (product: ProductItem) => {\n",
  handler + "  const handleProductTryOn = async (product: ProductItem) => {\n",
)

replaceOnce(
  'custom request ui',
  `                {/* ── Custom Instructions ── */}
                <section className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">{t.customInstructions}</h2>
                    <span className="text-xs text-gray-600">{t.optional}</span>
                  </div>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder={t.customPlaceholder}
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-300 placeholder-gray-500 backdrop-blur-3xl transition-all duration-200 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/25"
                  />
                </section>
`,
  `                <CustomRequestTryOn
                  lang={lang}
                  value={customInstructions}
                  disabled={isGenerating}
                  onChange={setCustomInstructions}
                  onSubmit={handleCustomTryOn}
                />
`,
)

fs.writeFileSync(path, source)
console.log('Custom request UX migration applied successfully.')
