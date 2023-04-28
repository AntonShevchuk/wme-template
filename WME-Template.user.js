// ==UserScript==
// @name         WME Template
// @version      0.1.2
// @description  Template of the script for Waze Map Editor
// @license      MIT License
// @author       Anton Shevchuk
// @namespace    https://greasyfork.org/users/227648-anton-shevchuk
// @supportURL   https://github.com/AntonShevchuk/wme-template/issues
// @match        https://*.waze.com/editor*
// @match        https://*.waze.com/*/editor*
// @exclude      https://*.waze.com/user/editor*
// @icon         https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://anton.shevchuk.name&size=64
// @grant        none
// @require      https://greasyfork.org/scripts/389765-common-utils/code/CommonUtils.js?version=1090053
// @require      https://greasyfork.org/scripts/450160-wme-bootstrap/code/WME-Bootstrap.js?version=1182738
// @require      https://greasyfork.org/scripts/452563-wme/code/WME.js?version=1182695
// @require      https://greasyfork.org/scripts/450221-wme-base/code/WME-Base.js?version=1137043
// @require      https://greasyfork.org/scripts/450320-wme-ui/code/WME-UI.js?version=1137289
// ==/UserScript==

/* jshint esversion: 8 */

/* global require */
/* global $, jQuery */
/* global W */
/* global I18n */
/* global OpenLayers */
/* global WME, WMEBase */
/* global WMEUI, WMEUIHelper, WMEUIHelperPanel, WMEUIHelperModal, WMEUIHelperTab, WMEUIShortcut, WMEUIHelperFieldset */
/* global Container, Settings, SimpleCache, Tools  */

