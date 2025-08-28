/* 
════════════════╗
| CONFIGURATION
════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Stores general config details and variables.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// #region > App <
export const USER = {
    address: null,
    ens: null,
    ethBalance: null,
    tokenBalance: null,
    value: null
}
export const STATE = {
  SEARCHING: false,
  PROCESSING_TIMEOUTS: false,
  PREMIUM: false
};
export const PLUGINS = {
  ethers: (window as any).ethers,
  sypher: (window as any).sypher,
  particles: (window as any).pJSDom
}
// #endregion ^ App ^
//
// --ι══════════════ι--
//
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
        ".net": false,
        ".org": false,
        ".gov": false,
        ".edu": false,
        ".io": false,
        ".xyz": false,
        ".info": false,
        ".biz": false,
        ".co": false,
        ".gay": false,
        ".jp": false,
        ".co.uk": false,
        ".de": false,
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
        RETRIES: 10,
        TIMEOUT: 1000,
        FALLBACK: {
            TIMEOUT: 5000,
            RETRIES: 0,
        },
        BATCH: 5,
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