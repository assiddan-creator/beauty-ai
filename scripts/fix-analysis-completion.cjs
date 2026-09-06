const fs = require('fs')

const path = 'src/App.tsx'
let src = fs.readFileSync(path, 'utf8')

const before = `    } finally {\n      setIsAnalyzing(false)\n    }`
const after = `    } finally {\n      setIsAnalyzing(false)\n      setShowAnalyzingScreen(false)\n    }`

const matches = src.split(before).length - 1
if (matches !== 1) {
  throw new Error(`Expected exactly 1 analysis finally block, found ${matches}`)
}

src = src.replace(before, after)
fs.writeFileSync(path, src)
console.log('Analysis completion screen now closes in finally.')
