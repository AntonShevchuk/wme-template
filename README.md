# WME Template

Template for Waze Map Editor userscripts. TypeScript source with Rollup build pipeline.

## Libraries

* [Common Utils](https://github.com/AntonShevchuk/common.utils) - `Container`, `SimpleCache`, `Settings`, `Tools`
* [Geo Utils](https://github.com/AntonShevchuk/geo.utils) - `GeoUtils` static class for geospatial calculations
* [WME-Bootstrap](https://github.com/AntonShevchuk/wme-bootstrap) - triggers `jQuery.Event` for all major WME events
* [WME-Base](https://github.com/AntonShevchuk/wme-base) - `WMEBase` parent class with event handlers, shortcuts, permissions
* [WME-UI](https://github.com/AntonShevchuk/wme-ui) - UI helpers: Tab, Panel, Modal, Fieldset, controls

## Project Structure

```
src/
  name.ts          # script name constant (unique identifier)
  translations.ts  # translations (en, uk, ru) accessed via WMEUI.t(NAME)
  settings.ts      # default settings (persisted to localStorage)
  buttons.ts       # button definitions with shortcuts
  style.css        # plain CSS (imported as string)
  template.ts      # main class extending WMEBase
  index.ts         # bootstrap: register translations/styles, init
  globals.d.ts     # type declarations for WME libraries
  meta.ts          # userscript header
```

## Development

```bash
npm install
npm run build           # build dist/WME-Template.user.js
npm run build:bundled   # build all-in-one version (libraries included)
npm run watch           # rebuild on changes
```

## Demonstrated Features

### WME-Base

- **Event handlers**: `onSegment`, `onSegments`, `onVenue`, `onVenues`, `onNode`, `onNodes`, `onPoint`, `onPlace`, `onResidential`, `onNone`
- **Shortcuts**: `createShortcut(id, description, keys, callback)`
- **Permissions**: `canEditSegment(model)`, `canEditVenue(model)`
- **Selection**: `getSelection()`, `getSelectedSegments()`, `getSelectedVenues()`
- **Logging**: `log()`, `warn()`, `error()`, `group()`, `groupEnd()`

### WME-UI

- **Tab**: sidebar tab with icon - `helper.createTab(title, { sidebar, icon })`
- **Panel**: inline panel injected into edit sidebar - `helper.createPanel(title)`
- **Modal**: floating overlay with close button - `helper.createModal(title)`
- **Fieldset**: collapsible group - `helper.createFieldset(title)`
- **Controls**: `addButton`, `addButtons`, `addCheckbox`, `addCheckboxes`, `addNumber`, `addInput`, `addRange`, `addText`, `addDiv`
- **Dynamic updates**: `setText()` on text elements, `remove()` on any element
- **Translations**: `WMEUI.addTranslation(NAME, data)`, `WMEUI.t(NAME)`
- **Styles**: `WMEUI.addStyle(css)`

### CommonUtils

- **Settings**: `new Settings(name, defaults)` with `get()`, `set()`, `save()`, `load()`

## Quick Start

### 1. Define name, translations, and settings

```typescript
// name.ts
export const NAME = 'MyScript'

// translations.ts - english is required
export const TRANSLATION = {
  en: { title: 'My Script', buttons: { run: 'Run' } },
  uk: { title: 'Мій скрипт', buttons: { run: 'Запуск' } },
}

// settings.ts - persisted to localStorage
export const SETTINGS = { enabled: true, threshold: 10 }
```

### 2. Define buttons

```typescript
// buttons.ts
export function getButtons () {
  return {
    A: {
      title: WMEUI.t(NAME).buttons.run,
      description: WMEUI.t(NAME).buttons.run,
      shortcut: 'S+1',
      callback: null  // wired in index.ts
    },
  }
}
```

### 3. Create the main class

```typescript
// my-script.ts
export class MyScript extends WMEBase {
  panel: WMEUIHelperPanel
  tab: WMEUIHelperTab

  init (buttons: Record<string, any>) {
    this.panel = this.helper.createPanel(WMEUI.t(NAME).title)
    this.panel.addButtons(buttons)

    this.tab = this.helper.createTab(WMEUI.t(NAME).title, {
      sidebar: this.wmeSDK.Sidebar,
      icon: 'polygon',
    })
    this.tab.inject()
  }

  onSegment (event: JQuery.Event, element: HTMLElement, model: Segment) {
    if (this.canEditSegment(model)) {
      element.prepend(this.panel.html())
    }
  }
}
```

### 4. Bootstrap

```typescript
// index.ts
$(document).on('bootstrap.wme', () => {
  WMEUI.addTranslation(NAME, TRANSLATION)
  WMEUI.addStyle(css)

  const instance = new MyScript(NAME, SETTINGS)
  const buttons = getButtons()
  buttons.A.callback = () => instance.onRun()
  instance.init(buttons)
})
```

## @require Libraries

```javascript
// @require      https://update.greasyfork.org/scripts/389765/1793258/CommonUtils.js
// @require      https://update.greasyfork.org/scripts/571719/1793257/GeoUtils.js
// @require      https://update.greasyfork.org/scripts/450160/1792042/WME-Bootstrap.js
// @require      https://update.greasyfork.org/scripts/450221/1793261/WME-Base.js
// @require      https://update.greasyfork.org/scripts/450320/1794414/WME-UI.js
```

## Links

Author homepage: https://anton.shevchuk.name/  
Script homepage: https://github.com/AntonShevchuk/wme-template  
