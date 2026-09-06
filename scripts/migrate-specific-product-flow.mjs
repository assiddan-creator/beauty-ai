import fs from 'node:fs'

const appPath = 'src/App.tsx'
let source = fs.readFileSync(appPath, 'utf8')

function replaceRequired(label, searchValue, replacement) {
  if (!source.includes(searchValue)) {
    throw new Error(`Migration anchor not found: ${label}`)
  }
  source = source.replace(searchValue, replacement)
}

if (!source.includes("import ProductTryOnPicker from './components/ProductTryOnPicker'")) {
  const importAnchor = "import { searchByIntent, type SearchResult, type LookMetadataRecord, type LookNavigationRecord } from './lib/beautyIntentSearch'\n"
  replaceRequired(
    'beauty intent import',
    importAnchor,
    `${importAnchor}import ProductTryOnPicker from './components/ProductTryOnPicker'\nimport type { BeautyProductView } from './lib/productCatalogFacade'\n`,
  )
}

replaceRequired(
  'legacy ProductItem type',
  'type ProductItem = (typeof PRODUCT_CATALOG)[0]',
  'type ProductItem = BeautyProductView',
)

const legacyStateLines = [
  "  const [productStep, setProductStep] = useState<'category' | 'brand' | 'product' | 'shade'>('category')\n",
  "  const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null)\n",
  "  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)\n",
  "  const [selectedProductName, setSelectedProductName] = useState<string | null>(null)\n",
  "  const [, setSelectedProduct] = useState<ProductItem | null>(null)\n",
]

for (const line of legacyStateLines) {
  if (!source.includes(line)) throw new Error(`Legacy product state line not found: ${line.trim()}`)
  source = source.replace(line, '')
}

const legacyResetLines = [
  "    setProductStep('category')\n",
  '    setSelectedProductCategory(null)\n',
  '    setSelectedBrand(null)\n',
  '    setSelectedProductName(null)\n',
  '    setSelectedProduct(null)\n',
]

for (const line of legacyResetLines) {
  if (!source.includes(line)) throw new Error(`Legacy product reset line not found: ${line.trim()}`)
  source = source.replace(line, '')
}

const pickerStart = source.indexOf('  const ProductTryOnMode = () => {')
const pickerEndMarker = '\n\n  const SplashScreen = () => {'
const pickerEnd = source.indexOf(pickerEndMarker, pickerStart)
if (pickerStart === -1 || pickerEnd === -1) {
  throw new Error('Legacy ProductTryOnMode block not found')
}

const replacementPicker = `  const ProductTryOnMode = () => (\n    <ProductTryOnPicker\n      lang={lang}\n      disabled={isGenerating}\n      onTryOn={handleProductTryOn}\n    />\n  )`
source = source.slice(0, pickerStart) + replacementPicker + source.slice(pickerEnd)

if (source.includes("const filteredByCategory = PRODUCT_CATALOG.filter(p => p.category === selectedProductCategory)")) {
  throw new Error('Legacy product picker implementation still present after migration')
}

fs.writeFileSync(appPath, source)
console.log('Specific-product flow migrated to ProductTryOnPicker.')
