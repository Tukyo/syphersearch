/* 
════════════════╗
| CONFIGURATION
════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Stores configuration details and variables.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// #region > Debug < 
// ━━━━┛ ▼ ┗━━━━
export const DEBUG = {
    ENABLED: true,
    QUIET: false
}
// ━━━━┛ ▲ ┗━━━━
// #endregion ^ Debug ^
//
// --ι══════════════ι--
//
// #region > Search <
//
// ━━━━┛ ▼ ┗━━━━
export const CHARACTER_SETS = {
    ALPHANUMERIC: "abcdefghijklmnopqrstuvwxyz0123456789",
    ALPHABETIC: "abcdefghijklmnopqrstuvwxyz",
    NUMERIC: "0123456789",
    SPECIAL: "!@#$%^&*()-_=+[]{}|;:',.<>?/~`"
};
export const SEARCH_PREFS = {
    BASE: "https://www.",
    DOMAINS: [
        ".com",
        ".net",
        ".org"
    ],
    CUSTOM: {
        LENGTH: {
            MIN: 5,
            MAX: 10
        },
        RANDOM: false,
        CHARACTERS: CHARACTER_SETS.ALPHANUMERIC,
    },
    LIMITS: {
        RETRIES: 1000,
        TIMEOUT: 1000
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Search ^
//
// --ι══════════════ι--
//
// #region > Interface <
//
// ━━━━┛ ▼ ┗━━━━
export const ICON = {
    LOGO: {
        TYPE: "svg",
        SVG: `
            <svg class="header_svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 105.87 120.22">
                <defs>
                    <style>
                        .cls-1 {
                            fill: #aaaaaa;
                        }
                    </style>
                </defs>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="svg1">
                        <g id="layer1">
                            <g id="g28">
                                <path id="path18-6-3" class="cls-1"
                                    d="M15.16,0h7V16.56H42.35V0h7V16.56h52.22l2.3,2.54q-5,20.15-15.54,34.48a83.94,83.94,0,0,1-18,17.81h30l4.19,3.72A117.92,117.92,0,0,1,86.24,95.7l-5.07-4.62a100.71,100.71,0,0,0,13-13.1H80.54l-.07,7.41q0,12.7-4.19,20.5a43,43,0,0,1-12.32,14l-5.2-5.23a33,33,0,0,0,11.59-12q3.77-7,3.76-17.24L74,78H55.62V71.39A77.14,77.14,0,0,0,81.19,51.5a70.26,70.26,0,0,0,14.18-28H80.46C80,25.78,77.65,35.39,66.37,49.46A193.42,193.42,0,0,1,47.31,68.51v41.68h-7V74.26Q26,85,15.17,89.2l-3.93-6.43Q36.8,73.55,61,44.84s11.5-14.36,11.39-21.32H64.51v0H49.35v12.7a28.57,28.57,0,0,1-5.9,17A36,36,0,0,1,26.89,65.61l-4.43-6.88Q31.84,56.35,37.1,50a21.06,21.06,0,0,0,5.25-13.57V23.56H22.16V40.27h-7V23.56H0v-7H15.16ZM76.61,113.11l29,.12.27,7-29-.12Z" />
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        `,
        CLASS: "header_svg"
    },
    LOGIN: {
        TYPE: "svg",
        SVG: `
            <svg class="header_svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6" stroke="#aaaaaa" stroke-width="1.75" stroke-linecap="round" />
                <path
                    d="M8.5 3.70605C5.26806 5.07157 3 8.27099 3 12.0001C3 14.3052 3.86656 16.4079 5.29169 18.0002M15.5 3.70605C18.7319 5.07157 21 8.27099 21 12.0001C21 16.9707 16.9706 21.0001 12 21.0001C10.9481 21.0001 9.93834 20.8197 9 20.488"
                    stroke="#aaaaaa" stroke-width="1.75" stroke-linecap="round" />
            </svg>
        `,
        CLASS: "header_svg"
    }
}
export const INTERFACE = {
    HEADER: {
        TYPE: "header",
        ID: "header",
        APPEND: "body",
        CONTAINERS: {
            LOGO: {
                TYPE: "div",
                ID: "logo_container",
                CLASS: "header-logo",
                HTML: ICON.LOGO.SVG,
                APPEND: "header"
            },
            LOGIN: {
                TYPE: "div",
                ID: "login_container",
                CLASS: "header-logo",
                HTML: ICON.LOGIN.SVG,
                TOOLTIP: "Connect Wallet",
                APPEND: "header"
            }
        }
    },
    MAIN: {
        TYPE: "main",
        ID: "main",
        APPEND: "body"
    },
    CONTAINERS: {
        HOME: {
            TYPE: "div",
            ID: "home",
            CLASS: "container",
            APPEND: "main"
        },
        MENU: {
            TYPE: "div",
            ID: "menu",
            CLASS: "container",
            APPEND: "home"
        },
        FILTERS: {
            TYPE: "div",
            ID: "filters",
            CLASS: "container",
            APPEND: "menu"
        },
        INPUT: {
            TYPE: "input",
            ID: "custom_input",
            CLASS: "input",
            PLACEHOLDER: "Custom Word Entry...",
            TOOLTIP: "Enter a custom word to include in the search.",
            APPEND: "menu"

        },
        SEARCH: {
            TYPE: "div",
            ID: "search",
            CLASS: "container",
            APPEND: "home"
        }
    },
    BUTTONS: {
        SEARCH: {
            TYPE: "button",
            ID: "search_button",
            CLASS: "button",
            TEXT: "Search",
            APPEND: "search"
        }
    },
    SLIDERS: {
        PROGRESS_SLIDER: {
            WRAPPER: {
                TYPE: "div",
                ID: "progress_wrapper",
                CLASS: "wrapper",
                APPEND: "search"
            },
            FILL: {
                TYPE: "div",
                ID: "progress_fill",
                CLASS: "fill",
                APPEND: "progress_wrapper"
            }
        }
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Interface ^