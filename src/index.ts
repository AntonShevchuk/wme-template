import { NAME, TRANSLATION, SETTINGS } from './translations'
import { getButtons } from './buttons'
import { Template } from './template'
import css from './style.css'

// Register translations and styles before bootstrap
WMEUI.addTranslation(NAME, TRANSLATION)
WMEUI.addStyle(css)

$(document).on('bootstrap.wme', () => {
  // Create instance with settings (auto-persisted to localStorage)
  const instance = new Template(NAME, SETTINGS)

  // Get buttons with deferred translations
  const buttons = getButtons()

  // Wire button callbacks to instance methods
  buttons.A.callback = () => instance.onSimplify()
  buttons.B.callback = () => instance.onStraighten()
  buttons.C.callback = () => instance.onInfo()

  // Initialize UI (tab, panel, modal, shortcuts)
  instance.init(buttons)
})
