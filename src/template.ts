import { NAME } from './translations'

export class Template extends WMEBase {
  helper: any
  panel: WMEUIHelperPanel
  modal: WMEUIHelperModal
  tab: WMEUIHelperTab

  constructor (name, settings) {
    super(name, settings)
  }

  /**
   * Initial UI elements
   * @param {Object} buttons
   */
  init (buttons) {
    this.helper = new WMEUIHelper(this.name)

    this.panel = this.helper.createPanel(I18n.t(this.name).title)
    this.panel.addButtons(buttons)

    this.modal = this.helper.createModal(I18n.t(this.name).title)
    this.modal.addButtons(buttons)

    this.tab = this.helper.createTab(
      I18n.t(this.name).title,
      {
        'sidebar': this.wmeSDK.Sidebar,
        'icon': 'polygon'
      }
    )

    // Setup buttons set
    let fieldsetForButtons = this.helper.createFieldset(I18n.t(NAME).buttons.title)
    fieldsetForButtons.addButtons(buttons)

    for (let n in buttons) {
      if (buttons[n].shortcut) {
        let shortcut = {
          callback: buttons[n].callback,
          description: buttons[n].description,
          shortcutId: this.id + '-' + n,
          shortcutKeys: buttons[n].shortcut,
        };

        if (this.wmeSDK.Shortcuts.areShortcutKeysInUse({ shortcutKeys: buttons[n].shortcut })) {
          this.log('Shortcut already in use')
          shortcut.shortcutKeys = null
        }
        this.wmeSDK.Shortcuts.createShortcut(shortcut);
      }
    }

    this.tab.addElement(fieldsetForButtons)

    // Setup custom text
    this.tab.addText(
      'description',
      ''
    )

    // Setup options for the script
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
   * @param {Segment} model
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
   * @param {Segment[]} models
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
   * @param {Node$1} model
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
   * @param {Node$1[]} models
   * @return {void}
   */
  onNodes (event, element, models) {
    this.log('Selected some nodes, doesn\'t work')
  }

  /**
   * Handler for `venue.wme` event
   * @param {jQuery.Event} event
   * @param {HTMLElement} element
   * @param {Venue} model
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
   * @param {Venue[]} models
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
   * @param {Venue} model
   * @return {void}
   */
  onPoint (event, element, model) {
    this.log('Selected a point')
  }

  /**
   * Handler for `place.wme` event
   * @param {jQuery.Event} event
   * @param {HTMLElement} element
   * @param {Venue} model
   * @return {void}
   */
  onPlace (event, element, model) {
    this.log('Selected a place')
  }

  /**
   * Handler for `residential.wme` event
   * @param {jQuery.Event} event
   * @param {HTMLElement} element
   * @param {Venue} model
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
