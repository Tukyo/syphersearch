/* 
══════════════╗
| CACHE
══════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Handles temporary runtime cache and local storage for search results.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { SessionResult } from "./Defs";

// #region > Runtime Cache <
//
// ━━━━┛ ▼ ┗━━━━
/**
 * A Map to store session results temporarily during the application's runtime -
 * The primary use is to not allow duplicate results.
 */
export const sessionResults: Map<string, SessionResult> = new Map();

/**
 * Stores successful (valid) session results.
 * Used to populate the Results tab during this session.
 */
export const validResults: Map<string, SessionResult> = new Map();

/**
 * Stores redirected-but-accepted session results (e.g., 301/302 with content).
 * May be shown later depending on UX decisions.
 */
export const redirectedResults: Map<string, SessionResult> = new Map();

// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Runtime Cache ^
//
// --ι══════════════ι--
//
// #region > Local Cache <
//
// ━━━━┛ ▼ ┗━━━━

// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Local Cache ^