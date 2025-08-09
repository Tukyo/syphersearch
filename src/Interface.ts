/* 
════════════╗
| INTERFACE
════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Manages all interface elements for the application.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { playSound } from "./Audio";
import { CHARACTERS, DEBUG, RANDOM_MODE, SEARCH_PREFS } from "./Config";
import { Interface, UIConfig } from "./Defs";
import { InterfaceInitEvents, ProgressEvents, ValidResultEvents } from "./Events";
import { INTERFACE } from "./InterfaceConfig";
import { cancelSearch, search, state } from "./Main";
import { sanitize, tooltip } from "./Utils";
import { dict, Dictionary } from "./dict/Dictionary";

// #region > Initialization <
//
// ━━━━━┛ Init Interface ┗━━━━━
export function initInterface(): void {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createUI);
    } else {
        createUI();
    }
}
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// #endregion ^ Initialization ^
//
// --ι══════════════ι--
//
// #region > UI Creation <
//
// ━━━━┛ ▼ ┗━━━━
export const ui: Interface = {};
function createUI(): Interface {
    initHeader();
    initCore();
    initSubtabs();

    initSearch();

    InterfaceInitEvents.emit();

    return ui;
}
function createElement(config: UIConfig): HTMLElement {
    const el = document.createElement(config.type);
    if (config.id) el.id = config.id;
    if (config.class) el.className = config.class;
    if (config.text) el.textContent = config.text;
    if (config.html) el.innerHTML = config.html;
    if (config.placeholder) (el as HTMLInputElement).placeholder = config.placeholder;
    if (config.tooltip) tooltip(el, config.tooltip);
    if (config.premium) initPremium(el);

    if (config.limits) (el as HTMLInputElement).type = config.limits;
    if (config.min !== undefined) (el as HTMLInputElement).min = String(config.min);
    if (config.max !== undefined) (el as HTMLInputElement).max = String(config.max);
    if ((config as any).value !== undefined) (el as HTMLInputElement).value = String((config as any).value);

    const target = config.append === "body"
        ? document.body
        : document.getElementById(config.append!);

    target?.appendChild(el);

    if (config.limits && (config.min !== undefined || config.max !== undefined)) {
        (el as HTMLInputElement).addEventListener("blur", () => {
            const input = el as HTMLInputElement;
            let value = input.value.trim();

            if (value === "") return;
            value = value.replace(/[^a-zA-Z0-9]/g, ""); // No special characters

            if (config.limits === "number") {
                let num = Number(value);

                if (!Number.isInteger(num)) { num = Math.round(num); }
                if (config.min !== undefined && num < config.min) { num = config.min; }
                if (config.max !== undefined && num > config.max) { num = config.max; }

                input.value = String(num);
            } else if (config.limits === "string") {
                if (config.max !== undefined && value.length > config.max) { value = value.slice(0, config.max); }
                if (config.min !== undefined && value.length < config.min) { value = ""; }

                input.value = value;
            }
        });
    }

    if (config.audio?.hover) {
        el.addEventListener("mouseenter", () => {
            playSound("hover");
        });
    }

    if (config.audio?.click) {
        el.addEventListener("click", () => {
            playSound("click");
        });
    }

    return el;
}
function initPremium(element: HTMLElement): void {
    // Remove any existing premium classes
    element.classList.forEach(className => {
        if (className.startsWith('premium_')) {
            element.classList.remove(className);
        }
    });

    // Add the current premium state class
    element.classList.add(`premium_${state.isPremium}`);

    // Set the premium dataset
    element.dataset.premium = 'required';
}
export function updatePremium(): void {
    document.querySelectorAll('[data-premium="required"]').forEach(element => {
        initPremium(element as HTMLElement);
    });
}
function initHeader(): void {
    ui.header = createElement(sanitize(INTERFACE.HEADER));
    ui.logo = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGO));
}
function initCore(): void {
    ui.main = createElement(sanitize(INTERFACE.MAIN));
    ui.home = createElement(sanitize(INTERFACE.CONTAINERS.HOME));

    ui.tabs = createElement(sanitize(INTERFACE.CONTAINERS.TABS));
    ui.helpTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.HELP_TAB));
    ui.optionsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.OPTIONS_TAB));
    ui.resultsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.RESULTS_TAB));

    ui.helpTab.addEventListener("click", () => toggleTab(ui.helpTab));
    ui.optionsTab.addEventListener("click", () => toggleTab(ui.optionsTab));
    ui.resultsTab.addEventListener("click", () => toggleTab(ui.resultsTab));

    ui.help = createElement(sanitize(INTERFACE.CONTAINERS.HELP));
    ui.menu = createElement(sanitize(INTERFACE.CONTAINERS.MENU));
    ui.results = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS));

    initHelpContent();

    ui.subtabs = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS));
    ui.filtersSubtab = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS.FILTERS_SUBTAB));
    ui.searchSettingsSubtab = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS.SEARCH_SETTINGS_SUBTAB));
    ui.advancedSubtab = createElement(sanitize(INTERFACE.CONTAINERS.SUBTABS.ADVANCED_SUBTAB));

    ui.filtersSubtab.addEventListener("click", () => toggleSubtab(ui.filtersSubtab));
    ui.searchSettingsSubtab.addEventListener("click", () => toggleSubtab(ui.searchSettingsSubtab));
    ui.advancedSubtab.addEventListener("click", () => toggleSubtab(ui.advancedSubtab));

    toggleTab(ui.optionsTab);
}
function initSubtabs(): void {
    initFiltersSubtab();
    initSearchSettingsSubtab();
    initAdvancedSubtab();

    toggleSubtab(ui.filtersSubtab);
}
function initFiltersSubtab(): void {
    ui.filtersContainer = createElement(sanitize(INTERFACE.CONTAINERS.FILTERS_CONTAINER));
    ui.filters = createElement(sanitize(INTERFACE.CONTAINERS.FILTERS));

    for (const folderName in dict) {
        const folder = dict[folderName as keyof Dictionary];

        const categoryID = `filter_category_${folderName}`;
        const containerID = `filter_container_${folderName}`;

        // Create the category wrapper
        const categoryContainer = createElement({
            type: "div",
            id: categoryID,
            class: "category",
            append: "filters",
            audio: { click: true }
        });
        ui[categoryID] = categoryContainer;

        categoryContainer.addEventListener("click", (event) => {
            // Prevent the click from toggling a single toggler first
            if ((event.target as HTMLElement).classList.contains("toggler")) return;

            const togglers = categoryContainer.querySelectorAll(".toggler");
            const allActive = Array.from(togglers).every(t => t.classList.contains("active"));

            togglers.forEach(toggler => {
                toggler.classList.toggle("active", !allActive);
                if (DEBUG.ENABLED) {
                    console.log(`Toggled ${toggler.textContent} in ${folderName}`);
                }
            });
        });

        // Create the header (folder name)
        createElement({
            type: "h3",
            text: folderName.toUpperCase(),
            append: categoryID
        });

        // Create the inner container for toggles
        const filterContainer = createElement({
            type: "div",
            id: containerID,
            class: "filters",
            append: categoryID
        });
        ui[containerID] = filterContainer;

        // Add toggles inside this container
        for (const entryName in folder) {
            const toggleID = `toggle_${folderName}_${entryName}`;

            const toggler = createElement({
                type: "div",
                id: toggleID,
                class: "toggler",
                text: entryName,
                append: containerID
            });

            toggler.addEventListener("mouseenter", () => {
                playSound("hover");
            });

            toggler.setAttribute("data-group", folderName);
            toggler.setAttribute("data-key", entryName);

            toggler.addEventListener("click", () => {
                toggler.classList.toggle("active");
                playSound("click");
                if (DEBUG.ENABLED) {
                    console.log(`Toggled ${entryName} in ${folderName}`);
                }
            });

            ui[toggleID] = toggler;
        }
    }
}
function initHelpContent(): void {
    ui.hc00 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_00));
    ui.hc01 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_01));
    ui.hc02 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_02));
    ui.hc03 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.HC_03));

    ui.gh00 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.GH_00));
    ui.gh01 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.GH_01));
    ui.gh02 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.GH_02));

    ui.ah00 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_00));
    ui.ah01 = createElement(sanitize(INTERFACE.CONTAINERS.HELP.AH_01));
}
function initSearchSettingsSubtab(): void {
    ui.searchSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_CONTAINER));

    ui.searchSettingsToggles = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES));
    ui.stopOnFirstContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.STOP_ON_FIRST_CONTAINER));
    ui.stopOnFirstToggler = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.STOP_ON_FIRST_TOGGLER));

    ui.stopOnFirstContainer.addEventListener("click", () => {
        ui.stopOnFirstToggler.classList.toggle("active");
        SEARCH_PREFS.CUSTOM.STOP_ON_FIRST = ui.stopOnFirstToggler.classList.contains("active");

        if (DEBUG.ENABLED) {
            console.log(`Stop on first set to ${SEARCH_PREFS.CUSTOM.STOP_ON_FIRST}`);
        }
    });
    if (SEARCH_PREFS.CUSTOM.STOP_ON_FIRST) {
        ui.stopOnFirstToggler.classList.add("active");
    }

    ui.openOnFindContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.OPEN_ON_FIND_CONTAINER));
    ui.openOnFindToggler = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH_SETTINGS_TOGGLES.OPEN_ON_FIND_TOGGLER));

    ui.openOnFindContainer.addEventListener("click", () => {
        ui.openOnFindToggler.classList.toggle("active");
        SEARCH_PREFS.CUSTOM.OPEN_ON_FIND = ui.openOnFindToggler.classList.contains("active");

        if (DEBUG.ENABLED) {
            console.log(`Open on find set to ${SEARCH_PREFS.CUSTOM.OPEN_ON_FIND}`);
        }
    });
    if (SEARCH_PREFS.CUSTOM.OPEN_ON_FIND) {
        ui.openOnFindToggler.classList.add("active");
    }

    initDomainSettings();

    ui.generationSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.GENERATION_SETTINGS_CONTAINER));
    ui.generationSettings = createElement(sanitize(INTERFACE.CONTAINERS.GENERATION_SETTINGS_CONTAINER.GENERATION_SETTINGS));
    ui.generationContainer = createElement(sanitize(INTERFACE.CONTAINERS.GENERATION_SETTINGS_CONTAINER.GENERATION_SETTINGS.GENERATION_CONTAINER));

    initCharacterSetSettings();

    initClusterWeightSettings();

    initRandomModeSettings();
}
function initDomainSettings(): void {
    ui.domainsContainer = createElement(sanitize(INTERFACE.CONTAINERS.DOMAIN_SETTINGS_CONTAINER));
    ui.domainSettings = createElement(sanitize(INTERFACE.CONTAINERS.DOMAIN_SETTINGS_CONTAINER.DOMAIN_SETTINGS));
    ui.domainsContainerInner = createElement(sanitize(INTERFACE.CONTAINERS.DOMAIN_SETTINGS_CONTAINER.DOMAIN_SETTINGS.DOMAINS_CONTAINER));

    const domainKeys = Object.keys(SEARCH_PREFS.DOMAINS) as Array<keyof typeof SEARCH_PREFS.DOMAINS>;

    for (const domain of domainKeys) {
        const domainID = `toggle_domain_${domain.replace(/\./g, "")}`;

        const toggler = createElement(sanitize({
            ...INTERFACE.CONTAINERS.DOMAINS,
            ID: domainID,
            TEXT: domain
        }));

        toggler.addEventListener("mouseenter", () => {
            playSound("hover");
        });

        toggler.setAttribute("data-domain", domain);

        toggler.addEventListener("click", () => {
            const isActive = toggler.classList.toggle("active");
            SEARCH_PREFS.DOMAINS[domain] = isActive;
            playSound("click");

            if (DEBUG.ENABLED) {
                console.log(`Toggled domain: ${domain} → ${isActive}`);
            }
        });

        if (SEARCH_PREFS.DOMAINS[domain]) {
            toggler.classList.add("active");
        }

        ui[domainID] = toggler;
    }
}
function initCharacterSetSettings(): void {
    ui.characterSetSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.CHARACTER_SET_SETTINGS_CONTAINER));
    ui.characterSetSettings = createElement(sanitize(INTERFACE.CONTAINERS.CHARACTER_SET_SETTINGS_CONTAINER.CHARACTER_SET_SETTINGS));
    ui.characterSetContainer = createElement(sanitize(INTERFACE.CONTAINERS.CHARACTER_SET_SETTINGS_CONTAINER.CHARACTER_SET_SETTINGS.CHARACTER_SET_CONTAINER));

    for (const key of Object.keys(CHARACTERS.CHARACTER_SET) as Array<keyof typeof CHARACTERS.CHARACTER_SET>) {
        const toggleID = `toggle_character_set_${key}`;

        const toggler = createElement(sanitize({
            ...INTERFACE.CONTAINERS.CHARACTER_SET,
            ID: toggleID,
            TEXT: key,
        }));

        toggler.addEventListener("mouseenter", () => {
            playSound("hover");
        });

        toggler.setAttribute("data-character-set", key);

        toggler.addEventListener("click", () => {
            const all = ui.characterSetContainer.querySelectorAll(".toggler");
            all.forEach(el => el.classList.remove("active"));

            toggler.classList.add("active");
            SEARCH_PREFS.CUSTOM.CHARACTERS = CHARACTERS.CHARACTER_SET[key];

            // Auto-switch to RAW mode for NUMERIC and ALPHANUMERIC
            if (key === 'NUMERIC' || key === 'ALPHANUMERIC') {
                // Update the preference
                SEARCH_PREFS.CUSTOM.RANDOM = RANDOM_MODE.RANDOM;

                // Update the UI - remove active from all random mode toggles
                const randomModeTogglers = ui.randomModeContainer?.querySelectorAll(".toggler");
                randomModeTogglers?.forEach(el => el.classList.remove("active"));

                // Add active to RAW toggle
                const rawToggle = ui.randomModeContainer?.querySelector('[data-random-mode="RAW"]');
                rawToggle?.classList.add("active");

                if (DEBUG.ENABLED) {
                    console.log(`Auto-switched to RAW mode for ${key} character set`);
                }
            }

            playSound("click");
            if (DEBUG.ENABLED) {
                console.log(`Character set set to ${key}`);
            }
        });

        if (SEARCH_PREFS.CUSTOM.CHARACTERS === CHARACTERS.CHARACTER_SET[key]) {
            toggler.classList.add("active");
        }

        ui[toggleID] = toggler;
    }
}
function initClusterWeightSettings(): void {
    ui.clusterWeightSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.CLUSTER_CHANCE_SETTINGS_CONTAINER));
    ui.clusterWeightSettings = createElement(sanitize(INTERFACE.CONTAINERS.CLUSTER_CHANCE_SETTINGS_CONTAINER.CLUSTER_CHANCE_SETTINGS));
    ui.clusterWeightContainer = createElement(sanitize(INTERFACE.CONTAINERS.CLUSTER_CHANCE_SETTINGS_CONTAINER.CLUSTER_CHANCE_SETTINGS.CLUSTER_CHANCE_CONTAINER));

    ui.clusterWeightWrapper = createElement(sanitize(INTERFACE.SLIDERS.CLUSTER_CHANCE_SLIDER.WRAPPER));
    ui.clusterWeightFill = createElement(sanitize(INTERFACE.SLIDERS.CLUSTER_CHANCE_SLIDER.FILL));

    // Initial fill based on current value
    updateClusterWeightFill(SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE);

    let isDragging = false;

    // Listen on full container
    ui.clusterWeightContainer.addEventListener("mousedown", (e: MouseEvent) => {
        isDragging = true;
        updateFillFromMouse(e);
    });

    document.addEventListener("mousemove", (e: MouseEvent) => {
        if (isDragging) {
            updateFillFromMouse(e);
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging && DEBUG.ENABLED) {
            console.log(`Cluster weight set to ${SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE}`);
        }
        isDragging = false;
    });

    function updateFillFromMouse(e: MouseEvent): void {
        const rect = ui.clusterWeightContainer.getBoundingClientRect();
        const clampedX = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const percent = clampedX / rect.width;
        const clamped = Math.min(Math.max(percent, 0), 1);

        SEARCH_PREFS.CUSTOM.CLUSTER_CHANCE = clamped;
        updateClusterWeightFill(clamped);
    }
}
function initRandomModeSettings(): void {
    ui.randomModeSettingsContainer = createElement(sanitize(INTERFACE.CONTAINERS.RANDOM_MODE_SETTINGS_CONTAINER));
    ui.randomModeSettings = createElement(sanitize(INTERFACE.CONTAINERS.RANDOM_MODE_SETTINGS_CONTAINER.RANDOM_MODE_SETTINGS));
    ui.randomModeContainer = createElement(sanitize(INTERFACE.CONTAINERS.RANDOM_MODE_SETTINGS_CONTAINER.RANDOM_MODE_SETTINGS.RANDOM_MODE_CONTAINER));

    for (const key of Object.keys(RANDOM_MODE) as Array<keyof typeof RANDOM_MODE>) {
        const toggleID = `toggle_random_mode_${key}`;

        const toggler = createElement(sanitize({
            ...INTERFACE.CONTAINERS.RANDOM_MODE,
            ID: toggleID,
            TEXT: key,
        }));

        toggler.addEventListener("mouseenter", () => {
            playSound("hover");
        });

        toggler.setAttribute("data-random-mode", key);

        toggler.addEventListener("click", () => {
            // Only allow one active at a time
            const all = ui.randomModeContainer.querySelectorAll(".toggler");
            all.forEach(el => el.classList.remove("active"));

            toggler.classList.add("active");
            SEARCH_PREFS.CUSTOM.RANDOM = RANDOM_MODE[key as keyof typeof RANDOM_MODE];

            // Auto-switch to ALPHABETIC for PHONETIC and SYLLABLE modes
            if (key === 'PHONETIC' || key === 'SYLLABLE') {
                // Update the preference
                SEARCH_PREFS.CUSTOM.CHARACTERS = CHARACTERS.CHARACTER_SET.ALPHABETIC;

                // Update the UI - remove active from all character set toggles
                const characterSetTogglers = ui.characterSetContainer?.querySelectorAll(".toggler");
                characterSetTogglers?.forEach(el => el.classList.remove("active"));

                // Add active to ALPHABETIC toggle
                const alphabeticToggle = ui.characterSetContainer?.querySelector('[data-character-set="ALPHABETIC"]');
                alphabeticToggle?.classList.add("active");

                if (DEBUG.ENABLED) {
                    console.log(`Auto-switched to ALPHABETIC character set for ${key} mode`);
                }
            }

            playSound("click");
            if (DEBUG.ENABLED) {
                console.log(`Random mode set to ${key}`);
            }
        });

        // Mark default
        if (SEARCH_PREFS.CUSTOM.RANDOM === RANDOM_MODE[key]) {
            toggler.classList.add("active");
        }

        ui[toggleID] = toggler;
    }
}
function initAdvancedSubtab(): void {
    ui.advancedContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER));
    ui.searchLengthsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER));
    ui.searchLimitsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER));
    ui.timeoutLimitsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER));
    ui.fallbackLimitsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER));

    initSearchLengths();
    initSearchAmounts();
    initBatchSize();
    initBatchInterval();
    initConcurrentRequests();

    initTimeoutLimits();
    initFallbackLimits();
}
function initSearchLengths(): void {
    ui.searchLengths = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS));
    ui.searchLengthsInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS.SEARCH_LENGTHS_INPUT_CONTAINER));
    ui.minLengthInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS.SEARCH_LENGTHS_INPUT_CONTAINER.MIN_LENGTH_INPUT));
    ui.maxLengthInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LENGTHS_CONTAINER.SEARCH_LENGTHS.SEARCH_LENGTHS_INPUT_CONTAINER.MAX_LENGTH_INPUT));

    ui.minLengthInput.addEventListener("blur", () => {
        const input = ui.minLengthInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.CUSTOM.LENGTH.MIN = num;
            if (DEBUG.ENABLED) {
                console.log(`Minimum search length set to ${SEARCH_PREFS.CUSTOM.LENGTH.MIN}`);
            }
        }
    });
    ui.maxLengthInput.addEventListener("blur", () => {
        const input = ui.maxLengthInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.CUSTOM.LENGTH.MAX = num;
            if (DEBUG.ENABLED) {
                console.log(`Maximum search length set to ${SEARCH_PREFS.CUSTOM.LENGTH.MAX}`);
            }
        }
    });
}
function initSearchAmounts(): void {
    ui.searchAmountContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.SEARCH_AMOUNT_CONTAINER));
    ui.searchAmountInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.SEARCH_AMOUNT_CONTAINER.SEARCH_AMOUNT_INPUT_CONTAINER));
    ui.searchAmountInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.SEARCH_AMOUNT_CONTAINER.SEARCH_AMOUNT_INPUT_CONTAINER.SEARCH_AMOUNT_INPUT));

    ui.searchAmountInput.addEventListener("blur", () => {
        const input = ui.searchAmountInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.RETRIES = num;
            if (DEBUG.ENABLED) {
                console.log(`Search amount set to ${SEARCH_PREFS.LIMITS.RETRIES}`);
            }
        }
    });
}
function initBatchSize(): void {
    ui.batchSizeContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_SIZE_CONTAINER));
    ui.batchSizeInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_SIZE_CONTAINER.BATCH_SIZE_INPUT_CONTAINER));
    ui.batchSizeInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_SIZE_CONTAINER.BATCH_SIZE_INPUT_CONTAINER.BATCH_SIZE_INPUT));

    ui.batchSizeInput.addEventListener("blur", () => {
        const input = ui.batchSizeInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.BATCH = num;
            if (DEBUG.ENABLED) {
                console.log(`Batch size set to ${SEARCH_PREFS.LIMITS.BATCH}`);
            }
        }
    });
}
function initBatchInterval(): void {
    ui.batchIntervalContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_INTERVAL_CONTAINER));
    ui.batchIntervalInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_INTERVAL_CONTAINER.BATCH_INTERVAL_INPUT_CONTAINER));
    ui.batchIntervalInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.BATCH_INTERVAL_CONTAINER.BATCH_INTERVAL_INPUT_CONTAINER.BATCH_INTERVAL_INPUT));

    ui.batchIntervalInput.addEventListener("blur", () => {
        const input = ui.batchIntervalInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.BATCH_INTERVAL = num;
            if (DEBUG.ENABLED) {
                console.log(`Batch interval set to ${SEARCH_PREFS.LIMITS.BATCH_INTERVAL}`);
            }
        }
    });
}
function initConcurrentRequests(): void {
    ui.concurrentRequestsContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.CONCURRENT_REQUESTS_CONTAINER));
    ui.concurrentRequestsInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.CONCURRENT_REQUESTS_CONTAINER.CONCURRENT_REQUESTS_INPUT_CONTAINER));
    ui.concurrentRequestsInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.SEARCH_LIMITS_CONTAINER.CONCURRENT_REQUESTS_CONTAINER.CONCURRENT_REQUESTS_INPUT_CONTAINER.CONCURRENT_REQUESTS_INPUT));

    ui.concurrentRequestsInput.addEventListener("blur", () => {
        const input = ui.concurrentRequestsInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS = num;
            if (DEBUG.ENABLED) {
                console.log(`Concurrent requests set to ${SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS}`);
            }
        }
    });
}
function initTimeoutLimits(): void {
    ui.timeoutLimit = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER.TIMEOUT_LIMIT));
    ui.timeoutLimitInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER.TIMEOUT_LIMIT.TIMEOUT_LIMIT_INPUT_CONTAINER));
    ui.timeoutLimitInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.TIMEOUT_LIMITS_CONTAINER.TIMEOUT_LIMIT.TIMEOUT_LIMIT_INPUT_CONTAINER.TIMEOUT_LIMIT_INPUT));

    ui.timeoutLimitInput.addEventListener("blur", () => {
        const input = ui.timeoutLimitInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.TIMEOUT = num;
            if (DEBUG.ENABLED) {
                console.log(`Timeout limit set to ${SEARCH_PREFS.LIMITS.TIMEOUT}`);
            }
        }
    });
}
function initFallbackLimits(): void {
    ui.fallbackTimeoutLimit = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_TIMEOUT_LIMIT));
    ui.fallbackTimeoutLimitInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_TIMEOUT_LIMIT.FALLBACK_TIMEOUT_LIMIT_INPUT_CONTAINER));
    ui.fallbackTimeoutLimitInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_TIMEOUT_LIMIT.FALLBACK_TIMEOUT_LIMIT_INPUT_CONTAINER.FALLBACK_TIMEOUT_LIMIT_INPUT));

    ui.fallbackTimeoutLimitInput.addEventListener("blur", () => {
        const input = ui.fallbackTimeoutLimitInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT = num;
            if (DEBUG.ENABLED) {
                console.log(`Fallback timeout limit set to ${SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT}`);
            }
        }
    });

    ui.fallbackRetriesLimit = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_RETRIES_LIMIT));
    ui.fallbackRetriesLimitInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_RETRIES_LIMIT.FALLBACK_RETRIES_LIMIT_INPUT_CONTAINER));
    ui.fallbackRetriesLimitInput = createElement(sanitize(INTERFACE.CONTAINERS.ADVANCED_CONTAINER.FALLBACK_LIMITS_CONTAINER.FALLBACK_RETRIES_LIMIT.FALLBACK_RETRIES_LIMIT_INPUT_CONTAINER.FALLBACK_RETRIES_LIMIT_INPUT));

    ui.fallbackRetriesLimitInput.addEventListener("blur", () => {
        const input = ui.fallbackRetriesLimitInput as HTMLInputElement;
        const value = input.value.trim();
        if (value === "") return;

        const num = Number(value);
        if (!isNaN(num)) {
            SEARCH_PREFS.LIMITS.FALLBACK.RETRIES = num;
            if (DEBUG.ENABLED) {
                console.log(`Fallback retries limit set to ${SEARCH_PREFS.LIMITS.FALLBACK.RETRIES}`);
            }
        }
    });
}
function initSearch(): void {
    ui.customInputContainer = createElement(sanitize(INTERFACE.CONTAINERS.CUSTOM_INPUT_CONTAINER));
    ui.inputContainer = createElement(sanitize(INTERFACE.CONTAINERS.INPUT_CONTAINER));
    ui.customInput = createElement(sanitize(INTERFACE.CONTAINERS.INPUT));

    ui.insertContainer = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER));
    ui.insertPrefix = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER.INSERT_PREFIX));
    ui.insertSuffix = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER.INSERT_SUFFIX));
    ui.insertRandom = createElement(sanitize(INTERFACE.CONTAINERS.INSERT_CONTAINER.INSERT_RANDOM));

    const insertOptions = [
        { el: ui.insertPrefix, value: "prefix" },
        { el: ui.insertSuffix, value: "suffix" },
        { el: ui.insertRandom, value: "random" }
    ];

    insertOptions.forEach(option => {
        if (option.value === SEARCH_PREFS.CUSTOM.INSERT) {
            option.el.classList.add("active");
        }

        option.el.addEventListener("click", () => {
            // Remove active from all
            insertOptions.forEach(opt => opt.el.classList.remove("active"));
            // Add active to the clicked one
            option.el.classList.add("active");
            // Update SEARCH_PREFS
            SEARCH_PREFS.CUSTOM.INSERT = option.value;

            if (DEBUG.ENABLED) {
                console.log(`Insert mode set to "${option.value}"`);
            }
        });
    });

    ui.searchContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH));
    ui.searchButton = createElement(sanitize(INTERFACE.BUTTONS.SEARCH));
    ui.progressWrapper = createElement(sanitize(INTERFACE.SLIDERS.PROGRESS_SLIDER.WRAPPER));
    ui.progressFill = createElement(sanitize(INTERFACE.SLIDERS.PROGRESS_SLIDER.FILL));

    ProgressEvents.on((percent) => {
        ui.progressFill.style.width = `${Math.floor(percent * 100)}%`;
    });

    ui.searchButton.addEventListener("click", () => {
        if (state.isSearching) {
            cancelSearch();
            return;
        }

        ui.progressFill.style.width = "0%";
        search();
    });
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ UI Creation ^
//
// --ι══════════════ι--
//
// #region > UI Management <
//
// ━━━━┛ ▼ ┗━━━━
export function setText(id: string, text: string): void {
    const element = ui[id];
    if (element) {
        element.textContent = text;
    }
}
export function toggleTab(tab: HTMLElement): void {
    if (tab.classList.contains("active")) return; // No-op if already active

    // List all tabs & containers in matching order
    const tabs = [ui.optionsTab, ui.resultsTab, ui.helpTab];
    const containers = [ui.menu, ui.results, ui.help];

    // Remove active from all tabs, hide all containers
    tabs.forEach(t => t.classList.remove("active"));
    containers.forEach(c => {
        c.classList.remove("active");
        c.classList.add("hidden");
    });

    // Find clicked tab's index
    const index = tabs.indexOf(tab);
    if (index === -1) return;

    // Activate clicked tab, show corresponding container
    tabs[index].classList.add("active");
    containers[index].classList.add("active");
    containers[index].classList.remove("hidden");

    if (DEBUG.ENABLED) {
        console.log(`Tab switched to ${tab.id || index}`);
    }
}
function toggleSubtab(activeButton: HTMLElement): void {
    // Deactivate all subtab buttons
    ui.filtersSubtab.classList.remove("active");
    ui.searchSettingsSubtab.classList.remove("active");
    ui.advancedSubtab.classList.remove("active");

    // Deactivate all subtab containers
    ui.filtersContainer.classList.remove("active");
    ui.searchSettingsContainer.classList.remove("active");
    ui.advancedContainer.classList.remove("active");

    // Activate selected subtab button
    activeButton.classList.add("active");

    // Activate matching container
    switch (activeButton) {
        case ui.filtersSubtab:
            ui.filtersContainer.classList.add("active");
            break;
        case ui.searchSettingsSubtab:
            ui.searchSettingsContainer.classList.add("active");
            break;
        case ui.advancedSubtab:
            ui.advancedContainer.classList.add("active");
            break;
    }
}
function renderValidResult(url: string): void {
    // Extract the domain and path after the domain
    // Remove protocol and www (be lenient)
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/i);
    let displayName = url;
    if (match && match[1]) {
        displayName = match[1];
    }

    const resultDiv = document.createElement("div");
    resultDiv.className = INTERFACE.CONTAINERS.RESULT.CLASS;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = displayName;

    resultDiv.appendChild(link);
    ui.results.appendChild(resultDiv);
}
ValidResultEvents.on(renderValidResult);
function updateClusterWeightFill(value: number): void {
    const percent = Math.floor(value * 100);
    if (ui.clusterWeightFill) {
        ui.clusterWeightFill.style.width = `${percent}%`;
    }
}
// #endregion ^ UI Management ^