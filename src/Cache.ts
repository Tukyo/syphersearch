/* 
══════════════╗
| CACHE
══════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Handles temporary runtime cache and local storage for search results.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { DEBUG, PLUGINS, STATE, USER } from "./Config";
import { CleanResults, SessionResult } from "./Defs";
import { ValidResultEvents } from "./Events";
import { clearResults, renderValidResult, updatePremium } from "./Interface";
import { cancelSearch } from "./Main";

// #region > Runtime Cache <
//
// ━━━━┛ ▼ ┗━━━━
/**
 * A Map to store session results temporarily during the application's runtime -
 * The primary use is to not allow duplicate results.
 * Hydrated on start from indexedDB.
 */
export const sessionResults: Map<string, SessionResult> = new Map();

/**
 * Stores successful (valid) session results.
 * Used to populate the Results tab during this session.
 */
export const validResults: Map<string, SessionResult> = new Map();

/**
 * Stores invalid session results (e.g., 404, 403, etc.).
 */
export const invalidResults: Map<string, SessionResult> = new Map();

/**
 * Timed out URLs that are currently being processed.
 */
export const timeoutQueue: Set<string> = new Set();

/**
 * Stores user favorites (valid URLs marked by the user).
 * Hydrated on start from backend.
 */
export const userFavorites: Set<string> = new Set();

/**
 * Stores user trash (valid URLs discarded by the user).
 * Hydrated on start from backend.
 */
export const userTrash: Set<string> = new Set();

/**
 * Stores perma-deleted urls that the user cleared from their cache.
 * Not hydrated from backend, used to filter the trash.
 */
export const userDeleted: Set<string> = new Set();

