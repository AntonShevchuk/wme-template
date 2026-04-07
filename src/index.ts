import { NAME, TRANSLATION, SETTINGS } from './translations'
import { getButtons } from './buttons'
import { Template } from './template'
import css from './style.css'

WMEUI.addTranslation(NAME, TRANSLATION)
WMEUI.addStyle(css)

function logger (_event: any, element: any, model: any) {
  console.log('HTMLElement', element)
  console.log('DataModel', model)
}

$(document)
  .on('bootstrap.wme', () => {
    let Instance = new Template(NAME, SETTINGS)
    let buttons = getButtons()
    buttons.A.callback = () => Instance.onButtonA()
    buttons.B.callback = () => Instance.onButtonB()
    buttons.C.callback = () => Instance.onButtonC()
    Instance.init(buttons)

    let shortcut = {
      callback: () => alert('It works!'),
      description: "Some description",
      shortcutId: "wme-template-shortcut",
      shortcutKeys: "S+Q",
    }
    Instance.wmeSDK.Shortcuts.createShortcut(shortcut)
  })
  .on('camera.wme', logger)
  .on('city.wme', logger)
  .on('comment.wme', logger)
  .on('segment.wme', logger)
  .on('segments.wme', logger)
  .on('node.wme', logger)
  .on('nodes.wme', logger)
  .on('venue.wme', logger)
  .on('venues.wme', logger)
  .on('point.wme', logger)
  .on('place.wme', logger)
  .on('residential.wme', logger)
