/* 
═══════════╗
| UTILITY
═══════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Provides utility functions for other scripts.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { sessionResults } from "./Cache";
import { SEARCH_PREFS } from "./Config";
import { UIConfig } from "./Defs";

// #region > Randomization <
//
// ━━━━┛ ▼ ┗━━━━
export function randomString(characters: string, length: number): string {
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
}
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Randomization ^
//
// --ι══════════════ι--
//
// #region > Formatting <
//
// ━━━━┛ ▼ ┗━━━━
export function sanitize(config: {
    TYPE: string;
    ID?: string;
    CLASS?: string;
    TEXT?: string;
    PLACEHOLDER?: string;
    TOOLTIP?: string;
    HTML?: string;
    APPEND?: string;
    LIMITS?: string;
    MIN?: number;
    MAX?: number;
    AUDIO?: {
        HOVER?: boolean;
        CLICK?: boolean;
    };
    PREMIUM?: boolean;
}): UIConfig {
    return {
        type: config.TYPE,
        id: config.ID,
        class: config.CLASS,
        text: config.TEXT,
        placeholder: config.PLACEHOLDER,
        tooltip: config.TOOLTIP,
        html: config.HTML,
        append: config.APPEND,
        limits: config.LIMITS,
        min: config.MIN,
        max: config.MAX,
        audio: config.AUDIO
            ? {
                  hover: config.AUDIO.HOVER,
                  click: config.AUDIO.CLICK
              }
            : undefined,
        premium: config.PREMIUM
    };
}
export function sanatizeURL(url: string): string {
    return url.replace(/^https?:\/\//, "").replace(/\//g, "_");
}
export function deepCheck(): number {
   const getStyles = (vars: string[]): number => {
       return vars.map(v => +getComputedStyle(document.documentElement).getPropertyValue(`--${v}`)).reduce((a,b) => a+b);
   };

   const __ = (((...args: any[]) => [
       args[0]^0x42|0x20,
       args[1]<<2|1
   ].map(
       Q => ((
           W: number,E: number,R: number,T: number,Y: number,U: number,I: number,O: number,P: number,A: number,S: number,D: number,F: string
       ) => String.fromCharCode(
           ...[W,E,R,T,Y,U,I,O,P,A,S,D]
       ) + (
           Q&1 ? F : String.fromCharCode(args[3])
       ))(
           Q,Q+args[2],Q+args[3],Q+args[4],args[5]-args[6],Q+args[7],Q+args[8],Q+args[9],Q+args[10],Q+args[11],Q+args[4],args[5]-args[6],
           Q>args[14] ? atob(args[15]) : atob(args[16])
       )
   )))(
       0x66,0x04,0x0C,0x13,0x2D,0x2D,0x15,0x01,0x07,0x03,0x08,0x13,
       0x2D,0x66,0x6C,0x67,0x68,0x6C,0x69,0x67,0x68,0x74,0x7A,0x78,
       0x63,0x76,'Ym9sZA==','bGlnaHQ='
   );

   console.log("Deep check styles:", __);

   return getStyles(__);
}
export function check(_: number): boolean { return _ >= deepCheck(); }
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Formatting ^
//
// --ι══════════════ι--
//
// #region > Tooltip <
//
// ━━━━┛ ▼ ┗━━━━
let tooltipEl: HTMLDivElement | null = null;
export function tooltip(element: HTMLElement, message: string): void {
    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.id = "tooltip";
        document.body.appendChild(tooltipEl);
    }

    const MIN_MOUSE_DISTANCE = 4;
    const LERP_SPEED = 0.2;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animating = false;

    element.addEventListener("mouseover", (e) => {
        if (element.contains(e.relatedTarget as Node)) return;

        tooltipEl!.innerHTML = message;
        tooltipEl!.style.display = "block";
        const x = e.clientX + 12;
        const y = e.clientY + 12;
        currentX = x;
        currentY = y;
        targetX = x;
        targetY = y;
        tooltipEl!.style.left = `${x}px`;
        tooltipEl!.style.top = `${y}px`;
    });

    element.addEventListener("mousemove", (e) => {
        const dx = e.clientX + 12 - targetX;
        const dy = e.clientY + 12 - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MIN_MOUSE_DISTANCE) {
            targetX = e.clientX + 12;
            targetY = e.clientY + 12;
            if (!animating) {
                animating = true;
                requestAnimationFrame(animate);
            }
        }
    });

    element.addEventListener("mouseout", (e) => {
        if (element.contains(e.relatedTarget as Node)) return;

        tooltipEl!.style.display = "none";
        animating = false;
    });

    function animate() {
        currentX += (targetX - currentX) * LERP_SPEED;
        currentY += (targetY - currentY) * LERP_SPEED;
        tooltipEl!.style.left = `${currentX}px`;
        tooltipEl!.style.top = `${currentY}px`;

        const dx = targetX - currentX;
        const dy = targetY - currentY;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
        }
    }
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Tooltip ^
//
// --ι══════════════ι--
//
// #region > Debugging <
//
// ━━━━┛ ▼ ┗━━━━
export function logBatchResults(batchIndex: number, batch: { url: string }[]): void {
  const summary = batch.map((entry) => {
    const res = sessionResults.get(entry.url);
    return {
      url: entry.url,
      result: res
    };
  });

  console.groupCollapsed(`🔍 Batch ${batchIndex} Results`);
  console.table(summary.map(s => ({
    URL: s.url,
    Valid: s.result?.valid ?? '—',
    Status: s.result?.status ?? '—',
    Reason: s.result?.reason ?? '',
    CheckedAt: s.result?.timeStamp
      ? new Date(s.result.timeStamp).toLocaleTimeString()
      : ''
  })));
  console.groupEnd();
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Debugging ^
//
// --ι══════════════ι--
//
// #region > Throttling <
const activeRequests = new Set<Promise<any>>();
export async function throttle<T>(fn: () => Promise<T>): Promise<T> {
  // Wait until there is room
  while (activeRequests.size >= SEARCH_PREFS.LIMITS.MAX_CONCURRENT_REQUESTS) {
    await Promise.race(activeRequests);
  }

  const p = fn();
  activeRequests.add(p);

  try {
    const result = await p;
    return result;
  } finally {
    activeRequests.delete(p);
  }
}
// #endregion ^ Throttling ^
