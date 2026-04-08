import { NAME } from './name'
import type { Segment, Venue } from 'wme-sdk-typings'

/**
 * Template script — demonstrates all WME library features:
 *
 * WMEBase:  helper, createShortcut, canEditSegment/canEditVenue, event handlers,
 *           log/warn/error, getSelectedSegments/Venues, getAllSegments/Venues
 * WME-UI:  WMEUI.t(), createTab, createPanel, createModal, createFieldset,
 *           addButton, addButtons, addCheckboxes, addNumber, addText, addDiv,
 *           setText, removeElement, inject
 * CommonUtils: Settings (get/set/save), Tools.mergeDeep
 */
export class Template extends WMEBase {
  panel: WMEUIHelperPanel
  modal: WMEUIHelperModal
  tab: WMEUIHelperTab
  statusText: any

  constructor (name: string, settings: any) {
    super(name, settings)
  }

  /**
   * Initialize UI — called after bootstrap when translations are ready
   */
  init (buttons: Record<string, any>) {
    // --- Panel (injected into sidebar on selection) ---
    this.panel = this.helper.createPanel(WMEUI.t(NAME).title)
    this.panel.addButtons(buttons)

    // --- Modal (floating overlay) ---
    this.modal = this.helper.createModal(WMEUI.t(NAME).title)
    this.modal.addButtons(buttons)

    // --- Tab (dedicated sidebar tab) ---
    this.tab = this.helper.createTab(WMEUI.t(NAME).title, {
      sidebar: this.wmeSDK.Sidebar,
      icon: 'polygon',
    })

    // Description
    this.tab.addText('description', WMEUI.t(NAME).description)
    this.tab.addDiv('help', WMEUI.t(NAME).help)

    // Buttons fieldset with shortcuts
    const fsButtons = this.helper.createFieldset(WMEUI.t(NAME).buttons.title)
    fsButtons.addButtons(buttons)
    for (const key in buttons) {
      if (buttons[key].shortcut) {
        this.createShortcut(key, buttons[key].description, buttons[key].shortcut, buttons[key].callback)
      }
    }
    this.tab.addElement(fsButtons)

    // Settings checkboxes (batch)
    const fsSettings = this.helper.createFieldset(WMEUI.t(NAME).settings.title)
    fsSettings.addCheckboxes({
      autoSave: {
        title: WMEUI.t(NAME).settings.autoSave,
        callback: (event: any) => this.settings.set('autoSave', event.target.checked),
        checked: this.settings.get('autoSave'),
      },
      showNotifications: {
        title: WMEUI.t(NAME).settings.showNotifications,
        callback: (event: any) => this.settings.set('showNotifications', event.target.checked),
        checked: this.settings.get('showNotifications'),
      },
      debugMode: {
        title: WMEUI.t(NAME).settings.debugMode,
        callback: (event: any) => this.settings.set('debugMode', event.target.checked),
        checked: this.settings.get('debugMode'),
      },
    })
    this.tab.addElement(fsSettings)

    // Numeric parameters
    const fsRanges = this.helper.createFieldset(WMEUI.t(NAME).ranges.title)
    fsRanges.addNumber(
      'tolerance',
      WMEUI.t(NAME).ranges.tolerance,
      (event: any) => this.settings.set('tolerance', Number(event.target.value)),
      this.settings.get('tolerance'),
      1, 50, 1
    )
    fsRanges.addNumber(
      'radius',
      WMEUI.t(NAME).ranges.radius,
      (event: any) => this.settings.set('radius', Number(event.target.value)),
      this.settings.get('radius'),
      50, 1000, 50
    )
    this.tab.addElement(fsRanges)

    // Text input and range
    const fsInputs = this.helper.createFieldset(WMEUI.t(NAME).inputs.title)
    fsInputs.addInput(
      'searchQuery',
      WMEUI.t(NAME).inputs.searchQuery,
      (event: any) => this.settings.set('searchQuery', event.target.value),
      this.settings.get('searchQuery')
    )
    fsInputs.addRange(
      'opacity',
      WMEUI.t(NAME).inputs.opacity,
      (event: any) => this.settings.set('opacity', Number(event.target.value)),
      this.settings.get('opacity'),
      0, 100, 10
    )
    this.tab.addElement(fsInputs)

    // Dynamic status text (can be updated with setText)
    this.statusText = this.tab.addText('status', 'Ready')

    // Script info footer
    this.tab.addText(
      'info',
      '<a href="' + GM_info.scriptUpdateURL + '">' + GM_info.script.name + '</a> ' + GM_info.script.version
    )
    this.tab.addText('blue', 'made in')
    this.tab.addText('yellow', 'Ukraine')

    this.tab.inject()
  }

