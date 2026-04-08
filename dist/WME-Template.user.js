// ==UserScript==
// @name         WME Template
// @version      0.6.0
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
// @require      https://update.greasyfork.org/scripts/389765/1793258/CommonUtils.js
// @require      https://update.greasyfork.org/scripts/571719/1793257/GeoUtils.js
// @require      https://update.greasyfork.org/scripts/450160/1792042/WME-Bootstrap.js
// @require      https://update.greasyfork.org/scripts/450221/1793261/WME-Base.js
// @require      https://update.greasyfork.org/scripts/450320/1793251/WME-UI.js
// ==/UserScript==

(function () {
    'use strict';

    /**
     * Script name — used as a unique identifier for translations, settings, and shortcuts
     */
    const NAME = 'Template';
    /**
     * Translations — English is required, other languages are optional
     * Access via WMEUI.t(NAME).key
     */
    const TRANSLATION = {
        'en': {
            title: 'WME Template',
            description: 'A comprehensive template for WME userscripts',
            help: 'Use <strong>keyboard shortcuts</strong> or buttons to apply actions',
            buttons: {
                title: 'Actions',
                simplify: 'Simplify',
                straighten: 'Straighten',
                info: 'Info',
            },
            settings: {
                title: 'Settings',
                autoSave: 'Auto-save changes',
                showNotifications: 'Show notifications',
                debugMode: 'Debug mode',
            },
            ranges: {
                title: 'Parameters',
                tolerance: 'Tolerance',
                radius: 'Search radius (m)',
            },
            layers: {
                title: 'Layers',
                highlights: 'Highlight segments',
            },
        },
        'uk': {
            title: 'WME Шаблон',
            description: 'Комплексний шаблон для скриптів WME',
            help: 'Використовуйте <strong>гарячі клавіші</strong> або кнопки для застосування дій',
            buttons: {
                title: 'Дії',
                simplify: 'Спростити',
                straighten: 'Вирівняти',
                info: 'Інфо',
            },
            settings: {
                title: 'Налаштування',
                autoSave: 'Автозбереження змін',
                showNotifications: 'Показувати сповіщення',
                debugMode: 'Режим налагодження',
            },
            ranges: {
                title: 'Параметри',
                tolerance: 'Допуск',
                radius: 'Радіус пошуку (м)',
            },
            layers: {
                title: 'Шари',
                highlights: 'Підсвітка сегментів',
            },
        },
        'ru': {
            title: 'WME Шаблон',
            description: 'Комплексный шаблон для скриптов WME',
            help: 'Используйте <strong>комбинации клавиш</strong> или кнопки для применения действий',
            buttons: {
                title: 'Действия',
                simplify: 'Упростить',
                straighten: 'Выровнять',
                info: 'Инфо',
            },
            settings: {
                title: 'Настройки',
                autoSave: 'Автосохранение изменений',
                showNotifications: 'Показывать уведомления',
                debugMode: 'Режим отладки',
            },
            ranges: {
                title: 'Параметры',
                tolerance: 'Допуск',
                radius: 'Радиус поиска (м)',
            },
            layers: {
                title: 'Слои',
                highlights: 'Подсветка сегментов',
            },
        },
    };

    /**
     * Default settings — persisted to localStorage via Settings class
     */
    const SETTINGS = {
        autoSave: true,
        showNotifications: false,
        debugMode: false,
        tolerance: 5,
        radius: 200,
    };

    /**
     * Button definitions — deferred via function to ensure WMEUI.t()
     * is called after translations are registered
     */
    function getButtons() {
        return {
            A: {
                title: WMEUI.t(NAME).buttons.simplify,
                description: WMEUI.t(NAME).buttons.simplify,
                shortcut: 'S+1',
                callback: null
            },
            B: {
                title: WMEUI.t(NAME).buttons.straighten,
                description: WMEUI.t(NAME).buttons.straighten,
                shortcut: 'S+2',
                callback: null
            },
            C: {
                title: WMEUI.t(NAME).buttons.info,
                description: WMEUI.t(NAME).buttons.info,
                shortcut: null,
                callback: null
            },
        };
    }

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
    class Template extends WMEBase {
        constructor(name, settings) {
            super(name, settings);
        }
        /**
         * Initialize UI — called after bootstrap when translations are ready
         */
        init(buttons) {
            // --- Panel (injected into sidebar on selection) ---
            this.panel = this.helper.createPanel(WMEUI.t(NAME).title);
            this.panel.addButtons(buttons);
            // --- Modal (floating overlay) ---
            this.modal = this.helper.createModal(WMEUI.t(NAME).title);
            this.modal.addButtons(buttons);
            // --- Tab (dedicated sidebar tab) ---
            this.tab = this.helper.createTab(WMEUI.t(NAME).title, {
                sidebar: this.wmeSDK.Sidebar,
                icon: 'polygon',
            });
            // Description
            this.tab.addText('description', WMEUI.t(NAME).description);
            this.tab.addDiv('help', WMEUI.t(NAME).help);
            // Buttons fieldset with shortcuts
            const fsButtons = this.helper.createFieldset(WMEUI.t(NAME).buttons.title);
            fsButtons.addButtons(buttons);
            for (const key in buttons) {
                if (buttons[key].shortcut) {
                    this.createShortcut(key, buttons[key].description, buttons[key].shortcut, buttons[key].callback);
                }
            }
            this.tab.addElement(fsButtons);
            // Settings checkboxes (batch)
            const fsSettings = this.helper.createFieldset(WMEUI.t(NAME).settings.title);
            fsSettings.addCheckboxes({
                autoSave: {
                    title: WMEUI.t(NAME).settings.autoSave,
                    callback: (event) => this.settings.set('autoSave', event.target.checked),
                    checked: this.settings.get('autoSave'),
                },
                showNotifications: {
                    title: WMEUI.t(NAME).settings.showNotifications,
                    callback: (event) => this.settings.set('showNotifications', event.target.checked),
                    checked: this.settings.get('showNotifications'),
                },
                debugMode: {
                    title: WMEUI.t(NAME).settings.debugMode,
                    callback: (event) => this.settings.set('debugMode', event.target.checked),
                    checked: this.settings.get('debugMode'),
                },
            });
            this.tab.addElement(fsSettings);
            // Numeric parameters
            const fsRanges = this.helper.createFieldset(WMEUI.t(NAME).ranges.title);
            fsRanges.addNumber('tolerance', WMEUI.t(NAME).ranges.tolerance, (event) => this.settings.set('tolerance', Number(event.target.value)), this.settings.get('tolerance'), 1, 50, 1);
            fsRanges.addNumber('radius', WMEUI.t(NAME).ranges.radius, (event) => this.settings.set('radius', Number(event.target.value)), this.settings.get('radius'), 50, 1000, 50);
            this.tab.addElement(fsRanges);
            // Dynamic status text (can be updated with setText)
            this.statusText = this.tab.addText('status', 'Ready');
            // Script info footer
            this.tab.addText('info', '<a href="' + GM_info.scriptUpdateURL + '">' + GM_info.script.name + '</a> ' + GM_info.script.version);
            this.tab.addText('blue', 'made in');
            this.tab.addText('yellow', 'Ukraine');
            this.tab.inject();
        }
        // --- Event Handlers ---
        onNone(event) {
            this.log('Selection cleared');
            this.statusText.setText('Ready');
        }
        onSegment(event, element, model) {
            this.log('Segment ' + model.id + ' selected');
            this.statusText.setText('Segment: ' + model.id);
            if (this.canEditSegment(model)) {
                element.prepend(this.panel.html());
            }
        }
        onSegments(event, element, models) {
            this.log(models.length + ' segments selected');
            this.statusText.setText('Segments: ' + models.length);
            const editable = models.filter(m => this.canEditSegment(m));
            if (editable.length > 0) {
                element.prepend(this.panel.html());
            }
        }
        onNode(event, element, model) {
            this.log('Node ' + model.id + ' selected (' + model.connectedSegmentIds.length + ' segments)');
            this.statusText.setText('Node: ' + model.id);
        }
        onNodes(event, element, models) {
            this.log(models.length + ' nodes selected');
        }
        onVenue(event, element, model) {
            this.log('Venue "' + model.name + '" selected');
            this.statusText.setText('Venue: ' + model.name);
            if (this.canEditVenue(model)) {
                element.prepend(this.panel.html());
            }
        }
        onVenues(event, element, models) {
            this.log(models.length + ' venues selected');
            this.statusText.setText('Venues: ' + models.length);
        }
        onPoint(event, element, model) {
            this.log('Point venue: ' + model.name);
        }
        onPlace(event, element, model) {
            this.log('Place venue: ' + model.name);
        }
        onResidential(event, element, model) {
            this.log('Residential: ' + model.name);
        }
        // --- Button Callbacks ---
        onSimplify() {
            this.group('Simplify');
            const segments = this.getSelectedSegments();
            this.log('Processing ' + segments.length + ' segment(s)');
            this.log('Tolerance: ' + this.settings.get('tolerance'));
            // ... your simplification logic here
            this.groupEnd();
        }
        onStraighten() {
            this.group('Straighten');
            const segments = this.getSelectedSegments();
            this.log('Processing ' + segments.length + ' segment(s)');
            // ... your straightening logic here
            this.groupEnd();
        }
        onInfo() {
            const selection = this.getSelection();
            if (!selection) {
                this.warn('Nothing selected');
                return;
            }
            this.group('Info');
            this.log('Type: ' + selection.objectType);
            this.log('IDs: ' + selection.ids.join(', '));
            this.log('Locale: ' + WMEUI.getLocale());
            this.log('Debug: ' + this.settings.get('debugMode'));
            this.groupEnd();
        }
    }

    var css_248z = "button.waze-btn.template {\n  background: #f2f4f7;\n  border: 1px solid #ccc;\n  margin: 2px;\n}\n\nbutton.waze-btn.template:hover {\n  background: #ffffff;\n  transition: background-color 100ms linear;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 0 100px 100px rgba(255, 255, 255, 0.3);\n}\n\nbutton.waze-btn.template:focus {\n  background: #f2f4f7;\n}\n\np.template-info {\n  border-top: 1px solid #ccc;\n  color: #777;\n  font-size: x-small;\n  margin-top: 15px;\n  padding-top: 10px;\n  text-align: center;\n}\n";

    $(document).on('bootstrap.wme', () => {
        // Register translations and styles
        WMEUI.addTranslation(NAME, TRANSLATION);
        WMEUI.addStyle(css_248z);
        // Create instance with settings (auto-persisted to localStorage)
        const instance = new Template(NAME, SETTINGS);
        // Get buttons with deferred translations
        const buttons = getButtons();
        // Wire button callbacks to instance methods
        buttons.A.callback = () => instance.onSimplify();
        buttons.B.callback = () => instance.onStraighten();
        buttons.C.callback = () => instance.onInfo();
        // Initialize UI (tab, panel, modal, shortcuts)
        instance.init(buttons);
    });

})();