export function clearRuntimeCache(): void {
    sessionResults.clear();
    validResults.clear();
    // invalidResults.clear();
    timeoutQueue.clear();
    userFavorites.clear();
    userTrash.clear();
    userDeleted.clear();

    if (DEBUG.ENABLED) {
        console.log("Runtime cache refreshed...");
    }
}
function resetUserState(): void {
    USER.address = null;
    USER.ens = null;
    USER.ethBalance = null;
    USER.tokenBalance = null;
}
export function resetAppState(): void {
    if (STATE.SEARCHING || STATE.PROCESSING_TIMEOUTS) { cancelSearch(); }
    clearRuntimeCache();
    resetUserState();
    clearResults();

    STATE.PREMIUM = false;
    updatePremium();
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Runtime Cache ^
//
// --ι══════════════ι--
//
// #region > IndexedDB Cache <
//
// ━━━━┛ ▼ ┗━━━━
function getDB(address?: string): string {
    const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
    return checksumAddress ? checksumAddress : "guest";
}
function openLocalIndexedDB(address?: string): Promise<IDBDatabase> {
    const dbName = address
        ? `syrch_${getDB(address)}`   // only checksum if address is provided
        : "syrch_guest";         // otherwise plain guest DB

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(dbName, 1);

        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("sessionResults")) {
                db.createObjectStore("sessionResults");
            }
            if (!db.objectStoreNames.contains("favorites")) {
                db.createObjectStore("favorites");
            }
            if (!db.objectStoreNames.contains("trash")) {
                db.createObjectStore("trash");
            }
            if (!db.objectStoreNames.contains("deleted")) {
                db.createObjectStore("deleted");
            }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
async function processIndexTX(
    action: "save" | "delete",
    objectStore: "sessionResults" | "favorites" | "trash" | "deleted",
    url: string,
    data?: CleanResults
): Promise<void> {
    let db = null;

    const wallet = USER.address;
    if (wallet) {
        db = await openLocalIndexedDB(wallet);
    } else {
        db = await openLocalIndexedDB();
    }

    const tx = db.transaction(objectStore, "readwrite");
    const store = tx.objectStore(objectStore);

    if (action === "save") {
        if (objectStore === "sessionResults" && data) {
            store.put(data, data.url);
        } else {
            store.put(true, url);
        }
    } else if (action === "delete") {
        store.delete(url);
    }

    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
}
export async function saveSessionResult(data: CleanResults): Promise<void> {
    return processIndexTX("save", "sessionResults", data.url, data);
}
export async function removeSessionResult(url: string): Promise<void> {
    return processIndexTX("delete", "sessionResults", url);
}
export async function saveFavorite(url: string): Promise<void> {
    return processIndexTX("save", "favorites", url);
}
export async function removeFavorite(url: string): Promise<void> {
    return processIndexTX("delete", "favorites", url);
}
export async function saveTrash(url: string): Promise<void> {
    return processIndexTX("save", "trash", url);
}
export async function removeTrash(url: string): Promise<void> {
    return processIndexTX("delete", "trash", url);
}
export async function saveDeleted(url: string): Promise<void> {
    return processIndexTX("save", "deleted", url);
}
export async function removeDeleted(url: string): Promise<void> {
    return processIndexTX("delete", "deleted", url);
}
export async function loadIndexedDB(address?: string): Promise<void> {
    const db = await openLocalIndexedDB(address);

    if (DEBUG.ENABLED) {
        console.log(`Loading IndexedDB for address: ${address || "guest"}`);
    }

    const deletedReq = db.transaction("deleted", "readonly")
        .objectStore("deleted").getAllKeys();

    const resultsReq = db.transaction("sessionResults", "readonly")
        .objectStore("sessionResults").getAll();

    const favReq = db.transaction("favorites", "readonly")
        .objectStore("favorites").getAllKeys();

    const trashReq = db.transaction("trash", "readonly")
        .objectStore("trash").getAllKeys();

    return new Promise((resolve, reject) => {
        deletedReq.onsuccess = () => {
            for (const url of deletedReq.result as string[]) {
                userDeleted.add(url);
            }
        };

        resultsReq.onsuccess = () => {
            const results = resultsReq.result as CleanResults[];
            for (const r of results) {
                if (userDeleted.has(r.url)) continue;

                const sessionResult: SessionResult = {
                    url: r.url,
                    valid: r.valid,
                    timeStamp: r.timestamp
                };
                sessionResults.set(r.url, sessionResult);

                if (r.valid) {
                    if (!userFavorites.has(r.url) && !userTrash.has(r.url)) {
                        validResults.set(r.url, sessionResult);
                        ValidResultEvents.emit(r.url);
                    }
                }
                else {
                    invalidResults.set(r.url, sessionResult);
                }
            }
        };

        favReq.onsuccess = () => {
            for (const url of favReq.result as string[]) {
                if (userDeleted.has(url)) continue;
                userFavorites.add(url);
                renderValidResult(url, "favorites_container");
            }
        };

        trashReq.onsuccess = () => {
            for (const url of trashReq.result as string[]) {
                if (userDeleted.has(url)) continue;
                userTrash.add(url);
                renderValidResult(url, "trash_bin_container");
            }
        };

        resultsReq.onerror =
            favReq.onerror =
            trashReq.onerror =
            deletedReq.onerror = () => reject();

        db.close();
        resolve();
    });
}
export async function migrateGuestCache(wallet: string): Promise<void> {
    const guestDB = await openLocalIndexedDB(); // guest
    const walletDB = await openLocalIndexedDB(wallet);

    const stores = ["sessionResults", "favorites", "trash", "deleted"] as const;

    for (const storeName of stores) {
        const guestTx = guestDB.transaction(storeName, "readonly");
        const guestStore = guestTx.objectStore(storeName);

        const all = await new Promise<any[]>((res, rej) => {
            const req = (storeName === "sessionResults")
                ? guestStore.getAll()
                : guestStore.getAllKeys();
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
        });

        const walletTx = walletDB.transaction(storeName, "readwrite");
        const walletStore = walletTx.objectStore(storeName);
        for (const item of all) {
            if (storeName === "sessionResults") {
                walletStore.put(item, item.url);
            } else {
                walletStore.put(true, item as string);
            }
        }
    }

    for (const storeName of stores) {
        const clearTx = guestDB.transaction(storeName, "readwrite");
        clearTx.objectStore(storeName).clear();
    }

    guestDB.close();
    walletDB.close();
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ IndexedDB Cache ^