  // --- Event Handlers ---

  onNone (event: JQuery.Event) {
    this.log('Selection cleared')
    this.statusText.setText('Ready')
  }

  onSegment (event: JQuery.Event, element: HTMLElement, model: Segment) {
    this.log('Segment ' + model.id + ' selected')
    this.statusText.setText('Segment: ' + model.id)

    if (this.canEditSegment(model)) {
      element.prepend(this.panel.html())
    }
  }

  onSegments (event: JQuery.Event, element: HTMLElement, models: Segment[]) {
    this.log(models.length + ' segments selected')
    this.statusText.setText('Segments: ' + models.length)

    const editable = models.filter(m => this.canEditSegment(m))
    if (editable.length > 0) {
      element.prepend(this.panel.html())
    }
  }

  onNode (event: JQuery.Event, element: HTMLElement, model: WMENode) {
    this.log('Node ' + model.id + ' selected (' + model.connectedSegmentIds.length + ' segments)')
    this.statusText.setText('Node: ' + model.id)
  }

  onNodes (event: JQuery.Event, element: HTMLElement, models: WMENode[]) {
    this.log(models.length + ' nodes selected')
  }

  onVenue (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Venue "' + model.name + '" selected')
    this.statusText.setText('Venue: ' + model.name)

    if (this.canEditVenue(model)) {
      element.prepend(this.panel.html())

      // --- Modal example: show venue details in a modal window ---
      const modal = this.helper.createModal(WMEUI.t(NAME).title)
      modal.addText('venue-name', 'Name: <strong>' + (model.name || 'No name') + '</strong>')
      modal.addText('venue-id', 'ID: ' + model.id)
      modal.addText('venue-categories', 'Categories: ' + (model.categories.join(', ') || 'none'))
      modal.addButton('close', 'Close', 'Close modal', () => {
        modal.remove()
      })
      modal.inject()
    }
  }

  onVenues (event: JQuery.Event, element: HTMLElement, models: Venue[]) {
    this.log(models.length + ' venues selected')
    this.statusText.setText('Venues: ' + models.length)
  }

  onPoint (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Point venue: ' + model.name)
  }

  onPlace (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Place venue: ' + model.name)
  }

  onResidential (event: JQuery.Event, element: HTMLElement, model: Venue) {
    this.log('Residential: ' + model.name)
  }

  // --- Button Callbacks ---

  onSimplify () {
    this.group('Simplify')
    const segments = this.getSelectedSegments()
    this.log('Processing ' + segments.length + ' segment(s)')
    this.log('Tolerance: ' + this.settings.get('tolerance'))
    // ... your simplification logic here
    this.groupEnd()
  }

  onStraighten () {
    this.group('Straighten')
    const segments = this.getSelectedSegments()
    this.log('Processing ' + segments.length + ' segment(s)')
    // ... your straightening logic here
    this.groupEnd()
  }

  onInfo () {
    const selection = this.getSelection()
    if (!selection) {
      this.warn('Nothing selected')
      return
    }

    this.group('Info')
    this.log('Type: ' + selection.objectType)
    this.log('IDs: ' + selection.ids.join(', '))
    this.log('Locale: ' + WMEUI.getLocale())
    this.log('Debug: ' + this.settings.get('debugMode'))
    this.groupEnd()
  }
}
