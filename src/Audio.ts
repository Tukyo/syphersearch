/* 
════════╗
| AUDIO
════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Handles audio playback and mixers.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

import { AUDIO, DEBUG } from "./Config";
import { Resources } from "./Sources";
import { randomFloat } from "./Utils";

// #region > Sound Playback <
let lastPlayedClip: string | null = null;
const bufferPool: Record<string, HTMLAudioElement[]> = {};
const DEBOUNCE = 100; // milliseconds
let lastPlayTime = 0;

export function playSound(category: string): void {
    const now = Date.now();
    if (now - lastPlayTime < DEBOUNCE) return;
    lastPlayTime = now;

    const clips = Object.keys(Resources).filter(key => key.startsWith(`${category}_`));
    if (clips.length === 0) return;

    let candidates = clips;
    if (clips.length > 1 && lastPlayedClip) {
        candidates = clips.filter(key => key !== lastPlayedClip);
    }

    const selectedKey = candidates[Math.floor(Math.random() * candidates.length)];
    const sourceClip = Resources[selectedKey];

    if (!(sourceClip instanceof HTMLAudioElement)) return;

    // Ensure a buffer pool exists for this sound
    if (!bufferPool[selectedKey]) {
        bufferPool[selectedKey] = Array.from({ length: AUDIO.BUFFER.COUNT }, () => sourceClip.cloneNode(true) as HTMLAudioElement);
    }

    // Find an available (not playing) audio element
    const pool = bufferPool[selectedKey];
    const available = pool.find(clip => clip.paused || clip.ended);

    // If none available, skip (all in use)
    if (!available) return;

    // Set playback parameters
    available.currentTime = randomFloat(AUDIO.RANDOM.START_TIME.MIN, AUDIO.RANDOM.START_TIME.MAX);
    available.playbackRate = randomFloat(AUDIO.RANDOM.PITCH.MIN, AUDIO.RANDOM.PITCH.MAX);
    const baseVol = randomFloat(AUDIO.RANDOM.VOL.MIN, AUDIO.RANDOM.VOL.MAX);
    available.volume = masterPass(baseVol * mixerPass("SFX"));

    // Play it
    available.play().catch(() => { });
    if (DEBUG.ENABLED && !DEBUG.QUIET) console.log("▶️ Playing:", selectedKey);
    lastPlayedClip = selectedKey;
}
//#endregion ^ Sound Playback ^
//
// --ι══════════════ι--
//
// #region > Mix <
function mixerPass(channel: keyof typeof AUDIO.MIXER): number {
    return AUDIO.MIXER[channel] ?? 1;
}
function masterPass(volume: number): number {
    return volume * AUDIO.MIXER.MASTER;
}
//#endregion ^ Mix ^