/* 
═════════╗
| EVENTS
═════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> Processes events for the application.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// #region > Events <
//
// ━━━━┛ ▼ ┗━━━━
type ProgressCallback = (percent: number) => void;

class ProgressEventEmitter {
  private listeners: Set<ProgressCallback> = new Set();

  on(cb: ProgressCallback) {
    this.listeners.add(cb);
  }

  off(cb: ProgressCallback) {
    this.listeners.delete(cb);
  }

  emit(percent: number) {
    for (const cb of this.listeners) cb(percent);
  }
}

export const ProgressEvents = new ProgressEventEmitter();
// ━━━━┛ ▲ ┗━━━━
//
// #endregion ^ Events ^