import { NAME, TRANSLATION } from './translations'
import { SETTINGS } from './settings'
import { getButtons } from './buttons'
import { Template } from './template'
import css from './style.css'

$(document).on('bootstrap.wme', () => {
  // Register translations and styles
  WMEUI.addTranslation(NAME, TRANSLATION)
  WMEUI.addStyle(css)

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
