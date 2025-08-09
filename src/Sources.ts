/* 
══════════╗
| SOURCES
══════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Loads and manages game resources such as images, audio, and video.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { DEBUG } from "./Config";
import { Resource, ResourceEntry } from "./Defs";

const r = "./assets"
const img = "/img/"
const a = "/audio/"

// #region • ── Resources ── •
export const Resources: Partial<Record<string, Resource>> = {};
const ResourceEntries: ResourceEntry[] = [
    // Images
    // image("grass", "grass.png"),

    // Audio
    audio("hover_00", "hover_00.mp3"),
    audio("hover_01", "hover_01.mp3"),
    audio("hover_02", "hover_02.mp3"),
    audio("hover_03", "hover_03.mp3"),
    audio("hover_04", "hover_04.mp3"),
    audio("click_00", "click_00.mp3"),
    audio("click_01", "click_01.mp3"),
    audio("click_02", "click_02.mp3"),
    audio("click_03", "click_03.mp3"),
    audio("click_04", "click_04.mp3")
];
// #endregion ▲ Resources ▲
//
// --ι══════════════ι--
//
// #region > Load Sources <
//
// ━━━━┛ ▼ ┗━━━━
function image(key: string, file: string): ResourceEntry {
    return { key, src: `${r}${img}${file}`, type: "image" };
}
function audio(key: string, file: string): ResourceEntry {
    return { key, src: `${r}${a}${file}`, type: "audio" };
}
// ━━━━┛ ▲ ┗━━━━
//
// ━━━━┛ ▼ ┗━━━━
loadSources();
function loadSources(): Promise<void> {
    return Promise.all(
        ResourceEntries.map(({ key, src, type }) => {
            return new Promise<void>((resolve, reject) => {
                if (type === "image") {
                    const img = new Image();
                    img.onload = () => {
                        Resources[key] = img;
                        resolve();
                    };
                    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                    img.src = src;
                }

                else if (type === "audio") {
                    const audio = new Audio();
                    audio.onloadeddata = () => {
                        Resources[key] = audio;
                        resolve();
                    };
                    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
                    audio.src = src;
                }

                else if (type === "video") {
                    const video = document.createElement("video");
                    video.onloadeddata = () => {
                        Resources[key] = video;
                        resolve();
                    };
                    video.onerror = () => reject(new Error(`Failed to load video: ${src}`));
                    video.src = src;
                }

                else {
                    reject(new Error(`Unsupported type: ${type}`));
                }
            });
        })
    ).then(() => {
        if (DEBUG.ENABLED) {
           console.log(`✅ All resources loaded: ${Object.keys(Resources).join(", ")}`);
        }
    });
}
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Load Sources ^