// ==UserScript==
// @name         WME Template
// @version      1.0.0
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
// ==/UserScript==

(function () {
    'use strict';

    /**
     * Object with a wrapper with getters and setters
     */
    class Container {
        constructor() {
            this.container = {};
        }
        set(...args) {
            let keys;
            let value;
            if (Array.isArray(args[0])) {
                // Old style: set(['options', 'theme'], 'dark')
                keys = args[0];
                value = args[1];
            }
            else {
                // New style: set('options', 'theme', 'dark')
                value = args.pop();
                keys = args;
            }
            let target = this.container;
            for (let i = 0; i < keys.length - 1; i++) {
                if (typeof target[keys[i]] === 'undefined')
                    target[keys[i]] = {};
                target = target[keys[i]];
            }
            target[keys[keys.length - 1]] = value;
        }
        get(...keys) {
            if (keys.length === 0)
                return this.container;
            let target = this.container;
            for (let i = 0; i < keys.length; i++) {
                if (typeof target[keys[i]] === 'undefined')
                    return null;
                target = target[keys[i]];
            }
            return target;
        }
        has(...keys) {
            let target = this.container;
            for (let i = 0; i < keys.length; i++) {
                if (typeof target[keys[i]] === 'undefined')
                    return false;
                target = target[keys[i]];
            }
            return true;
        }
    }

    class Tools {
        /**
         * Simple object check
         */
        static isObject(item) {
            return (item && typeof item === 'object' && !Array.isArray(item));
        }
        /**
         * Deep merge objects
         */
        static mergeDeep(target, ...sources) {
            if (!sources.length)
                return target;
            const source = sources.shift();
            if (Tools.isObject(target) && Tools.isObject(source)) {
                for (const key in source) {
                    if (!source.hasOwnProperty(key))
                        continue;
                    if (Tools.isObject(source[key])) {
                        if (!Tools.isObject(target[key]))
                            Object.assign(target, { [key]: {} });
                        Tools.mergeDeep(target[key], source[key]);
                    }
                    else {
                        Object.assign(target, { [key]: source[key] });
                    }
                }
            }
            return Tools.mergeDeep(target, ...sources);
        }
    }

    /**
     * Settings object with localStorage as storage
     */
    class Settings extends Container {
        constructor(uid, def = {}) {
            super();
            this.uid = uid;
            this.default = def;
            this.load();
        }
        load() {
            let settings = localStorage.getItem(this.uid);
            if (settings) {
                let parsed = JSON.parse(settings);
                this.container = Tools.mergeDeep({}, this.default, parsed);
            }
            else {
                this.container = Tools.mergeDeep({}, this.default);
            }
        }
        /**
         * With jQuery:
         *   $(window).on('beforeunload', () => SettingsInstance.save());
         */
        save() {
            localStorage.setItem(this.uid, JSON.stringify(this.container));
        }
    }

    // Expose as globals (consumed via @require by other scripts)
    Object.assign(window, { Container, Settings, Tools });

})();

