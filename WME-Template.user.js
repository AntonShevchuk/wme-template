// ==UserScript==
// @name         WME Template
// @version      0.5.0
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
// @require      https://update.greasyfork.org/scripts/389765/1785927/CommonUtils.js
// @require      https://update.greasyfork.org/scripts/450160/1785943/WME-Bootstrap.js
// @require      https://update.greasyfork.org/scripts/450221/1785960/WME-Base.js
// @require      https://update.greasyfork.org/scripts/450320/1785964/WME-UI.js
// ==/UserScript==

(function () {
    'use strict';

    // Script name, uses as unique index
    const NAME = 'Template';
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
    };
    // Default settings
    const SETTINGS = {
        A: true,
        B: false,
        C: false,
    };

    function getButtons() {
        return {
            A: {
                title: I18n.t(NAME).buttons.A,
                description: I18n.t(NAME).buttons.A,
                shortcut: 'S+1',
            },
            B: {
                title: I18n.t(NAME).buttons.B,
                description: I18n.t(NAME).buttons.B,
                shortcut: 'S+2',
            },
            C: {
                title: I18n.t(NAME).buttons.C,
                description: I18n.t(NAME).buttons.C,
                shortcut: 'S+3',
            }
        };
    }

    class Template extends WMEBase {
        constructor(name, settings) {
            super(name, settings);
        }
        /**
         * Initial UI elements
         */
        init(buttons) {
            this.panel = this.helper.createPanel(I18n.t(this.name).title);
            this.panel.addButtons(buttons);
            this.modal = this.helper.createModal(I18n.t(this.name).title);
            this.modal.addButtons(buttons);
            this.tab = this.helper.createTab(I18n.t(this.name).title, {
                'sidebar': this.wmeSDK.Sidebar,
                'icon': 'polygon'
            });
            // Setup buttons set
            let fieldsetForButtons = this.helper.createFieldset(I18n.t(NAME).buttons.title);
            fieldsetForButtons.addButtons(buttons);
            for (let n in buttons) {
                if (buttons[n].shortcut) {
                    this.createShortcut(n, buttons[n].description, buttons[n].shortcut, buttons[n].callback);
                }
            }
            this.tab.addElement(fieldsetForButtons);
            // Setup custom text
            this.tab.addText('description', '');
            // Setup options for the script
            let fieldset = this.helper.createFieldset(I18n.t(NAME).settings.title);
            let settings = this.settings.get();
            let checkboxes = {};
            for (let item in settings) {
                if (settings.hasOwnProperty(item)) {
                    checkboxes['settings-' + item] = {
                        title: I18n.t(NAME).settings[item],
                        callback: (event) => this.settings.set([item], event.target.checked),
                        checked: this.settings.get(item),
                    };
                }
            }
            fieldset.addCheckboxes(checkboxes);
            this.tab.addElement(fieldset);
            this.tab.addText('info', '<a href="' + GM_info.scriptUpdateURL + '">' + GM_info.script.name + '</a> ' + GM_info.script.version);
            // Inject custom HTML to container in the WME interface
            this.tab.inject();
        }
        onNone(event) {
            this.log('No select');
            this.clearModal();
        }
        onSegment(event, element, model) {
            this.log('Selected one segment');
            this.createModal();
        }
        onSegments(event, element, models) {
            this.log('Selected some segments');
            this.createModal();
        }
        onNode(event, element, model) {
            this.log('Selected one node');
            this.createPanel(element);
        }
        onNodes(event, element, models) {
            this.log('Selected some nodes');
        }
        onVenue(event, element, model) {
            this.log('Selected one venue');
            this.createPanel(element);
        }
        onVenues(event, element, models) {
            this.log('Selected some venues');
            this.createPanel(element);
        }
        onPoint(event, element, model) {
            this.log('Selected a point');
        }
        onPlace(event, element, model) {
            this.log('Selected a place');
        }
        onResidential(event, element, model) {
            this.log('Selected a residential');
        }
        /**
         * Show panel with buttons in the sidebar
         */
        createPanel(element) {
            element.prepend(this.panel.html());
        }
        /**
         * Show modal with buttons
         */
        createModal() {
            this.modal.inject();
        }
        /**
         * Close modal
         */
        clearModal() {
            this.modal.html().remove();
        }
        onButtonA() {
            this.log('Button A');
        }
        onButtonB() {
            this.log('Button B');
        }
        onButtonC() {
            this.log('Button C');
        }
    }

    var css_248z = "button.waze-btn.template {\n  background: #f2f4f7;\n  border: 1px solid #ccc;\n  margin: 2px;\n}\n\nbutton.waze-btn.template:hover {\n  background: #ffffff;\n  transition: background-color 100ms linear;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 0 100px 100px rgba(255, 255, 255, 0.3);\n}\n\nbutton.waze-btn.template:focus {\n  background: #f2f4f7;\n}\n\np.template-info {\n  border-top: 1px solid #ccc;\n  color: #777;\n  font-size: x-small;\n  margin-top: 15px;\n  padding-top: 10px;\n  text-align: center;\n}\n";

    WMEUI.addTranslation(NAME, TRANSLATION);
    WMEUI.addStyle(css_248z);
    function logger(_event, element, model) {
        console.log('HTMLElement', element);
        console.log('DataModel', model);
    }
    $(document)
        .on('bootstrap.wme', () => {
        let Instance = new Template(NAME, SETTINGS);
        let buttons = getButtons();
        buttons.A.callback = () => Instance.onButtonA();
        buttons.B.callback = () => Instance.onButtonB();
        buttons.C.callback = () => Instance.onButtonC();
        Instance.init(buttons);
        let shortcut = {
            callback: () => alert('It works!'),
            description: "Some description",
            shortcutId: "wme-template-shortcut",
            shortcutKeys: "S+Q",
        };
        Instance.wmeSDK.Shortcuts.createShortcut(shortcut);
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
        .on('residential.wme', logger);

})();
