/* 
════════════╗
| INTERFACE
════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Manages all interface elements for the application.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { DEBUG, INTERFACE, SEARCH_PREFS } from "./Config";
import { Interface, UIConfig } from "./Defs";
import { ProgressEvents, ValidResultEvents } from "./Events";
import { search, state } from "./Main";
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
    initFilters();
    initSearch();

    ProgressEvents.on((percent) => {
        ui.progressFill.style.width = `${Math.floor(percent * 100)}%`;
    });

    ui.searchButton.addEventListener("click", () => {
        if (state.isSearching) {
            state.isSearching = false;
            setText("searchButton", "Search");
            return;
        }

        ui.progressFill.style.width = "0%";
        search();
    });


    if (DEBUG.ENABLED) {
        console.log("UI created:", ui);
    }

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

    const target = config.append === "body"
        ? document.body
        : document.getElementById(config.append!);

    target?.appendChild(el);

    return el;
}
function initHeader(): void {
    ui.header = createElement(sanitize(INTERFACE.HEADER));
    ui.logo = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGO));
    ui.login = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGIN));
}
function initCore(): void {
    ui.main = createElement(sanitize(INTERFACE.MAIN));
    ui.home = createElement(sanitize(INTERFACE.CONTAINERS.HOME));

    ui.tabs = createElement(sanitize(INTERFACE.CONTAINERS.TABS));
    ui.optionsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.OPTIONS_TAB));
    ui.resultsTab = createElement(sanitize(INTERFACE.CONTAINERS.TABS.RESULTS_TAB));

    ui.optionsTab.addEventListener("click", () => toggleTab(ui.optionsTab));
    ui.resultsTab.addEventListener("click", () => toggleTab(ui.resultsTab));

    ui.menu = createElement(sanitize(INTERFACE.CONTAINERS.MENU));
    ui.results = createElement(sanitize(INTERFACE.CONTAINERS.RESULTS));

    toggleTab(ui.optionsTab);
}
function initFilters(): void {
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
            append: "filters"
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

            toggler.setAttribute("data-group", folderName);
            toggler.setAttribute("data-key", entryName);

            toggler.addEventListener("click", () => {
                toggler.classList.toggle("active");
                if (DEBUG.ENABLED) {
                    console.log(`Toggled ${entryName} in ${folderName}`);
                }
            });

            ui[toggleID] = toggler;
        }
    }
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
    const isOptionsTab = tab === ui.optionsTab;

    if (tab.classList.contains("active")) return; // No-op if already active

    // Toggle active tab styling
    ui.optionsTab.classList.remove("active");
    ui.resultsTab.classList.remove("active");
    tab.classList.add("active");

    // Show/hide containers
    if (isOptionsTab) {
        ui.menu.classList.add("active");
        ui.menu.classList.remove("hidden");

        ui.results.classList.remove("active");
        ui.results.classList.add("hidden");
    } else {
        ui.menu.classList.remove("active");
        ui.menu.classList.add("hidden");

        ui.results.classList.add("active");
        ui.results.classList.remove("hidden");
    }

    if (DEBUG.ENABLED) {
        console.log(`Tab switched to ${isOptionsTab ? "Options" : "Results"}`);
    }
}
function renderValidResult(url: string): void {
    const resultDiv = document.createElement("div");
    resultDiv.className = INTERFACE.CONTAINERS.RESULT.CLASS;

    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url;

    resultDiv.appendChild(link);
    ui.results.appendChild(resultDiv);
}
ValidResultEvents.on(renderValidResult);
// #endregion ^ UI Management ^