(function () {
    'use strict';

    /**
     * A utility class for spherical geometry (geodesy).
     *
     * All coordinates use [longitude, latitude] order in degrees.
     * Distances are in meters unless noted otherwise.
     * Bearings are in degrees (0-360, clockwise from north).
     * Angular distances are in radians.
     *
     * @example
     * // Distance between Kyiv and London
     * GeoUtils.getDistance([30.52, 50.45], [-0.13, 51.51]) // ~2131 km
     *
     * // Bearing from Kyiv to London
     * GeoUtils.getBearing([30.52, 50.45], [-0.13, 51.51]) // ~289°
     */
    class GeoUtils {
        /**
         * Convert degrees to radians.
         * @param degrees - Angle in degrees
         * @returns Angle in radians
         */
        static _toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }
        /**
         * Convert radians to degrees.
         * @param radians - Angle in radians
         * @returns Angle in degrees
         */
        static _toDegrees(radians) {
            return radians * (180 / Math.PI);
        }
        /**
         * Normalize an angle to the range [-180, 180] degrees.
         * @param degrees - Angle in degrees (any range)
         * @returns Normalized angle in degrees
         */
        static _normalizeAngle(degrees) {
            return (degrees + 540) % 360 - 180;
        }
        /**
         * Calculate the initial bearing (forward azimuth) from point A to point B.
         *
         * @param pA - Start point [lon, lat]
         * @param pB - End point [lon, lat]
         * @returns Bearing in degrees (0-360, clockwise from north)
         *
         * @example
         * GeoUtils.getBearing([0, 0], [0, 1]) // 0 (due north)
         * GeoUtils.getBearing([0, 0], [1, 0]) // 90 (due east)
         */
        static getBearing(pA, pB) {
            const latA = GeoUtils._toRadians(pA[1]);
            const lonA = GeoUtils._toRadians(pA[0]);
            const latB = GeoUtils._toRadians(pB[1]);
            const lonB = GeoUtils._toRadians(pB[0]);
            const deltaLon = lonB - lonA;
            const y = Math.sin(deltaLon) * Math.cos(latB);
            const x = Math.cos(latA) * Math.sin(latB) -
                Math.sin(latA) * Math.cos(latB) * Math.cos(deltaLon);
            const bearingRad = Math.atan2(y, x);
            return (GeoUtils._toDegrees(bearingRad) + 360) % 360;
        }
        /**
         * Calculate the interior angle at vertex p2 formed by points p1-p2-p3.
         *
         * @param p1 - First point [lon, lat]
         * @param p2 - Vertex point [lon, lat]
         * @param p3 - Third point [lon, lat]
         * @returns Angle in degrees (0-180)
         *
         * @example
         * // Right angle
         * GeoUtils.findAngle([0, 0], [0, 1], [1, 1]) // ~90°
         *
         * // Straight line
         * GeoUtils.findAngle([0, 0], [0, 1], [0, 2]) // ~180°
         */
        static findAngle(p1, p2, p3) {
            const bearing21 = GeoUtils.getBearing(p2, p1);
            const bearing23 = GeoUtils.getBearing(p2, p3);
            let angle = Math.abs(bearing21 - bearing23);
            if (angle > 180) {
                angle = 360 - angle;
            }
            return angle;
        }
        /**
         * Calculate the distance between two points using the Haversine formula.
         *
         * @param pA - First point [lon, lat]
         * @param pB - Second point [lon, lat]
         * @returns Distance in meters
         *
         * @example
         * GeoUtils.getDistance([30.52, 50.45], [-0.13, 51.51]) // ~2131000 m
         */
        static getDistance(pA, pB) {
            return GeoUtils.getAngularDistance(pA, pB) * 6371000;
        }
        /**
         * Calculate the angular distance between two points using the Haversine formula.
         *
         * @param pA - First point [lon, lat]
         * @param pB - Second point [lon, lat]
         * @returns Angular distance in radians
         */
        static getAngularDistance(pA, pB) {
            const latA = GeoUtils._toRadians(pA[1]);
            const lonA = GeoUtils._toRadians(pA[0]);
            const latB = GeoUtils._toRadians(pB[1]);
            const lonB = GeoUtils._toRadians(pB[0]);
            const deltaLat = latB - latA;
            const deltaLon = lonB - lonA;
            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(latA) * Math.cos(latB) *
                    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
            return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        /**
         * Calculate the destination point given a start point, bearing, and angular distance.
         *
         * @param startPoint - Start point [lon, lat]
         * @param bearing - Bearing in degrees (0-360)
         * @param distanceRad - Angular distance in radians
         * @returns Destination point [lon, lat]
         *
         * @example
         * // Move 100km north from the equator
         * const dist = 100000 / 6371000; // convert meters to radians
         * GeoUtils.getDestination([0, 0], 0, dist) // [0, ~0.9]
         */
        static getDestination(startPoint, bearing, distanceRad) {
            const lat1 = GeoUtils._toRadians(startPoint[1]);
            const lon1 = GeoUtils._toRadians(startPoint[0]);
            const brng = GeoUtils._toRadians(bearing);
            const d = distanceRad;
            const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) +
                Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
            const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
            const lon2Deg = GeoUtils._toDegrees(lon2);
            const lat2Deg = GeoUtils._toDegrees(lat2);
            return [(lon2Deg + 540) % 360 - 180, lat2Deg];
        }
        /**
         * Find a point D on the great circle path A→B such that
         * the angle ADC equals the specified angle.
         *
         * Uses the Four-Part (Cotangent) Formula for spherical triangles.
         *
         * @param pA - Start of line [lon, lat]
         * @param pB - End of line [lon, lat]
         * @param pC - Third point [lon, lat]
         * @param angle - Desired angle at D in degrees (e.g., 90 for perpendicular)
         * @returns Coordinates of D [lon, lat], or null if no solution exists
         *
         * @example
         * // Find where line AB makes a 90° angle with point C
         * GeoUtils.findIntersection(A, B, C, 90)
         */
        static findIntersection(pA, pB, pC, angle) {
            // Guard: degenerate angle (0° or 180°) makes cot(D) undefined
            if (angle % 180 === 0) {
                return null;
            }
            const angleRad = GeoUtils._toRadians(angle);
            const bearingAB = GeoUtils.getBearing(pA, pB);
            const bearingAC = GeoUtils.getBearing(pA, pC);
            const angleA_rad = GeoUtils._toRadians(bearingAC - bearingAB);
            const distb_rad = GeoUtils.getAngularDistance(pA, pC);
            // Guard: pA and pC are the same point — cot(b) is undefined
            if (distb_rad < 1e-12) {
                return null;
            }
            const cot_b = 1.0 / Math.tan(distb_rad);
            const cot_D = 1.0 / Math.tan(angleRad);
            const X = cot_b;
            const Y = Math.cos(angleA_rad);
            const Z = Math.sin(angleA_rad) * cot_D;
            const R = Math.hypot(X, Y);
            const phi = Math.atan2(Y, X);
            const sin_c_minus_phi = Z / R;
            if (Math.abs(sin_c_minus_phi) > 1) {
                return null;
            }
            const distAD_rad = phi + Math.asin(sin_c_minus_phi);
            return GeoUtils.getDestination(pA, bearingAB, distAD_rad);
        }
        /**
         * Find the perpendicular foot from point C onto the great circle
         * defined by points A and B. The resulting point D forms a right
         * angle (90°) at vertex D in triangle ADC.
         *
         * Uses Napier's Rules for right spherical triangles.
         *
         * @param pA - First point of the line [lon, lat]
         * @param pB - Second point of the line [lon, lat] (defines the angle at A)
         * @param pC - Point to project [lon, lat]
         * @returns Coordinates of D [lon, lat] — the perpendicular foot
         *
         * @example
         * // Project point C onto line AB
         * const foot = GeoUtils.findRightAngleIntersection(A, B, C)
         * GeoUtils.findAngle(A, foot, C) // ~90°
         */
        static findRightAngleIntersection(pA, pB, pC) {
            const angleA_deg = GeoUtils.findAngle(pB, pA, pC);
            const angleA_rad = GeoUtils._toRadians(angleA_deg);
            const distAC_rad = GeoUtils.getAngularDistance(pA, pC);
            const tan_c = Math.cos(angleA_rad) * Math.tan(distAC_rad);
            const distAD_rad = Math.abs(Math.atan(tan_c));
            const bearingAC_deg = GeoUtils.getBearing(pA, pC);
            const bearingAB_deg = GeoUtils.getBearing(pA, pB);
            const angleCAB_raw_diff = GeoUtils._normalizeAngle(bearingAC_deg - bearingAB_deg);
            let bearingAD_deg;
            if (angleCAB_raw_diff >= 0) {
                bearingAD_deg = GeoUtils._normalizeAngle(bearingAC_deg - angleA_deg);
            }
            else {
                bearingAD_deg = GeoUtils._normalizeAngle(bearingAC_deg + angleA_deg);
            }
            return GeoUtils.getDestination(pA, bearingAD_deg, distAD_rad);
        }
    }

    Object.assign(window, { GeoUtils });

})();

