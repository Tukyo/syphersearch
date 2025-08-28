/* 
═══════╗
| MAIN
═══════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Entry point for the application - Initializes interface and search process.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { DEBUG, PLUGINS, SEARCH_PREFS, STATE, USER } from './Config';
import { InterfaceInitEvents, ProgressEvents, ValidResultEvents } from './Events';
import { initInterface, setText, toggleTab, ui, updatePremium } from './Interface';
import { logBatchResults, throttle, check } from './Utils';
import { Dictionary } from './dict/Dictionary';
import { invalidResults, loadIndexedDB, resetAppState, saveSessionResult, sessionResults, timeoutQueue, validResults } from './Cache';
import { SessionResult } from './Defs';
import { generateRandomURL } from './Generation';
import { cloudSync, loadGlobalFavorites, loadGlobalSyrchers, login, syncENS } from './Database';

let c = {} as any;

// #region > Initialization <
// ----> EVENT INIT
InterfaceInitEvents.on(() => {
  if (DEBUG.ENABLED) {
    console.log("UI created:", ui);
  }

  PLUGINS.sypher.init({
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
      overrides: {
        decimals: 18,
        name: "Sypher",
        symbol: "SYPHER",
        totalSupply: PLUGINS.ethers.utils.parseUnits("1000000", 18),
        tokenPrice: 0.086728360992 //TODO: DELETE THIS TESTING ONLY!
      },
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
      console.log("Token:", c.token);
    }

    try {
      // Call login BEFORE mutating USER
      const dbUser = await login(c.user.address, c.user.ens);

      await new Promise(resolve => setTimeout(resolve, 100)); // Let IndexedDB operations complete

      if (tb != 0 && check(tb)) { STATE.PREMIUM = true; updatePremium(); }

      // Only update USER if login worked
      USER.address = c.user.address;
      USER.ens = c.user.ens || undefined;
      USER.ethBalance = c.user.ethBalance;
      USER.tokenBalance = c.user.tokenBalance;
      USER.value = c.user.value;

      if (DEBUG.ENABLED) {
        console.log("User:", USER);
      }

      await cloudSync(dbUser, c.user.address);
    } catch (err) {
      console.error("Login failed, USER not updated:", err);
    }
  })();
});
window.addEventListener("sypher:ens", (event) => {
    const ens = (event as CustomEvent).detail;
    USER.ens = ens;
    syncENS(ens);
});
window.addEventListener("sypher:disconnect", (event) => {
  resetAppState();
});
window.addEventListener("sypher:accountChange", (event) => {
  console.log("ACCOUNT CHANGE!!!!!!!!!!!!!!!!!!!!!!!!!");
  resetAppState();
});
// ----
//
// ----> CORE INIT
async function init() {
  initInterface();
  await loadIndexedDB();
  loadGlobalFavorites();
  loadGlobalSyrchers();
}
await init();
// ----
// #endregion ^ Initialization ^
//
// --ι══════════════ι--
//
// #region > Search <
//
// ━━━━┛ ▼ ┗━━━━
export async function search(): Promise<void> {
  if (STATE.SEARCHING) return;
  STATE.SEARCHING = true;
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
          if (!STATE.SEARCHING) {
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
            if (!STATE.SEARCHING) {
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
                STATE.SEARCHING = false;
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
  } finally {
    ProgressEvents.emit(1);
    STATE.SEARCHING = false;
    setText("searchButton", "Search");
  }
}
async function fetchWithTimeout(url: string, timeout: number, mode: RequestMode): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      mode: mode,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
export function cancelSearch(): void {
  if (DEBUG.ENABLED) console.log("🛑 Cancelling search process");

  clearQueue();
  STATE.SEARCHING = false;
  setText("searchButton", "Search");
}
export function clearQueue(): void {
  if (DEBUG.ENABLED) console.log("Clearing timeout queue");

  timeoutQueue.clear();
  STATE.PROCESSING_TIMEOUTS = false;
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
    const response = await fetchWithTimeout(url, SEARCH_PREFS.LIMITS.TIMEOUT, 'cors');

    const result: SessionResult = {
      url,
      valid: response.status < 400,
      status: response.status,
      timeStamp: Date.now(),
    };

    sessionResults.set(url, result);
    saveSessionResult({
      url,
      valid: result.valid,
      timestamp: result.timeStamp
    });


    if (result.valid) {
      validResults.set(url, result);
      ValidResultEvents.emit(url);
    } else {
      invalidResults.set(url, result);
    }

    return result.valid;
  } catch (error) {
    const result: SessionResult = {
      url,
      valid: false,
      timeStamp: Date.now(),
      reason: (error as Error)?.message || "unknown error",
    };

    sessionResults.set(url, result);
    invalidResults.set(url, result);
    saveSessionResult({
      url,
      valid: result.valid,
      timestamp: result.timeStamp
    });

    const errMsg = (error as Error)?.message || "";
    const isTimeout = errMsg.toLowerCase().includes("timeout") || errMsg.toLowerCase().includes("aborted") || (error as any)?.name === "AbortError";
    const retriesEnabled = SEARCH_PREFS.LIMITS.FALLBACK.RETRIES > 0;

    if (isTimeout && retriesEnabled) {
      timeoutQueue.add(url);
      processTimeoutQueue();
    }

    const fallbackSuccess = await fallback(url);

    // If fallback succeeded, update the cached result
    if (fallbackSuccess) {
      const updatedResult: SessionResult = {
        url,
        valid: true,
        timeStamp: Date.now(),
        reason: "recovered via fallback"
      };

      sessionResults.set(url, updatedResult);
      validResults.set(url, updatedResult);
      ValidResultEvents.emit(url);
      invalidResults.delete(url);

      saveSessionResult({
        url,
        valid: true,
        timestamp: updatedResult.timeStamp
      });
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
// #region > Fallback <
//
// ━━━━┛ ▼ ┗━━━━
async function fallback(url: string): Promise<boolean> {
  if (DEBUG.ENABLED && !DEBUG.QUIET) {
    console.log("🔄 Attempting fallback for:", url);
  }

  try {
    await fetch(url, {
      method: "GET",
      mode: "no-cors", // Attempt without cors
      redirect: "follow"
    });

    if (DEBUG.ENABLED && !DEBUG.QUIET) {
      console.log("✅ CORS bypass succeeded for:", url);
    }
    return true;
  } catch (error) {
    if (DEBUG.ENABLED && !DEBUG.QUIET) {
      console.log("❌ CORS bypass failed for:", url, error);
    }
    return false;
  }
}
async function processTimeoutQueue(): Promise<void> {
  if (STATE.PROCESSING_TIMEOUTS) return;
  STATE.PROCESSING_TIMEOUTS = true;

  const fallbackLimits = SEARCH_PREFS.LIMITS.FALLBACK;

  if (DEBUG.ENABLED) console.log("🕒 Starting background retry for timeouts");

  while (timeoutQueue.size > 0) {
    const url = [...timeoutQueue][0]; // get one (any order is fine)
    let success = false;

    for (let attempt = 1; attempt <= fallbackLimits.RETRIES; attempt++) {
      try {
        const response = await fetchWithTimeout(url, fallbackLimits.TIMEOUT, 'cors');

        const valid = response.status < 400;
        const redirected = getRoot(url) !== getRoot(response.url);

        if (valid && !redirected) {
          const result: SessionResult = {
            url,
            valid: true,
            status: response.status,
            timeStamp: Date.now(),
            reason: "recovered via background retry"
          };

          sessionResults.set(url, result);
          validResults.set(url, result);
          ValidResultEvents.emit(url);
          saveSessionResult({
            url,
            valid: result.valid,
            timestamp: result.timeStamp
          });
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
  STATE.PROCESSING_TIMEOUTS = false;
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Fallback ^
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