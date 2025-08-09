/* 
════════════════════╗
| INTERFACE CONFIG
════════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Stores configuration details for the interface.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { SEARCH_PREFS } from "./Config"

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
        //
        //
        // --> Tabs
        TABS: {
            TYPE: "div",
            ID: "tabs",
            CLASS: "container",
            APPEND: "home",
            HELP_TAB: {
                TYPE: "div",
                ID: "help_tab",
                CLASS: "tab",
                HTML: `<h3>?</h3>`,
                APPEND: "tabs"
            },
            OPTIONS_TAB: {
                TYPE: "div",
                ID: "options_tab",
                CLASS: "tab",
                HTML: `<h3>Options</h3>`,
                APPEND: "tabs"
            },
            RESULTS_TAB: {
                TYPE: "div",
                ID: "results_tab",
                CLASS: "tab",
                HTML: `<h3>Results</h3>`,
                APPEND: "tabs"
            }
        },
        SUBTABS: {
            TYPE: "div",
            ID: "subtabs",
            CLASS: "container",
            APPEND: "menu",
            FILTERS_SUBTAB: {
                TYPE: "div",
                ID: "filters_subtab",
                CLASS: "subtab",
                HTML: `<h3>Filters</h3>`,
                APPEND: "subtabs"
            },
            SEARCH_SETTINGS_SUBTAB: {
                TYPE: "div",
                ID: "search_settings_subtab",
                CLASS: "subtab",
                HTML: `<h3>Search Settings</h3>`,
                APPEND: "subtabs"
            },
            ADVANCED_SUBTAB: {
                TYPE: "div",
                ID: "advanced_subtab",
                CLASS: "subtab",
                HTML: `<h3>Advanced</h3>`,
                APPEND: "subtabs"
            }
        },
        HELP: {
            TYPE: "div",
            ID: "help",
            CLASS: "container",
            APPEND: "home",
                HC_00: {
                    TYPE: "div",
                    ID: "hc_00",
                    CLASS: "help",
                    HTML: `
                        <h3>What is Syrch?</h3>
                        <p>A tool to help you explore the internet without a specific destination in mind.</p>
                    `,
                    APPEND: "help"
                },
                HC_01: {
                    TYPE: "div",
                    ID: "hc_01",
                    CLASS: "help",
                    HTML: `
                        <h3>What is Sypher?</h3>
                        <p>Syrch is a part of the Sypher ecosystem, fueled by the SYPHER token.</p>
                        <p>Sypher grants access to <span class="SyrchPro">SyrchPro</span>, and helps fund development through trading fees.</p>
                    `,
                    APPEND: "help"
                },
                HC_02: {
                    TYPE: "div",
                    ID: "hc_02",
                    CLASS: "help",
                    HTML: `
                        <h3>What is <span class="SyrchPro">SyrchPro</span>?</h3>
                        <p><span class="SyrchPro">SyrchPro</span> extends the features and customization of Syrch. Connect a wallet with <strong>1000</strong> SYPHER tokens to get access.</p>
                        <p>Premium features can be enabled when desired; without paying a direct flat rate or subscription fee.</p>
                    `,
                    APPEND: "help"
                },
                HC_03: {
                    TYPE: "div",
                    ID: "hc_03",
                    CLASS: "help",
                    HTML: `
                        <h3>Where Should I Start?</h3>
                        <p>For further help, keep reading below. Otherwise, begin customizing your filters and search preferences - finally, press the search button to begin your journey.</p>
                    `,
                    APPEND: "help"
                },
                GH_00: {
                    TYPE: "div",
                    ID: "gh_00",
                    CLASS: "help",
                    HTML: `
                        <h3>General Help</h3>
                        <p><strong>Filters: </strong>Customize specific filters for the search by category.</p>
                        <p><span class="SyrchPro">SyrchPro</span> also allows you to insert a custom word as a prefix, suffix or randomly.</p>
                        <br>
                    `,
                    APPEND: "help"
                },
                GH_01: {
                    TYPE: "div",
                    ID: "gh_01",
                    CLASS: "help",
                    HTML: `
                        <p><strong>Search Settings: </strong> Customize search preferences and URL generation properties.</p>
                        <p><em>Stop on First </em> stops the search when the first valid result is found.</p>
                        <p><em>Open on Find </em> opens valid results in a new tab. Highly recommended enabling "Stop on First" if this is enabled.</p>
                        <p><em>Domains </em> allows toggling of domains for the search. All are enabled by default.</p>
                        <br>
                    `,
                    APPEND: "help"
                },
                GH_02: {
                    TYPE: "div",
                    ID: "gh_02",
                    CLASS: "help",
                    HTML: `
                        <p><strong>URL Generation: </strong> Choose preferences for the way URLs are generated and constructed.</p>
                        <p><em>Character Set </em> determines which characters are used when generating URLs.</p>
                        <p><em>Cluster Chance </em> determines how often clusters like "th", "he", and "in" are used in the generated URLs.</p>
                        <p><em>Mode </em> determines how URLs are generated. Either randomly, using phonetic patterns or syllables.</p>
                    `,
                    APPEND: "help"
                },
                AH_00: {
                    TYPE: "div",
                    ID: "ah_00",
                    CLASS: "help",
                    HTML: `
                        <h3>Advanced Settings</h3>
                        <p><strong>Generation Length </strong> sets the minimum and maximum length for generated URLs. The maximum amount that the browser allows is 63 characters.</p>
                    `,
                    APPEND: "help"
                },
                AH_01: {
                    TYPE: "div",
                    ID: "ah_01",
                    CLASS: "help",
                    HTML: `
                        <h3><span class="SyrchPro">SyrchPro</span> Advanced Settings</h3>
                        <p><strong>Search Limits</strong> Setup advanced search parameters.</p>
                        <p><em>Search Amount </em> allows you to change the total amount of searches performed.</p>
                        <p><em>Batch Size </em> sets how many batches there will be during the search process. If 'Search Amount' equals 100 and 'Batch Size' is 10, there will be 10 batches of 10 searches each.</p>
                        <p><em>Batch Interval </em> is the time between each batch. Each batch will wait this long after the last batch starts, before starting to process.</p>
                        <p><em>Concurrent Requests </em> sets the maximum amount of URLs that are processed at the same time.</p>
                        <br>
                    `,
                    APPEND: "help"
                },
                AH_02: {
                    TYPE: "div",
                    ID: "ah_02",
                    CLASS: "help",
                    HTML: `
                        <p><strong>Timeouts: </strong> Change timeout parameters.</p>
                    `,
                    APPEND: "help"
                }
        },
        MENU: {
            TYPE: "div",
            ID: "menu",
            CLASS: "container",
            HTML: `<h3>tehe</h3>`, // Creates light blur effect
            APPEND: "home"
        },
        RESULTS: {
            TYPE: "div",
            ID: "results",
            CLASS: "container",
            APPEND: "home"
        },
        RESULT: {
            TYPE: "div",
            ID: "result",
            CLASS: "result",
            APPEND: "results"
        },
        //
        //
        // --> Filters
        FILTERS_CONTAINER: {
            TYPE: "div",
            ID: "filters_container",
            CLASS: "container",
            APPEND: "menu"
        },
        FILTERS: {
            TYPE: "div",
            ID: "filters",
            CLASS: "container",
            APPEND: "filters_container"
        },
        FILTER_CATEGORIES: {
            TYPE: "div",
            ID: " ", // Apply dynamically
            CLASS: "category",
            APPEND: "filters"
        },
        FILTER_CONTAINTERS: {
            TYPE: "div",
            ID: " ",  // Apply dynamically
            CLASS: "filters",
            APPEND: " "  // Apply dynamically
        },
        //
        //
        // --> Custom Input
        CUSTOM_INPUT_CONTAINER: {
            PREMIUM: true,
            TYPE: "div",
            ID: "custom_input_container",
            CLASS: "category",
            HTML: `<h3>Custom Word</h3>`,
            APPEND: "filters_container"
        },
        INPUT_CONTAINER: {
            TYPE: "div",
            ID: "input_container",
            CLASS: "container",
            APPEND: "custom_input_container"
        },
        INPUT: {
            TYPE: "input",
            ID: "custom_input",
            CLASS: "input",
            LIMITS: "string",
            MIN: 0,
            MAX: SEARCH_PREFS.CUSTOM.LENGTH.MAX,
            PLACEHOLDER: "Custom Word Entry...",
            TOOLTIP: "Enter a custom word to include in the search.",
            AUDIO: { HOVER: true, CLICK: true },
            APPEND: "input_container"

        },
        INSERT_CONTAINER: {
            TYPE: "div",
            ID: "insert_container",
            CLASS: "container",
            APPEND: "input_container",
            INSERT_PREFIX: {
                TYPE: "div",
                ID: "insert_prefix",
                CLASS: "toggler",
                TOOLTIP: "Insert word at the beginning.",
                TEXT: "Prefix",
                AUDIO: { HOVER: true, CLICK: true },
                APPEND: "insert_container",
            },
            INSERT_SUFFIX: {
                TYPE: "div",
                ID: "insert_suffix",
                CLASS: "toggler",
                TOOLTIP: "Insert word at the end.",
                TEXT: "Suffix",
                AUDIO: { HOVER: true, CLICK: true },
                APPEND: "insert_container"
            },
            INSERT_RANDOM: {
                TYPE: "div",
                ID: "insert_random",
                CLASS: "toggler",
                TOOLTIP: "Insert word randomly.",
                TEXT: "Random",
                AUDIO: { HOVER: true, CLICK: true },
                APPEND: "insert_container"
            }
        },
        //
        //
        // --> Search Settings
        SEARCH_SETTINGS_CONTAINER: {
            TYPE: "div",
            ID: "search_settings_container",
            CLASS: "container",
            APPEND: "menu"
        },
        SEARCH_SETTINGS_TOGGLES: {
            TYPE: "div",
            ID: "search_settings_toggles",
            CLASS: "container",
            APPEND: "search_settings_container",
            STOP_ON_FIRST_CONTAINER: {
                TYPE: "div",
                ID: "stop_on_first_container",
                CLASS: "category",
                TEXT: "Stop on First",
                TOOLTIP: "Stop searching after the first valid result is found.",
                AUDIO: { HOVER: true, CLICK: true },
                APPEND: "search_settings_toggles"
            },
            STOP_ON_FIRST_TOGGLER: {
                TYPE: "div",
                ID: "stop_on_first_toggler",
                CLASS: "toggler",
                APPEND: "stop_on_first_container"
            },
            OPEN_ON_FIND_CONTAINER: {
                TYPE: "div",
                ID: "open_on_find_container",
                CLASS: "category",
                TEXT: "Open on Find",
                TOOLTIP: "Opens results in a new tab. Recommend enabling 'Stop on First' when enabled.",
                AUDIO: { HOVER: true, CLICK: true },
                APPEND: "search_settings_toggles"
            },
            OPEN_ON_FIND_TOGGLER: {
                TYPE: "div",
                ID: "open_on_find_toggler",
                CLASS: "toggler",
                APPEND: "open_on_find_container"
            }
        },
        DOMAIN_SETTINGS_CONTAINER: {
            TYPE: "div",
            ID: "domain_settings_container",
            CLASS: "container",
            APPEND: "search_settings_container",
            DOMAIN_SETTINGS: {
                TYPE: "div",
                ID: "domain_settings",
                HTML: "<h3>Domains</h3>",
                CLASS: "category",
                TOOLTIP: "Select which domains to include in the search.",
                APPEND: "domain_settings_container",
                DOMAINS_CONTAINER: {
                    TYPE: "div",
                    ID: "domains_container",
                    CLASS: "filters",
                    APPEND: "domain_settings"
                }
            }
        },
        DOMAINS: {
            TYPE: "div",
            ID: " ", // Apply dynamically
            CLASS: "toggler",
            APPEND: "domains_container"
        },
        GENERATION_SETTINGS_CONTAINER: {
            TYPE: "div",
            ID: "generation_settings_container",
            CLASS: "container",
            APPEND: "search_settings_container",
            GENERATION_SETTINGS: {
                TYPE: "div",
                ID: "generation_settings",
                HTML: "<h3>URL Generation</h3>",
                CLASS: "category",
                APPEND: "generation_settings_container",
                GENERATION_CONTAINER: {
                    TYPE: "div",
                    ID: "generation_container",
                    CLASS: "filters",
                    APPEND: "generation_settings"
                }
            }
        },
        CHARACTER_SET_SETTINGS_CONTAINER: {
            TYPE: "div",
            ID: "character_set_settings_container",
            CLASS: "container",
            TOOLTIP: "Determines which characters to use when generating URLs.",
            APPEND: "generation_container",
            CHARACTER_SET_SETTINGS: {
                TYPE: "div",
                ID: "character_set_settings",
                HTML: `<h2>Character Set</h2>`,
                CLASS: "category",
                APPEND: "character_set_settings_container",
                CHARACTER_SET_CONTAINER: {
                    TYPE: "div",
                    ID: "character_set_container",
                    CLASS: "filters",
                    APPEND: "character_set_settings"
                }
            }
        },
        CHARACTER_SET: {
            TYPE: "div",
            ID: " ", // Apply dynamically
            CLASS: "toggler",
            APPEND: "character_set_container"
        },
        CLUSTER_CHANCE_SETTINGS_CONTAINER: {
            TYPE: "div",
            ID: "cluster_chance_settings_container",
            CLASS: "container",
            TOOLTIP: "How often clusters like 'th', 'st' or 'ch' are used in URL generation.",
            APPEND: "generation_container",
            CLUSTER_CHANCE_SETTINGS: {
                TYPE: "div",
                ID: "cluster_chance_settings",
                HTML: `<h2>Cluster Chance</h2>`,
                CLASS: "category",
                APPEND: "cluster_chance_settings_container",
                CLUSTER_CHANCE_CONTAINER: {
                    TYPE: "div",
                    ID: "cluster_chance_container",
                    CLASS: "filters",
                    APPEND: "cluster_chance_settings",
                    AUDIO: { HOVER: true }
                }
            }
        },
        RANDOM_MODE_SETTINGS_CONTAINER: {
            TYPE: "div",
            ID: "random_mode_settings_container",
            CLASS: "container",
            TOOLTIP: "Determines how URLs are generated. Either randomly, using phonetic patterns or syllables.",
            APPEND: "generation_container",
            RANDOM_MODE_SETTINGS: {
                TYPE: "div",
                ID: "random_mode_settings",
                HTML: `<h2>Mode</h2>`,
                CLASS: "category",
                APPEND: "random_mode_settings_container",
                RANDOM_MODE_CONTAINER: {
                    TYPE: "div",
                    ID: "random_mode_container",
                    CLASS: "filters",
                    APPEND: "random_mode_settings"
                }
            }
        },
        RANDOM_MODE: {
            TYPE: "div",
            ID: " ", // Apply dynamically
            CLASS: "toggler",
            APPEND: "random_mode_container"
        },
        //
        //
        // --> Advanced Settings
        ADVANCED_CONTAINER: {
            TYPE: "div",
            ID: "advanced_container",
            CLASS: "container",
            APPEND: "menu",
            SEARCH_LENGTHS_CONTAINER: {
                TYPE: "div",
                ID: "search_lengths_container",
                CLASS: "container",
                APPEND: "advanced_container",
                SEARCH_LENGTHS: {
                    TYPE: "div",
                    ID: "search_lengths",
                    CLASS: "category",
                    HTML: `<h3>Generation Length</h3>`,
                    TOOLTIP: "Minimum and maximum length for generated URLs.",
                    AUDIO: { HOVER: true },
                    APPEND: "search_lengths_container",
                    SEARCH_LENGTHS_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "search_lengths_input_container",
                        CLASS: "container",
                        APPEND: "search_lengths",
                        MIN_LENGTH_INPUT: {
                            TYPE: "input",
                            ID: "min_length_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 1,
                            MAX: SEARCH_PREFS.CUSTOM.LENGTH.MAX,
                            VALUE: SEARCH_PREFS.CUSTOM.LENGTH.MIN,
                            PLACEHOLDER: String(SEARCH_PREFS.CUSTOM.LENGTH.MIN),
                            TOOLTIP: "Minimum length for generated URLs.",
                            AUDIO: { CLICK: true },
                            APPEND: "search_lengths_input_container"
                        },
                        MAX_LENGTH_INPUT: {
                            TYPE: "input",
                            ID: "max_length_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: SEARCH_PREFS.CUSTOM.LENGTH.MIN,
                            MAX: 63,
                            VALUE: SEARCH_PREFS.CUSTOM.LENGTH.MAX,
                            PLACEHOLDER: String(SEARCH_PREFS.CUSTOM.LENGTH.MAX),
                            TOOLTIP: "Maximum length for generated URLs.",
                            AUDIO: { CLICK: true },
                            APPEND: "search_lengths_input_container"
                        }
                    }
                }
            },
            SEARCH_LIMITS_CONTAINER: {
                TYPE: "div",
                ID: "search_limits_container",
                CLASS: "container",
                APPEND: "advanced_container",
                SEARCH_AMOUNT_CONTAINER: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "search_amount_container",
                    CLASS: "category",
                    HTML: `<h3>Search Amount</h3>`,
                    TOOLTIP: "How many URLs to generate per search.",
                    AUDIO: { HOVER: true },
                    APPEND: "search_limits_container",
                    SEARCH_AMOUNT_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "search_amount_input_container",
                        CLASS: "container",
                        APPEND: "search_amount_container",
                        SEARCH_AMOUNT_INPUT: {
                            TYPE: "input",
                            ID: "search_amount_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 1,
                            MAX: 100000,
                            VALUE: SEARCH_PREFS.LIMITS.RETRIES,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.RETRIES),
                            AUDIO: { CLICK: true },
                            APPEND: "search_amount_input_container"
                        }
                    }
                },
                BATCH_SIZE_CONTAINER: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "batch_size_container",
                    CLASS: "category",
                    HTML: `<h3>Batch Size</h3>`,
                    TOOLTIP: "How many URLs to check per batch.",
                    AUDIO: { HOVER: true },
                    APPEND: "search_limits_container",
                    BATCH_SIZE_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "batch_size_input_container",
                        CLASS: "container",
                        APPEND: "batch_size_container",
                        BATCH_SIZE_INPUT: {
                            TYPE: "input",
                            ID: "batch_size_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 1,
                            MAX: SEARCH_PREFS.LIMITS.RETRIES,
                            VALUE: SEARCH_PREFS.LIMITS.BATCH,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.BATCH),
                            AUDIO: { CLICK: true },
                            APPEND: "batch_size_input_container"
                        }
                    }
                },
                BATCH_INTERVAL_CONTAINER: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "batch_interval_container",
                    CLASS: "category",
                    HTML: `<h3>Batch Interval</h3>`,
                    TOOLTIP: "Time in milliseconds between batches.",
                    AUDIO: { HOVER: true },
                    APPEND: "search_limits_container",
                    BATCH_INTERVAL_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "batch_interval_input_container",
                        CLASS: "container",
                        APPEND: "batch_interval_container",
                        BATCH_INTERVAL_INPUT: {
                            TYPE: "input",
                            ID: "batch_interval_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 100, // 1 second
                            MAX: 60000, // 1 minute
                            VALUE: SEARCH_PREFS.LIMITS.BATCH_INTERVAL,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.BATCH_INTERVAL),
                            AUDIO: { CLICK: true },
                            APPEND: "batch_interval_input_container"
                        }
                    }
                },
                CONCURRENT_REQUESTS_CONTAINER: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "concurrent_requests_container",
                    CLASS: "category",
                    HTML: `<h3>Concurrent Requests</h3>`,
                    TOOLTIP: "How many requests can be processed at the same time. Recommend 100 or less.",
                    AUDIO: { HOVER: true },
                    APPEND: "search_limits_container",
                    CONCURRENT_REQUESTS_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "concurrent_requests_input_container",
                        CLASS: "container",
                        APPEND: "concurrent_requests_container",
                        CONCURRENT_REQUESTS_INPUT: {
                            TYPE: "input",
                            ID: "concurrent_requests_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 1,
                            MAX: 1000,
                            VALUE: SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS),
                            AUDIO: { CLICK: true },
                            APPEND: "concurrent_requests_input_container"
                        }
                    }
                }
            },
            TIMEOUT_LIMITS_CONTAINER: {
                TYPE: "div",
                ID: "timeout_limits_container",
                CLASS: "container",
                APPEND: "advanced_container",
                TIMEOUT_LIMIT: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "timeout_limit",
                    CLASS: "category",
                    HTML: `<h3>Timeout Limit</h3>`,
                    TOOLTIP: "How long in milliseconds to wait for each URL to respond.",
                    AUDIO: { HOVER: true },
                    APPEND: "timeout_limits_container",
                    TIMEOUT_LIMIT_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "timeout_limit_input_container",
                        CLASS: "container",
                        APPEND: "timeout_limit",
                        TIMEOUT_LIMIT_INPUT: {
                            TYPE: "input",
                            ID: "timeout_limit_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 100, // 0.1 second
                            MAX: 30000, // 30 seconds
                            VALUE: SEARCH_PREFS.LIMITS.TIMEOUT,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.TIMEOUT),
                            AUDIO: { CLICK: true },
                            APPEND: "timeout_limit_input_container"
                        }
                    }
                },
            },
            FALLBACK_LIMITS_CONTAINER: {
                TYPE: "div",
                ID: "fallback_limits_container",
                CLASS: "container",
                APPEND: "advanced_container",
                FALLBACK_TIMEOUT_LIMIT: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "fallback_timeout_limit",
                    CLASS: "category",
                    HTML: `<h3>Fallback Timeout</h3>`,
                    TOOLTIP: "How long in milliseconds to wait for a fallback request.",
                    AUDIO: { HOVER: true },
                    APPEND: "fallback_limits_container",
                    FALLBACK_TIMEOUT_LIMIT_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "fallback_timeout_limit_input_container",
                        CLASS: "container",
                        APPEND: "fallback_timeout_limit",
                        FALLBACK_TIMEOUT_LIMIT_INPUT: {
                            TYPE: "input",
                            ID: "fallback_timeout_limit_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 1000, // 1 second
                            MAX: 30000, // 30 seconds
                            VALUE: SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.FALLBACK.TIMEOUT),
                            AUDIO: { CLICK: true },
                            APPEND: "fallback_timeout_limit_input_container"
                        }
                    }
                },
                FALLBACK_RETRIES_LIMIT: {
                    PREMIUM: true,
                    TYPE: "div",
                    ID: "fallback_retries_limit",
                    CLASS: "category",
                    HTML: `<h3>Fallback Retries</h3>`,
                    TOOLTIP: "How many times to retry a fallback request.",
                    AUDIO: { HOVER: true },
                    APPEND: "fallback_limits_container",
                    FALLBACK_RETRIES_LIMIT_INPUT_CONTAINER: {
                        TYPE: "div",
                        ID: "fallback_retries_limit_input_container",
                        CLASS: "container",
                        APPEND: "fallback_retries_limit",
                        FALLBACK_RETRIES_LIMIT_INPUT: {
                            TYPE: "input",
                            ID: "fallback_retries_limit_input",
                            CLASS: "input",
                            LIMITS: "number",
                            MIN: 1,
                            MAX: 10,
                            VALUE: SEARCH_PREFS.LIMITS.FALLBACK.RETRIES,
                            PLACEHOLDER: String(SEARCH_PREFS.LIMITS.FALLBACK.RETRIES),
                            AUDIO: { CLICK: true },
                            APPEND: "fallback_retries_limit_input_container"
                        }
                    }
                },
            },
        },
        //
        //
        // --> Search
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
            APPEND: "search",
            AUDIO: {
                HOVER: true,
                CLICK: true
            }
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
        },
        CLUSTER_CHANCE_SLIDER: {
            WRAPPER: {
                TYPE: "div",
                ID: "cluster_chance_wrapper",
                CLASS: "wrapper",
                APPEND: "cluster_chance_container"
            },
            FILL: {
                TYPE: "div",
                ID: "cluster_chance_fill",
                CLASS: "fill",
                APPEND: "cluster_chance_wrapper"
            }
        }
    },
    TOGGLE: {
        FILTERS_TOGGLE: {
            TOGGLER: {
                TYPE: "div",
                ID: "toggle_wrapper",
                CLASS: "toggler",
                TEXT: " ", // Apply dynamically
                APPEND: "filters"
            }
        }
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Interface ^