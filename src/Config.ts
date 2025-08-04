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
    QUIET: true
}
// ━━━━┛ ▲ ┗━━━━
// #endregion ^ Debug ^
//
// --ι══════════════ι--
//
// #region > Search <
//
// ━━━━┛ ▼ ┗━━━━
export const CHARACTERS = {
    CHARACTER_SETS: {
        ALPHANUMERIC: "abcdefghijklmnopqrstuvwxyz0123456789",
        ALPHABETIC: "abcdefghijklmnopqrstuvwxyz",
        NUMERIC: "0123456789",
        SPECIAL: "!@#$%^&*()-_=+[]{}|;:',.<>?/~`"
    },
    CHARACTER_TYPES: {
        VOWELS: "aeiou",
        CONSONANTS: "bcdfghjklmnpqrstvwxyz",
    }
}
export const RANDOM_MODE = {
    RAW: "raw", // Completely random
    PHONETIC: "phonetic", // Attempt to build words
    DICTIONARY: "dictionary" // TODO: Implement predefined dictionary
}
export const SEARCH_PREFS = {
    BASE: "https://www.",
    DOMAINS: [
        ".com",
        ".net",
        ".org",
        ".gov",
        ".edu",
        ".io",
        ".xyz",
        ".info",
        ".biz",
        ".co",
        ".gay",
        ".jp",
        ".co.uk",
        ".de",
    ],
    CUSTOM: {
        LENGTH: {
            MIN: 3,
            MAX: 12
        },
        RANDOM: RANDOM_MODE.PHONETIC,
        COMBINATION_WEIGHT: 0.5,
        STOP_ON_FIRST: false,
        OPEN_ON_FIND: false,
        CHARACTERS: CHARACTERS.CHARACTER_SETS.ALPHABETIC,
        INSERT: "random", // Can be dynamically set to "prefix" or "suffix"
    },
    LIMITS: {
        RETRIES: 1000,
        TIMEOUT: 1000,
        BATCH: 10,
        BUFFER: 1000 // ms time between batches
    }
}
export const PATTERNS = [
    // Short patterns (3-5 chars)
    { pattern: "cvc", weight: 15 }, //cat, dog, sun
    { pattern: "cvcc", weight: 12 }, //hand, wolf, park
    { pattern: "ccvc", weight: 8 }, //stop, plan, true
    { pattern: "cvcv", weight: 10 }, //hero, data, baby
    { pattern: "vcv", weight: 6 }, //age, ice, eye
    { pattern: "vcc", weight: 5 }, //and, end, old
    { pattern: "ccv", weight: 4 }, //sky, try, fly
    { pattern: "vccv", weight: 6 }, //also, into, open
    { pattern: "cvv", weight: 4 }, //sea, tea, zoo
    { pattern: "ccvv", weight: 3 }, //blue, true, free

    // Medium patterns (4-7 chars)
    { pattern: "cvcvc", weight: 20 }, //basic, magic, music
    { pattern: "cvccv", weight: 15 }, //apple, simple, table
    { pattern: "ccvcv", weight: 8 }, //drama, price, place
    { pattern: "cvcvv", weight: 5 }, //video, radio, piano
    { pattern: "vccvc", weight: 6 }, //under, after, other
    { pattern: "vcvcv", weight: 7 }, //again, above, about
    { pattern: "ccvcc", weight: 6 }, //block, plant, front
    { pattern: "cvccc", weight: 4 }, //world, first, worst
    { pattern: "ccccv", weight: 2 }, //street, strong
    { pattern: "vcvcc", weight: 5 }, //event, actor, order
    { pattern: "cvcvcc", weight: 8 }, //better, center, winter
    { pattern: "cvccvc", weight: 10 }, //market, garden, person

    // Longer patterns (6+ chars)
    { pattern: "cvcvcv", weight: 12 }, //banana, camera, canada
    { pattern: "cvccvcv", weight: 5 }, //fantastic, calendar
    { pattern: "cvcvcvc", weight: 8 }, //america, develop, computer
    { pattern: "vcvcvc", weight: 6 }, //elephant, umbrella
    { pattern: "cvcvcvv", weight: 4 }, //dangerous, beautiful
    { pattern: "ccvcvcv", weight: 5 }, //traveling, different
    { pattern: "vcvccvc", weight: 4 }, //important, understand
    { pattern: "cvcvccv", weight: 4 }, //remember, september
    { pattern: "ccvcvcc", weight: 3 }, //progress, connect
    { pattern: "cvcvcvcv", weight: 6 }, //absolutely, television
    { pattern: "vcvcvcv", weight: 4 }, //economy, democracy
    { pattern: "ccvcvcvc", weight: 3 }, //practical, specific
    { pattern: "cvcccvc", weight: 3 }, //children, standard
    { pattern: "cvccvcvc", weight: 4 }, //wonderful, political
    { pattern: "vcvcvcvc", weight: 3 }, //helicopter, refrigerator
    
    // Extra long patterns (8+ chars)
    { pattern: "cvcvcvcvc", weight: 3 }, //communication, organization
    { pattern: "ccvcvcvcv", weight: 2 }, //representative
    { pattern: "cvcvcvcvcv", weight: 2 }, //responsibility
    { pattern: "vcvcvcvcv", weight: 2 }, //international
]
export const COMBINATIONS = [
    // Common consonant clusters
    { pattern: "th", weight: 25 }, //the, think, both
    { pattern: "st", weight: 20 }, //stop, best, first
    { pattern: "ch", weight: 18 }, //child, much, beach
    { pattern: "sh", weight: 15 }, //show, fish, wish
    { pattern: "ng", weight: 15 }, //sing, long, thing
    { pattern: "nt", weight: 12 }, //want, front, point
    { pattern: "nd", weight: 12 }, //hand, kind, around
    { pattern: "ck", weight: 10 }, //back, check, quick
    { pattern: "ll", weight: 10 }, //call, well, tell
    { pattern: "ss", weight: 8 }, //class, less, kiss
    { pattern: "tt", weight: 6 }, //better, letter, little
    { pattern: "pp", weight: 5 }, //happy, apple, pepper
    { pattern: "ff", weight: 5 }, //off, stuff, coffee
    { pattern: "mm", weight: 4 }, //summer, hammer, common
    { pattern: "nn", weight: 4 }, //funny, dinner, cannot
    { pattern: "rr", weight: 3 }, //sorry, carry, mirror
    { pattern: "dd", weight: 3 }, //add, middle, sudden
    { pattern: "bb", weight: 2 }, //rabbit, hobby, bubble
    { pattern: "gg", weight: 2 }, //bigger, egg,agger
    
    // Common vowel combinations
    { pattern: "ee", weight: 12 }, //see, tree, free
    { pattern: "oo", weight: 10 }, //book, good, food
    { pattern: "ea", weight: 8 }, //sea, read, beach
    { pattern: "ou", weight: 8 }, //house, about, mouth
    { pattern: "ai", weight: 6 }, //main, rain, again
    { pattern: "ie", weight: 6 }, //piece, field, believe
    { pattern: "ue", weight: 4 }, //blue, true, value
    { pattern: "oa", weight: 4 }, //boat, road, soap
    { pattern: "au", weight: 3 }, //because, caught, laugh
    { pattern: "ei", weight: 3 }, //receive, eight, weight
    
    // Common consonant-vowel patterns
    { pattern: "er", weight: 20 }, //water, after, other
    { pattern: "re", weight: 15 }, //more, here, where
    { pattern: "or", weight: 12 }, //for, work, word
    { pattern: "ar", weight: 10 }, //car, part, start
    { pattern: "le", weight: 10 }, //table, people, little
    { pattern: "en", weight: 8 }, //when, then, open
    { pattern: "an", weight: 8 }, //man, can, plan
    { pattern: "on", weight: 6 }, //on, long, front
    { pattern: "in", weight: 6 }, //in, thing, begin
    { pattern: "al", weight: 6 }, //all, also, small
    { pattern: "ed", weight: 6 }, //asked, worked, played
    { pattern: "es", weight: 6 }, //yes, goes, comes
    { pattern: "ly", weight: 5 }, //only, really, family
    { pattern: "ty", weight: 4 }, //city, party, empty
    { pattern: "ny", weight: 3 }, //any, many, funny
]
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
        TABS: {
            TYPE: "div",
            ID: "tabs",
            CLASS: "container",
            APPEND: "home",
            OPTIONS_TAB: {
                TYPE: "div",
                ID: "options_tab",
                CLASS: "tab",
                HTML: `
                    <h3>Options</h3>
                `,
                APPEND: "tabs"
            },
            RESULTS_TAB: {
                TYPE: "div",
                ID: "results_tab",
                CLASS: "tab",
                HTML: `
                    <h3>Results</h3>
                `,
                APPEND: "tabs"
            }
        },
        MENU: {
            TYPE: "div",
            ID: "menu",
            CLASS: "container",
            HTML: `
                <h3>tehe</h3>
            `,
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
        CUSTOM_INPUT_CONTAINER: {
            TYPE: "div",
            ID: "custom_input_container",
            CLASS: "category",
            HTML: `
                <h3>Custom Word</h3>
            `,
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
            PLACEHOLDER: "Custom Word Entry...",
            TOOLTIP: "Enter a custom word to include in the search.",
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
                TOOLTIP: "Insert word at the beginning",
                TEXT: "Prefix",
                APPEND: "insert_container"
            },
            INSERT_SUFFIX: {
                TYPE: "div",
                ID: "insert_suffix",
                CLASS: "toggler",
                TOOLTIP: "Insert word at the end",
                TEXT: "Suffix",
                APPEND: "insert_container"
            },
            INSERT_RANDOM: {
                TYPE: "div",
                ID: "insert_random",
                CLASS: "toggler",
                TOOLTIP: "Insert word randomly",
                TEXT: "Random",
                APPEND: "insert_container"
            }
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