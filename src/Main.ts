/* 
═══════╗
| MAIN
═══════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Entry point for the application - Initializes interface and search process.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import axios, { AxiosError } from 'axios';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

import { CHARACTERS, COMBINATIONS, DEBUG, PATTERNS, RANDOM_MODE, SEARCH_PREFS } from './Config';
import { ProgressEvents, ValidResultEvents } from './Events';
import { initInterface, setText, toggleTab, ui } from './Interface';
import { randomString, randomInt, logBatchResults } from './Utils';
import { dict, Dictionary } from './dict/Dictionary';
import { redirectedResults, sessionResults, validResults } from './Cache';
import { SessionResult } from './Defs';

export const state = {
  isSearching: false
}

// #region > Entrypoint <
//
// ━━━━┛ ▼ ┗━━━━
initInterface();
export async function search(): Promise<void> {
  if (state.isSearching) return;
  state.isSearching = true;
  setText("searchButton", "Cancel");

  let attempts = 0;
  let progress = 0;

  if (DEBUG.ENABLED) {
    console.log("Starting search with preferences:", SEARCH_PREFS);
  }

  // 🟡 Start fake ticking
  const progressTimer = setInterval(() => {
    if (progress < 1) {
      progress += 0.005; // smooth visual feel
      ProgressEvents.emit(progress);
    }
  }, 500);

  try {
    const globalBatchSet = new Set<string>();
    const batchPromises = [];

    for (let i = 0; i < SEARCH_PREFS.LIMITS.RETRIES; i += SEARCH_PREFS.LIMITS.BATCH) {
      // Create delay for rolling batches (first batch starts immediately)
      const batchDelay = i === 0 ? 0 : SEARCH_PREFS.LIMITS.BUFFER;

      const batchPromise = new Promise<void>(resolve => {
        setTimeout(async () => {
          if (!state.isSearching) {
            resolve();
            return;
          }

          const batchSet = new Set<string>();
          const batch: { url: string; promise: Promise<boolean> }[] = [];

          while (batch.length < SEARCH_PREFS.LIMITS.BATCH) {
            const domain = SEARCH_PREFS.DOMAINS[Math.floor(Math.random() * SEARCH_PREFS.DOMAINS.length)];
            const url = generateRandomURL(domain);

            if (!batchSet.has(url) && !sessionResults.has(url) && !globalBatchSet.has(url)) {
              batchSet.add(url);
              globalBatchSet.add(url);
              batch.push({ url, promise: checkUrl(url) });
            }
          }

          const batchIndex = Math.floor(i / SEARCH_PREFS.LIMITS.BATCH) + 1;

          try {
            const results = await Promise.all(batch.map(b => b.promise));

            // 🛑 Check again AFTER batch completes
            if (!state.isSearching) {
              resolve();
              return;
            }

            attempts += SEARCH_PREFS.LIMITS.BATCH;

            if (DEBUG.ENABLED) {
              logBatchResults(batchIndex, batch);
            }

            progress = Math.max(progress, attempts / SEARCH_PREFS.LIMITS.RETRIES);
            ProgressEvents.emit(progress);

            const workingBatch = batch.filter((b, idx) => results[idx]);
            if (workingBatch.length > 0) {
              if (DEBUG.ENABLED) {
                console.log(`✅ Found ${workingBatch.length} valid URLs in batch ${batchIndex}`);
              }

              toggleTab(ui.resultsTab);

              if (SEARCH_PREFS.CUSTOM.OPEN_ON_FIND) {
                for (const { url } of workingBatch) {
                  window.open(url, "_blank");
                }
              }

              if (SEARCH_PREFS.CUSTOM.STOP_ON_FIRST) {
                state.isSearching = false;
              }
            }
          } catch (error) {
            if (DEBUG.ENABLED) {
              console.error(`Error in batch ${batchIndex}:`, error);
            }
          }

          resolve();
        }, batchDelay);
      });

      batchPromises.push(batchPromise);
    }

    await Promise.all(batchPromises);

    if (DEBUG.ENABLED && state.isSearching) {
      console.warn("No working URLs found after maximum retries.");
    }
  } finally {
    clearInterval(progressTimer);
    ProgressEvents.emit(1);
    state.isSearching = false;
    setText("searchButton", "Search");
  }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Entrypoint ^
//
// --ι══════════════ι--
//
// #region > Optional Word Handling <
//
// ━━━━┛ ▼ ┗━━━━
let customWord: string | null = null;
function getCustomWord(): string | null {
  const input = ui.customInput as HTMLInputElement;
  const word = input?.value.trim();

  if (DEBUG.ENABLED && word) {
    console.log(`Getting custom word: ${word}`);
  }

  customWord = word || null;
  return word ? word.toLowerCase() : null;
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
  const selected = getSelectedFilters();
  const length = randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX);

  let randPart = "";

  if (selected.length === 0) {
    // fallback
    switch (SEARCH_PREFS.CUSTOM.RANDOM) {
      case RANDOM_MODE.RAW:
        randPart = randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, length);
        break;
      case RANDOM_MODE.PHONETIC:
        randPart = generatePhoneticWord(length);
        break;
      case RANDOM_MODE.DICTIONARY:
        randPart = generateRealisticWord(length);
        break;
    }
  } else {
    // build from selected filters
    const parts: string[] = [];
    for (const [group, key] of selected) {
      const entry = dict[group][key];
      const wordList = getWordList(entry);

      if (wordList.length > 0) {
        const word = wordList[Math.floor(Math.random() * wordList.length)];
        parts.push(word.toLowerCase());

        if (DEBUG.ENABLED && !DEBUG.QUIET) {
          console.log(`[${group}.${key}] → Sample: "${word}" (${wordList.length} words)`);
        }
      } else if (DEBUG.ENABLED) {
        console.warn(`[${group}.${key}] → No usable word list.`);
      }
    }
    randPart = parts.join("");
    if (randPart.length > length) randPart = randPart.slice(0, length);
  }

  // insert custom word if applicable
  if (!customWord) customWord = getCustomWord();
  if (customWord) {
    switch (SEARCH_PREFS.CUSTOM.INSERT) {
      case "prefix":
        randPart = customWord + randPart;
        break;
      case "suffix":
        randPart = randPart + customWord;
        break;
      default:
        randPart = insertWordRandomly(randPart, customWord);
    }

    // if (DEBUG.ENABLED) {
    //   console.log(`Inserted optional word: ${customWord} into ${randPart}`);
    // }
  }

  let finalUrl = `${SEARCH_PREFS.BASE}${randPart}${domain}`;

  // 🔁 Ensure this URL hasn't been searched before in session
  let maxRetries = 5;
  while (sessionResults.has(finalUrl) && maxRetries-- > 0) {
    randPart = SEARCH_PREFS.CUSTOM.RANDOM
      ? randomString(SEARCH_PREFS.CUSTOM.CHARACTERS, randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX))
      : generateRealisticWord(randomInt(SEARCH_PREFS.CUSTOM.LENGTH.MIN, SEARCH_PREFS.CUSTOM.LENGTH.MAX));

    if (customWord) {
      switch (SEARCH_PREFS.CUSTOM.INSERT) {
        case "prefix":
          randPart = customWord + randPart;
          break;
        case "suffix":
          randPart = randPart + customWord;
          break;
        default:
          randPart = insertWordRandomly(randPart, customWord);
      }
    }

    finalUrl = `${SEARCH_PREFS.BASE}${randPart}${domain}`;
  }

  return finalUrl;
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
function generatePhoneticWord(maxLength: number): string {
  const vowels = CHARACTERS.CHARACTER_TYPES.VOWELS;
  const consonants = CHARACTERS.CHARACTER_TYPES.CONSONANTS;
  const minLength = SEARCH_PREFS.CUSTOM.LENGTH.MIN;

  // 30% chance to use combination-based generation
  if (Math.random() < SEARCH_PREFS.CUSTOM.COMBINATION_WEIGHT) {
    return generateWithCombinations(maxLength, minLength);
  }

  // 70% chance to use pattern-based generation with combination enhancements
  return generateWithEnhancedPatterns(maxLength, minLength, vowels, consonants);
}
function generateWithCombinations(maxLength: number, minLength: number): string {
  let word = "";
  const usedCombinations = new Set<string>();

  while (word.length < maxLength && word.length < minLength + 4) {
    // Get valid combinations that fit
    const validCombos = COMBINATIONS.filter(combo =>
      combo.pattern.length <= (maxLength - word.length) &&
      !usedCombinations.has(combo.pattern)
    );

    if (validCombos.length === 0) break;

    // Weighted selection
    const totalWeight = validCombos.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;

    for (const combo of validCombos) {
      random -= combo.weight;
      if (random <= 0) {
        word += combo.pattern;
        usedCombinations.add(combo.pattern);
        break;
      }
    }
  }

  // Ensure minimum length
  while (word.length < minLength) {
    const vowels = CHARACTERS.CHARACTER_TYPES.VOWELS;
    word += vowels[Math.floor(Math.random() * vowels.length)];
  }

  return word.slice(0, maxLength);
}

function generateWithEnhancedPatterns(maxLength: number, minLength: number, vowels: string, consonants: string): string {
  // Filter valid patterns
  const validPatterns = PATTERNS.filter(p =>
    p.pattern.length >= minLength && p.pattern.length <= maxLength
  );

  if (validPatterns.length === 0) {
    return generateFallbackPattern(maxLength, minLength, vowels, consonants);
  }

  // Select pattern using weights
  const totalWeight = validPatterns.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;

  let selectedPattern = validPatterns[0].pattern;
  for (const patternObj of validPatterns) {
    random -= patternObj.weight;
    if (random <= 0) {
      selectedPattern = patternObj.pattern;
      break;
    }
  }

  return buildEnhancedWordFromPattern(selectedPattern, vowels, consonants);
}

function buildEnhancedWordFromPattern(pattern: string, vowels: string, consonants: string): string {
  let word = "";

  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    const nextChar = pattern[i + 1];

    if (char === 'c') {
      // 20% chance to use a common combination if it fits the pattern
      if (nextChar && Math.random() < 0.2) {
        const validCombos = COMBINATIONS.filter(combo =>
          combo.pattern.length === 2 &&
          i + 1 < pattern.length &&
          ((char === 'c' && nextChar === 'c') ||
            (char === 'c' && nextChar === 'v'))
        );

        if (validCombos.length > 0) {
          const combo = validCombos[Math.floor(Math.random() * validCombos.length)];
          word += combo.pattern;
          i++; // Skip next character since we used a 2-char combination
          continue;
        }
      }

      word += consonants[Math.floor(Math.random() * consonants.length)];
    } else if (char === 'v') {
      // 15% chance to use vowel combinations
      if (nextChar === 'v' && Math.random() < 0.15) {
        const vowelCombos = COMBINATIONS.filter(combo =>
          combo.pattern.length === 2 &&
          /^[aeiou]{2}$/.test(combo.pattern)
        );

        if (vowelCombos.length > 0) {
          const combo = vowelCombos[Math.floor(Math.random() * vowelCombos.length)];
          word += combo.pattern;
          i++; // Skip next character
          continue;
        }
      }

      word += vowels[Math.floor(Math.random() * vowels.length)];
    }
  }

  return word;
}

function generateFallbackPattern(maxLength: number, minLength: number, vowels: string, consonants: string): string {
  let pattern = "";
  let useConsonant = true;

  for (let i = 0; i < Math.min(maxLength, Math.max(minLength, 4)); i++) {
    pattern += useConsonant ? "c" : "v";
    useConsonant = !useConsonant;
  }

  return buildEnhancedWordFromPattern(pattern, vowels, consonants);
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
  // 🧠 Check runtime cache
  if (sessionResults.has(url)) {
    if (DEBUG.ENABLED) {
      console.log(`🔁 Using cached result for ${url}`);
    }
    return sessionResults.get(url)!.valid;
  }

  try {
    const response = await axios.head(url, {
      timeout: SEARCH_PREFS.LIMITS.TIMEOUT,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    const originalRoot = getRoot(url);
    const finalRoot = getRoot(response.request?.responseURL || url);
    const redirected = originalRoot !== finalRoot;

    const result: SessionResult = {
      url,
      valid: !redirected && response.status < 400,
      status: response.status,
      redirectedTo: redirected ? finalRoot : undefined,
      checkedAt: Date.now(),
    };

    sessionResults.set(url, result);

    if (result.valid) {
      validResults.set(url, result);
      ValidResultEvents.emit(url);
    } else if (redirected) {
      redirectedResults.set(url, result);
    }

    return result.valid;
  } catch (error) {
    const result: SessionResult = {
      url,
      valid: false,
      checkedAt: Date.now(),
      reason: (error as AxiosError)?.message || "unknown error",
    };

    sessionResults.set(url, result);

    const fallbackSuccess = await fallback(error, url);

    // If fallback succeeded, update the cached result
    if (fallbackSuccess) {
      const updatedResult: SessionResult = {
        url,
        valid: true,
        checkedAt: Date.now(),
        reason: "recovered via fallback"
      };

      sessionResults.set(url, updatedResult);
      validResults.set(url, updatedResult);
      ValidResultEvents.emit(url);
    }

    return fallbackSuccess;
  }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ URL Processing ^
//
// --ι══════════════ι--
//
// #region > Fallbacks <
//
// ━━━━┛ ▼ ┗━━━━
async function fallback(error: unknown, url: string): Promise<boolean> {
  const err = error as AxiosError;
  const message = (err?.message || "").toLowerCase();
  const code = err?.code || "";

  // CORS error or failure on 200
  if (message.includes("cors") || message.includes("err_failed")) {
    return await corsImageCheck(url);
  }

  // DNS resolution failure
  if (message.includes("name_not_resolved")) {
    return false; // skip completely, domain doesn't exist
  }

  // SSL certificate problems
  if (
    message.includes("ssl") ||
    message.includes("cert") ||
    message.includes("cipher") ||
    message.includes("protocol")
  ) {
    return false;
  }

  // Redirects to 405, 302, etc. that might block HEAD
  if (
    message.includes("405") ||
    message.includes("redirect") ||
    message.includes("302") ||
    message.includes("301")
  ) {
    return await tryGetInstead(url);
  }

  // Timeout case
  if (code === "ECONNABORTED" || message.includes("timeout")) {
    return await retryWithLongerTimeout(url);
  }

  return false; // Default fallback
}
async function corsImageCheck(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const timeout = setTimeout(() => resolve(false), 3000);
    img.onload = () => { clearTimeout(timeout); resolve(true); };
    img.onerror = () => { clearTimeout(timeout); resolve(false); };
    img.src = url;
  });
}
async function tryGetInstead(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "no-cors",
    });
    // no way to inspect response due to no-cors, so fallback to image
    return await corsImageCheck(url);
  } catch {
    return false;
  }
}
async function retryWithLongerTimeout(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 3000,
      maxRedirects: 2,
      validateStatus: () => true,
    });

    if (response.status < 400) {
      if (DEBUG.ENABLED) console.log(`⏱️ Recovered after timeout: ${url}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Fallbacks ^
//
// --ι══════════════ι--
//
// #region > Filters <
function getSelectedFilters(): [keyof Dictionary, keyof Dictionary[keyof Dictionary]][] {
  const selected: [keyof Dictionary, keyof Dictionary[keyof Dictionary]][] = [];

  document.querySelectorAll(".toggler.active").forEach(el => {
    const group = el.getAttribute("data-group") as keyof Dictionary;
    const key = el.getAttribute("data-key") as keyof Dictionary[keyof Dictionary];
    if (group && key) selected.push([group, key]);
  });

  return selected;
}
function getWordList(entry: any): string[] {
  if (Array.isArray(entry)) return entry;

  if (typeof entry === 'object' && entry !== null) {
    for (const value of Object.values(entry)) {
      if (Array.isArray(value)) return value;
    }
  }

  return [];
}
//
// ━━━━┛ ▲ ┗━━━━
// #endregion ^ Filters ^