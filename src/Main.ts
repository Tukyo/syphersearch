/* 
═══════╗
| MAIN
═══════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Entry point for the application - Initializes interface and search process.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import axios from 'axios';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

import { DEBUG, SEARCH_PREFS } from './Config';
import { ProgressEvents } from './Events';
import { initInterface } from './Interface';
import { randomString, randomInt } from './Utils';

// #region > Initialization <
//
// ━━━━┛ ▼ ┗━━━━
initInterface();
export async function initSearch(): Promise<void> {
  const BATCH_SIZE = 50;
  let attempts = 0;

  if (DEBUG.ENABLED) {
    console.log("Starting search with preferences:", SEARCH_PREFS);
  }

  for (let i = 0; i < SEARCH_PREFS.LIMITS.RETRIES; i += BATCH_SIZE) {
    const batch = Array.from({ length: BATCH_SIZE }, () => {
      const domain = SEARCH_PREFS.DOMAINS[Math.floor(Math.random() * SEARCH_PREFS.DOMAINS.length)];
      const url = generateRandomURL(domain);
      if (DEBUG.ENABLED && !DEBUG.QUIET) {
        console.log(`Generated URL: ${url}`);
      }
      return { url, promise: checkUrl(url) };
    });

    const results = await Promise.all(batch.map(b => b.promise));
    attempts += BATCH_SIZE;

    if (DEBUG.ENABLED && !DEBUG.QUIET) {
      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} checked:`, results);
    }

    const percent = Math.min(attempts / SEARCH_PREFS.LIMITS.RETRIES, 1);
    ProgressEvents.emit(percent);

    const firstWorking = batch.find((b, idx) => results[idx]);
    if (firstWorking) {
      if (DEBUG.ENABLED) {
        console.log(`Found working URL: ${firstWorking.url}`);
      }
      ProgressEvents.emit(1); // instantly fill bar if hit early
      window.open(firstWorking.url, "_blank");
      return;
    }
  }
  if (DEBUG.ENABLED) {
    console.warn("No working URLs found after maximum retries.");
  }
  ProgressEvents.emit(1); // reached end
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Initialization ^
//
// --ι══════════════ι--
//
// #region > Optional Word Handling <
//
// ━━━━┛ ▼ ┗━━━━
let optionalWord: string | null = null;
function setOptionalWord(word: string) {
  if (DEBUG.ENABLED && word) {
    console.log(`Setting optional word: ${word}`);
  }
  optionalWord = word?.toLowerCase() || null;
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Optional Word Handling ^
//
// --ι══════════════ι--
//
// #region > Generation <
//
// ━━━━┛ ▼ ┗━━━━
function generateRandomURL(domain: string): string {
  const length = randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX);
  let randPart = SEARCH_PREFS.CUSTOM.RANDOM
    ? randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, length)
    : generateRealisticWord(length);

  if (optionalWord) {
    randPart = insertWordRandomly(randPart, optionalWord);
    if (DEBUG.ENABLED) {
      console.log(`Inserted optional word: ${optionalWord} into ${randPart}`);
    }
  }

  return `${SEARCH_PREFS.BASE}${randPart}${domain}`;
}
function generateRealisticWord(maxLength: number): string {
  const raw = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    length: 1,
    style: 'lowerCase'
  });

  let word = raw.replace(/[^a-z0-9]/gi, '');
  if (word.length > maxLength) return word.slice(0, maxLength);
  if (word.length < SEARCH_PREFS.CUSTOM.LENGTH.MIN) return word.padEnd(SEARCH_PREFS.CUSTOM.LENGTH.MIN, 'x');
  return word;
}
function insertWordRandomly(base: string, word: string): string {
  const pos = randomInt(0, base.length);
  return base.slice(0, pos) + word + base.slice(pos);
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Generation ^
//
// --ι══════════════ι--
//
// #region > URL Processing <
//
// ━━━━┛ ▼ ┗━━━━
function getRoot(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}
async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: SEARCH_PREFS.LIMITS.TIMEOUT,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const originalRoot = getRoot(url);
    const finalRoot = getRoot(response.request?.responseURL || url);

    if (DEBUG.ENABLED && !DEBUG.QUIET) {
      console.log(`↪️ Checked ${url} -> status: ${response.status}, final url: ${finalRoot}`);
    }
    
    if (originalRoot !== finalRoot) {
      if (DEBUG.ENABLED && !DEBUG.QUIET) {
        console.log(`↪️ Redirected to ${response.request?.responseURL}. Skipping.`);
      }      
      return false;
    }

    if (DEBUG.ENABLED) {
      console.log(`✔️ URL ${url} is valid.`);
    }

    return response.status < 400;
  } catch {
    return false;
  }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ URL Processing ^