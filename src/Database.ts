/* 
═══════════╗
| DATABASE
═══════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Handles backend communication from frontend.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { USER, DEBUG, PLUGINS } from "./Config";
import { DBResult, DBUser, GlobalResult } from "./Defs";
import { loadIndexedDB, migrateGuestCache, resetAppState, saveFavorite, saveTrash, userFavorites, userTrash } from "./Cache";
import { renderValidResult, ui } from "./Interface";
import { sanatizeURL } from "./Utils";

// #region > Initialization <
const firebaseConfig = {
    apiKey: "AIzaSyAdeL4DWDYsgIRj6x7n5vDtmcptlSf_rpg",
    authDomain: "syrch-1dd39.firebaseapp.com",
    projectId: "syrch-1dd39",
    storageBucket: "syrch-1dd39.firebasestorage.app",
    messagingSenderId: "986491950281",
    appId: "1:986491950281:web:a8c5c1fe421e1238fe2918",
    measurementId: "G-C1YP0PW2FL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
// #endregion ^ Initialization ^
//
// --ι══════════════ι--
//
// #region > Database Functions <
export async function login(address: string, ens?: string): Promise<DBUser> {
    if (!address) {
        throw new Error("No wallet connected. Address is null.");
    }

    resetAppState();

    const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
    const ref = doc(db, "users", checksumAddress);
    const snap = await getDoc(ref);
    if (DEBUG.ENABLED) {
        console.log(`[DATABASE-READ] Checking user: ${checksumAddress}`);
    }

    if (snap.exists()) {
        const user = snap.data() as DBUser;

        await loadIndexedDB(address);

        if (ens && user.ens !== ens) {
            await updateDoc(ref, { ens });
            if (DEBUG.ENABLED) console.log(`[DATABASE-WRITE] ENS updated for ${PLUGINS.sypher.truncate(checksumAddress)}: ${ens}`);
        }

        if (DEBUG.ENABLED) console.log(`User found: ${PLUGINS.sypher.truncate(checksumAddress)}`, user);
        return user;
    } else {
        return createAccount(ref, checksumAddress, ens);
    }
}
async function createAccount(ref: DocumentReference, address: string, ens?: string): Promise<DBUser> {
    const newUser: DBUser = { // Create new default account, and store anything the user already did before creation
        created: Date.now(),
        ens: ens ?? null,
        favorites: Array.from(userFavorites),
        karma: 0, // Default karma
        trash: Array.from(userTrash),
    };

    await setDoc(ref, newUser);
    if (DEBUG.ENABLED) { console.log(`[DATABASE-WRITE] New user created: ${address}`, newUser); }

    await migrateGuestCache(address);
    resetAppState();
    await loadIndexedDB(address);

    return newUser;
}
export async function updateUser(syncGlobal: boolean, address?: string, data?: Omit<DBUser, "created">): Promise<void> {
    if (!address) {
        if (USER.address) { address = USER.address; }
        else { throw new Error("No user address set. Cannot update user."); }
    }

    if (!data) {
        const karma = await syncKarma(address);
        data = {
            favorites: Array.from(userFavorites),
            trash: Array.from(userTrash),
            ens: USER.ens ?? null,
            karma: karma
        };
    }

    const hasData = !!(data.favorites?.length || data.trash?.length);
    if (!hasData) {
        if (DEBUG.ENABLED) {
            console.log(`Local state is empty for user ${PLUGINS.sypher.truncate(address)}...`);
        }
    }

    const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
    const ref = doc(db, "users", checksumAddress);
    await setDoc(ref, data, { merge: true });

    if (DEBUG.ENABLED) { console.log(`[DATABASE-WRITE] User updated in DB: ${PLUGINS.sypher.truncate(checksumAddress)}`, data); }

    if (syncGlobal) { syncGlobalFavorites(); }
}
export async function cloudSync(dbUser: DBUser, address: string): Promise<void> {
    const localFavCount = userFavorites.size;
    const localTrashCount = userTrash.size;
    const hasCloud = (dbUser.favorites?.length || 0) > 0 || (dbUser.trash?.length || 0) > 0;

    console.log(`Cloud Sync Check for ${address}: Local Favorites = ${localFavCount}, Local Trash = ${localTrashCount}, Cloud Data Present = ${hasCloud}`);

    // Case A: Local has state → push local to cloud
    if (localFavCount > 0 || localTrashCount > 0) {
        const karma = await syncKarma(address);
        await updateUser(false, address, {
            favorites: Array.from(userFavorites),
            trash: Array.from(userTrash),
            ens: USER.ens ?? null,
            karma: karma
        });
        await syncGlobalFavorites();
        return;
    } else if (hasCloud) {
        // Case B: Local is empty but DB has data → hydrate from cloud
        for (const url of dbUser.favorites || []) {
            if (!userFavorites.has(url)) { // URL MIGHT NOT MATCH FROM DB COULD BE TRIMMED
                if (DEBUG.ENABLED) {
                    console.log(`Adding favorite from cloud: ${url}`);
                }
                userFavorites.add(url);
                renderValidResult(url, "favorites_container");
                await saveFavorite(url);
            }
        }
        for (const url of dbUser.trash || []) {
            if (!userTrash.has(url)) {
                userTrash.add(url);
                renderValidResult(url, "trash_bin_container");
                await saveTrash(url);
            }
        }
    }
}
export async function syncGlobalFavorites(): Promise<void> {
    if (!USER.address) throw new Error("No wallet address available for global favorites sync.");
    const checksumAddress = PLUGINS.ethers.utils.getAddress(USER.address);

    try {
        const favsSnapshot = await getDocs(
            query(collection(db, "favorites"), where("favorites", "array-contains", checksumAddress))
        );

        for (const docSnap of favsSnapshot.docs) {
            const docId = docSnap.id;                 // e.g. sanitized URL
            const url = docId.replace(/_/g, "/");   // revert sanitize
            if (!userFavorites.has(url)) {
                const data = docSnap.data() as any;
                const discovery = data.discovery || {};
                const favoritesArr = (data.favorites as string[]) || [];

                // CASE A: user IS discoverer
                if (discovery.uid === checksumAddress) {
                    const others = favoritesArr.filter(uid => uid !== checksumAddress);
                    if (others.length === 0) {
                        // nobody left → delete doc and remove from discoverer's personal discoveries
                        await deleteDoc(docSnap.ref);
                        if (discovery.uid) {
                            const discovererRef = doc(db, "users", discovery.uid);
                            await updateDoc(discovererRef, { discoveries: arrayRemove(docId) });
                        }
                        if (DEBUG.ENABLED) {
                            console.log(`[DATABASE-WRITE] Deleted ${url}; removed from discoverer ${checksumAddress} discoveries`);
                        }
                    } else {
                        // others remain → keep doc (discoverer immutable), just remove from favorites
                        await updateDoc(docSnap.ref, { favorites: arrayRemove(checksumAddress) });
                        if (DEBUG.ENABLED) {
                            console.log(`[DATABASE-WRITE] Removed discoverer ${checksumAddress} from favorites for ${url}; doc kept`);
                        }
                    }
                    continue;
                }

                // CASE B: user is NOT discoverer
                if (favoritesArr.length === 1 /* only this user */) {
                    // after removal → empty: delete doc and remove from original discoverer’s discoveries
                    await deleteDoc(docSnap.ref);
                    if (discovery.uid) {
                        const discovererRef = doc(db, "users", discovery.uid);
                        await updateDoc(discovererRef, { discoveries: arrayRemove(docId) });
                    }
                    if (DEBUG.ENABLED) {
                        console.log(`[DATABASE-WRITE] Deleted ${url}; removed from original discoverer ${discovery.uid} discoveries`);
                    }
                } else {
                    // others still favoriting → just remove this user
                    await updateDoc(docSnap.ref, { favorites: arrayRemove(checksumAddress) });
                    if (DEBUG.ENABLED) {
                        console.log(`[DATABASE-WRITE] Removed ${checksumAddress} from global favorite ${url}`);
                    }
                }
            }
        }
        await syncKarma(checksumAddress); // Update karma for the user after cleaning up
    } catch (err) {
        console.error(`Error cleaning stale global favorites for ${checksumAddress}:`, err);
    }

    for (const url of userFavorites) {
        try {
            const docId = sanatizeURL(url);
            const favRef = doc(db, "favorites", docId);
            const snap = await getDoc(favRef);

            if (!snap.exists()) {
                // New doc → set discoverer and first favoriter (ENS only if present)
                await setDoc(favRef, {
                    discovery: {
                        uid: checksumAddress,
                        timestamp: Date.now(),
                        ...(USER.ens ? { ens: USER.ens } : {})
                    },
                    favorites: [checksumAddress]
                });

                const userRef = doc(db, "users", checksumAddress);
                await updateDoc(userRef, {
                    discoveries: arrayUnion(docId) // Add to user's personal discoveries
                });

                await loadGlobalFavorites();
                if (DEBUG.ENABLED) { console.log(`[DATABASE-WRITE] Global favorite synced for ${url}`); }
                continue;
            }

            const data = snap.data() as any;
            const discovery = data.discovery || {};
            const favoritesArr = data.favorites || [];

            // Build updates with dot-paths (no mutating snapshot objects)
            const updates: any = {};

            // If discoverer not set, set it (first discoverer write)
            if (!discovery.uid) {
                updates["discovery.uid"] = checksumAddress;
                updates["discovery.timestamp"] = Date.now();
                if (USER.ens) updates["discovery.ens"] = USER.ens;
            } else {
                // Backfill timestamp if missing
                if (discovery.timestamp == null) {
                    updates["discovery.timestamp"] = Date.now();
                }
                // If THIS user is the discoverer and ENS differs, patch it
                if (discovery.uid === checksumAddress && USER.ens && discovery.ens !== USER.ens) {
                    updates["discovery.ens"] = USER.ens;
                }
            }

            // Ensure this user is in favorites
            if (!favoritesArr.includes(checksumAddress)) {
                updates["favorites"] = arrayUnion(checksumAddress);

                if (DEBUG.ENABLED) { console.log(`User ${checksumAddress} added to favorites for ${url}`); }

                if (discovery.uid && discovery.uid !== checksumAddress) {
                    if (DEBUG.ENABLED) {
                        console.log(`
                            User ${checksumAddress} not discoverer, for ${url}.
                            Updating karma for discoverer: ${discovery.uid}
                        `);
                    }
                    await syncKarma(discovery.uid); // Update karma for original discoverer
                }
            }

            // Only write if there is something to change
            if (Object.keys(updates).length > 0) {
                await updateDoc(favRef, updates);
                if (DEBUG.ENABLED) { console.log(`[DATABASE-WRITE] Global favorite updated for ${url}`, updates); }
            }
        } catch (err) {
            console.error(`Error syncing global favorite for ${url}:`, err);
        }
    }
}
export async function loadGlobalFavorites(): Promise<void> {
    const snapshot = await getDocs(collection(db, "favorites"));
    if (!ui.globalResultsTable) {
        throw new Error("Global results table not found");
    }
    if (DEBUG.ENABLED) {
        console.log("[DATABASE-READ] Loading global favorites");
    }

    if (ui.globalResultsPlaceholder) {
        ui.globalResultsPlaceholder.remove();
        ui.globalResultsPlaceholder = undefined as any;
    }

    ui.globalResultsTable.querySelectorAll("tr:not(#global_results_header_row)").forEach(el => el.remove());

    if (snapshot.empty) {
        const row = document.createElement("tr");
        row.className = `placeholder_row`;
        row.innerHTML = `
            <td colspan="5">No Results Available</td>
        `;
        ui.globalResultsTable.appendChild(row);
        return;
    }

    let position = 1;
    snapshot.forEach(docSnap => {
        const data = docSnap.data() as DBResult;
        const uid = data.discovery?.uid || "Unknown";

        const displayName = data.discovery?.ens
            ? PLUGINS.sypher.truncate(data.discovery.ens, 5, 4)
            : PLUGINS.sypher.truncate(uid, 5, 4);

        const result: GlobalResult = {
            doc: docSnap.id,
            url: docSnap.id.replace(/_/g, "/"), // revert sanitizeURL
            discoverer: displayName,
            discoveredOn: new Date(data.discovery?.timestamp || 0).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }),
            karma: (data.favorites?.length || 0)
        };

        const row = document.createElement("tr");
        row.id = `global_result_${result.doc}`;

        row.innerHTML = `
            <td>${position}</td>
            <td><a href="https://${result.url}" target="_blank">${result.url}</a></td>
            <td><a href="https://blockscan.com/address/${uid}" target="_blank">${PLUGINS.sypher.truncate(result.discoverer, 5, 4)}</a></td>
            <td>${result.discoveredOn}</td>
            <td>${result.karma}</td>
        `;

        ui.globalResultsTable.appendChild(row);
        position++;
    });
}
const MIN_KARMA = 1;
export async function loadGlobalSyrchers(): Promise<void> {
    if (!ui.globalSyrchersTable) {
        throw new Error("Global Syrchers table not found");
    }
    
    ui.globalSyrchersTable.querySelectorAll("tr:not(#syrchers_header_row)").forEach(el => el.remove());

    // Query only users with karma > 1, highest first
    const q = query(
        collection(db, "users"),
        where("karma", ">=", MIN_KARMA),
        orderBy("karma", "desc"),
        limit(50) // cap leaderboard length
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        const row = document.createElement("tr");
        row.className = `placeholder_row`;
        row.innerHTML = `
            <td colspan="5">No Results Available</td>
        `;
        ui.globalSyrchersTable.appendChild(row);
        return;
    }

    let position = 1;
    snapshot.forEach(docSnap => {
        const data = docSnap.data() as DBUser;

        const displayName = data.ens
            ? PLUGINS.sypher.truncate(data.ens, 5, 4)
            : PLUGINS.sypher.truncate(docSnap.id, 5, 4);

        const discoveries = data.discoveries?.length || 0;
        const userSince = new Date(data.created || 0).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });

        const row = document.createElement("tr");
        row.id = `syrcher_${docSnap.id}`;

        row.innerHTML = `
            <td>${position}</td>
            <td><a href="https://blockscan.com/address/${docSnap.id}" target="_blank">${displayName}</a></td>
            <td>${discoveries}</td>
            <td>${userSince}</td>
            <td>${data.karma}</td>
        `;

        ui.globalSyrchersTable.appendChild(row);
        position++;
    });
}
export async function syncENS(ens: string): Promise<void> {
    if (!USER.address || !ens) return;

    try {
        const checksumAddress = PLUGINS.ethers.utils.getAddress(USER.address);
        const ref = doc(db, "users", checksumAddress);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const user = snap.data() as DBUser;
            if (user.ens !== ens) {
                await updateDoc(ref, { ens });
                if (DEBUG.ENABLED) {
                    console.log(`ENS updated for ${PLUGINS.sypher.truncate(checksumAddress, 4, 4)}: ${ens}`);
                }
            }
        }
    } catch (err) {
        console.error("Failed to update ENS:", err);
    }
}
async function syncKarma(address: string): Promise<number> {
    const checksumAddress = PLUGINS.ethers.utils.getAddress(address);
    const userRef = doc(db, "users", checksumAddress);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return 0;
    if (DEBUG.ENABLED) {
        console.log(`[DATABASE-READ] Syncing karma for user: ${PLUGINS.sypher.truncate(checksumAddress)}`);
    }

    const user = userSnap.data() as DBUser;
    const discoveries = user.discoveries || [];
    if (discoveries.length === 0) {
        if (DEBUG.ENABLED) console.log(`No discoveries found for user ${checksumAddress}. Setting karma to 0.`);
        await updateDoc(userRef, { karma: 0 });
        return 0;
    }

    let totalKarma = 0;
    let count = 0;

    for (const docId of discoveries) {
        const favRef = doc(db, "favorites", docId);
        const favSnap = await getDoc(favRef);
        if (favSnap.exists()) {
            const data = favSnap.data() as any;
            const karma = (data.favorites?.length || 0);
            totalKarma += karma;
            count++;
        }
    }

    if (DEBUG.ENABLED) {
        console.log(`Karma for ${checksumAddress}: ${totalKarma} (based on ${count} discoveries)`);
    }
    await updateDoc(userRef, { karma: totalKarma });
    loadGlobalSyrchers(); // Don't await, just trigger a refresh of the global syrchers leaderboard
    return totalKarma;
}
// #endregion ^ Database Functions ^