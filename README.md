# WME Template
Template of the GreasyFork script for Waze Map Editor

## Libraries

* [Common Utils](https://github.com/AntonShevchuk/common.utils) – contains `SimpleCache`, `Settings` and `Tools` classes
* [WME-Bootstrap](https://github.com/AntonShevchuk/wme-bootstrap) - trigger `jQuery.Event` for all major events on the page
* [WME-Base](https://github.com/AntonShevchuk/wme-base) - contains `WME` class-helper and `WMEBase` – parent class for WME scripts
* [WME-UI](https://github.com/AntonShevchuk/wme-ui) - contains set of the classes to simplify build UI for WME scripts


### Require libraries

⚠️ Actual version of libraries see on the [Greasy Fork site](https://greasyfork.org/en/users/227648-anton-shevchuk)

```javascript
// @require https://greasyfork.org/scripts/389765-common-utils/code/CommonUtils.js?version=1090053
// @require https://greasyfork.org/scripts/450160-wme-bootstrap/code/WME-Bootstrap.js?version=1090054
// @require https://greasyfork.org/scripts/450221-wme-base/code/WME-Base.js?version=1090055
// @require https://greasyfork.org/scripts/450320-wme-ui/code/WME-UI.js?version=1090056
```

## Recommended structure

```javascript
(function () {
  'use strict'

  // Script name, uses as unique index
  const NAME = 'Example'

  // Translations, english section is requiried
  const TRANSLATION = {
    en: {},
    ua: {}
  }

  // Custom style will be injected
  const STYLE = 'button.waze-btn.template { border: 1px solid #ccc; } '

  WMEUI.addTranslation(NAME, TRANSLATION)
  WMEUI.addStyle(STYLE)

  // Custom buttons, you can inject it to sidebar or modal window
  const BUTTONS = {
    A: {
      title: I18n.t(NAME).buttons.A, // use translation for the button title
      description: I18n.t(NAME).buttons.A, // use translation for the button description
      shortcut: 'S+A', // setup shortcut
      callback: () => console.log('Button A') // setup button here or later
    },
  }

  // Create default settings, if needed
  const SETTINGS = {
    A: true,
  }

  // Example
  class Example extends WMEBase {
    constructor (name, settings) {
      super(name)
      // setup settings
      this.settings = new Settings(name, settings)
    }
    
    /**
     * Handler for window `beforeunload` event
     * @param {jQuery.Event} event
     * @return {Null}
     */
    onBeforeUnload (event) {
      // save settings
      this.settings.save()
    }

    /**
     * Initial UI elements
     * @param {Object} buttons
     */
    init (buttons) {
      /** @type {WMEUIHelper} */
      this.helper = new WMEUIHelper(this.name)

      /** @type {WMEUIHelperPanel} */
      this.panel = this.helper.createPanel(I18n.t(this.name).title)
      this.panel.addButtons(buttons)
    }

    /**
     * Handler for `point.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {W.model} model
     * @return {void}
     */
    onPoint (event, element, model) {
      this.log('Selected a point')
      // Inject custom HTML to the current sidebar
      // It can be #node-edit-general or #segment-edit-general or #venue-edit-general or #mergeVenuesCollection
      element.prepend(this.panel.html())
    }
  }

  $(document).on('bootstrap.wme', () => {
    let Instance = new Example(NAME, SETTINGS)
    Instance.init(BUTTONS)
  })
})();
```

## Links
Author homepage: http://anton.shevchuk.name/  
Script homepage: https://github.com/AntonShevchuk/wme-template  
