import fs from 'fs'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

// Userscript header without @require lines
const meta = fs.readFileSync('./src/meta.ts', 'utf8')
  .replace('{{version}}', pkg.version)
  .split('\n')
  .filter(line => !line.includes('// @require'))
  .join('\n')

// Library dist files in dependency order
const libs = [
  '../common.utils/dist/Utils.user.js',
  '../geo.utils/dist/GeoUtils.user.js',
  '../wme-bootstrap/dist/WME-Bootstrap.user.js',
  '../wme-base/dist/WME-Base.user.js',
  '../wme-ui/dist/WME-UI.user.js',
]

// Read each library, strip its userscript header
function stripMeta (code) {
  return code.replace(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/, '')
}

const libCode = libs
  .map(path => stripMeta(fs.readFileSync(path, 'utf8')))
  .join('\n')

const banner = meta + '\n' + libCode

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/WME-Template.bundled.user.js',
    format: 'iife',
    banner,
  },
  plugins: [
    postcss({ inject: false }),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
}
