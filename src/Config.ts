/* 
════════════════╗
| CONFIGURATION
════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Stores general config details and variables.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// #region > Debug < 
// ━━━━┛ ▼ ┗━━━━
export const DEBUG = {
    ENABLED: false,
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
    CHARACTER_SET: {
        ALPHANUMERIC: "abcdefghijklmnopqrstuvwxyz0123456789",
        ALPHABETIC: "abcdefghijklmnopqrstuvwxyz",
        NUMERIC: "0123456789"
    },
    CHARACTER_TYPE: {
        VOWELS: "aeiou",
        CONSONANTS: "bcdfghjklmnpqrstvwxyz",
    }
}
export const RANDOM_MODE = {
    RANDOM: "raw", // Completely random
    PHONETIC: "phonetic", // Build words using phonetics
    SYLLABLE: "syllable" // Use syllable patterns
}
export const SEARCH_PREFS = {
    BASE: "https://www.",
    DOMAINS: {
        ".com": true,
        ".net": true,
        ".org": true,
        ".gov": true,
        ".edu": true,
        ".io": true,
        ".xyz": true,
        ".info": true,
        ".biz": true,
        ".co": true,
        ".gay": true,
        ".jp": true,
        ".co.uk": true,
        ".de": true,
    },
    CUSTOM: {
        LENGTH: {
            MIN: 3, // Clamp 1
            MAX: 12 // Clamp 63
        },
        RANDOM: RANDOM_MODE.PHONETIC,
        CLUSTER_CHANCE: 0.5,
        STOP_ON_FIRST: false,
        OPEN_ON_FIND: false,
        CHARACTERS: CHARACTERS.CHARACTER_SET.ALPHABETIC,
        INSERT: "random", // Can be dynamically set to "prefix" or "suffix"
    },
    LIMITS: {
        RETRIES: 100,
        TIMEOUT: 1000,
        FALLBACK: {
            TIMEOUT: 5000,
            RETRIES: 0,
        },
        BATCH: 10,
        BATCH_INTERVAL: 1000, // ms time between batches
        MAX_CONCURRENT_REQUESTS: 10
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Search ^
//
// --ι══════════════ι--
//
// #region > Audio <
//
// ━━━━┛ ▼ ┗━━━━
export const AUDIO = {
    MIXER: {
        MASTER: 1,
        MUSIC: 1,
        SFX: 1
    },
    RANDOM: {
        PITCH: {
            MIN: 0.9,
            MAX: 1.05
        },
        VOL: {
            MIN: 0.5,
            MAX: 0.75
        },
        START_TIME: {
            MIN: 0,
            MAX: 0.001
        }
    },
    BUFFER: {
        COUNT: 5
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Audio ^