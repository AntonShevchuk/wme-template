import { NAME } from './translations'
import type { Segment, Venue } from 'wme-sdk-typings'

export class Template extends WMEBase {
  panel: WMEUIHelperPanel
  modal: WMEUIHelperModal
  tab: WMEUIHelperTab

  constructor (name: string, settings: any) {
    super(name, settings)
  }

  /**
   * Initial UI elements
   */
  init (buttons: Record<string, any>) {
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
        this.createShortcut(n, buttons[n].description, buttons[n].shortcut, buttons[n].callback)
      }
    }

    this.tab.addElement(fieldsetForButtons)

    // Setup custom text
    this.tab.addText('description', '')

    // Setup options for the script
    let fieldset = this.helper.createFieldset(I18n.t(NAME).settings.title)
    let settings = this.settings.get()
    let checkboxes: Record<string, any> = {}
    for (let item in settings) {
      if (settings.hasOwnProperty(item)) {
        checkboxes['settings-' + item] = {
          title: I18n.t(NAME).settings[item],
          callback: (event: any) => this.settings.set([item], event.target.checked),
          checked: this.settings.get(item),
        }
      }
    }
    fieldset.addCheckboxes(checkboxes)
    this.tab.addElement(fieldset)
    this.tab.addText(
      'info',
      '<a href="' + GM_info.scriptUpdateURL + '">' + GM_info.script.name + '</a> ' + GM_info.script.version
    )

    // Inject custom HTML to container in the WME interface
    this.tab.inject()
  }

  onNone (event: JQuery.Event) {
    this.log('No select')
    this.clearModal()
  }

  onSegment (event: JQuery.Event, element: HTMLElement, model: Segment) {
    this.log('Selected one segment')
    this.createModal()
  }

  onSegments (event: JQuery.Event, element: HTMLElement, models: Segment[]) {
    this.log('Selected some segments')
    this.createModal()
  }

  onNode (event: JQuery.Event, element: HTMLElement, model: WMENode) {
    this.log('Selected one node')
    this.createPanel(element)
  }

  onNodes (event: JQuery.Event, element: HTMLElement, models: WMENode[]) {
    this.log('Selected some nodes')
  }

  onVenue (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Selected one venue')
    this.createPanel(element)
  }

  onVenues (event: JQuery.Event, element: HTMLElement, models: Venue[]) {
    this.log('Selected some venues')
    this.createPanel(element)
  }

  onPoint (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Selected a point')
  }

  onPlace (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Selected a place')
  }

  onResidential (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Selected a residential')
  }

  /**
   * Show panel with buttons in the sidebar
   */
  createPanel (element: HTMLElement) {
    element.prepend(this.panel.html())
  }

  /**
   * Show modal with buttons
   */
  createModal () {
    this.modal.inject()
  }

  /**
   * Close modal
   */
  clearModal () {
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
