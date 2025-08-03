/* 
═══════════╗
| UTILITY
═══════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Provides utility functions for other scripts.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { DEBUG } from "./Config";
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
}): UIConfig {
    return {
        type: config.TYPE,
        id: config.ID,
        class: config.CLASS,
        text: config.TEXT,
        placeholder: config.PLACEHOLDER,
        tooltip: config.TOOLTIP,
        html: config.HTML,
        append: config.APPEND
    };
}
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

    element.addEventListener("mouseenter", (e) => {
        tooltipEl!.textContent = message;
        tooltipEl!.style.display = "block";
        currentX = e.clientX + 12;
        currentY = e.clientY + 12;
        targetX = currentX;
        targetY = currentY;
        tooltipEl!.style.left = `${currentX}px`;
        tooltipEl!.style.top = `${currentY}px`;

        if (DEBUG.ENABLED) {
            console.log(`Tooltip initialized at (${currentX}, ${currentY}) with message: "${message}"`);
        }
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

    element.addEventListener("mouseleave", () => {
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