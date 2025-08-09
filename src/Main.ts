/* 
═══════╗
| MAIN
═══════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Entry point for the application - Initializes interface and search process.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import axios, { AxiosError } from 'axios';

import { DEBUG, SEARCH_PREFS } from './Config';
import { InterfaceInitEvents, ProgressEvents, ValidResultEvents } from './Events';
import { initInterface, setText, toggleTab, ui, updatePremium } from './Interface';
import { logBatchResults, throttle, check } from './Utils';
import { Dictionary } from './dict/Dictionary';
import { invalidResults, redirectedResults, sessionResults, timeoutQueue, validResults } from './Cache';
import { SessionResult } from './Defs';
import { generateRandomURL } from './Generation';

export const state = {
  isSearching: false,
  isProcessingTimeouts: false,
  isPremium: false
};

export const plugins = {
  ethers: (window as any).ethers,
  sypher: (window as any).sypher
}

let c = {} as any;

// #region > Initialization <
InterfaceInitEvents.on(() => {
  if (DEBUG.ENABLED) {
    console.log("UI created:", ui);
  }

  plugins.sypher.init({
    interface: {
      button: {
        type: "connect",
        text: "Login",
        modal: true,
        append: ui.header
      }
    },
    crypto: {
      chain: "base",
      contractAddress: "0x21b9D428EB20FA075A29d51813E57BAb85406620",
      poolAddress: "0xB0fbaa5c7D28B33Ac18D9861D4909396c1B8029b",
      pairAddress: "0x4200000000000000000000000000000000000006",
      version: "V3",
      icon: "https://github.com/Tukyo/sypherbot-public/blob/main/assets/img/botpic.png?raw=true"
    }
  });
});

window.addEventListener('sypher:initCrypto', function (event) {
  (async () => {
    c = (event as CustomEvent).detail;
    let tb = c.user.tokenBalance;

    if (DEBUG.ENABLED) {
      console.log("Crypto:", c);
    }

    if (check(tb)) { state.isPremium = true;  updatePremium(); }
  })();
});

initInterface();
// #endregion ^ Initialization ^
//
// --ι══════════════ι--
//
// #region > Search <
//
// ━━━━┛ ▼ ┗━━━━
export async function search(): Promise<void> {
  if (state.isSearching) return;
  state.isSearching = true;
  setText("searchButton", "Cancel");

  clearQueue();

  let attempts = 0;
  let progress = 0;

  if (DEBUG.ENABLED) {
    console.log("Starting search with preferences:", SEARCH_PREFS);
  }

  try {
    const globalBatchSet = new Set<string>();
    const batchPromises = [];

    for (let i = 0; i < SEARCH_PREFS.LIMITS.RETRIES; i += SEARCH_PREFS.LIMITS.BATCH) {
      // Create delay for rolling batches (first batch starts immediately)
      const batchDelay = i === 0 ? 0 : SEARCH_PREFS.LIMITS.BATCH_INTERVAL;

      const batchPromise = new Promise<void>(resolve => {
        setTimeout(async () => {
          if (!state.isSearching) {
            resolve();
            return;
          }

          const batchSet = new Set<string>();
          const batch: { url: string; promise: Promise<boolean> }[] = [];

          while (batch.length < SEARCH_PREFS.LIMITS.BATCH) {
            const enabledDomains = Object.entries(SEARCH_PREFS.DOMAINS)
              .filter(([, isEnabled]) => isEnabled)
              .map(([domain]) => domain);

            if (enabledDomains.length === 0) {
              throw new Error("No domains are enabled. Please select at least one.");
            }

            const domain = enabledDomains[Math.floor(Math.random() * enabledDomains.length)];

            const url = generateRandomURL(domain);

            if (!batchSet.has(url) && !sessionResults.has(url) && !globalBatchSet.has(url)) {
              batchSet.add(url);
              globalBatchSet.add(url);
              batch.push({ url, promise: throttle(() => checkUrl(url)) });
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
    ProgressEvents.emit(1);
    state.isSearching = false;
    setText("searchButton", "Search");
  }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Search ^
//
// --ι══════════════ι--
//
// #region > URL Processing <
//
// ━━━━┛ ▼ ┗━━━━
/**
 * Extracts the root domain from a URL.
 */
function getRoot(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}
async function checkUrl(url: string): Promise<boolean> {
  // Check runtime cache
  // 
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
    } else {
      invalidResults.set(url, result);
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
    invalidResults.set(url, result);

    const errMsg = (error as AxiosError)?.message || "";
    const isTimeout = errMsg.toLowerCase().includes("timeout") || (error as AxiosError)?.code === "ECONNABORTED";

    if (isTimeout) {
      timeoutQueue.add(url);
      processTimeoutQueue();
    }

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
      invalidResults.delete(url);
    }

    return fallbackSuccess;
  }
}
export function cancelSearch(): void {
  if (DEBUG.ENABLED) console.log("🛑 Cancelling search process");

  clearQueue();
  state.isSearching = false;
  setText("searchButton", "Search");
}
export function clearQueue(): void {
  if (DEBUG.ENABLED) console.log("Clearing timeout queue");

  timeoutQueue.clear();
  state.isProcessingTimeouts = false;
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
async function processTimeoutQueue(): Promise<void> {
  if (state.isProcessingTimeouts) return;
  state.isProcessingTimeouts = true;

  const fallbackLimits = SEARCH_PREFS.LIMITS.FALLBACK;

  if (DEBUG.ENABLED) console.log("🕒 Starting background retry for timeouts");

  while (timeoutQueue.size > 0) {
    const url = [...timeoutQueue][0]; // get one (any order is fine)
    let success = false;

    for (let attempt = 1; attempt <= fallbackLimits.RETRIES; attempt++) {
      try {
        const response = await axios.head(url, {
          timeout: fallbackLimits.TIMEOUT,
          maxRedirects: 2,
          validateStatus: () => true
        });

        const valid = response.status < 400;
        const redirected = getRoot(url) !== getRoot(response.request?.responseURL || url);

        if (valid && !redirected) {
          const result: SessionResult = {
            url,
            valid: true,
            status: response.status,
            checkedAt: Date.now(),
            reason: "recovered via background retry"
          };

          sessionResults.set(url, result);
          validResults.set(url, result);
          ValidResultEvents.emit(url);
          success = true;
          break;
        }
      } catch {
        // Silent fail, just retry
      }

      await new Promise(r => setTimeout(r, 50)); // short delay between retries
    }

    timeoutQueue.delete(url);

    if (DEBUG.ENABLED) {
      console.log(`🧪 Retried: ${url} → ${success ? "✅ success" : "❌ failed"}`);
    }
  }

  if (DEBUG.ENABLED) console.log("✅ Timeout queue cleared.");
  state.isProcessingTimeouts = false;
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Fallbacks ^
//
// --ι══════════════ι--
//
// #region > Filters <
export function getSelectedFilters(): [keyof Dictionary, keyof Dictionary[keyof Dictionary]][] {
  const selected: [keyof Dictionary, keyof Dictionary[keyof Dictionary]][] = [];

  const container = document.getElementById("filters_container"); // or use ui.filters if cleaner
  if (!container) return selected;

  container.querySelectorAll(".toggler.active").forEach(el => {
    const group = el.getAttribute("data-group") as keyof Dictionary;
    const key = el.getAttribute("data-key") as keyof Dictionary[keyof Dictionary];

    if (group && key) {
      selected.push([group, key]);
    }
  });

  return selected;
}
export function getWordList(entry: any): string[] {
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