(function () {
  'use strict'

  // Script name, uses as unique index
  const NAME = 'Template'

  // Translations
  const TRANSLATION = {
    'en': {
      title: 'WME Template',
      description: 'Example of the script for Waze Map Editor',
      buttons: {
        title: 'Buttons',
        A: 'Button A',
        B: 'Button B',
        C: 'Button C',
      },
      settings: {
        title: 'Settings',
        A: 'Flag A',
        B: 'Flag B',
        C: 'Flag C',
      },
    },
    'uk': {
      title: 'WME Template',
      description: 'Приклад скрипта для редактора карт Waze',
      buttons: {
        title: 'Кнопки',
        A: 'Кнопка A',
        B: 'Кнопка B',
        C: 'Кнопка C',
      },
      settings: {
        title: 'Налаштування',
        A: 'Опція A',
        B: 'Опція B',
        C: 'Опція C',
      },
    },
    'ru': {
      title: 'WME Template',
      description: 'Пример скрипта для редактора карт Waze',
      buttons: {
        title: 'Кнопки',
        A: 'Кнопка A',
        B: 'Кнопка B',
        C: 'Кнопка C',
      },
      settings: {
        title: 'Настройки',
        A: 'Опция A',
        B: 'Опция B',
        C: 'Опция C',
      },
    }
  }

  const STYLE =
    'button.waze-btn.template { background: #f2f4f7; border: 1px solid #ccc; margin: 2px; } ' +
    'button.waze-btn.template:hover { background: #ffffff; transition: background-color 100ms linear; box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 0 100px 100px rgba(255, 255, 255, 0.3); } ' +
    'button.waze-btn.template:focus { background: #f2f4f7; } ' +
    'p.template-info { border-top: 1px solid #ccc; color: #777; font-size: x-small; margin-top: 15px; padding-top: 10px; text-align: center; }'

  WMEUI.addTranslation(NAME, TRANSLATION)
  WMEUI.addStyle(STYLE)

  const BUTTONS = {
    A: {
      title: I18n.t(NAME).buttons.A,
      description: I18n.t(NAME).buttons.A,
      shortcut: 'S+A',
    },
    B: {
      title: I18n.t(NAME).buttons.B,
      description: I18n.t(NAME).buttons.B,
      shortcut: 'S+B',
    },
    C: {
      title: I18n.t(NAME).buttons.C,
      description: I18n.t(NAME).buttons.C,
      shortcut: 'S+C',
    }
  }

  // Default settings
  const SETTINGS = {
    A: true,
    B: false,
    C: false,
  }

  class Template extends WMEBase {
    constructor (name, settings) {
      super(name, settings)
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

      /** @type {WMEUIHelperModal} */
      this.modal = this.helper.createModal(I18n.t(this.name).title)
      this.modal.addButtons(buttons)

      /** @type {WMEUIHelperTab} */
      this.tab = this.helper.createTab(
        I18n.t(this.name).title,
        {
          'icon': 'polygon'
        }
      )

      // Setup buttons set
      /** @type {WMEUIHelperFieldset} */
      let fieldsetForButtons = this.helper.createFieldset(I18n.t(NAME).buttons.title)
      fieldsetForButtons.addButtons(buttons)
      this.tab.addElement(fieldsetForButtons)

      // Setup custom text
      this.tab.addText(
        'description',
        ''
      )

      // Setup options for script
      let fieldset = this.helper.createFieldset(I18n.t(NAME).settings.title)
      let settings = this.settings.get()
      for (let item in settings) {
        if (settings.hasOwnProperty(item)) {
          fieldset.addCheckbox(
            'settings-' + item,
            I18n.t(NAME).settings[item],
            event => this.settings.set([item], event.target.checked),
            this.settings.get(item)
          )
        }
      }
      this.tab.addElement(fieldset)
      this.tab.addText(
        'info',
        '<a href="' + GM_info.scriptUpdateURL + '">' + GM_info.script.name + '</a> ' + GM_info.script.version
      )

      // Inject custom HTML to container in the WME interface
      this.tab.inject()
    }

    /**
     * Handler for `none.wme` event
     * @param {jQuery.Event} event
     * @return {void}
     */
    onNone (event) {
      this.log('No select')
      this.clearModal(event)
    }

    /**
     * Handler for `segment.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {W.model} model
     * @return {void}
     */
    onSegment (event, element, model) {
      this.log('Selected one segment')
      this.createModal(event, element, [model])
    }

    /**
     * Handler for `segments.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {Array} models
     * @return {void}
     */
    onSegments (event, element, models) {
      this.log('Selected some segments')
      this.createModal(event, element, models)
    }

    /**
     * Handler for `node.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {W.model} model
     * @return {void}
     */
    onNode (event, element, model) {
      this.log('Selected one node')
      this.createPanel(event, element, [model])
    }

    /**
     * Handler for `nodes.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {Array} models
     * @return {void}
     */
    onNodes (event, element, models) {
      this.log('Selected some nodes, doesn\'t work')
    }

    /**
     * Handler for `venue.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {W.model} model
     * @return {void}
     */
    onVenue (event, element, model) {
      this.log('Selected one venue')
      this.createPanel(event, element, [model])
    }

    /**
     * Handler for `venues.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {Array} models
     * @return {void}
     */
    onVenues (event, element, models) {
      this.log('Selected some venues')
      this.createPanel(event, element, models)
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
    }

    /**
     * Handler for `place.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {W.model} model
     * @return {void}
     */
    onPlace (event, element, model) {
      this.log('Selected a place')
    }

    /**
     * Handler for `residential.wme` event
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {W.model} model
     * @return {void}
     */
    onResidential (event, element, model) {
      this.log('Selected a residential')
    }

    /**
     * Create panel with buttons
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {Array} models
     */
    createPanel (event, element, models) {
      // Avoid duplicates
      // if (element.querySelector('div.form-group.template')) {
      //   return
      // }

      // Inject custom HTML to the current sidebar
      // It can be #node-edit-general or #segment-edit-general or #venue-edit-general or #mergeVenuesCollection
      element.prepend(this.panel.html())
    }

    /**
     * Create modal with buttons
     * @param {jQuery.Event} event
     * @param {HTMLElement} element
     * @param {Array} models
     */
    createModal (event, element, models) {
      // Inject custom HTML to container in the WME interface
      this.modal.inject()
    }

    /**
     * Close modal
     * @param {jQuery.Event} event
     */
    clearModal (event) {
      // Remove custom HTML
      this.modal.html().remove()
    }

    onButtonA () {
      this.log('Button A')
    }

    onButtonB () {
      this.log('Button B')
    }

    onButtonC () {
      this.log('Button C')
    }
  }

  $(document).on('bootstrap.wme', () => {
    let Instance = new Template(NAME, SETTINGS)

    BUTTONS.A.callback = () => Instance.onButtonA()
    BUTTONS.B.callback = () => Instance.onButtonB()
    BUTTONS.C.callback = () => Instance.onButtonC()

    Instance.init(BUTTONS)

    // create simple shortcut
    WMEUI.addShortcut('Example', 'Some description', NAME, 'Title example', 'S+Q', () => alert('It works!'))

    // rename shortcut section
    WMEUIShortcut.setGroupTitle(NAME, I18n.t(NAME).title + '⛔️')
  })

})()