(function () {
    'use strict';

    const SELECTORS = {
        city: 'div.city-feature-editor',
        comment: 'div.map-comment-feature-editor',
        hazard: 'div.permanent-hazard-feature-editor',
        node: 'div.connections-edit',
        junction: '#big-junction-edit-general',
        restricted: 'div.restricted-driving-area',
        segment: '#segment-edit-general',
        venue: '#venue-edit-general'};
    const FETCHERS = {
        city: (sdk, id) => sdk.DataModel.Cities.getById({ cityId: id }),
        mapComment: (sdk, id) => sdk.DataModel.MapComments.getById({ mapCommentId: id }),
        bigJunction: (sdk, id) => sdk.DataModel.BigJunctions.getById({ bigJunctionId: id }),
        node: (sdk, id) => sdk.DataModel.Nodes.getById({ nodeId: id }),
        segment: (sdk, id) => sdk.DataModel.Segments.getById({ segmentId: id }),
        venue: (sdk, id) => sdk.DataModel.Venues.getById({ venueId: id }),
        permanentHazard: (sdk, id) => sdk.DataModel.PermanentHazards.getCameraById({ cameraId: id }),
        restrictedDrivingArea: (sdk, id) => sdk.DataModel.RestrictedDrivingAreas.getById({ restrictedDrivingAreaId: id }),
    };
    class Bootstrap {
        /**
         * Bootstrap it once!
         */
        constructor() {
            const sandbox = typeof unsafeWindow !== 'undefined';
            const pageWindow = sandbox ? unsafeWindow : window;
            if (!pageWindow.WMEBootstrapReady) {
                pageWindow.WMEBootstrapReady = true;
                document.addEventListener('wme-ready', () => this.init(), { once: true });
            }
        }
        /**
         * Initial events and handlers
         */
        init() {
            try {
                // fire `bootstrap.wme` event
                jQuery(document).trigger('bootstrap.wme');
                // setup additional handlers
                this.setup();
                // listen to all events
                jQuery(document)
                    .on('junction.wme', (_event, _element, model) => this.log('🔀 junction.wme: ' + model.id))
                    .on('camera.wme', (_event, _element, model) => this.log('📸 camera.wme: ' + model.id))
                    .on('city.wme', (_event, _element, model) => this.log('🏬 city.wme: ' + model.id))
                    .on('comment.wme', (_event, _element, model) => this.log('💬 comment.wme: ' + model.id))
                    .on('segment.wme', (_event, _element, model) => this.log('🛣️ segment.wme: ' + model.id))
                    .on('segments.wme', (_event, _element, models) => this.log('🛣️ segments.wme: ' + models.length + ' elements'))
                    .on('node.wme', (_event, _element, model) => this.log('⭐️ node.wme: ' + model.id))
                    .on('nodes.wme', (_event, _element, models) => this.log('🌟 nodes.wme: ' + models.length + ' elements'))
                    .on('venue.wme', (_event, _element, model) => this.log('🏠 venue.wme: ' + model.id))
                    .on('venues.wme', (_event, _element, models) => this.log('🏘️ venues.wme: ' + models.length + ' elements'))
                    .on('point.wme', () => this.log('📍 point.wme'))
                    .on('place.wme', () => this.log('📌 place.wme'))
                    .on('residential.wme', () => this.log('🏡 residential.wme'));
            }
            catch (e) {
                console.error(e);
            }
        }
        /**
         * Setup handlers for WME SDK events
         */
        setup() {
            this.wmeSDK = getWmeSdk({
                scriptId: 'wme-bootstrap',
                scriptName: 'WME Bootstrap',
            });
            this.wmeSDK.Events.on({
                eventName: 'wme-feature-editor-opened',
                eventHandler: ({ featureType }) => this.eventHandler(featureType),
            });
            this.wmeSDK.Events.on({
                eventName: 'wme-selection-changed',
                eventHandler: () => {
                    if (!this.wmeSDK.Editing.getSelection()) {
                        jQuery(document).trigger('none.wme');
                    }
                },
            });
        }
        /**
         * Handler for selected features
         */
        eventHandler(featureType) {
            const fetcher = FETCHERS[featureType];
            if (!fetcher) {
                return;
            }
            const selection = this.wmeSDK.Editing.getSelection();
            if (!selection || !selection.ids || !selection.ids.length) {
                return;
            }
            const models = selection.ids.map((id) => fetcher(this.wmeSDK, id));
            if (!models.length) {
                return;
            }
            const isSingle = models.length === 1;
            const model = models[0];
            if (featureType === 'city') {
                this.eventTrigger('city.wme', SELECTORS.city, model);
            }
            else if (featureType === 'mapComment') {
                this.eventTrigger('comment.wme', SELECTORS.comment, model);
            }
            else if (featureType === 'bigJunction') {
                this.eventTrigger('junction.wme', SELECTORS.junction, model);
            }
            else if (featureType === 'node' && isSingle) {
                this.eventTrigger('node.wme', SELECTORS.node, model);
            }
            else if (featureType === 'node') {
                this.eventTrigger('nodes.wme', SELECTORS.node, models);
            }
            else if (featureType === 'permanentHazard') {
                this.eventTrigger('camera.wme', SELECTORS.hazard, model);
            }
            else if (featureType === 'restrictedDrivingArea') {
                this.eventTrigger('restricted.wme', SELECTORS.restricted, models);
            }
            else if (featureType === 'segment' && isSingle) {
                this.eventTrigger('segment.wme', SELECTORS.segment, model);
            }
            else if (featureType === 'segment') {
                this.eventTrigger('segments.wme', SELECTORS.segment, models);
            }
            else if (featureType === 'venue' && isSingle) {
                this.eventTrigger('venue.wme', SELECTORS.venue, model);
                if (model.isResidential) {
                    this.eventTrigger('residential.wme', SELECTORS.venue, model);
                }
                else if (model.geometry.type === 'Point') {
                    this.eventTrigger('point.wme', SELECTORS.venue, model);
                }
                else {
                    this.eventTrigger('place.wme', SELECTORS.venue, model);
                }
            }
            else if (featureType === 'venue') {
                this.eventTrigger('venues.wme', SELECTORS.venue, models);
            }
        }
        /**
         * Trigger jQuery event on the document with a DOM element and model(s)
         */
        eventTrigger(eventType, selector, models) {
            jQuery(document).trigger(eventType, [document.querySelector(selector), models]);
        }
        /**
         * Log message with a Bootstrap prefix
         */
        log(message) {
            console.log('%cBootstrap:%c ' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal');
        }
    }

    new Bootstrap();

})();

(function () {
    'use strict';

    class WMEBase {
        constructor(name, settings = null) {
            this._helper = null;
            this.id = name.toLowerCase().replace(/\s+/g, '-');
            this.name = name;
            this.wmeSDK = getWmeSdk({
                scriptId: this.id,
                scriptName: this.name,
            });
            if (settings && settings instanceof Settings) {
                this.settings = settings;
            }
            else if (settings) {
                this.settings = new Settings(name, settings);
            }
            else {
                this.settings = new Settings(name, {});
            }
            jQuery(document)
                .on('none.wme', (e) => this.onNone(e))
                .on('segment.wme', (e, el, t) => this.onSegment(e, el, t))
                .on('segments.wme', (e, el, t) => this.onSegments(e, el, t))
                .on('node.wme', (e, el, t) => this.onNode(e, el, t))
                .on('nodes.wme', (e, el, t) => this.onNodes(e, el, t))
                .on('venue.wme', (e, el, t) => this.onVenue(e, el, t))
                .on('venues.wme', (e, el, t) => this.onVenues(e, el, t))
                .on('point.wme', (e, el, t) => this.onPoint(e, el, t))
                .on('place.wme', (e, el, t) => this.onPlace(e, el, t))
                .on('residential.wme', (e, el, t) => this.onResidential(e, el, t));
            jQuery(window).on('beforeunload', (e) => this.onBeforeUnload(e));
        }
        // --- WMEUIHelper (lazy) ---
        get helper() {
            if (!this._helper) {
                this._helper = new WMEUIHelper(this.name);
            }
            return this._helper;
        }
        // --- Logging ---
        log(message, ...args) {
            console.log('%c' + this.name + ': %c' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal', ...args);
        }
        warn(message, ...args) {
            console.warn('%c' + this.name + ': %c' + message, 'color: #DAA520; font-weight: bold', 'color: dimgray; font-weight: normal', ...args);
        }
        error(message, ...args) {
            console.error('%c' + this.name + ': %c' + message, 'color: #FF4444; font-weight: bold', 'color: dimgray; font-weight: normal', ...args);
        }
        group(message, ...args) {
            console.groupCollapsed('%c' + this.name + ': %c' + message, 'color: #0DAD8D; font-weight: bold', 'color: dimgray; font-weight: normal', ...args);
        }
        groupEnd() {
            console.groupEnd();
        }
        // --- Shortcuts ---
        createShortcut(id, description, keys, callback) {
            const shortcutId = this.id + '-' + id;
            let effective;
            if (this.settings && this.settings.has('shortcuts', shortcutId)) {
                // getAllShortcuts() returns numeric format "mod,keyCode" (e.g. "4,56");
                // createShortcut() requires combo format "A+8". Convert on read-back.
                effective = this.normalizeShortcutKeys(this.settings.get('shortcuts', shortcutId));
            }
            else {
                effective = keys;
            }
            // The SDK requires the prior registration to be removed before
            // re-creating with the same id. isShortcutRegistered is unreliable,
            // so try delete unconditionally and swallow the "not found" error.
            try {
                this.wmeSDK.Shortcuts.deleteShortcut({ shortcutId });
            }
            catch (e) {
                // expected on first load
            }
            const shortcut = {
                callback: callback,
                description: description,
                shortcutId: shortcutId,
                shortcutKeys: effective,
            };
            if (effective && this.wmeSDK.Shortcuts.areShortcutKeysInUse({ shortcutKeys: effective })) {
                this.warn('Shortcut "' + effective + '" already in use');
                shortcut.shortcutKeys = null;
            }
            this.wmeSDK.Shortcuts.createShortcut(shortcut);
        }
        // Convert WME's stored numeric format ("4,56" = Alt+8) to the combo
        // format createShortcut expects ("A+8"). Pass through combo strings and
        // null unchanged.
        normalizeShortcutKeys(keys) {
            if (keys == null)
                return null;
            const str = String(keys);
            if (!/^\d+,-?\d+$/.test(str))
                return str;
            const [modStr, codeStr] = str.split(',');
            const mod = parseInt(modStr, 10);
            const code = parseInt(codeStr, 10);
            if (isNaN(mod) || isNaN(code) || code < 0)
                return null;
            let mods = '';
            if (mod & 4)
                mods += 'A';
            if (mod & 1)
                mods += 'C';
            if (mod & 2)
                mods += 'S';
            let char;
            if (code >= 48 && code <= 57)
                char = String.fromCharCode(code);
            else if (code >= 65 && code <= 90)
                char = String.fromCharCode(code).toLowerCase();
            else
                char = String(code);
            return mods ? mods + '+' + char : char;
        }
        // --- Event handlers ---
        onBeforeUnload(event) {
            if (!this.settings)
                return;
            try {
                const prefix = this.id + '-';
                const all = this.wmeSDK.Shortcuts.getAllShortcuts() || [];
                for (const sc of all) {
                    if (!sc.shortcutId || !sc.shortcutId.startsWith(prefix))
                        continue;
                    this.settings.set(['shortcuts', sc.shortcutId], sc.shortcutKeys);
                }
            }
            catch (e) {
                this.warn('Failed to persist shortcuts', e);
            }
            this.settings.save();
        }
        onNone(event) { }
        onSegment(event, element, model) { }
        onSegments(event, element, models) { }
        onNode(event, element, model) { }
        onNodes(event, element, models) { }
        onVenue(event, element, model) { }
        onVenues(event, element, models) { }
        onPlace(event, element, model) { }
        onPoint(event, element, model) { }
        onResidential(event, element, model) { }
        // --- Permissions ---
        canEditSegment(model) {
            return this.wmeSDK.DataModel.Segments.isRoadTypeDrivable({ roadType: model.roadType })
                && this.wmeSDK.DataModel.Segments.hasPermissions({ segmentId: model.id });
        }
        canEditVenue(model) {
            return this.wmeSDK.DataModel.Venues.hasPermissions({ venueId: model.id });
        }
        // --- Selection ---
        getSelection() {
            return this.wmeSDK.Editing.getSelection() || null;
        }
        // --- Venues ---
        getAllVenues(except = []) {
            const venues = this.wmeSDK.DataModel.Venues.getAll();
            const rank = this.wmeSDK.State.getUserInfo().rank;
            return venues
                .filter((venue) => venue.lockRank <= rank)
                .filter((venue) => !except.length || except.indexOf(venue.categories[0]) === -1);
        }
        getSelectedVenue() {
            return this.getSelectedVenues()?.[0] ?? null;
        }
        getSelectedVenues() {
            const selection = this.getSelection();
            if (!selection || selection.objectType !== 'venue') {
                return [];
            }
            return selection.ids.map((id) => this.wmeSDK.DataModel.Venues.getById({ venueId: id }));
        }
        getSelectedVenueAddress() {
            const venue = this.getSelectedVenue();
            if (!venue)
                return null;
            return this.wmeSDK.DataModel.Venues.getAddress({ venueId: venue.id });
        }
        // --- Segments ---
        getAllSegments(except = []) {
            const segments = this.wmeSDK.DataModel.Segments.getAll();
            const rank = this.wmeSDK.State.getUserInfo().rank;
            return segments
                .filter((segment) => segment.lockRank <= rank)
                .filter((segment) => !except.length || except.indexOf(segment.roadType) === -1);
        }
        getSelectedSegment() {
            return this.getSelectedSegments()?.[0] ?? null;
        }
        getSelectedSegments() {
            const selection = this.getSelection();
            if (!selection || selection.objectType !== 'segment') {
                return [];
            }
            return selection.ids.map((id) => this.wmeSDK.DataModel.Segments.getById({ segmentId: id }));
        }
        getSelectedSegmentAddress() {
            const segment = this.getSelectedSegment();
            if (!segment)
                return null;
            return this.wmeSDK.DataModel.Segments.getAddress({ segmentId: segment.id });
        }
        // --- Nodes ---
        getAllNodes(except = []) {
            const nodes = this.wmeSDK.DataModel.Nodes.getAll();
            if (!except.length)
                return nodes;
            return nodes.filter((node) => except.indexOf(node.id) === -1);
        }
        getSelectedNode() {
            return this.getSelectedNodes()?.[0] ?? null;
        }
        getSelectedNodes() {
            const selection = this.getSelection();
            if (!selection || selection.objectType !== 'node') {
                return [];
            }
            return selection.ids.map((id) => this.wmeSDK.DataModel.Nodes.getById({ nodeId: id }));
        }
    }

    Object.assign(window, { WMEBase });

})();

(function () {
    'use strict';

    let unsafePolicy = { createHTML: (string) => string };
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        unsafePolicy = window.trustedTypes.createPolicy('unsafe', {
            createHTML: (string) => string,
        });
    }

    class WMEUI {
        /**
         * Get or create a WME SDK instance (lazy)
         */
        static get sdk() {
            if (!this._sdk) {
                this._sdk = getWmeSdk({ scriptId: 'wme-ui', scriptName: 'WME UI' });
            }
            return this._sdk;
        }
        /**
         * Get current locale code from WME SDK
         * Falls back to I18n or 'en' if SDK is not yet available
         */
        static getLocale() {
            if (!this._locale) {
                try {
                    this._locale = this.sdk.Settings.getLocale().localeCode;
                }
                catch (e) {
                    // SDK is not available yet (called before bootstrap)
                    this._locale = 'en';
                }
            }
            return this._locale;
        }
        /**
         * Normalize title or UID
         */
        static normalize(string) {
            return string.replace(/\W+/gi, '-').toLowerCase();
        }
        /**
         * Inject CSS styles
         */
        static addStyle(css) {
            const style = document.createElement('style');
            style.innerHTML = unsafePolicy.createHTML(css);
            document.querySelector('head').appendChild(style);
        }
        /**
         * Register translations for a script
         */
        static addTranslation(uid, data) {
            if (!data.en) {
                console.error('Default translation `en` is required');
                return;
            }
            // Store internally
            this._translations[uid] = data;
        }
        /**
         * Get translation by script name
         * Falls back to English if current locale not available
         */
        static t(uid) {
            const locale = this.getLocale();
            return this._translations[uid]?.[locale]
                || this._translations[uid]?.['en']
                || {};
        }
    }
    WMEUI._translations = {};
    WMEUI._locale = null;
    WMEUI._sdk = null;

    class WMEUIHelperElement {
        constructor(uid, id, title = null, attributes = {}) {
            this.uid = uid;
            this.id = id;
            this.title = title;
            this.attributes = attributes;
            this.element = null;
            this.elements = [];
        }
        /**
         * Add WMEUIHelperElement to the container
         * If already rendered, appends the new child to the live DOM
         */
        addElement(element) {
            this.elements.push(element);
            if (this.element) {
                const container = this.getChildContainer();
                if (container) {
                    container.append(element.html());
                }
            }
            return element;
        }
        /**
         * Remove this element from the DOM and reset its state
         */
        remove() {
            if (this.element) {
                this.element.remove();
                this.element = null;
            }
        }
        /**
         * Remove WMEUIHelperElement from the container
         */
        removeElement(element) {
            const index = this.elements.indexOf(element);
            if (index !== -1) {
                this.elements.splice(index, 1);
                element.html().remove();
            }
        }
        /**
         * Find the child container element in the rendered DOM
         */
        getChildContainer() {
            if (!this.element)
                return null;
            return this.element.querySelector('.wme-ui-modal-content')
                || this.element.querySelector('.wme-ui-panel-content')
                || this.element.querySelector('.wme-ui-tab-content')
                || this.element.querySelector('.wme-ui-fieldset-content')
                || this.element;
        }
        /**
         * Apply attributes to the HTML element
         */
        applyAttributes(element) {
            for (const [attr, value] of Object.entries(this.attributes)) {
                if (attr === 'className' && element.className) {
                    element.className += ' ' + value;
                }
                else {
                    element[attr] = value;
                }
            }
            return element;
        }
        /**
         * Get or build HTML element
         */
        html() {
            if (!this.element) {
                this.element = this.toHTML();
                this.element.className += ' ' + this.uid + ' ' + this.uid + '-' + this.id;
            }
            return this.element;
        }
        /**
         * Build and return HTML elements for injection
         */
        toHTML() {
            throw new Error('Abstract method');
        }
    }

    /**
     * Base class for controls
     */
    class WMEUIHelperControl extends WMEUIHelperElement {
        constructor(uid, id, title, attributes = {}) {
            super(uid, id, title, attributes);
            if (!attributes.name) {
                this.attributes.name = this.id;
            }
        }
    }
    /**
     * Input with label inside the div
     */
    class WMEUIHelperControlInput extends WMEUIHelperControl {
        toHTML() {
            let input = document.createElement('input');
            input.className = 'wme-ui-controls-input';
            input = this.applyAttributes(input);
            let label = document.createElement('label');
            label.className = 'wme-ui-controls-label';
            label.htmlFor = input.id || this.uid + '-' + this.id;
            label.innerHTML = unsafePolicy.createHTML(this.title);
            let container = document.createElement('div');
            container.className = 'wme-ui-controls-container controls-container';
            container.append(input);
            container.append(label);
            // Add <output> element for range inputs to display current value
            if (this.attributes.type === 'range') {
                let output = document.createElement('output');
                output.className = 'wme-ui-controls-output';
                output.htmlFor.add(input.id || this.uid + '-' + this.id);
                output.value = String(input.value);
                const userCallback = input.onchange;
                input.onchange = null;
                input.oninput = function (e) {
                    output.value = e.target.value;
                    if (userCallback)
                        userCallback.call(input, e);
                };
                container.append(output);
            }
            return container;
        }
    }
    /**
     * Button with a shortcut if needed
     */
    class WMEUIHelperControlButton extends WMEUIHelperControl {
        constructor(uid, id, title, description, callback, attributes = {}) {
            super(uid, id, title, attributes);
            this.description = description;
            this.callback = callback;
        }
        toHTML() {
            let button = document.createElement('button');
            button.className = 'wme-ui-controls-button waze-btn waze-btn-small waze-btn-white';
            button.innerHTML = unsafePolicy.createHTML(this.title);
            button.title = this.description;
            button.onclick = this.callback;
            this.applyAttributes(button);
            return button;
        }
    }

    class WMEUIHelperDiv extends WMEUIHelperElement {
        toHTML() {
            let div = document.createElement('div');
            div.className = 'wme-ui-helper-div';
            div.id = this.uid + '-' + this.id;
            div = this.applyAttributes(div);
            if (this.title) {
                div.innerHTML = unsafePolicy.createHTML(this.title);
            }
            return div;
        }
    }

    class WMEUIHelperText extends WMEUIHelperElement {
        toHTML() {
            let p = document.createElement('p');
            p.className = 'wme-ui-helper-text';
            p = this.applyAttributes(p);
            p.innerHTML = unsafePolicy.createHTML(this.title);
            return p;
        }
        /**
         * Update text content after rendering
         */
        setText(text) {
            this.title = text;
            if (this.element) {
                this.element.innerHTML = unsafePolicy.createHTML(text);
            }
        }
    }

    class WMEUIHelperContainer extends WMEUIHelperElement {
        /**
         * Create and add WMEUIHelperControlButton element
         */
        addButton(id, title, description, callback, attributes = {}) {
            return this.addElement(new WMEUIHelperControlButton(this.uid, id, title, description, callback, attributes));
        }
        /**
         * Create buttons
         */
        addButtons(buttons) {
            for (let key in buttons) {
                if (buttons.hasOwnProperty(key)) {
                    this.addButton(key, buttons[key].title, buttons[key].description, buttons[key].callback);
                }
            }
        }
        /**
         * Create checkboxes from an object
         * Each key becomes a checkbox with title, callback, and checked state
         */
        addCheckboxes(checkboxes) {
            for (const key in checkboxes) {
                if (checkboxes.hasOwnProperty(key)) {
                    this.addCheckbox(key, checkboxes[key].title, checkboxes[key].callback, checkboxes[key].checked || false);
                }
            }
        }
        /**
         * Create and add WMEUIHelperControlInput element
         */
        addCheckbox(id, title, callback, checked = false) {
            return this.addElement(new WMEUIHelperControlInput(this.uid, id, title, {
                'id': this.uid + '-' + id,
                'onclick': callback,
                'type': 'checkbox',
                'value': '1',
                'checked': checked,
            }));
        }
        /**
         * Create and add WMEUIHelperDiv element
         */
        addDiv(id, innerHTML = null, attributes = {}) {
            return this.addElement(new WMEUIHelperDiv(this.uid, id, innerHTML, attributes));
        }
        /**
         * Create and add WMEUIHelperFieldset element
         */
        addFieldset(id, title, attributes = {}) {
            return this.addElement(new WMEUIHelperContainer._fieldsetClass(this.uid, id, title, attributes));
        }
        /**
         * Create text input
         */
        addInput(id, title, callback, value = '') {
            return this.addElement(new WMEUIHelperControlInput(this.uid, id, title, {
                'id': this.uid + '-' + id,
                'onchange': callback,
                'type': 'text',
                'value': value,
            }));
        }
        /**
         * Create number input
         */
        addNumber(id, title, callback, value = 0, min, max, step = 10) {
            return this.addElement(new WMEUIHelperControlInput(this.uid, id, title, {
                'id': this.uid + '-' + id,
                'onchange': callback,
                'type': 'number',
                'value': value,
                'min': min,
                'max': max,
                'step': step,
            }));
        }
        /**
         * Create radiobutton
         */
        addRadio(id, title, callback, name, value, checked = false) {
            return this.addElement(new WMEUIHelperControlInput(this.uid, id, title, {
                'id': this.uid + '-' + id,
                'name': name,
                'onclick': callback,
                'type': 'radio',
                'value': value,
                'checked': checked,
            }));
        }
        /**
         * Create range input
         */
        addRange(id, title, callback, value, min, max, step = 10) {
            return this.addElement(new WMEUIHelperControlInput(this.uid, id, title, {
                'id': this.uid + '-' + id,
                'onchange': callback,
                'type': 'range',
                'value': value,
                'min': min,
                'max': max,
                'step': step,
            }));
        }
        /**
         * Create and add WMEUIHelperText element
         */
        addText(id, text) {
            return this.addElement(new WMEUIHelperText(this.uid, id, text));
        }
    }

    var css_248z$3 = ".wme-ui-panel {\n  /* panel */\n}\n\n.wme-ui-panel-label {\n  /* panel title label */\n}\n\n.wme-ui-panel-content {\n  padding: 8px;\n}\n\n.wme-ui-panel-content .wme-ui-controls-button {\n  margin: 2px;\n}\n\n.wme-ui-controls-button:hover {\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 0 100px 100px rgba(255, 255, 255, 0.3);\n  transition: box-shadow 100ms linear;\n}\n";

    function injectPanelStyles() {
        if (!document.querySelector('style[data-wme-ui-panel]')) {
            const style = document.createElement('style');
            style.setAttribute('data-wme-ui-panel', '');
            style.innerHTML = unsafePolicy.createHTML(css_248z$3);
            document.head.appendChild(style);
        }
    }
    class WMEUIHelperPanel extends WMEUIHelperContainer {
        container() {
            return document.getElementById('edit-panel');
        }
        inject() {
            this.container()?.append(this.html());
        }
        toHTML() {
            injectPanelStyles();
            let label = document.createElement('wz-label');
            label.className = 'wme-ui-panel-label';
            label.innerHTML = unsafePolicy.createHTML(this.title);
            let content = document.createElement('div');
            content.className = 'wme-ui-panel-content';
            this.elements.forEach(element => content.append(element.html()));
            let panel = document.createElement('div');
            panel.className = 'wme-ui-panel form-group';
            panel.append(label);
            panel.append(content);
            return panel;
        }
    }

    var css_248z$2 = ".wme-ui-tab {\n  /* tab root container */\n}\n\n.wme-ui-tab-header {\n  align-items: center;\n  display: flex;\n  gap: 9px;\n  justify-content: stretch;\n  padding: 8px;\n  width: 100%;\n  border-bottom: 1px solid #e5e5e5;\n}\n\n.wme-ui-tab-header .wme-ui-tab-icon {\n  font-size: 24px;\n}\n\n.wme-ui-tab-header .wme-ui-tab-image {\n  height: 42px;\n}\n\n.wme-ui-tab-title {\n  /* tab title container */\n}\n\n.wme-ui-tab-content {\n  padding: 8px;\n}\n\n/* Common footer styles for script tabs */\n.wme-ui-tab-content p[class$=\"-info\"] {\n  border-top: 1px solid #ccc;\n  color: #777;\n  font-size: x-small;\n  margin-top: 15px;\n  padding-top: 10px;\n  text-align: center;\n}\n\n#sidebar .wme-ui-tab-content p[class$=\"-blue\"] {\n  background-color: #0057B8;\n  color: white;\n  height: 32px;\n  text-align: center;\n  line-height: 32px;\n  font-size: 24px;\n  margin: 0;\n}\n\n#sidebar .wme-ui-tab-content p[class$=\"-yellow\"] {\n  background-color: #FFDD00;\n  color: black;\n  height: 32px;\n  text-align: center;\n  line-height: 32px;\n  font-size: 24px;\n  margin: 0;\n}\n";

    function injectTabStyles() {
        if (!document.querySelector('style[data-wme-ui-tab]')) {
            const style = document.createElement('style');
            style.setAttribute('data-wme-ui-tab', '');
            style.innerHTML = unsafePolicy.createHTML(css_248z$2);
            document.head.appendChild(style);
        }
    }
    class WMEUIHelperTab extends WMEUIHelperContainer {
        constructor(uid, id, title, attributes = {}) {
            super(uid, id, title, attributes);
            this.sidebar = attributes.sidebar;
            this.icon = attributes.icon;
            this.image = attributes.image;
        }
        async inject() {
            const { tabLabel, tabPane } = await this.sidebar.registerScriptTab(this.uid);
            tabLabel.innerText = this.title;
            tabLabel.title = this.title;
            tabPane.append(this.html());
        }
        toHTML() {
            injectTabStyles();
            let header = document.createElement('div');
            header.className = 'wme-ui-tab-header panel-header-component settings-header';
            if (this.icon) {
                let icon = document.createElement('i');
                icon.className = 'wme-ui-tab-icon w-icon panel-header-component-icon w-icon-' + this.icon;
                header.append(icon);
            }
            if (this.image) {
                let img = document.createElement('img');
                img.className = 'wme-ui-tab-image';
                img.src = this.image;
                header.append(img);
            }
            let title = document.createElement('div');
            title.className = 'wme-ui-tab-title feature-id-container';
            title.innerHTML = unsafePolicy.createHTML('<wz-overline>' + this.title + '</wz-overline>');
            header.append(title);
            let content = document.createElement('div');
            content.className = 'wme-ui-tab-content';
            this.elements.forEach(element => content.append(element.html()));
            let tab = document.createElement('div');
            tab.className = 'wme-ui-tab form-group';
            tab.append(header);
            tab.append(content);
            return tab;
        }
    }

    var css_248z$1 = ".wme-ui-modal {\n  width: 320px;\n  background: #fff;\n  margin: 15px;\n  border-radius: 5px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);\n}\n\n.wme-ui-modal-container {\n  position: relative;\n}\n\n.wme-ui-modal-header {\n  position: relative;\n}\n\n.wme-ui-modal-header h5 {\n  padding: 12px 12px 0;\n  font-size: 18px;\n}\n\n.wme-ui-modal-close {\n  background: #fff;\n  border: 1px solid #ececec;\n  border-radius: 100%;\n  cursor: pointer;\n  font-size: 20px;\n  height: 20px;\n  line-height: 16px;\n  position: absolute;\n  right: 12px;\n  text-indent: -2px;\n  top: 12px;\n  transition: all 150ms;\n  width: 20px;\n  z-index: 99;\n}\n\n.wme-ui-modal-close:hover {\n  background: #f0f0f0;\n  border-color: #ccc;\n}\n\n.wme-ui-modal-close:focus-visible {\n  outline: 2px solid #4a90d9;\n  outline-offset: 2px;\n}\n\n.wme-ui-modal-content {\n  max-height: 70vh;\n  overflow: auto;\n}\n\n.wme-ui-modal-footer {\n  padding: 4px 0;\n}\n";

    function injectModalStyles() {
        if (!document.querySelector('style[data-wme-ui-modal]')) {
            const style = document.createElement('style');
            style.setAttribute('data-wme-ui-modal', '');
            style.innerHTML = unsafePolicy.createHTML(css_248z$1);
            document.head.appendChild(style);
        }
    }
    class WMEUIHelperModal extends WMEUIHelperContainer {
        container() {
            return document.getElementById('tippy-container');
        }
        inject() {
            this.container()?.append(this.html());
        }
        toHTML() {
            injectModalStyles();
            let modal = document.createElement('div');
            modal.className = 'wme-ui-modal';
            this.applyAttributes(modal);
            let close = document.createElement('button');
            close.className = 'wme-ui-modal-close';
            close.innerText = '\u00d7';
            close.onclick = function () {
                modal.remove();
            };
            let title = document.createElement('h5');
            title.innerHTML = unsafePolicy.createHTML(this.title);
            let header = document.createElement('div');
            header.className = 'wme-ui-modal-header';
            header.prepend(title);
            header.prepend(close);
            let content = document.createElement('div');
            content.className = 'wme-ui-modal-content';
            this.elements.forEach(element => content.append(element.html()));
            let footer = document.createElement('div');
            footer.className = 'wme-ui-modal-footer';
            let container = document.createElement('div');
            container.className = 'wme-ui-modal-container';
            container.append(header);
            container.append(content);
            container.append(footer);
            modal.append(container);
            return modal;
        }
    }

    var css_248z = ".wme-ui-fieldset {\n    margin: 4px 0;\n    width: 100%;\n}\n\n.wme-ui-fieldset-legend {\n    cursor: pointer;\n    font-size: 12px;\n    font-weight: bold;\n    width: 100%;\n    text-align: right;\n    margin: 0;\n    padding: 2px 8px;\n    background-color: #f6f7f7;\n\n    border-radius: 8px 8px 0 0;\n    border: 1px solid #e5e5e5;\n}\n\n.wme-ui-fieldset-legend::after {\n    content: \"\\25B6\";\n    font-size: 8px;\n    display: inline-block;\n    margin-left: 4px;\n    transition: transform 0.35s ease-in-out;\n    transform: rotate(90deg);\n}\n\n.wme-ui-fieldset.collapsed .wme-ui-fieldset-legend::after {\n    transform: rotate(0deg);\n}\n\n.wme-ui-fieldset-content {\n    border: 1px solid #ddd;\n    border-top: 0;\n    border-radius: 0 0 8px 8px;\n    padding: 8px;\n}\n\n.wme-ui-fieldset-content p {\n    margin-bottom: 2px;\n}\n\n.wme-ui-fieldset-content label {\n    white-space: normal;\n    font-weight: normal;\n    font-size: 13px;\n    max-width: 80%;\n}\n\n.wme-ui-fieldset-content input[type=\"text\"] {\n    float: right;\n    height: 28px;\n}\n\n.wme-ui-fieldset-content input[type=\"number\"] {\n    float: right;\n    height: 28px;\n    width: 60px;\n    text-align: right;\n}\n\n.wme-ui-fieldset-content input[type=\"range\"] {\n    width: 100%;\n}\n\n.wme-ui-controls-button:focus-visible,\n.wme-ui-controls-input:focus-visible,\n.wme-ui-fieldset-legend:focus-visible {\n    outline: 2px solid #4a90d9;\n    outline-offset: 2px;\n}\n\n.wme-ui-controls-output {\n    float: right;\n    font-size: 13px;\n    min-width: 30px;\n    text-align: right;\n    padding: 2px;\n}\n\n.wme-ui-fieldset.collapsed .wme-ui-fieldset-legend {\n    border-radius: 8px;\n    transition: background-color 0.2s ease;\n}\n\n.wme-ui-fieldset.collapsed .wme-ui-fieldset-legend:hover {\n    background-color: #edeef0;\n}\n\n.wme-ui-fieldset.collapsed .wme-ui-fieldset-content {\n    display: none;\n}\n";

    function injectFieldsetStyles() {
        if (!document.querySelector('style[data-wme-ui-fieldset]')) {
            const style = document.createElement('style');
            style.setAttribute('data-wme-ui-fieldset', '');
            style.innerHTML = unsafePolicy.createHTML(css_248z);
            document.head.appendChild(style);
        }
    }
    class WMEUIHelperFieldset extends WMEUIHelperContainer {
        toHTML() {
            injectFieldsetStyles();
            let legend = document.createElement('legend');
            legend.className = 'wme-ui-fieldset-legend';
            legend.innerHTML = unsafePolicy.createHTML(this.title);
            legend.onclick = () => {
                fieldset.classList.toggle('collapsed');
                return false;
            };
            let content = document.createElement('div');
            content.className = 'wme-ui-fieldset-content';
            this.elements.forEach(element => content.append(element.html()));
            let fieldset = document.createElement('fieldset');
            fieldset.className = 'wme-ui-fieldset';
            fieldset = this.applyAttributes(fieldset);
            fieldset.append(legend);
            fieldset.append(content);
            return fieldset;
        }
    }
    // Register with container to break circular dependency
    WMEUIHelperContainer._fieldsetClass = WMEUIHelperFieldset;

    class WMEUIHelper {
        constructor(uid) {
            this.uid = WMEUI.normalize(uid);
            this.index = 0;
        }
        /**
         * Generate unique ID
         */
        generateId() {
            this.index++;
            return this.uid + '-' + this.index;
        }
        /**
         * Create a panel for the sidebar
         */
        createPanel(title, attributes = {}) {
            return new WMEUIHelperPanel(this.uid, this.generateId(), title, attributes);
        }
        /**
         * Create a tab for the sidebar
         */
        createTab(title, attributes = {}) {
            return new WMEUIHelperTab(this.uid, this.generateId(), title, attributes);
        }
        /**
         * Create a modal window
         */
        createModal(title, attributes = {}) {
            return new WMEUIHelperModal(this.uid, this.generateId(), title, attributes);
        }
        /**
         * Create a field set
         */
        createFieldset(title, attributes = {}) {
            return new WMEUIHelperFieldset(this.uid, this.generateId(), title, attributes);
        }
    }

    Object.assign(window, {
        WMEUI, WMEUIHelper,
        WMEUIHelperElement, WMEUIHelperContainer,
        WMEUIHelperFieldset, WMEUIHelperPanel, WMEUIHelperTab, WMEUIHelperModal,
        WMEUIHelperDiv, WMEUIHelperText,
        WMEUIHelperControl, WMEUIHelperControlInput, WMEUIHelperControlButton,
    });

})();

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
            inputs: {
                title: 'Inputs',
                searchQuery: 'Search query',
                opacity: 'Opacity',
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
            inputs: {
                title: 'Введення',
                searchQuery: 'Пошуковий запит',
                opacity: 'Прозорість',
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
            inputs: {
                title: 'Ввод',
                searchQuery: 'Поисковый запрос',
                opacity: 'Прозрачность',
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
        searchQuery: '',
        opacity: 50,
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
            // Text input and range
            const fsInputs = this.helper.createFieldset(WMEUI.t(NAME).inputs.title);
            fsInputs.addInput('searchQuery', WMEUI.t(NAME).inputs.searchQuery, (event) => this.settings.set('searchQuery', event.target.value), this.settings.get('searchQuery'));
            fsInputs.addRange('opacity', WMEUI.t(NAME).inputs.opacity, (event) => this.settings.set('opacity', Number(event.target.value)), this.settings.get('opacity'), 0, 100, 10);
            this.tab.addElement(fsInputs);
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
                // --- Modal example: show venue details in a modal window ---
                const modal = this.helper.createModal(WMEUI.t(NAME).title);
                modal.addText('venue-name', 'Name: <strong>' + (model.name || 'No name') + '</strong>');
                modal.addText('venue-id', 'ID: ' + model.id);
                modal.addText('venue-categories', 'Categories: ' + (model.categories.join(', ') || 'none'));
                modal.addButton('close', 'Close', 'Close modal', () => {
                    modal.remove();
                });
                modal.inject();
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

    var css_248z = "button.waze-btn.template {\n  background: #f2f4f7;\n  border: 1px solid #ccc;\n  margin: 2px;\n}\n\nbutton.waze-btn.template:hover {\n  background: #ffffff;\n  transition: background-color 100ms linear;\n  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 0 100px 100px rgba(255, 255, 255, 0.3);\n}\n\nbutton.waze-btn.template:focus {\n  background: #f2f4f7;\n}\n\n.wme-ui-modal-content p.wme-ui-helper-text {\n  padding: 8px;\n}\n\np.template-info {\n  border-top: 1px solid #ccc;\n  color: #777;\n  font-size: x-small;\n  margin-top: 15px;\n  padding-top: 10px;\n  text-align: center;\n}\n#sidebar p.template-blue {\n  background-color: #0057B8;\n  color: white;\n  height: 32px;\n  text-align: center;\n  line-height: 32px;\n  font-size: 24px;\n  margin: 0;\n}\n\n#sidebar p.template-yellow {\n  background-color: #FFDD00;\n  color: black;\n  height: 32px;\n  text-align: center;\n  line-height: 32px;\n  font-size: 24px;\n  margin: 0;\n}\n";

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
