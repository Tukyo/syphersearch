/* 
════════════╗
| INTERFACE
════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Manages all interface elements for the application.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { DEBUG, INTERFACE } from "./Config";
import { Interface, UIConfig } from "./Defs";
import { ProgressEvents } from "./Events";
import { initSearch } from "./Main";
import { sanitize, tooltip } from "./Utils";

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
    ui.header = createElement(sanitize(INTERFACE.HEADER));
    ui.logo = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGO));
    ui.login = createElement(sanitize(INTERFACE.HEADER.CONTAINERS.LOGIN));

    ui.main = createElement(sanitize(INTERFACE.MAIN));
    ui.home = createElement(sanitize(INTERFACE.CONTAINERS.HOME));
    ui.menu = createElement(sanitize(INTERFACE.CONTAINERS.MENU));

    ui.filters = createElement(sanitize(INTERFACE.CONTAINERS.FILTERS));

    ui.searchInput = createElement(sanitize(INTERFACE.CONTAINERS.INPUT));
    ui.searchContainer = createElement(sanitize(INTERFACE.CONTAINERS.SEARCH));
    ui.searchButton = createElement(sanitize(INTERFACE.BUTTONS.SEARCH));
    ui.progressWrapper = createElement(sanitize(INTERFACE.SLIDERS.PROGRESS_SLIDER.WRAPPER));
    ui.progressFill = createElement(sanitize(INTERFACE.SLIDERS.PROGRESS_SLIDER.FILL));

    ProgressEvents.on((percent) => {
        ui.progressFill.style.width = `${Math.floor(percent * 100)}%`;
    });

    ui.searchButton.addEventListener("click", () => {
        ui.progressFill.style.width = "0%";
        initSearch();
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
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ UI Creation ^